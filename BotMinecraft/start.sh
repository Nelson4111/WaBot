#!/usr/bin/env bash

# ==============================================================================
# MINECRAFT BOT LAUNCHER FOR PTERODACTYL / GAME PANELS (JAVA CONTAINERS)
# ==============================================================================

echo "=================================================="
echo " Starting Minecraft AFK Bot Launcher"
echo "=================================================="

# 1. Tambahkan node_dist/bin ke PATH jika folder node_dist ada
if [ -d "./node_dist/bin" ]; then
    export PATH="$(pwd)/node_dist/bin:$PATH"
fi

# 2. Cek apakah 'node' sudah tersedia
if ! command -v node >/dev/null 2>&1; then
    echo "[Launcher] Node.js tidak ditemukan di container Java ini."
    echo "[Launcher] Mengunduh Portable Node.js v20.18.0 (Linux x64 gzip)..."
    mkdir -p node_dist
    curl -sL https://nodejs.org/dist/v20.18.0/node-v20.18.0-linux-x64.tar.gz | tar -xz --strip-components=1 -C node_dist
    export PATH="$(pwd)/node_dist/bin:$PATH"
    
    if command -v node >/dev/null 2>&1; then
        echo "[Launcher] Berhasil mengunduh & mengekstrak Node.js!"
    else
        echo "[ERROR] Gagal mengunduh Node.js. Pastikan container memiliki koneksi internet & curl/tar."
        exit 1
    fi
else
    echo "[Launcher] Node.js siap: $(node -v)"
fi

# 3. Cek apakah node_modules sudah ada, jika belum jalankan npm install
if [ ! -d "./node_modules" ]; then
    echo "[Launcher] Folder node_modules belum ada. Menginstall dependencies..."
    npm install --production
fi

# 4. Jalankan bot
echo "[Launcher] Memulai bot Minecraft (index.js)..."
echo "=================================================="
node index.js
