'use strict';

const { createModuleLogger } = require('../../utils/logger');
const { sleep } = require('../../utils/retry');

const log = createModuleLogger('AutoEnchantManager');

/**
 * AutoEnchantManager mendeteksi saat XP Level bot mencapai 60,
 * lalu menjalankan perintah /ce, membeli Legendary Custom Enchant (Kaca Hijau 60 XP),
 * dan mendepositkan hasilnya ke Shulker Box terdekat.
 */
class AutoEnchantManager {
  /**
   * @param {import('mineflayer').Bot} bot
   * @param {import('../chat/ChatQueue')} chatQueue
   */
  constructor(bot, chatQueue) {
    this.bot = bot;
    this.chatQueue = chatQueue;
    this.isActive = false;
    this.isProcessing = false;
    this._checkInterval = null;
  }

  /**
   * Aktifkan pemantauan XP level.
   */
  start() {
    if (this.isActive) return;
    this.isActive = true;

    // Cek XP level secara periodik setiap 5 detik
    this._checkInterval = setInterval(() => {
      this._checkXPAndBuy();
    }, 5000);

    log.info('AutoEnchantManager (Auto /ce at 60 XP) aktif');
  }

  /**
   * Hentikan pemantauan.
   */
  stop() {
    this.isActive = false;
    if (this._checkInterval) {
      clearInterval(this._checkInterval);
      this._checkInterval = null;
    }
  }

  /**
   * Cek XP dan pemicu transaksi /ce.
   * @private
   */
  async _checkXPAndBuy() {
    if (!this.isActive || this.isProcessing || !this.bot.experience) return;

    // Syarat: XP Level >= 60
    if (this.bot.experience.level >= 60) {
      this.isProcessing = true;
      if (this.botManager) this.botManager.setBusy(true);

      // 1. Hentikan sementara MobFarm agar serangan mob & pathfinding guard mode tidak mengganggu /ce
      const mobFarm = this.botManager?.getModules()?.mobFarm;
      const wasMobFarmActive = mobFarm?.isActive || false;

      if (wasMobFarmActive && mobFarm) {
        log.info('Menghentikan sementara MobFarm untuk transaksi /ce & deposit Shulker...');
        mobFarm.stop();
        await sleep(1500); // Jeda transisi aktivitas 1.5 detik
      }

      log.info(`XP Level mencapai ${this.bot.experience.level}! Membuka GUI /ce...`);
      if (this.chatQueue) this.chatQueue.send(`XP Level mencapai ${this.bot.experience.level}! Membeli Legendary Custom Enchant (/ce)...`);

      try {
        await sleep(1200); // Jeda 1.2 detik sebelum buka /ce
        await this._buyLegendaryEnchant();
        await sleep(1500); // Jeda 1.5 detik setelah beli buku sebelum deposit shulker
        await this._depositToNearestShulker();
        await sleep(1200); // Jeda 1.2 detik setelah deposit shulker
      } catch (err) {
        log.error(`Gagal transaksi /ce: ${err.message}`);
        if (this.chatQueue) this.chatQueue.send(`Gagal transaksi /ce: ${err.message}`);
      } finally {
        this.isProcessing = false;
        if (this.botManager) this.botManager.setBusy(false);

        // 2. Resume MobFarm jika sebelumnya aktif
        if (wasMobFarmActive && mobFarm) {
          log.info('Melanjutkan kembali MobFarm setelah /ce & deposit selesai...');
          await sleep(1500); // Jeda transisi 1.5 detik sebelum resume mobfarm
          mobFarm.start();
        }
      }
    }
  }

  /**
   * Buka GUI /ce dan klik tombol Legendary (Kaca Hijau 60 XP).
   * @private
   */
  async _buyLegendaryEnchant() {
    return new Promise((resolve, reject) => {
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          this.bot.removeListener('windowOpen', onWindowOpen);
          reject(new Error('Timeout menunggu GUI /ce terbuka'));
        }
      }, 10000);

      const onWindowOpen = async (window) => {
        if (resolved) return;

        log.info(`GUI /ce Terbuka: ${window.title || 'Crazy Enchanter'}`);
        await sleep(1000);

        let targetSlot = null;

        // Cari slot kaca hijau / Legendary di dalam container
        for (const [slotIndex, item] of Object.entries(window.slots)) {
          if (!item) continue;
          const name = (item.name || '').toLowerCase();
          const displayName = (item.displayName || '').toLowerCase();

          // Deteksi item kaca hijau (lime/green glass) atau bertuliskan Legendary
          const isGreenGlass = name.includes('lime_stained_glass_pane') || 
                               name.includes('green_stained_glass_pane') || 
                               displayName.includes('legendary');

          if (isGreenGlass) {
            targetSlot = parseInt(slotIndex, 10);
            log.info(`Ditemukan tombol Legendary Enchant pada slot ${targetSlot}`);
            break;
          }
        }

        // Fallback: Di layout Crazy Enchanter standar, slot Legendary berada di slot 28 (kaca hijau di bawah anvil)
        if (targetSlot === null) {
          targetSlot = 28;
          log.info(`Menggunakan fallback slot ${targetSlot} untuk Legendary Enchant`);
        }

        try {
          // Klik tombol beli
          await this.bot.clickWindow(targetSlot, 0, 0);
          log.success('Berhasil mengklik Legendary Enchant (Cost: 60 XP)');
          await sleep(1500);

          // Tutup window
          try {
            this.bot.closeWindow(window);
          } catch (_e) {}

          await sleep(1000);

          // Setor hasil enchant ke Shulker Box terdekat
          await this._depositToNearestShulker();

          resolved = true;
          clearTimeout(timeout);
          resolve();

        } catch (clickErr) {
          resolved = true;
          clearTimeout(timeout);
          reject(clickErr);
        }
      };

      this.bot.once('windowOpen', onWindowOpen);

      // Kirim command /ce
      this.bot.chat('/ce');
    });
  }

  /**
   * Dapatkan seluruh Block ID resmi dari registry Mineflayer untuk Shulker Box, Chest, & Barrel.
   * KECUALI Ender Chest (karena Ender Chest bersifat personal).
   * @private
   */
  _getContainerBlockIds() {
    if (!this.bot.registry || !this.bot.registry.blocksByName) return [];
    const ids = [];
    for (const [name, block] of Object.entries(this.bot.registry.blocksByName)) {
      const n = name.toLowerCase();
      const isContainer = n.includes('shulker_box') || n.includes('chest') || n.includes('barrel');
      const isEnderChest = n.includes('ender_chest');

      if (isContainer && !isEnderChest) {
        if (block && block.id !== undefined) {
          ids.push(block.id);
        }
      }
    }
    return ids;
  }

  /**
   * Cari Shulker Box terdekat dan setor item hasil /ce ke dalamnya.
   * @private
   */
  async _depositToNearestShulker() {
    if (!this.bot.entity || this.isProcessing) return;
    this.isProcessing = true;

    if (this.botManager) this.botManager.setBusy(true);
    log.info('Mencari Shulker Box terdekat untuk menyimpan buku /ce...');

    const fullShulkerPositions = new Set();
    let totalDeposited = 0;
    const containerIds = this._getContainerBlockIds();

    const isBookItem = (item) => {
      if (!item || !item.name) return false;
      const n = item.name.toLowerCase();
      const customName = (item.customName ? JSON.stringify(item.customName) : '').toLowerCase();
      const nbtData = (item.nbt ? JSON.stringify(item.nbt) : '').toLowerCase();

      return n.includes('book') ||
             n.includes('paper') ||
             customName.includes('enchant') ||
             customName.includes('book') ||
             nbtData.includes('enchant') ||
             nbtData.includes('customenchants');
    };

    let loopLimit = 0;

    try {
      while (loopLimit++ < 10) {
        // 1. Cek apakah masih ada buku enchant di inventory
        const items = this.bot.inventory.items();
        const enchantBooks = items.filter(isBookItem);

        if (enchantBooks.length === 0) break; // Semua buku sudah tersimpan!

        // 2. Cari Shulker Box / Chest / Barrel terdekat berbasis Block ID resmi (radius 32 block)
        let shulkerBlock = null;
        if (containerIds.length > 0) {
          const positions = this.bot.findBlocks({
            matching: containerIds,
            maxDistance: 32,
            count: 30,
          });

          for (const pos of positions) {
            const posKey = `${pos.x},${pos.y},${pos.z}`;
            if (!fullShulkerPositions.has(posKey)) {
              shulkerBlock = this.bot.blockAt(pos);
              break;
            }
          }
        }

        // Fallback: Jika tidak ditemukan via ID, coba findBlock dengan predicate nama
        if (!shulkerBlock) {
          shulkerBlock = this.bot.findBlock({
            matching: (block) => {
              if (!block || !block.name) return false;
              const n = block.name.toLowerCase();
              const isMatch = (n.includes('shulker') || n.includes('chest') || n.includes('barrel')) && !n.includes('ender_chest');
              if (!isMatch) return false;
              const posKey = `${block.position.x},${block.position.y},${block.position.z}`;
              return !fullShulkerPositions.has(posKey);
            },
            maxDistance: 32,
          });
        }

        if (!shulkerBlock || !shulkerBlock.position) {
          log.warn('Tidak ada Shulker Box / Chest / Barrel tersedia di sekitar bot (radius 32 block).');
          if (this.chatQueue) this.chatQueue.send('Semua Shulker Box/Chest terdekat penuh! Buku /ce disimpan di inventory.');
          break;
        }

        const posKey = `${shulkerBlock.position.x},${shulkerBlock.position.y},${shulkerBlock.position.z}`;

        // 3. Jika lokasi container > 3 block, berjalan mendekat dulu agar tidak terlalu jauh
        const dist = this.bot.entity.position.distanceTo(shulkerBlock.position);
        if (dist > 3 && this.botManager?.getModules()?.pathfinder) {
          log.info(`Mendekati ${shulkerBlock.name} di ${shulkerBlock.position} (jarak: ${dist.toFixed(1)}m)...`);
          await this.botManager.getModules().pathfinder.goto(shulkerBlock.position, 2).catch(() => {});
          await sleep(1000);
        }

        log.info(`Membuka ${shulkerBlock.name} di ${shulkerBlock.position}...`);

        try {
          const shulkerWindow = await this.bot.openContainer(shulkerBlock);
          await sleep(1000); // Jeda konfirmasi container terbuka penuh oleh server

          let depositedInThisShulker = 0;
          const startSlot = shulkerWindow.inventoryStart || 27;
          const endSlot = shulkerWindow.inventoryEnd || 63;

          for (let slot = startSlot; slot < endSlot; slot++) {
            const itemInSlot = shulkerWindow.slots[slot];
            if (!itemInSlot || !isBookItem(itemInSlot)) continue;

            const countBefore = itemInSlot.count;

            try {
              // Shift-Click (button 0, mode 1) untuk memindahkan buku ke slot kosong Shulker Box
              await this.bot.clickWindow(slot, 0, 1);
              await sleep(650);

              const itemAfter = shulkerWindow.slots[slot];
              if (!itemAfter || itemAfter.count < countBefore) {
                const moved = countBefore - (itemAfter ? itemAfter.count : 0);
                depositedInThisShulker += moved;
                totalDeposited += moved;
                log.info(`Berhasil menaruh ${itemInSlot.name} x${moved} ke ${shulkerBlock.name}`);
              } else {
                // Item tidak berpindah => Shulker Box Penuh!
                log.warn(`Shulker Box di ${shulkerBlock.position} penuh (item tidak dapat masuk lagi).`);
                fullShulkerPositions.add(posKey);
                break;
              }
            } catch (clickErr) {
              log.warn(`Peringatan shift-click slot ${slot}: ${clickErr.message}`);
              fullShulkerPositions.add(posKey);
              break;
            }
          }

          try {
            shulkerWindow.close();
          } catch (_e) {}

          if (depositedInThisShulker === 0) {
            log.warn(`Shulker Box di ${shulkerBlock.position} penuh/tidak dapat menerima item. Mencari Shulker lain...`);
            fullShulkerPositions.add(posKey);
          } else {
            log.success(`Berhasil menaruh ${depositedInThisShulker} buku ke ${shulkerBlock.name} di ${shulkerBlock.position}`);
          }
        } catch (openErr) {
          log.warn(`Gagal membuka container di ${shulkerBlock.position}: ${openErr.message}`);
          fullShulkerPositions.add(posKey);
        }

        await sleep(1200);
      }

      if (totalDeposited > 0) {
        log.success(`Berhasil menyimpan total ${totalDeposited} buku ke Shulker Box.`);
        if (this.chatQueue) this.chatQueue.send(`Berhasil menaruh ${totalDeposited} buku hasil /ce ke Shulker Box.`);
      }
    } finally {
      this.isProcessing = false;
      if (this.botManager) this.botManager.setBusy(false);
    }
  }
}

module.exports = AutoEnchantManager;
