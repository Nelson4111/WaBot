'use strict';

const axios = require('axios');
const { createModuleLogger } = require('../utils/logger');

const log = createModuleLogger('GeminiService');

const SYSTEM_INSTRUCTION = `Kamu adalah Nenel, bot cewek Minecraft pintar di server SMP.

ATURAN UTAMA KOMUNIKASI (SUPER SINGKAT & DIRECT):
1. SINGKAT, PADAT, & TEGAS:
   - Jawab pertanyaan player dengan SINGKAT, PADAT, & JELAS (maksimal 1-2 kalimat pendek).
   - DILARANG keras menjawab panjang lebar seperti pidato atau membuat paragraf panjang!
   - DILARANG banyak bertanya balik atau bertele-tele.

2. JIKA TIDAK TAHU:
   - Jika kamu tidak tahu atau informasi tidak pasti, LANGSUNG katakan "Saya kurang tahu" atau "Gak tahu" secara jujur dan singkat tanpa alasan berbelit-belit!

3. KETENTUAN GAYA BAHASA:
   - PANGGIL NAMA PLAYER: Panggil nama player tanpa angka (contoh: Budi123 -> Budi).
   - DILARANG menggunakan kata "bro" atau "sis".
   - DILARANG spontan menyebut nama "Nelson" kecuali diminta.`;

class GeminiService {
  constructor() {
    this.apiKey = (process.env.GEMINI_API_KEY || '').trim();
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    // Simpan riwayat percakapan per player (maksimal 6 percakapan terakhir)
    this.userHistories = new Map();
    this.clearAllHistory();
  }

  /**
   * Bersihkan seluruh ingatan percakapan lama agar tidak mempengaruhi kepribadian AI
   */
  clearAllHistory() {
    this.userHistories.clear();
    log.info('Seluruh riwayat ingatan percakapan AI telah dibersihkan murni!');
  }

  /**
   * Cek apakah API key tersedia
   */
  isEnabled() {
    return Boolean(this.apiKey && this.apiKey !== '');
  }

  /**
   * Pembersih teks balasan mentah dari AI (menghapus format tag & whitespace berlebih)
   * @private
   */
  _cleanAndTruncateReply(text) {
    if (!text || typeof text !== 'string') return null;
    let cleaned = text
      .replace(/^\[.*?\]\s*:\s*/gi, '')
      .replace(/^Nenel\s*:\s*/gi, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/^["'«“]|["'»”]$/g, '')
      .trim();

    return cleaned || null;
  }

  /**
   * Pemotong dan pembagi teks balasan panjang menjadi beberapa potongan kalimat bersih (chunks)
   * @param {string} replyText
   * @returns {string[]} Array bagian kalimat
   */
  splitReplyIntoChunks(replyText) {
    if (!replyText || typeof replyText !== 'string') return [];
    let cleaned = replyText
      .replace(/^\[.*?\]\s*:\s*/gi, '')
      .replace(/^Nenel\s*:\s*/gi, '')
      .replace(/[\r\n]+/g, ' ')
      .replace(/^["'«“]|["'»”]$/g, '')
      .trim();

    if (!cleaned) return [];

    // Jika panjang balasan <= 140 karakter, kirim sebagai 1 potongan
    if (cleaned.length <= 140) return [cleaned];

    // Jika lebih panjang, bagi berdasarkan tanda titik/tanya/seru
    const sentences = cleaned.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length <= 1) {
      const chunks = [];
      let remaining = cleaned;
      while (remaining.length > 0) {
        if (remaining.length <= 140) {
          chunks.push(remaining);
          break;
        }
        let cut = remaining.substring(0, 140);
        let lastSpace = cut.lastIndexOf(' ');
        if (lastSpace > 40) cut = remaining.substring(0, lastSpace);
        chunks.push(cut.trim());
        remaining = remaining.substring(cut.length).trim();
      }
      return chunks;
    }

    const chunks = [];
    let currentChunk = '';

    for (const s of sentences) {
      if ((currentChunk + ' ' + s).trim().length <= 140) {
        currentChunk = (currentChunk + ' ' + s).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = s;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks;
  }

  /**
   * Simpan percakapan ke riwayat player
   * @private
   */
  _saveHistory(sender, userPrompt, botReply) {
    if (!this.userHistories.has(sender)) {
      this.userHistories.set(sender, []);
    }
    const history = this.userHistories.get(sender);
    history.push({ user: userPrompt, bot: botReply });
    if (history.length > 6) {
      history.shift(); // Pertahankan 6 percakapan terakhir
    }
  }

  /**
   * Buat pesan ber-riwayat untuk Groq / OpenRouter (Format OpenAI)
   * @private
   */
  _getGroqMessages(sender, prompt) {
    const history = this.userHistories.get(sender) || [];
    const messages = [
      { role: 'system', content: SYSTEM_INSTRUCTION }
    ];

    for (const item of history) {
      messages.push({ role: 'user', content: `${sender}: ${item.user}` });
      messages.push({ role: 'assistant', content: item.bot });
    }

    messages.push({ role: 'user', content: `${sender}: ${prompt}` });
    return messages;
  }

  /**
   * Hasikan balasan chat berdasarkan pertanyaan player.
   * @param {string} sender - Username pengirim chat
   * @param {string} prompt - Pesan dari player
   * @returns {Promise<string|null>}
   */
  async generateReply(sender, prompt) {
    if (!this.isEnabled()) return null;

    // 1. Jika API Key Groq (berawalan gsk_)
    if (this.apiKey.startsWith('gsk_')) {
      return this._callGroq(sender, prompt);
    }

    // 2. Jika API Key OpenRouter (berawalan sk-or-)
    if (this.apiKey.startsWith('sk-or-')) {
      return this._callOpenRouter(sender, prompt);
    }

    // 3. Default: Google AI Studio (berawalan AIzaSy...)
    return this._callGoogleGemini(sender, prompt);
  }

  /**
   * Pemanggilan resmi ke Google AI Studio REST API
   * @private
   */
  async _callGoogleGemini(sender, prompt) {
    const candidateModels = [
      this.model,
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash'
    ];

    const modelsToTry = [...new Set(candidateModels)];
    const history = this.userHistories.get(sender) || [];
    let fullPromptText = `${SYSTEM_INSTRUCTION}\n\n`;

    if (history.length > 0) {
      fullPromptText += `[Riwayat Percakapan Sebelumnya dengan ${sender}]:\n`;
      for (const item of history) {
        fullPromptText += `${sender}: "${item.user}"\nNenel: "${item.bot}"\n`;
      }
      fullPromptText += `\n`;
    }
    fullPromptText += `[Pesan Terbaru dari ${sender}]: "${prompt}"\n[Balasan Nenel]:`;

    for (const modelName of modelsToTry) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;

      try {
        const response = await axios.post(
          url,
          {
            contents: [
              {
                role: 'user',
                parts: [{ text: fullPromptText }]
              }
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 250,
            }
          },
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 7000
          }
        );

        const candidate = response.data?.candidates?.[0];
        let rawReply = candidate?.content?.parts?.[0]?.text || null;
        let reply = this._cleanAndTruncateReply(rawReply);

        if (reply) {
          this._saveHistory(sender, prompt, reply);
          log.info(`Gemini AI Reply ke ${sender} (${modelName}): "${reply}" (${reply.length} chars)`);
          return reply;
        }
      } catch (err) {
        const status = err.response?.status;
        const errMsg = err.response?.data?.error?.message || err.message;

        log.warn(`[GeminiAI] Model ${modelName} respon error (${status || 'net'}): ${errMsg}`);

        if (status === 429 || errMsg.includes('Quota exceeded')) {
          log.debug(`Model ${modelName} rate limited, mencoba model alternatif...`);
          continue;
        }
      }
    }

    return null;
  }

  /**
   * Pemanggilan ke Groq Cloud API
   * @private
   */
  async _callGroq(sender, prompt) {
    const groqModels = [
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
      'llama-3.1-70b-versatile',
      'gemma2-9b-it'
    ];

    const messages = this._getGroqMessages(sender, prompt);

    for (const modelName of groqModels) {
      try {
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: modelName,
            messages: messages,
            max_tokens: 250,
            temperature: 0.8
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.apiKey}`
            },
            timeout: 7000
          }
        );

        let rawReply = response.data?.choices?.[0]?.message?.content || null;
        let reply = this._cleanAndTruncateReply(rawReply);

        if (reply) {
          this._saveHistory(sender, prompt, reply);
          log.info(`Groq AI Reply ke ${sender} (${modelName}): "${reply}" (${reply.length} chars)`);
          return reply;
        }
      } catch (err) {
        log.warn(`[GroqAI] Model ${modelName} error: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    return null;
  }

  /**
   * Pemanggilan ke OpenRouter API
   * @private
   */
  async _callOpenRouter(sender, prompt) {
    const messages = this._getGroqMessages(sender, prompt);

    try {
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: messages,
          max_tokens: 250,
          temperature: 0.8
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          timeout: 7000
        }
      );

      let rawReply = response.data?.choices?.[0]?.message?.content || null;
      let reply = this._cleanAndTruncateReply(rawReply);

      if (reply) {
        this._saveHistory(sender, prompt, reply);
        log.info(`OpenRouter AI Reply ke ${sender}: "${reply}" (${reply.length} chars)`);
        return reply;
      }
    } catch (err) {
      log.warn(`[OpenRouterAI] Error: ${err.response?.data?.error?.message || err.message}`);
    }

    return null;
  }
}

module.exports = new GeminiService();
