import fs from 'fs'
import path from 'path'

const messagesPath = path.resolve('./node_modules/@whiskeysockets/baileys/lib/Utils/messages.js')
const messagesMediaPath = path.resolve('./node_modules/@whiskeysockets/baileys/lib/Utils/messages-media.js')

function patchBaileys() {
    let patched = false

    // 1. Patch messages.js to preserve user-provided waveform
    if (fs.existsSync(messagesPath)) {
        let content = fs.readFileSync(messagesPath, 'utf8')
        const target = "const requiresWaveformProcessing = mediaType === 'audio' && uploadData.ptt === true;"
        const replacement = "const requiresWaveformProcessing = mediaType === 'audio' && uploadData.ptt === true && typeof uploadData.waveform === 'undefined';"
        if (content.includes(target)) {
            content = content.replace(target, replacement)
            fs.writeFileSync(messagesPath, content, 'utf8')
            console.log('[Baileys Patch] ✅ Patched messages.js to preserve custom waveform')
            patched = true
        }
    }

    // 2. Patch messages-media.js to add natural fallback waveform generator when audio-decode is missing
    if (fs.existsSync(messagesMediaPath)) {
        let mediaContent = fs.readFileSync(messagesMediaPath, 'utf8')
        if (!mediaContent.includes('generateFallbackWaveform')) {
            const fallbackFn = `const generateFallbackWaveform = (audioData) => {
    const samples = 64;
    const waveform = new Uint8Array(samples);
    let seed = audioData?.length || 100;
    const len = audioData ? Math.min(audioData.length, 100) : 0;
    for (let i = 0; i < len; i++) {
        seed = (seed * 31 + (audioData[i] ?? 0)) >>> 0;
    }
    const random = () => {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return (seed >>> 16) / 65536;
    };
    for (let i = 0; i < samples; i++) {
        const position = i / samples;
        const envelope = Math.sin(position * Math.PI);
        const baseAmplitude = 30 + random() * 40;
        waveform[i] = Math.min(100, Math.max(0, Math.floor(baseAmplitude * envelope)));
    }
    return waveform;
};
export async function getAudioWaveform(buffer, logger) {
    let audioData;
    if (Buffer.isBuffer(buffer)) {
        audioData = buffer;
    }
    else if (typeof buffer === 'string') {
        const rStream = createReadStream(buffer);
        audioData = await toBuffer(rStream);
    }
    else {
        audioData = await toBuffer(buffer);
    }
    try {
        // @ts-ignore
        const { default: decoder } = await import('audio-decode');
        const audioBuffer = await decoder(audioData);
        const rawData = audioBuffer.getChannelData(0);
        const samples = 64;
        const blockSize = Math.floor(rawData.length / samples);
        const filteredData = [];
        for (let i = 0; i < samples; i++) {
            const blockStart = blockSize * i;
            let sum = 0;
            for (let j = 0; j < blockSize; j++) {
                sum = sum + Math.abs(rawData[blockStart + j]);
            }
            filteredData.push(sum / blockSize);
        }
        const multiplier = Math.pow(Math.max(...filteredData), -1);
        const normalizedData = filteredData.map(n => n * multiplier);
        const waveform = new Uint8Array(normalizedData.map(n => Math.floor(100 * n)));
        return waveform;
    }
    catch (e) {
        logger?.debug('Failed to generate waveform: ' + e);
        return generateFallbackWaveform(audioData);
    }
}`

            const originalGetWaveformRegex = /export async function getAudioWaveform[\s\S]*?catch \(e\) \{[\s\S]*?\}\s*\}/
            if (originalGetWaveformRegex.test(mediaContent)) {
                mediaContent = mediaContent.replace(originalGetWaveformRegex, fallbackFn)
                fs.writeFileSync(messagesMediaPath, mediaContent, 'utf8')
                console.log('[Baileys Patch] ✅ Patched messages-media.js with fallback waveform generator')
                patched = true
            }
        }
    }

    if (!patched) {
        console.log('[Baileys Patch] ℹ️ Baileys is already up to date with waveform patches.')
    }
}

patchBaileys()
