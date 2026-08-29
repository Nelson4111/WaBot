/**
 * test-groq-key-audit.js — Test suite untuk verifikasi Groq API Key Management & Error Handling
 */

import { GroqProvider, maskApiKey } from '../lib/ai/providers/GroqProvider.js';
import { ModelManager } from '../lib/ai/providers/ModelManager.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${message}`);
        failed++;
    }
}

async function runKeyAuditTests() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 GROQ API KEY MANAGEMENT & SECURITY AUDIT TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    // ─── TEST 1: Key Masking ──────────────────────────────────────────────────
    console.log('Test 1 — Key Masking Security:');
    const mockKey1 = 'gsk_1234567890abcdef1234567890abcdef1234567890abcdef';
    const masked1 = maskApiKey(mockKey1);
    assert(masked1 === 'gsk_...cdef', `Masking key panjang: ${masked1}`);
    assert(!masked1.includes('1234567890abcdef'), 'Key asli tidak terbocorkan dalam masked string');

    const maskedNull = maskApiKey(null);
    assert(maskedNull === 'missing', 'Masking null key mengembalikan "missing"');

    const maskedShort = maskApiKey('123');
    assert(maskedShort === '***', 'Masking short key mengembalikan "***"');

    // ─── TEST 2: KeyPool Initialization ──────────────────────────────────────
    console.log('\nTest 2 — KeyPool Initialization:');
    const provider = new GroqProvider(['gsk_dummyKeyOne1111', 'gsk_dummyKeyTwo2222', 'gsk_dummyKeyOne1111'], ['llama-3.1-8b-instant']);
    assert(provider.keyPool.length === 2, 'Deduplikasi key duplikat berhasil (2 unique keys)');
    assert(provider.keyPool[0].status === 'ACTIVE', 'Key pertama status ACTIVE');
    assert(provider.keyPool[1].status === 'ACTIVE', 'Key kedua status ACTIVE');

    // ─── TEST 3: Status Transition (429 Rate Limit) ───────────────────────────
    console.log('\nTest 3 — 429 Rate Limit Handling:');
    provider.keyPool[0].status = 'RATE_LIMITED';
    provider.keyPool[0].cooldownUntil = Date.now() + 60000; // 60s cooldown

    const eligibleAfterRateLimit = provider.getEligibleKeys();
    assert(eligibleAfterRateLimit.length === 1, 'Hanya key kedua yang eligible setelah key 1 terkena rate limit');
    assert(eligibleAfterRateLimit[0].masked === provider.keyPool[1].masked, 'Key 2 terpilih saat Key 1 rate limited');

    // ─── TEST 4: Status Transition (401 Invalid Key) ──────────────────────────
    console.log('\nTest 4 — 401 Invalid Key Handling:');
    provider.keyPool[1].status = 'INVALID';

    const eligibleAfter401 = provider.getEligibleKeys();
    // Key 1 masih RATE_LIMITED, Key 2 INVALID -> fallback ke key yang paling cepat pulih
    assert(eligibleAfter401[0].masked === provider.keyPool[0].masked, 'Key INVALID (401) tidak diikutsertakan');

    // ─── TEST 5: Cooldown Expiry Auto-Recovery ────────────────────────────────
    console.log('\nTest 5 — Cooldown Expiry Auto-Recovery:');
    // Set cooldown key 1 sudah lewat waktu
    provider.keyPool[0].cooldownUntil = Date.now() - 1000;

    const eligibleRecovered = provider.getEligibleKeys();
    assert(provider.keyPool[0].status === 'ACTIVE', 'Status key 1 otomatis pulih ke ACTIVE setelah cooldown habis');
    assert(eligibleRecovered.length === 1 && eligibleRecovered[0].masked === provider.keyPool[0].masked, 'Key 1 kembali eligible');

    // ─── TEST 6: ModelManager Environment Multi-Format Parser ─────────────────
    console.log('\nTest 6 — ModelManager Multi-Format Parser:');
    process.env.GROQ_API_KEY = 'gsk_mockEnvKey1_aaaa';
    process.env.GROQ_KEY_1 = 'gsk_mockEnvKey2_bbbb';
    process.env.GROQ_KEYS = 'gsk_mockEnvKey3_cccc, gsk_mockEnvKey4_dddd';

    const mm = new ModelManager();
    const groqProv = mm.providers.find(p => p.name === 'Groq');
    assert(groqProv !== undefined, 'GroqProvider berhasil diinisialisasi');
    assert(groqProv.keyPool.length >= 4, `Berhasil membaca ${groqProv.keyPool.length} keys dari berbagai format env`);

    // ─── TEST 7: Fallback Provider Activation ─────────────────────────────────
    console.log('\nTest 7 — Fallback Provider Activation:');
    const pollinationsProv = mm.providers.find(p => p.name === 'Pollinations');
    assert(pollinationsProv !== undefined, 'PollinationsProvider terdaftar sebagai fallback provider');

    // ─── TEST 8: Log Output Safety ───────────────────────────────────────────
    console.log('\nTest 8 — Log Output Safety:');
    const poolStatus = groqProv.getPoolStatus();
    for (const item of poolStatus) {
        assert(item.masked.includes('...'), `Key ${item.masked} tersamar dengan aman`);
        assert(!item.masked.includes('mockEnvKey'), `Key secret tidak bocor: ${item.masked}`);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`📊 HASIL TEST: ${passed} PASSED, ${failed} FAILED`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (failed > 0) process.exit(1);
}

runKeyAuditTests().catch(console.error);
