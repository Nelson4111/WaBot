'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Main.class base64 compiled for Java 8+ compatibility
const MAIN_CLASS_BASE64 = fs.readFileSync('Main.class').toString('base64');

/**
 * Buat file bungeecord.jar menggunakan utilitas zip/jar atau node buffer.
 */
function createBungeecordJar() {
  const tempDir = path.join(__dirname, 'jar_build');
  const metaDir = path.join(tempDir, 'META-INF');

  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  fs.mkdirSync(metaDir, { recursive: true });

  // 1. Tulis Main.class
  fs.writeFileSync(path.join(tempDir, 'Main.class'), Buffer.from(MAIN_CLASS_BASE64, 'base64'));

  // 2. Tulis MANIFEST.MF
  const manifestContent = 'Manifest-Version: 1.0\r\nMain-Class: Main\r\n\r\n';
  fs.writeFileSync(path.join(metaDir, 'MANIFEST.MF'), manifestContent);

  // 3. Jar/zip ke bungeecord.jar
  const jarPath = path.join(__dirname, 'bungeecord.jar');
  if (fs.existsSync(jarPath)) fs.unlinkSync(jarPath);

  try {
    // Jalankan fastjar / jar yang terinstall
    execSync(`jar cfm "${jarPath}" "${path.join(metaDir, 'MANIFEST.MF')}" -C "${tempDir}" Main.class`, {
      stdio: 'inherit'
    });
    console.log('[SUCCESS] bungeecord.jar berhasil dibuat!');
  } catch (err) {
    console.error('[ERROR] Gagal membuat bungeecord.jar:', err.message);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

createBungeecordJar();
