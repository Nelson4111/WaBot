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

    // 3. Patch WAProto/index.js to support Native Sound Stickers (audioMessage in StickerMessage & audioStickerMessage in Message)
    const waProtoPath = path.resolve('./node_modules/@whiskeysockets/baileys/WAProto/index.js')
    if (fs.existsSync(waProtoPath)) {
        let content = fs.readFileSync(waProtoPath, 'utf8')
        let protoPatched = false

        // 3a. Patch Root Message
        const rootStart = content.indexOf('proto.Message = (function() {')
        const rootEnd = content.indexOf('    return Message;\n    })();', rootStart)
        if (rootStart !== -1 && rootEnd !== -1) {
            let rootBlock = content.slice(rootStart, rootEnd)

            const msgEncTarget = `$root.proto.Message.MessageHistoryNotice.encode(message.messageHistoryNotice, writer.uint32(/* id 102, wireType 2 =*/818).fork()).ldelim();`
            const msgEncRepl = `$root.proto.Message.MessageHistoryNotice.encode(message.messageHistoryNotice, writer.uint32(/* id 102, wireType 2 =*/818).fork()).ldelim();
            if (message.audioStickerMessage != null && Object.hasOwnProperty.call(message, "audioStickerMessage"))
                $root.proto.Message.FutureProofMessage.encode(message.audioStickerMessage, writer.uint32(/* id 134, wireType 2 =*/1074).fork()).ldelim();`

            if (!rootBlock.includes('/* id 134, wireType 2 =*/1074') && rootBlock.includes(msgEncTarget)) {
                rootBlock = rootBlock.replace(msgEncTarget, msgEncRepl)
                protoPatched = true
            }

            const msgDecTarget = `case 102: {
                        message.messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.decode(reader, reader.uint32());
                        break;
                    }`
            const msgDecRepl = `case 102: {
                        message.messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.decode(reader, reader.uint32());
                        break;
                    }
                case 134: {
                        message.audioStickerMessage = $root.proto.Message.FutureProofMessage.decode(reader, reader.uint32());
                        break;
                    }`

            if (!rootBlock.includes('case 134:') && rootBlock.includes(msgDecTarget)) {
                rootBlock = rootBlock.replace(msgDecTarget, msgDecRepl)
                protoPatched = true
            }

            const msgFromTarget = `message.messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.fromObject(object.messageHistoryNotice);
            }`
            const msgFromRepl = `message.messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.fromObject(object.messageHistoryNotice);
            }
            if (object.audioStickerMessage != null) {
                if (typeof object.audioStickerMessage !== "object")
                    throw TypeError(".proto.Message.audioStickerMessage: object expected");
                message.audioStickerMessage = $root.proto.Message.FutureProofMessage.fromObject(object.audioStickerMessage);
            }`

            if (!rootBlock.includes('.proto.Message.audioStickerMessage: object expected') && rootBlock.includes(msgFromTarget)) {
                rootBlock = rootBlock.replace(msgFromTarget, msgFromRepl)
                protoPatched = true
            }

            const msgToTarget = `messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.toObject(message.messageHistoryNotice, options);
                if (options.oneofs)
                    object._messageHistoryNotice = "messageHistoryNotice";
            }`
            const msgToRepl = `messageHistoryNotice = $root.proto.Message.MessageHistoryNotice.toObject(message.messageHistoryNotice, options);
                if (options.oneofs)
                    object._messageHistoryNotice = "messageHistoryNotice";
            }
            if (message.audioStickerMessage != null && message.hasOwnProperty("audioStickerMessage")) {
                object.audioStickerMessage = $root.proto.Message.FutureProofMessage.toObject(message.audioStickerMessage, options);
            }`

            if (!rootBlock.includes('object.audioStickerMessage = $root.proto.Message.FutureProofMessage.toObject') && rootBlock.includes(msgToTarget)) {
                rootBlock = rootBlock.replace(msgToTarget, msgToRepl)
                protoPatched = true
            }

            const msgProtoTarget = 'Message.prototype.messageHistoryNotice = null;'
            const msgProtoRepl = `Message.prototype.messageHistoryNotice = null;
        Message.prototype.audioStickerMessage = null;`

            if (!rootBlock.includes('Message.prototype.audioStickerMessage = null;') && rootBlock.includes(msgProtoTarget)) {
                rootBlock = rootBlock.replace(msgProtoTarget, msgProtoRepl)
                protoPatched = true
            }

            content = content.slice(0, rootStart) + rootBlock + content.slice(rootEnd)
        }

        // 3b. Patch StickerMessage
        const stStart = content.indexOf('Message.StickerMessage = (function() {')
        const stEnd = content.indexOf('    return StickerMessage;\n        })();', stStart)
        if (stStart !== -1 && stEnd !== -1) {
            let stBlock = content.slice(stStart, stEnd)

            const stEncTarget = 'writer.uint32(/* id 22, wireType 2 =*/178).string(message.accessibilityLabel);'
            const stEncRepl = `writer.uint32(/* id 22, wireType 2 =*/178).string(message.accessibilityLabel);
                if (message.emojis != null && Object.hasOwnProperty.call(message, "emojis"))
                    writer.uint32(/* id 25, wireType 2 =*/202).string(message.emojis);
                if (message.audioMessage != null && Object.hasOwnProperty.call(message, "audioMessage"))
                    $root.proto.Message.AudioMessage.encode(message.audioMessage, writer.uint32(/* id 26, wireType 2 =*/210).fork()).ldelim();`

            if (!stBlock.includes('/* id 26, wireType 2 =*/210') && stBlock.includes(stEncTarget)) {
                stBlock = stBlock.replace(stEncTarget, stEncRepl)
                protoPatched = true
            }

            const stDecTarget = `case 22: {
                            message.accessibilityLabel = reader.string();
                            break;
                        }`
            const stDecRepl = `case 22: {
                            message.accessibilityLabel = reader.string();
                            break;
                        }
                    case 25: {
                            message.emojis = reader.string();
                            break;
                        }
                    case 26: {
                            message.audioMessage = $root.proto.Message.AudioMessage.decode(reader, reader.uint32());
                            break;
                        }`

            if (!stBlock.includes('case 26:') && stBlock.includes(stDecTarget)) {
                stBlock = stBlock.replace(stDecTarget, stDecRepl)
                protoPatched = true
            }

            const stFromTarget = `if (object.accessibilityLabel != null)
                    message.accessibilityLabel = String(object.accessibilityLabel);`
            const stFromRepl = `if (object.accessibilityLabel != null)
                    message.accessibilityLabel = String(object.accessibilityLabel);
                if (object.emojis != null)
                    message.emojis = String(object.emojis);
                if (object.audioMessage != null) {
                    if (typeof object.audioMessage !== "object")
                        throw TypeError(".proto.Message.StickerMessage.audioMessage: object expected");
                    message.audioMessage = $root.proto.Message.AudioMessage.fromObject(object.audioMessage);
                }`

            if (!stBlock.includes('.proto.Message.StickerMessage.audioMessage: object expected') && stBlock.includes(stFromTarget)) {
                stBlock = stBlock.replace(stFromTarget, stFromRepl)
                protoPatched = true
            }

            const stToTarget = `if (message.accessibilityLabel != null && message.hasOwnProperty("accessibilityLabel")) {
                    object.accessibilityLabel = message.accessibilityLabel;
                    if (options.oneofs)
                        object._accessibilityLabel = "accessibilityLabel";
                }`
            const stToRepl = `if (message.accessibilityLabel != null && message.hasOwnProperty("accessibilityLabel")) {
                    object.accessibilityLabel = message.accessibilityLabel;
                    if (options.oneofs)
                        object._accessibilityLabel = "accessibilityLabel";
                }
                if (message.emojis != null && message.hasOwnProperty("emojis")) {
                    object.emojis = message.emojis;
                }
                if (message.audioMessage != null && message.hasOwnProperty("audioMessage")) {
                    object.audioMessage = $root.proto.Message.AudioMessage.toObject(message.audioMessage, options);
                }`

            if (!stBlock.includes('object.audioMessage = $root.proto.Message.AudioMessage.toObject') && stBlock.includes(stToTarget)) {
                stBlock = stBlock.replace(stToTarget, stToRepl)
                protoPatched = true
            }

            const stProtoTarget = 'StickerMessage.prototype.accessibilityLabel = null;'
            const stProtoRepl = `StickerMessage.prototype.accessibilityLabel = null;
            StickerMessage.prototype.emojis = null;
            StickerMessage.prototype.audioMessage = null;`

            if (!stBlock.includes('StickerMessage.prototype.audioMessage = null;') && stBlock.includes(stProtoTarget)) {
                stBlock = stBlock.replace(stProtoTarget, stProtoRepl)
                protoPatched = true
            }

            content = content.slice(0, stStart) + stBlock + content.slice(stEnd)
        }

        if (protoPatched) {
            fs.writeFileSync(waProtoPath, content, 'utf8')
            console.log('[Baileys Patch] ✅ Patched WAProto/index.js for Native Sound Stickers (audioMessage & audioStickerMessage)')
            patched = true
        }
    }

    if (!patched) {
        console.log('[Baileys Patch] ℹ️ Baileys is already up to date with waveform patches.')
    }
}

patchBaileys()
