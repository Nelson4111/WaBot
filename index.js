import yargs from 'yargs';
import cfonts from 'cfonts';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
import { createRequire } from 'module';
import { createInterface } from 'readline';
import { setupMaster, fork } from 'cluster';
import { watchFile, unwatchFile } from 'fs';

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
        p.kill(); // Change here
        isRunning = false;
        start(file);
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
