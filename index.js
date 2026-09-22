import 'dotenv/config';
import yargs from 'yargs';
import cfonts from 'cfonts';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';
import { execSync } from 'child_process';

// Setup console output
const { say } = cfonts;
const rl = createInterface(process.stdin, process.stdout);
const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(__dirname);
const { name, author } = require(join(__dirname, './package.json'));

say('Avelia', { font: 'block', align: 'center', gradient: ['cyan', 'blue'] });
say(`By ${author?.name || author || 'Nenel'}`, { font: 'console', align: 'center', gradient: ['magenta', 'red'] });

console.log(chalk.cyan('┌────────────────────────────────────────────────────────┐'));
console.log(chalk.cyan('│') + chalk.black.bgCyan('        AVELIA SYSTEM INITIALIZED                   ') + chalk.cyan('│'));
console.log(chalk.cyan('├────────────────────────────────────────────────────────┤'));
console.log(chalk.cyan('│') + ` [+] TIME   : ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB`.padEnd(56) + chalk.cyan('│'));
console.log(chalk.cyan('│') + ` [+] OWNER  : ${author?.name || author || 'Nenel'}`.padEnd(56) + chalk.cyan('│'));
console.log(chalk.cyan('│') + ` [+] SYSTEM : ${name || 'Avelia'}`.padEnd(56) + chalk.cyan('│'));
console.log(chalk.cyan('│') + ` [+] ENGINE : Baileys Multi-Device Official`.padEnd(56) + chalk.cyan('│'));
console.log(chalk.cyan('└────────────────────────────────────────────────────────┘'));

// Otomatis verifikasi & patch Baileys agar waveform VN aktif (di VPS / Local)
try {
  await import('./scripts/patch-baileys.js');
} catch (errPatch) {
  console.warn('[Baileys Patch] Startup check failed:', errPatch?.message);
}

console.log(chalk.green('🐾 Starting engine...')); 

var isRunning = false;
var p;

/**
 * Start a js file
 * @param {String} file `path/to/file`
 */
function start(file) {
  if (isRunning) return;
  isRunning = true;

  let args = [join(__dirname, file), ...process.argv.slice(2)];
  say([process.argv[0], ...args].join(' '), { font: 'console', align: 'center', gradient: ['red', 'magenta'] });
  
  setupMaster({ exec: args[0], args: args.slice(1), execArgv: ['--expose-gc'], stdio: ['pipe', 'inherit', 'inherit', 'ipc'] });
  p = fork();

  p.on('message', data => {
    console.log('[✅RECEIVED]', data);
    switch (data) {
      case 'reset':
        if (p && !p.killed) {
          p.kill('SIGTERM'); // Kirim SIGTERM agar worker menjalankan gracefulExit dan menyimpan database
        }
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

// --- GRACEFUL SHUTDOWN UNTUK MENCEGAH ORPHAN PROCESS & DATA LOSS ---
let isIndexExiting = false;
const cleanupAndExit = async (signal = 'SIGTERM') => {
  if (isIndexExiting) return;
  isIndexExiting = true;
  isRunning = false;
  console.log(chalk.red(`\n🛑 [Index] Menerima sinyal ${signal}, menunggu worker menyimpan data ke Supabase...`));
  if (p && !p.killed) {
    try {
      p.kill('SIGTERM');
      // Berikan waktu hingga 12 detik agar worker dapat menyelesaikan penyimpanan database
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 12000);
        p.on('exit', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    } catch {}
  }
  process.exit(0);
};

process.on('SIGINT', () => cleanupAndExit('SIGINT'));
process.on('SIGTERM', () => cleanupAndExit('SIGTERM'));
