import yargs from 'yargs';
import cfonts from 'cfonts';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile, existsSync, rmSync } from 'fs';
import { execSync } from 'child_process';

// ── AUTO-PATCH: Ganti Baileys resmi dengan fork yuusuke1101/ryuuxalya ──
const __dirname_root = dirname(fileURLToPath(import.meta.url));
const baileysPath = join(__dirname_root, 'node_modules/@whiskeysockets/baileys');
const forkUrl = 'https://github.com/yuusuke1101/ryuuxalya.git';
const pkgCheck = join(baileysPath, 'package.json');

try {
  const createRequireCheck = (await import('module')).createRequire(import.meta.url);
  const pkgData = existsSync(pkgCheck) ? createRequireCheck(pkgCheck) : {};
  // Cek apakah yang terinstall bukan fork (fork namanya AlyaxRyuu)
  if (pkgData?.name !== 'AlyaxRyuu') {
    console.log('[🔄 PATCH] Baileys bukan fork, mengganti dengan fork yuusuke1101/ryuuxalya...');
    if (existsSync(baileysPath)) rmSync(baileysPath, { recursive: true, force: true });
    execSync(`git clone --depth 1 ${forkUrl} "${baileysPath}"`, { stdio: 'inherit' });
    // Install dependencies fork
    execSync(`npm install --prefix "${baileysPath}"`, { stdio: 'inherit' });
    console.log('[✅ PATCH] Fork Baileys berhasil dipasang!');
  } else {
    console.log('[✅ PATCH] Fork Baileys (AlyaxRyuu) sudah terpasang, skip.');
  }
} catch (e) {
  console.warn('[⚠️ PATCH] Gagal ganti Baileys fork, melanjutkan dengan versi terinstall:', e.message);
}
// ── END AUTO-PATCH ──

// Setup console output
const { say } = cfonts;
const rl = createInterface(process.stdin, process.stdout);
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));

say('Lightweight\nWhatsApp Bot', { font: 'chrome', align: 'center', gradient: ['red', 'magenta'] });
say(`'${name}' By @${author.name || author}`, { font: 'console', align: 'center', gradient: ['red', 'magenta'] });

console.log('🐾 Starting...'); 

var isRunning = false;

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
  if (isRunning) return;
  isRunning = true;

  let args = [join(__dirname, file), ...process.argv.slice(2)];
  say([process.argv[0], ...args].join(' '), { font: 'console', align: 'center', gradient: ['red', 'magenta'] });
  
  setupMaster({ exec: args[0], args: args.slice(1), stdio: ['pipe', 'inherit', 'inherit', 'ipc'] });
  let p = fork();

  p.on('message', data => {
    console.log('[✅RECEIVED]', data);
    switch (data) {
      case 'reset':
        p.kill(); // Trigger process exit, allowing 'exit' listener to cleanly restart it.
        break;
      case 'uptime':
        p.send(process.uptime());
        break;
      default:
          console.warn('[⚠️ UNRECOGNIZED MESSAGE]', data);
    }
  });

  p.on('exit', (code, signal) => {
    isRunning = false;
    console.error('[❗] Exited with code:', code, signal ? `signal: ${signal}` : '');
    if (code !== 0) {
      console.log('[🔄 Restarting worker due to non-zero exit code...');
      return start(file);
    }
    
    unwatchFile(args[0]);
    watchFile(args[0], () => {
      unwatchFile(args[0]);
      start(file);
    });
  });

  let opts = yargs(process.argv.slice(2)).exitProcess(false).parse();
  
  if (!opts['test']) {
    if (!rl.listenerCount()) {
      rl.on('line', line => {
        const text = line.trim();
        if (text === 'reset' || text === 'uptime') {
          p.emit('message', text);
          return;
        }

        if (p.process.stdin?.writable) {
          p.process.stdin.write(`${line}\n`);
        } else {
          console.warn('[⚠️ INPUT NOT FORWARDED]', text);
        }
      });
    }
  }
}

start('main.js');
