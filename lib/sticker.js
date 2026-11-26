import { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { ffmpeg } from './converter.js';
import fluent_ffmpeg from 'fluent-ffmpeg';
import { spawn } from 'child_process';
import { fileTypeFromBuffer } from 'file-type';
import webp from 'node-webpmux';
import fetch from 'node-fetch';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tmp = path.join(__dirname, '../tmp');

/**
 * Mendeteksi batas hitam (letterbox di atas/bawah atau pillarbox di kiri/kanan) secara otomatis
 * menggunakan filter FFmpeg cropdetect.
 * Menghasilkan string filter crop FFmpeg jika batas hitam terdeteksi, atau string kosong jika video bersih.
 *
 * @param {string} filePath - Path file video lokal
 * @param {number} [startSec=0] - Waktu mulai (detik)
 * @returns {Promise<string>} - String filter ffmpeg (contoh: "crop=720:720:0:180," atau "")
 */
async function detectBlackBars(filePath, startSec = 0) {
  return new Promise((resolve) => {
    const args = ['-y'];
    if (startSec > 0) args.push('-ss', String(startSec));
    // Analisis 8 frame dengan threshold luma 24 dan kelipatan 2 pixel
    args.push('-i', filePath, '-vframes', '8', '-vf', 'cropdetect=24:2:0', '-f', 'null', '-');

    const proc = spawn('ffmpeg', args);
    let stderr = '';
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve('');
    }, 3000);

    proc.stderr.on('data', chunk => { stderr += chunk.toString(); });
    proc.on('close', () => {
      clearTimeout(timer);
      try {
        const dimMatch = stderr.match(/Stream #0:.*Video:.*, ([0-9]+)x([0-9]+)/);
        const cropMatches = [...stderr.matchAll(/crop=([0-9]+:[0-9]+:[0-9]+:[0-9]+)/g)];
        if (cropMatches.length > 0) {
          const bestCrop = cropMatches[cropMatches.length - 1][1];
          let [w, h, x, y] = bestCrop.split(':').map(Number);

          let hasBlackBars = (x > 0 || y > 0);
          if (!hasBlackBars && dimMatch) {
            const inW = Number(dimMatch[1]);
            const inH = Number(dimMatch[2]);
            if (inW && inH && (w < inW - 12 || h < inH - 12)) {
              hasBlackBars = true;
            }
          }

          if (hasBlackBars && w >= 32 && h >= 32) {
            w -= (w % 2);
            h -= (h % 2);
            x -= (x % 2);
            y -= (y % 2);
            return resolve(`crop=${w}:${h}:${x}:${y},`);
          }
        }
      } catch (err) {
        console.warn('[detectBlackBars Error]:', err?.message || err);
      }
      resolve('');
    });
    proc.on('error', () => {
      clearTimeout(timer);
      resolve('');
    });
  });
}

/**
 * Proses konversi gambar atau video menjadi stiker webp menggunakan ffmpeg.
 * @param {Buffer} img - Buffer gambar atau video.
 * @param {String} [url] - URL gambar atau video.
 * @param {Boolean} [isAnimation=false] - Apakah file berupa animasi.
 * @param {Number} [duration=10] - Durasi maksimal animasi (jika file animasi).
 * @returns {Promise<Buffer>}
 */
async function processSticker(img, url, isAnimation = false, duration = 10) {
  if (url) {
    const res = await fetch(url);
    if (res.status !== 200) throw new Error(await res.text());
    img = await res.buffer();
  }

  const type = await fileTypeFromBuffer(img);
  if (!type) throw new Error('Unsupported file type');

  const tmpPath = path.join(tmp, `${Date.now()}.${type.ext}`);
  const outPath = `${tmpPath}.webp`;

  await fs.promises.writeFile(tmpPath, img);

  const cropFilter = isAnimation ? await detectBlackBars(tmpPath, 0) : '';

  return new Promise((resolve, reject) => {
    const animDuration = Math.min(Number(duration) || 6, 6);
    let ffmpegProcess = fluent_ffmpeg(tmpPath)
      .on('error', (err) => {
        fs.promises.unlink(tmpPath).catch(console.error);
        reject(err);
      })
      .on('end', async () => {
        try {
          let webpBuffer = await fs.promises.readFile(outPath);
          // Safety Check: WhatsApp Animated Sticker strictly prohibits files >= 1,000,000 bytes (1 MB)
          // If the output exceeds 800 KB, run a quick Pass-2 optimization to guarantee playback!
          if (isAnimation && webpBuffer.length > 800000) {
            const outPath2 = `${tmpPath}_opt.webp`;
            await new Promise((resOpt) => {
              fluent_ffmpeg(tmpPath)
                .addOutputOptions([
                  '-vcodec', 'libwebp',
                  '-vf', `${cropFilter}scale=360:360:flags=lanczos:force_original_aspect_ratio=decrease,fps=10,pad=360:360:(ow-iw)/2:(oh-ih)/2:color=#00000000`,
                  '-loop', '0',
                  '-vsync', 'vfr',
                  '-t', '5',
                  '-qscale', '35',
                  '-compression_level', '6'
                ])
                .toFormat('webp')
                .on('end', async () => {
                  try {
                    const optBuffer = await fs.promises.readFile(outPath2);
                    if (optBuffer && optBuffer.length < webpBuffer.length) {
                      webpBuffer = optBuffer;
                    }
                  } catch {}
                  await fs.promises.unlink(outPath2).catch(() => {});
                  resOpt();
                })
                .on('error', () => resOpt())
                .save(outPath2);
            });
          }
          resolve(webpBuffer);
        } finally {
          await fs.promises.unlink(tmpPath).catch(console.error);
          await fs.promises.unlink(outPath).catch(console.error);
        }
      });

    if (isAnimation) {
      ffmpegProcess
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', `${cropFilter}scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,fps=12`,
          '-loop', '0',
          '-vsync', 'vfr',
          '-t', String(animDuration),
          '-qscale', '42',
          '-compression_level', '6'
        ])
        .toFormat('webp');
    } else {
      ffmpegProcess
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0'
        ])
        .toFormat('webp');
    }

    ffmpegProcess.save(outPath);
  });
}

/**
 * Mengubah gambar menjadi stiker menggunakan ffmpeg dan ImageMagick.
 * @param {Buffer} img - Buffer gambar.
 * @param {String} [url] - URL gambar.
 * @returns {Promise<Buffer>}
 */
async function sticker1(img, url) {
  try {
    if (url) {
      const res = await fetch(url);
      if (res.status !== 200) throw new Error(await res.text());
      img = await res.buffer();
    }

    const inp = path.join(tmp, `${Date.now()}.jpeg`);
    await fs.promises.writeFile(inp, img);

    const ffmpegProcess = spawn('ffmpeg', [
      '-y', '-i', inp,
      '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000,setsar=1',
      '-f', 'png', '-'
    ]);

    const bufs = [];

    ffmpegProcess.stdout.on('data', chunk => bufs.push(chunk));

    const convertProcess = spawn(global.support.gm ? 'gm' : 'convert', ['png:-', 'webp:-']);
    ffmpegProcess.stdout.pipe(convertProcess.stdin);

    return new Promise((resolve, reject) => {
      convertProcess.stdout.on('data', (data) => bufs.push(data));
      convertProcess.on('exit', () => resolve(Buffer.concat(bufs)));
      ffmpegProcess.on('error', reject);
      convertProcess.on('error', reject);
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
}

/**
 * Mengubah gambar atau video menjadi stiker menggunakan ffmpeg.
 * @param {Buffer} img - Buffer gambar atau video.
 * @param {String} [url] - URL gambar atau video.
 * @returns {Promise<Buffer>}
 */

async function sticker2(img, url) {
  if (url) {
    const res = await fetch(url);
    if (res.status !== 200) throw new Error(await res.text());
    img = await res.buffer();
  }

  const type = await fileTypeFromBuffer(img);
  if (!type) {
    throw new Error('Unsupported file type');
  }

  const isAnimation = ['mp4', 'webm', 'gif', 'apng'].includes(type.ext);
  const isImage = ['png', 'jpg', 'jpeg'].includes(type.ext) && !isAnimation;

  if (!isAnimation && !isImage) {
    throw new Error('Unsupported file type for sticker');
  }

  const tmpPath = path.join(tmp, `${Date.now()}.${type.ext}`);
  const outPath = `${tmpPath}.webp`;

  await fs.promises.writeFile(tmpPath, img);

  return new Promise((resolve, reject) => {
    let ffmpegProcess = fluent_ffmpeg(tmpPath)
      .on('error', (err) => {
        fs.promises.unlink(tmpPath).catch(console.error);
        reject(err);
      })
      .on('end', async () => {
        const webpBuffer = await fs.promises.readFile(outPath);
        resolve(webpBuffer);
        fs.promises.unlink(tmpPath).catch(console.error); // Clean up input file
        fs.promises.unlink(outPath).catch(console.error); // Clean up output file
      });

    if (isAnimation) {
      ffmpegProcess
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,fps=12',
          '-loop', '0',
          '-vsync', 'vfr',
          '-t', '6',
          '-qscale', '42',
          '-compression_level', '6'
        ])
        .toFormat('webp');
    } else if (isImage) {
      ffmpegProcess
        .addOutputOptions([
          '-vcodec', 'libwebp',
          '-vf', 'scale=512:512:flags=lanczos:force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0'
        ])
        .toFormat('webp');
    }

    ffmpegProcess.save(outPath);
  });
}

/**
 * Mengubah gambar menjadi stiker menggunakan wa-sticker-formatter.
 * @param {Buffer} img - Buffer gambar.
 * @param {String} url - URL gambar.
 * @param {String} packname - Nama paket stiker.
 * @param {String} author - Penulis stiker.
 * @param {Array<String>} [categories] - Kategori stiker.
 * @param {Object} [extra] - Metadata tambahan.
 * @returns {Promise<Buffer>}
 */
async function sticker3(img, url, packname, author, categories = [''], extra = {}) {
  const { Sticker } = await import('wa-sticker-formatter');
  const stickerMetadata = {
    type: 'default',
    pack: packname,
    author,
    categories,
    ...extra
  };

  return new Sticker(img || url, stickerMetadata).toBuffer();
}

/**
 * Menggunakan fluent-ffmpeg untuk konversi gambar menjadi stiker.
 * @param {Buffer} img - Buffer gambar.
 * @param {String} url - URL gambar.
 * @returns {Promise<Buffer>}
 */
async function sticker4(img, url) {
  if (url) {
    const res = await fetch(url);
    if (res.status !== 200) throw new Error(await res.text());
    img = await res.buffer();
  }

  const type = await fileTypeFromBuffer(img) || { mime: 'application/octet-stream', ext: 'bin' };
  if (type.ext === 'bin') throw new Error('Unsupported file type');

  const tmpPath = path.join(tmp, `${Date.now()}.${type.ext}`);
  const outPath = `${tmpPath}.webp`;

  await fs.promises.writeFile(tmpPath, img);

  return new Promise((resolve, reject) => {
    fluent_ffmpeg(tmpPath)
      .on('error', (err) => {
        fs.promises.unlink(tmpPath).catch(console.error);
        reject(err);
      })
      .on('end', async () => {
        fs.promises.unlink(tmpPath).catch(console.error);
        resolve(await fs.promises.readFile(outPath));
      })
      .addOutputOptions([
        '-vcodec', 'libwebp', '-vf',
        'scale="min(320,iw)":min"(320,ih)":force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse'
      ])
      .toFormat('webp')
      .save(outPath);
  });
}

/**
 * Konversi video langsung (1-Pass) menjadi stiker animasi WebP ber-EXIF dengan pemotongan durasi instan.
 * Jauh lebih cepat (3x-4x) karena memotong dan mengonversi langsung ke WebP tanpa proses encode MP4 perantara.
 *
 * @param {Buffer} buffer - Buffer video asli
 * @param {Object} [options]
 * @param {number} [options.startSec=0] - Detik awal pemotongan
 * @param {number} [options.durationSec=6] - Durasi stiker (maks 10 detik)
 * @param {string} [options.packname] - Nama paket stiker
 * @param {string} [options.author] - Nama pembuat stiker
 * @returns {Promise<Buffer>} - Buffer WebP lengkap dengan metadata EXIF
 */
async function directVideoToSticker(buffer, {
  startSec = 0,
  durationSec = 6,
  packname = global.stickpack || 'Avelia Sound',
  author = global.stickauth || 'Avelia'
} = {}) {
  if (!buffer || !Buffer.isBuffer(buffer)) throw new Error('Buffer video valid wajib disertakan.');

  const tmpIn = path.join(tmp, `fast_in_${Date.now()}_${Math.random().toString(36).slice(2)}.mp4`);
  const tmpOut = path.join(tmp, `fast_out_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`);
  await fs.promises.writeFile(tmpIn, buffer);

  try {
    const animDur = Math.min(Number(durationSec) || 6, 60);
    const cropFilter = await detectBlackBars(tmpIn, startSec);

    // Dynamic Frame & Quality Budgeting:
    // Menjaga agar stiker berdurasi panjang (hingga 60 detik / 1 menit) tetap di bawah batas 1 MB WhatsApp
    let targetScale = 512;
    let targetFps = 12;
    let targetQuality = 42;

    if (animDur > 30) {
      // 31-60 detik: gunakan 6 FPS dan 300px agar ukuran tetap aman < 650 KB
      targetScale = 300;
      targetFps = 6;
      targetQuality = 24;
    } else if (animDur > 15) {
      // 16-30 detik: gunakan 8 FPS dan 360px
      targetScale = 360;
      targetFps = 8;
      targetQuality = 30;
    } else if (animDur > 7) {
      // 8-15 detik: gunakan 10 FPS dan 420px
      targetScale = 420;
      targetFps = 10;
      targetQuality = 36;
    }

    const args = ['-y'];
    if (startSec > 0) args.push('-ss', String(startSec));
    args.push('-i', tmpIn);
    args.push(
      '-t', String(animDur),
      '-vcodec', 'libwebp',
      '-vf', `${cropFilter}scale=${targetScale}:${targetScale}:flags=lanczos:force_original_aspect_ratio=decrease,fps=${targetFps}`,
      '-loop', '0',
      '-vsync', 'vfr',
      '-qscale', String(targetQuality),
      '-compression_level', '4',
      tmpOut
    );

    await new Promise((resolve, reject) => {
      const proc = spawn('ffmpeg', args);
      proc.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg 1-pass exit code ${code}`));
      });
      proc.on('error', reject);
    });

    let webpBuf = await fs.promises.readFile(tmpOut);

    // Pass-2 Safety: WhatsApp menolak stiker animasi >= 1,000,000 bytes (1 MB)
    if (webpBuf.length > 800000) {
      const tmpOut2 = `${tmpOut}_opt.webp`;
      const p2Args = ['-y'];
      if (startSec > 0) p2Args.push('-ss', String(startSec));
      p2Args.push('-i', tmpIn);
      p2Args.push(
        '-t', String(animDur),
        '-vcodec', 'libwebp',
        '-vf', `${cropFilter}scale=320:320:flags=lanczos:force_original_aspect_ratio=decrease,fps=8,pad=320:320:(ow-iw)/2:(oh-ih)/2:color=#00000000`,
        '-loop', '0',
        '-vsync', 'vfr',
        '-qscale', '28',
        '-compression_level', '4',
        tmpOut2
      );

      await new Promise((resolve) => {
        const proc2 = spawn('ffmpeg', p2Args);
        proc2.on('close', resolve);
        proc2.on('error', resolve);
      });

      try {
        const optBuf = await fs.promises.readFile(tmpOut2);
        if (optBuf && optBuf.length < webpBuf.length) {
          webpBuf = optBuf;
        }
      } catch {}
      await fs.promises.unlink(tmpOut2).catch(() => {});
    }

    // Pass-3 Extreme Safety: Jika file masih > 850 KB, kompresi lebih lanjut agar stiker dipastikan bisa diputar WhatsApp
    if (webpBuf.length > 850000) {
      const tmpOut3 = `${tmpOut}_opt3.webp`;
      const p3Args = ['-y'];
      if (startSec > 0) p3Args.push('-ss', String(startSec));
      p3Args.push('-i', tmpIn);
      p3Args.push(
        '-t', String(Math.min(animDur, 15)),
        '-vcodec', 'libwebp',
        '-vf', `${cropFilter}scale=280:280:flags=lanczos:force_original_aspect_ratio=decrease,fps=7,pad=280:280:(ow-iw)/2:(oh-ih)/2:color=#00000000`,
        '-loop', '0',
        '-vsync', 'vfr',
        '-qscale', '24',
        '-compression_level', '4',
        tmpOut3
      );

      await new Promise((resolve) => {
        const proc3 = spawn('ffmpeg', p3Args);
        proc3.on('close', resolve);
        proc3.on('error', resolve);
      });

      try {
        const optBuf3 = await fs.promises.readFile(tmpOut3);
        if (optBuf3 && optBuf3.length < webpBuf.length) {
          webpBuf = optBuf3;
        }
      } catch {}
      await fs.promises.unlink(tmpOut3).catch(() => {});
    }

    return await addExif(webpBuf, packname, author);
  } finally {
    await fs.promises.unlink(tmpIn).catch(() => {});
    await fs.promises.unlink(tmpOut).catch(() => {});
  }
}

/**
 * Menambahkan metadata EXIF untuk stiker WhatsApp.
 * @param {Buffer} webpSticker - Buffer stiker webp.
 * @param {String} packname - Nama paket stiker.
 * @param {String} author - Penulis stiker.
 * @param {Array<String>} categories - Kategori stiker.
 * @param {Object} [extra] - Metadata tambahan.
 * @returns {Promise<Buffer>}
 */
async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image();
  const stickerPackId = crypto.randomBytes(32).toString('hex');
  const json = {
    'sticker-pack-id': stickerPackId,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': categories,
    ...extra
  };

  const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  const exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);

  await img.load(webpSticker);
  img.exif = exif;
  return img.save(null);
}

/**
 * Konversi gambar atau video ke stiker dengan metadata tambahan.
 * @param {Buffer} img - Buffer gambar atau video.
 * @param {String} url - URL gambar atau video.
 * @param {String} packname - Nama paket stiker.
 * @param {String} author - Penulis stiker.
 * @param {Array<String>} [categories] - Kategori stiker.
 * @param {Object} [extra] - Metadata tambahan.
 * @returns {Promise<Buffer>}
 */
async function sticker(img, url, packname, author, categories = [''], extra = {}) {
  try {
    const isAnimation = ['mp4', 'webm', 'gif', 'apng'].includes(await fileTypeFromBuffer(img).then(type => type?.ext));
    const stickerBuffer = await processSticker(img, url, isAnimation);
    return await addExif(stickerBuffer, packname, author, categories, extra);
  } catch (error) {
    console.error('Failed to create sticker:', error);
    throw error;
  }
}

const support = {
  ffmpeg: true,
  ffprobe: true,
  ffmpegWebp: true,
  convert: true,
  magick: false,
  gm: false,
  find: false
};

export {
  sticker,
  directVideoToSticker,
  detectBlackBars,
  sticker1,
  sticker2,
  sticker3,
  sticker4,
  addExif,
  support
};