import { promises } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmp = join(__dirname, '../tmp', +new Date() + '.' + ext);
      let out = tmp + '.' + ext2;
      await promises.writeFile(tmp, buffer);
      const ffmpegProcess = spawn('ffmpeg', [
        '-y',
        '-i', tmp,
        ...args,
        out
      ]);
      ffmpegProcess.on('error', (err) => {
        console.error('Error spawning ffmpeg:', err);
        reject(err);
      });
      ffmpegProcess.on('close', async (code) => {
        try {
          await promises.unlink(tmp);
          if (code !== 0) return reject(code);
          if (!await promises.access(out).then(() => true).catch(() => false)) {
            return reject(new Error('Output file not found'));
          }
          resolve({
            data: await promises.readFile(out),
            filename: out,
            delete() {
              return promises.unlink(out);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to Playable WhatsApp Audio
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
  ], ext, 'ogg');
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer Audio Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(buffer, [
    '-vn',
    '-c:a', 'libopus',
    '-b:a', '128k',
    '-vbr', 'on',
    '-compression_level', '10'
  ], ext, 'opus');
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer Video Buffer
 * @param {String} ext File Extension 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(buffer, [
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-ab', '128k',
    '-ar', '44100',
    '-crf', '32',
    '-preset', 'slow'
  ], ext, 'mp4');
}

/**
 * Merge Video and Audio into a single Video
 * @param {Buffer} videoBuffer Video Buffer
 * @param {Buffer} audioBuffer Audio Buffer
 * @param {String} videoExt 
 * @param {String} audioExt 
 * @param {String} outExt 
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function mergeAudioVideo(videoBuffer, audioBuffer, videoExt = 'mp4', audioExt = 'mp3', outExt = 'mp4') {
  return new Promise(async (resolve, reject) => {
    try {
      let tmpVid = join(__dirname, '../tmp', +new Date() + '_vid.' + videoExt);
      let tmpAud = join(__dirname, '../tmp', +new Date() + '_aud.' + audioExt);
      let out = join(__dirname, '../tmp', +new Date() + '_merged.' + outExt);
      await promises.writeFile(tmpVid, videoBuffer);
      await promises.writeFile(tmpAud, audioBuffer);
      const ffmpegProcess = spawn('ffmpeg', [
        '-y',
        '-i', tmpVid,
        '-i', tmpAud,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-shortest',
        out
      ]);
      ffmpegProcess.on('error', (err) => {
        promises.unlink(tmpVid).catch(() => {});
        promises.unlink(tmpAud).catch(() => {});
        reject(err);
      });
      ffmpegProcess.on('close', async (code) => {
        try {
          await promises.unlink(tmpVid).catch(() => {});
          await promises.unlink(tmpAud).catch(() => {});
          if (code !== 0) return reject(code);
          if (!await promises.access(out).then(() => true).catch(() => false)) {
            return reject(new Error('Output file not found'));
          }
          resolve({
            data: await promises.readFile(out),
            filename: out,
            delete() {
              return promises.unlink(out);
            }
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export {
  toAudio,
  toPTT,
  toVideo,
  mergeAudioVideo,
  ffmpeg
};
