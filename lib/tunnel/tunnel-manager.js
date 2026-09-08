import { spawn } from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

let tunnelProcess = null;

function findCloudflaredPath() {
    const candidates = [
        'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
        'C:\\Program Files\\cloudflared\\cloudflared.exe',
        'cloudflared'
    ];

    for (const p of candidates) {
        if (p === 'cloudflared' || fs.existsSync(p)) {
            return p;
        }
    }
    return 'cloudflared';
}

/**
 * Starts a Cloudflare Quick Tunnel to expose local port to public WSS/HTTPS.
 * Resolves with { tunnelUrl, wssUrl } when connected.
 * @param {number} port 
 * @returns {Promise<{ tunnelUrl: string, wssUrl: string }>}
 */
export async function startTunnel(port = (global.port || process.env.PORT || 3001)) {
    if (global.tunnelUrl && global.wssUrl) {
        return { tunnelUrl: global.tunnelUrl, wssUrl: global.wssUrl };
    }

    // If manual URL specified in environment variables
    if (process.env.TUNNEL_URL) {
        const tunnelUrl = process.env.TUNNEL_URL.trim().replace(/\/+$/, '');
        const wssUrl = tunnelUrl.replace(/^http/, 'ws') + '/ws/arena';
        global.tunnelUrl = tunnelUrl;
        global.wssUrl = wssUrl;
        console.log(chalk.green(`🌐 [Tunnel] Menggunakan URL dari ENV: ${tunnelUrl}`));
        return { tunnelUrl, wssUrl };
    }

    const binPath = findCloudflaredPath();
    console.log(chalk.blue(`🌐 [Tunnel] Memulai Cloudflare Quick Tunnel untuk port ${port}...`));

    return new Promise((resolve) => {
        try {
            tunnelProcess = spawn(binPath, ['tunnel', '--url', `http://localhost:${port}`], {
                stdio: ['ignore', 'pipe', 'pipe']
            });

            let resolved = false;

            const onData = (data) => {
                const text = data.toString();
                // Match https://something.trycloudflare.com
                const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
                if (match && !resolved) {
                    resolved = true;
                    const tunnelUrl = match[0];
                    const wssUrl = tunnelUrl.replace(/^http/, 'ws') + '/ws/arena';

                    global.tunnelUrl = tunnelUrl;
                    global.wssUrl = wssUrl;

                    console.log(chalk.green(`✅ [Tunnel] Cloudflare Tunnel AKTIF:`));
                    console.log(chalk.cyan(`   🔗 HTTPS URL: ${tunnelUrl}`));
                    console.log(chalk.cyan(`   ⚡ WSS URL  : ${wssUrl}`));

                    resolve({ tunnelUrl, wssUrl });
                }
            };

            tunnelProcess.stdout.on('data', onData);
            tunnelProcess.stderr.on('data', onData);

            tunnelProcess.on('error', (err) => {
                console.warn(chalk.yellow(`⚠️ [Tunnel] Gagal menjalankan cloudflared: ${err.message}`));
                if (!resolved) {
                    resolved = true;
                    resolve({ tunnelUrl: `http://localhost:${port}`, wssUrl: `ws://localhost:${port}/ws/arena` });
                }
            });

            tunnelProcess.on('close', (code) => {
                console.log(chalk.gray(`[Tunnel] Cloudflare tunnel process exited with code ${code}`));
                global.tunnelUrl = null;
                global.wssUrl = null;
            });

            // Timeout fallback after 20 seconds
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    console.warn(chalk.yellow(`⚠️ [Tunnel] Waktu habis menunggu tunnel URL, fallback ke localhost.`));
                    resolve({ tunnelUrl: `http://localhost:${port}`, wssUrl: `ws://localhost:${port}/ws/arena` });
                }
            }, 20000);

        } catch (err) {
            console.error(chalk.red(`[Tunnel Error] ${err.message}`));
            resolve({ tunnelUrl: `http://localhost:${port}`, wssUrl: `ws://localhost:${port}/ws/arena` });
        }
    });
}

export function stopTunnel() {
    if (tunnelProcess) {
        tunnelProcess.kill();
        tunnelProcess = null;
    }
}
