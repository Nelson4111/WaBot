'use strict';

/**
 * Utility untuk mengekstrak pesan kick dari paket/objek chat Minecraft (NBT atau JSON format).
 */
function formatKickReason(reason) {
  if (!reason) return 'Unknown reason';
  if (typeof reason === 'string') return reason;

  if (typeof reason === 'object') {
    try {
      // Jika merupakan ChatMessage mineflayer (punya toMotd / toAnsi / toPlainText)
      if (typeof reason.toPlainText === 'function') return reason.toPlainText();
      if (typeof reason.toMotd === 'function') return reason.toMotd();

      const parts = [];

      function walk(node) {
        if (!node) return;
        if (typeof node === 'string') {
          parts.push(node);
          return;
        }
        if (typeof node === 'object') {
          if (node.value !== undefined && (typeof node.value === 'string' || typeof node.value === 'number')) {
            parts.push(String(node.value));
          }
          if (node.text) walk(node.text);
          if (node.translate) walk(node.translate);
          if (node.with) walk(node.with);
          if (node.extra) walk(node.extra);
          if (Array.isArray(node)) {
            node.forEach(walk);
          }
          if (node.value && typeof node.value === 'object') {
            walk(node.value);
          }
        }
      }

      walk(reason);
      const cleaned = parts.join(' ').replace(/\s+/g, ' ').trim();
      return cleaned || JSON.stringify(reason);
    } catch (_) {
      return JSON.stringify(reason);
    }
  }

  return String(reason);
}

module.exports = { formatKickReason };
