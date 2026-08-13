'use strict';

/**
 * BehaviorTree.js — Primitif Behavior Tree untuk TaskPlanner.
 *
 * Status return standar:
 *   SUCCESS  — node berhasil
 *   FAILURE  — node gagal
 *   RUNNING  — node masih berjalan (async)
 */

const STATUS = Object.freeze({
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  RUNNING: 'RUNNING',
});

/**
 * Sequence: jalankan child berurutan, berhenti di FAILURE pertama.
 * Sukses hanya jika SEMUA child sukses.
 */
class Sequence {
  constructor(name, children) {
    this.name = name;
    this.children = children;
    this._currentIndex = 0;
  }

  reset() {
    this._currentIndex = 0;
    this.children.forEach((c) => c.reset && c.reset());
  }

  async tick(ctx) {
    while (this._currentIndex < this.children.length) {
      const result = await this.children[this._currentIndex].tick(ctx);
      if (result === STATUS.FAILURE) {
        this.reset();
        return STATUS.FAILURE;
      }
      if (result === STATUS.RUNNING) return STATUS.RUNNING;
      // SUCCESS — lanjut ke child berikutnya
      this._currentIndex++;
    }
    this.reset();
    return STATUS.SUCCESS;
  }
}

/**
 * Selector: jalankan child berurutan, berhenti di SUCCESS pertama.
 * Gagal hanya jika SEMUA child gagal.
 */
class Selector {
  constructor(name, children) {
    this.name = name;
    this.children = children;
    this._currentIndex = 0;
  }

  reset() {
    this._currentIndex = 0;
    this.children.forEach((c) => c.reset && c.reset());
  }

  async tick(ctx) {
    while (this._currentIndex < this.children.length) {
      const result = await this.children[this._currentIndex].tick(ctx);
      if (result === STATUS.SUCCESS) {
        this.reset();
        return STATUS.SUCCESS;
      }
      if (result === STATUS.RUNNING) return STATUS.RUNNING;
      // FAILURE — coba child berikutnya
      this._currentIndex++;
    }
    this.reset();
    return STATUS.FAILURE;
  }
}

/**
 * Action: node daun yang menjalankan fungsi async.
 * @param {string} name
 * @param {function} fn - async(ctx) => STATUS
 */
class Action {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
    this._status = null;
  }

  reset() {
    this._status = null;
  }

  async tick(ctx) {
    try {
      const result = await this.fn(ctx);
      this._status = result;
      return result;
    } catch (err) {
      // Wrap exception sebagai FAILURE terstruktur — tidak lempar ke luar
      ctx?.blackboard?.recovery?.logError?.({
        source: `BT.Action[${this.name}]`,
        error: err,
      });
      this._status = STATUS.FAILURE;
      return STATUS.FAILURE;
    }
  }
}

/**
 * Condition: node daun yang mengecek kondisi.
 * @param {string} name
 * @param {function} fn - async(ctx) => boolean
 */
class Condition {
  constructor(name, fn) {
    this.name = name;
    this.fn = fn;
  }

  reset() {}

  async tick(ctx) {
    try {
      const ok = await this.fn(ctx);
      return ok ? STATUS.SUCCESS : STATUS.FAILURE;
    } catch (err) {
      return STATUS.FAILURE;
    }
  }
}

/**
 * Decorator: Inverter — membalik hasil child.
 */
class Inverter {
  constructor(name, child) {
    this.name = name;
    this.child = child;
  }

  reset() {
    this.child.reset && this.child.reset();
  }

  async tick(ctx) {
    const result = await this.child.tick(ctx);
    if (result === STATUS.SUCCESS) return STATUS.FAILURE;
    if (result === STATUS.FAILURE) return STATUS.SUCCESS;
    return STATUS.RUNNING;
  }
}

/**
 * Decorator: Retry — coba ulang child sampai N kali jika FAILURE.
 */
class Retry {
  constructor(name, child, maxRetries) {
    this.name = name;
    this.child = child;
    this.maxRetries = maxRetries;
    this._retries = 0;
  }

  reset() {
    this._retries = 0;
    this.child.reset && this.child.reset();
  }

  async tick(ctx) {
    while (this._retries <= this.maxRetries) {
      const result = await this.child.tick(ctx);
      if (result === STATUS.SUCCESS) {
        this.reset();
        return STATUS.SUCCESS;
      }
      if (result === STATUS.RUNNING) return STATUS.RUNNING;
      this._retries++;
    }
    this.reset();
    return STATUS.FAILURE;
  }
}

module.exports = { STATUS, Sequence, Selector, Action, Condition, Inverter, Retry };
