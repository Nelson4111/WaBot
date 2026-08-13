'use strict';
const Groq = require('groq-sdk');
const config = require('../../config');
const { createModuleLogger } = require('../utils/Logger');

/**
 * ChatAI.js — AI chat menggunakan Groq API (LLaMA 3.3 70B).
 *
 * Dipanggil saat "bot" atau "nenel" disebut di chat.
 * Menjawab dalam < 10 detik setelah pertanyaan masuk.
 * Pesan panjang dipecah dan dikirim berurutan.
 * Menyebut nama depan pemain, tanpa angka di nama bot.
 */
class ChatAI {
  constructor(blackboard) {
    this.bb = blackboard;
    this.log = createModuleLogger(blackboard.botName, 'ChatAI');

    this._groq = null;
    this._initGroq();

    // History percakapan untuk konteks AI
    this._history = [];
    this._maxHistory = 10; // Jaga agar tidak terlalu besar
  }

  _initGroq() {
    if (!config.ai.apiKey) {
      this.log.warn('GROQ_API_KEY not set — AI chat disabled');
      return;
    }
    try {
      this._groq = new Groq({ apiKey: config.ai.apiKey });
      this.log.info('Groq AI initialized', { model: config.ai.model });
    } catch (err) {
      this.log.error('Failed to init Groq', { error: err.message });
    }
  }

  /**
   * Generate respons AI untuk pertanyaan/pesan dari player.
   * @param {string} username - Nama pemain yang bertanya
   * @param {string} message - Pesan yang dikirim
   * @returns {Promise<string[]>} - Array segmen pesan untuk dikirim
   */
  async generateResponse(username, message) {
    if (!this._groq) {
      return ['Maaf, AI sedang offline.'];
    }

    // Ambil nama depan saja (tanpa angka)
    const firstName = this._extractFirstName(username);

    // Bangun history context
    const messages = [
      {
        role: 'system',
        content: this._buildSystemPrompt(firstName),
      },
      ...this._history.slice(-this._maxHistory),
      { role: 'user', content: `${firstName}: ${message}` },
    ];

    try {
      const completion = await Promise.race([
        this._groq.chat.completions.create({
          model: config.ai.model,
          messages,
          max_tokens: config.ai.maxTokens,
          temperature: config.ai.temperature,
        }),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error('AI timeout')),
            config.chat.aiResponseWindowMs - 1000), // 1s buffer
        ),
      ]);

      const rawResponse = completion.choices[0]?.message?.content || '';
      const cleaned = this._cleanResponse(rawResponse);

      // Simpan ke history
      this._history.push({ role: 'user', content: `${firstName}: ${message}` });
      this._history.push({ role: 'assistant', content: cleaned });
      if (this._history.length > this._maxHistory * 2) {
        this._history = this._history.slice(-this._maxHistory);
      }

      // Pecah pesan jika terlalu panjang
      return this._splitMessage(cleaned);
    } catch (err) {
      this.log.warn('AI generation error', { error: err.message });
      if (err.message.includes('timeout')) {
        return null; // Tidak ada respons — window habis
      }
      return null;
    }
  }

  /**
   * Bangun system prompt dengan persona bot.
   */
  _buildSystemPrompt(firstName) {
    const persona = config.ai.botPersona;
    return [
      `Kamu adalah ${persona}, bot Minecraft yang ramah dan helpful di ${config.ai.serverContext}`,
      `Kamu sedang ngobrol dengan pemain bernama ${firstName}.`,
      `Jawab dalam Bahasa Indonesia yang santai dan natural. Singkat dan padat.`,
      `Jangan sebut angka di nama kamu. Sebut dirimu "${persona}" saja.`,
      `Jangan terlalu panjang karena ada limit karakter chat Minecraft.`,
      `Kalau tidak tahu sesuatu, akui dengan jujur.`,
    ].join(' ');
  }

  /**
   * Bersihkan respons dari format tidak perlu.
   */
  _cleanResponse(text) {
    return text
      .replace(/\*\*/g, '')       // hapus bold markdown
      .replace(/\*/g, '')          // hapus italic markdown
      .replace(/^[-•]\s*/gm, '')  // hapus bullet points
      .replace(/\n{3,}/g, '\n\n') // kurangi newline berlebih
      .trim();
  }

  /**
   * Pecah pesan panjang menjadi segmen yang sesuai limit chat Minecraft.
   * @param {string} text
   * @returns {string[]}
   */
  _splitMessage(text) {
    const maxLen = config.chat.maxMessageLength;
    if (text.length <= maxLen) return [text];

    const segments = [];
    // Pisah di batas kalimat dulu
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = '';

    for (const sentence of sentences) {
      if ((current + ' ' + sentence).trim().length <= maxLen) {
        current = (current + ' ' + sentence).trim();
      } else {
        if (current) segments.push(current);
        // Jika kalimat sendiri terlalu panjang, potong di kata
        if (sentence.length > maxLen) {
          const words = sentence.split(' ');
          current = '';
          for (const word of words) {
            if ((current + ' ' + word).trim().length <= maxLen) {
              current = (current + ' ' + word).trim();
            } else {
              if (current) segments.push(current);
              current = word;
            }
          }
        } else {
          current = sentence;
        }
      }
    }
    if (current) segments.push(current);
    return segments.filter((s) => s.length > 0);
  }

  /**
   * Ekstrak nama depan dari username, hilangkan angka.
   * Contoh: "Nelson41111" → "Nelson", "Player_123" → "Player"
   */
  _extractFirstName(username) {
    // Hilangkan angka trailing
    let name = username.replace(/\d+$/, '');
    // Ambil sebelum underscore/titik
    name = name.split(/[_.\s]/)[0];
    // Kapitalkan
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  /**
   * Cek apakah pesan mengandung trigger word AI.
   * @param {string} message
   */
  static isTrigger(message) {
    const lower = message.toLowerCase();
    return config.chat.aiTriggerWords.some((w) => lower.includes(w));
  }

  /**
   * Reset history percakapan.
   */
  resetHistory() {
    this._history = [];
  }
}

module.exports = ChatAI;
