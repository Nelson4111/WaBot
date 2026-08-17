/**
 * YouTube Account & Cookie Pool Manager
 * Mengelola rotasi akun Google / YouTube Cookie / OAuth Token secara Round-Robin & Failover
 */
class YoutubeAccountManager {
  constructor(config = {}) {
    this.accounts = Array.isArray(config.youtube_account_pool) ? config.youtube_account_pool : [];
    this.currentIndex = 0;
    this.cooldowns = new Map(); // accountId -> expiryTimestamp
  }

  /**
   * Mendapatkan akun aktif berikutnya yang tidak sedang dalam masa cooldown
   */
  getNextAccount() {
    if (!this.accounts || this.accounts.length === 0) {
      return null;
    }

    const now = Date.now();
    const activeAccounts = this.accounts.filter(acc => {
      if (!acc.enabled) return false;
      const cd = this.cooldowns.get(acc.id);
      return !cd || cd <= now;
    });

    if (activeAccounts.length === 0) {
      // Jika semua akun cooldown, ambil akun dengan cooldown paling cepat berakhir
      return this.accounts.find(acc => acc.enabled) || null;
    }

    this.currentIndex = (this.currentIndex + 1) % activeAccounts.length;
    return activeAccounts[this.currentIndex];
  }

  /**
   * Memberikan cooldown pada akun yang terkena limit (misal 429 atau 403)
   * @param {string} accountId 
   * @param {number} durationMs Default 15 menit
   */
  markCooldown(accountId, durationMs = 15 * 60 * 1000) {
    if (!accountId) return;
    this.cooldowns.set(accountId, Date.now() + durationMs);
    console.log(`[YT-AccountPool] Account "${accountId}" placed on cooldown for ${Math.round(durationMs / 60000)}m.`);
  }

  /**
   * Status ringkasan pool akun
   */
  getStats() {
    const now = Date.now();
    return {
      total: this.accounts.length,
      active: this.accounts.filter(acc => acc.enabled && (!this.cooldowns.get(acc.id) || this.cooldowns.get(acc.id) <= now)).length,
      cooldown: this.accounts.filter(acc => acc.enabled && this.cooldowns.get(acc.id) > now).length
    };
  }
}

module.exports = YoutubeAccountManager;
