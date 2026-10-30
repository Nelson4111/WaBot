import toMs from "ms";
import * as jimpPkg from 'jimp';
import { loadDB, saveDB } from './waifuHelper.js';
import { addRpgMoney } from './rpgMoney.js';
import { AI_PROTAGONIST_ROLES, ANTAGONIST_STORIES, CUSTOM_ANTAGONIST_ROLES, HIDE_ANTAGONIST_STORIES, PROTAGONIST_WIN_STORIES, ROLE_DATA, ROLE_DEATH_STORIES, getGameCategory, getRandomHideActions, getSorcererFaction, isAntagonistRole, validateCustomRoles } from './werewolfData.js';
const jimp = jimpPkg.default || jimpPkg.Jimp || jimpPkg;

let thumb1 =
    "https://user-images.githubusercontent.com/72728486/235344562-4677d2ad-48ee-419d-883f-e0ca9ba1c7b8.jpg";
let thumb2 =
    "https://user-images.githubusercontent.com/72728486/235344861-acdba7d1-8fce-41b8-adf6-337c818cda2b.jpg";
let thumb3 =
    "https://user-images.githubusercontent.com/72728486/235316834-f9f84ba0-8df3-4444-81d8-db5270995e6d.jpg";
let thumb4 =
    "https://user-images.githubusercontent.com/72728486/235354619-6ad1cabd-216c-4c7c-b7c2-3a564836653a.jpg";
let thumb5 =
    "https://user-images.githubusercontent.com/72728486/235365156-cfab66ce-38b2-4bc7-90d7-7756fc320e06.jpg";
let thumb6 =
    "https://user-images.githubusercontent.com/72728486/235365148-35b8def7-c1a2-451d-a2f2-6b6a911b37db.jpg";

export const resize = async (image, width, height) => {
    const read = await jimp.read(image);
    const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
    return data;
};

var a;
var b;
var d;
var e;
var f;
var textnya;
var idd;
var room;

export async function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function emoji_role(role) {
    return ROLE_DATA[role]?.emoji || "";
}

const normalizeRoleName = (role) => {
    const clean = String(role || '').trim().toLowerCase();
    return Object.hasOwn(ROLE_DATA, clean) ? clean : null;
};

const formatRoleTitle = (role) => ROLE_DATA[normalizeRoleName(role)]?.title || 'Warga';

export const absorbWardenAttack = (target) => {
    if (!target || target.role !== 'warden' || target.armor === false) return false;
    target.armor = false;
    return true;
};

export const formatPlayerLabel = (player) => {
    if (!player) return '—';
    if (player.isDummy) return `Warga ${player.number}`;
    if (player.isAiCitizen) return player.displayName || `Warga ${player.number}`;
    const mentionId = String(player.id || '').split('@')[0].split(':')[0];
    return mentionId ? `@${mentionId}` : `Pemain ${player.number}`;
};

const formatEliminatedRoles = (players) => {
    const eliminated = players.filter((player) => player.isdead && !player.isDummy);
    if (!eliminated.length) return '';
    return `\n\n*ROLE PEMAIN GUGUR*\n${eliminated.map((player) =>
        `> ${player.number}) ${formatPlayerLabel(player)} — ${formatRoleTitle(player.role)} ${emoji_role(player.role)}`
    ).join('\n')}`;
};

const getSelectableLivingTargets = (room, player, { includeSelf = false } = {}) => {
    if (!room || !Array.isArray(room.player)) return [];
    return room.player.filter((entry) => {
        if (!entry || entry.isdead) return false;
        if (!includeSelf && entry.id === player?.id) return false;
        return true;
    });
};

const isValidActionTarget = (room, targetNumber, { allowDead = false } = {}) => {
    if (!room || !Array.isArray(room.player) || targetNumber === null || targetNumber === undefined) return false;
    const numericTarget = Number(targetNumber);
    if (!Number.isFinite(numericTarget)) return false;
    const target = room.player.find((entry) => entry && entry.number === numericTarget);
    if (!target) return false;
    if (target.isdead && !allowDead) return false;
    return true;
};

export const getWerewolfPlayerFaction = (room, player) => {
    if (player?.role === 'sorcerer') return room?.sorcererFaction || 'neutral';
    if (isAntagonistRole(room?.category, player?.role)) return 'antagonist';
    if (player?.role === 'jester' || player?.role === 'cipher' || player?.role === 'fixer') return 'neutral';
    return 'protagonist';
};

export const assignFixerContracts = (room, random = Math.random) => {
    if (!room || !Array.isArray(room.player)) return false;
    const players = room.player.filter((player) => player && !player.isDummy && !player.isAiCitizen);
    for (const fixer of players.filter((player) => player.role === 'fixer')) {
        const targets = players.filter((player) => player.id !== fixer.id && !player.isdead);
        if (!targets.length) return false;
        const targetIndex = Math.min(targets.length - 1, Math.floor(random() * targets.length));
        const target = targets[targetIndex];
        fixer.contractTargetId = target.id;
        fixer.contractTargetNumber = target.number;
    }
    return true;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ1234567890";

const generateCode = (used = new Set()) => {
    let code = "";
    while (code.length < 4) {
        const idx = Math.floor(Math.random() * CODE_ALPHABET.length);
        code += CODE_ALPHABET[idx];
    }
    if (used.has(code)) return generateCode(used);
    used.add(code);
    return code;
};

export const buildRoleCodeMap = (room, player) => {
    if (!room || !player) return {};
    const used = new Set();
    const secret = {};
    const addEntry = (entry) => {
        const code = generateCode(used);
        secret[code] = entry;
    };
    const aliveTargets = getSelectableLivingTargets(room, player, { includeSelf: player.role === 'guardian' });

    const addTargetEntries = (targets, actionType) => {
        targets.forEach((target) => {
            addEntry({
                type: actionType,
                targetNumber: target.number,
                targetId: target.id,
                targetRole: target.role || null
            });
        });
    };

    const addHideActionEntries = (limit = 5) => {
        const { actions, reset } = getRandomHideActions(player.usedHideActions || [], limit);
        if (reset) player.usedHideActions = [];
        actions.forEach((label) => addEntry({ type: "dummy", label }));
    };

    const category = getGameCategory(room.category);
    if (isAntagonistRole(category.id, player.role) && player.role !== 'sorcerer') {
        const killTargets = aliveTargets.filter((t) => !isAntagonistRole(category.id, t.role));
        addTargetEntries(killTargets, "kill");
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "seer") {
        if (player.hasUsedSeerAbility) {
            addHideActionEntries();
        } else {
            addTargetEntries(aliveTargets, "check");
            addEntry({ type: "skip", label: "Lewati Menerawang" });
        }
    } else if (player.role === "guardian") {
        if (player.hasUsedGuardianAbility) {
            addHideActionEntries();
        } else {
            addTargetEntries(aliveTargets, "guard");
            addEntry({ type: "skip", label: "Lewati Melindungi" });
        }
    } else if (player.role === "sorcerer") {
        addTargetEntries(aliveTargets, "poison");
        const reviveTargets = room.player.filter((p) => p.isdead && p.id !== player.id);
        reviveTargets.forEach((target) => {
            addEntry({
                type: "revive",
                targetNumber: target.number,
                targetId: target.id,
                targetRole: target.role || null
            });
        });
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "hunter") {
        if (player.isdead) {
            addTargetEntries(aliveTargets, "hunter");
            addEntry({ type: "skip", label: "Tidak menembak siapa pun" });
        } else {
            addEntry({ type: "skip", label: "Lewati Malam" });
            addHideActionEntries(2);
            addEntry({ type: "patrol", label: `Berkeliling di ${category.location}` });
            addEntry({ type: "patrol", label: `Patroli di sekitar ${category.location}` });
        }
    } else if (player.role === "mayor" || player.role === "jester" || player.role === "warden" || player.role === "cipher" || player.role === "fixer" || player.role === "warga") {
        addHideActionEntries();
    }

    if (Object.keys(secret).length === 0) {
        addHideActionEntries();
    }

    player.secretCodes = secret;
    return secret;
};

export const generateVoteCodeMap = (room, player, usedCodes = new Set()) => {
    if (!room || !player) return {};
    const voteCodes = {};
    const addEntry = (choice) => {
        const code = generateCode(usedCodes);
        voteCodes[code] = choice.target
            ? {
                type: choice.type,
                targetNumber: choice.target.number,
                targetId: choice.target.id,
                targetRole: choice.target.role || null
            }
            : { type: choice.type };
    };

    const aliveTargets = getSelectableLivingTargets(room, player);
    aliveTargets.forEach((target) => addEntry({ type: 'vote', target }));
    addEntry({ type: 'vote-skip' });

    player.voteCodes = voteCodes;
    return voteCodes;
};

export const resolveSecretCodeAction = (from, sender, code, data, phase = "night") => {
    const room = sesi(from, data);
    if (!room) return { ok: false, reason: "room" };
    const player = room.player.find((p) => p.id === sender);
    if (!player) return { ok: false, reason: "player" };
    if (phase === "hunter") {
        if (room.pendingHunter !== sender || !player.pendingHunter || player.role !== "hunter") {
            return { ok: false, reason: "hunter-turn" };
        }
        const normalized = String(code || "").trim().toUpperCase();
        const choice = player.secretCodes?.[normalized];
        if (!choice || !["hunter", "skip"].includes(choice.type)) {
            return { ok: false, reason: "invalid-hunter-code" };
        }
        if (choice.type === "skip") return { ok: true, action: "hunter-skip" };
        if (!isValidActionTarget(room, choice.targetNumber)) {
            return { ok: false, reason: "invalid-target" };
        }
        const target = room.player.find((entry) => entry.number === choice.targetNumber);
        if (!target || target.isdead || target.isDummy || target.id === sender) {
            return { ok: false, reason: "invalid-target" };
        }
        return { ok: true, action: "hunter-shoot", targetNumber: target.number };
    }
    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return { ok: false, reason: "code" };
    if (player.isdead) return { ok: false, reason: "dead-player" };

    if (phase === "vote") {
        const voteCodes = player.voteCodes && Object.keys(player.voteCodes).length
            ? player.voteCodes
            : generateVoteCodeMap(room, player);
        const choice = voteCodes[normalized];
        if (!choice) return { ok: false, reason: "invalid-vote-code" };
        if (player.isvote) return { ok: false, reason: "already-voted" };
        if (choice.type === 'vote-skip') {
            player.isvote = true;
            return { ok: true, action: 'vote-skip' };
        }
        const target = room.player.find((p) => p.number === choice.targetNumber && !p.isdead);
        if (!target) return { ok: false, reason: "invalid-vote-target" };
        const voteBoost = player.role === "mayor" ? 2 : 1;
        target.vote += voteBoost;
        target.voteCount = (Number(target.voteCount) || 0) + 1;
        player.isvote = true;
        return { ok: true, action: "vote", targetNumber: target.number, voteBoost };
    }

    if (player.nightDone) return { ok: false, reason: "night-done" };

    const secretCodes = player.secretCodes || buildRoleCodeMap(room, player);
    const choice = secretCodes[normalized];
    if (!choice) return { ok: false, reason: "invalid-night-code" };

    if (["kill", "check", "guard", "poison", "revive", "hunter"].includes(choice.type)) {
        const isReviveChoice = choice.type === "revive";
        const allowsDeadTarget = isReviveChoice;
        if (!isValidActionTarget(room, choice.targetNumber, { allowDead: allowsDeadTarget })) {
            return { ok: false, reason: "invalid-target" };
        }
        if (isReviveChoice) {
            const target = room.player.find((p) => p && p.number === Number(choice.targetNumber));
            if (!target || !target.isdead) {
                return { ok: false, reason: "invalid-target" };
            }
        }
    }

    player.nightDone = true;
    player.lastNightAction = choice;
    if (choice.type === 'check') player.hasUsedSeerAbility = true;
    if (choice.type === 'guard') player.hasUsedGuardianAbility = true;
    if (choice.type === 'dummy' && choice.label) {
        player.usedHideActions = [...new Set([...(player.usedHideActions || []), choice.label])];
    }
    const nightMap = room.nightActions || (room.nightActions = {});
    nightMap[sender] = choice;

    if (choice.type === "kill") {
        room.nightTarget = choice.targetNumber;
    }
    if (choice.type === "skip" && isAntagonistRole(room.category, player.role)) {
        room.nightTarget = null;
    }
    if (choice.type === "check") {
        const target = room.player.find((p) => p.number === choice.targetNumber);
        if (target) {
            player.seerResult = normalizeRoleName(target.role) || "—";
        }
    }
    if (choice.type === "guard") {
        room.guardianTarget = choice.targetNumber;
    }
    if (choice.type === "skip" && player.role === "guardian") {
        room.guardianTarget = null;
    }
    if (choice.type === "poison") {
        room.poisonTarget = choice.targetNumber;
        if (player.role === 'sorcerer') {
            const hasOtherAntagonist = room.player.some((entry) =>
                !entry.isdead && entry.id !== player.id && isAntagonistRole(room.category, entry.role)
            );
            room.sorcererFaction = getSorcererFaction('poison', hasOtherAntagonist);
        }
    }
    if (choice.type === "revive") {
        room.reviveTarget = choice.targetNumber;
        if (player.role === 'sorcerer') {
            const hasOtherAntagonist = room.player.some((entry) =>
                entry.id !== player.id &&
                isAntagonistRole(room.category, entry.role) &&
                (!entry.isdead || entry.number === Number(choice.targetNumber))
            );
            room.sorcererFaction = getSorcererFaction('revive', hasOtherAntagonist);
        }
    }
    if (choice.type === "skip" && player.role === "sorcerer") {
        room.poisonTarget = null;
        room.reviveTarget = null;
        if (!room.sorcererFaction) room.sorcererFaction = 'neutral';
    }
    if (choice.type === "hunter") {
        room.hunterTarget = choice.targetNumber;
    }
    if (choice.type === "skip" && player.role === "hunter") {
        room.hunterTarget = null;
    }

    return { ok: true, action: choice.type, targetNumber: choice.targetNumber || null, choices: choice };
};

export const getNightProgress = (room) => {
    if (!room || !Array.isArray(room.player)) return { done: 0, total: 0, completed: false };
    const alivePlayers = room.player.filter((player) => !player.isdead && !player.isDummy);
    const total = alivePlayers.length;
    const done = alivePlayers.filter((player) => player.nightDone === true).length;
    return { done, total, completed: total > 0 && done >= total };
};

export const findObject = (obj = {}, key, value) => {
    const result = [];
    const seen = new WeakSet();

    const recursiveSearch = (current, depth = 0) => {
        if (!current || typeof current !== "object" || depth > 8) {
            return;
        }
        if (seen.has(current)) {
            return;
        }
        seen.add(current);

        if (current[key] === value) {
            result.push(current);
        }

        for (const k of Object.keys(current)) {
            // Lewati objek timer / runtime internal untuk menghindari looping sirkular
            if (k === 'phaseTimeout' || k === 'cooldown' || k.startsWith('_idle') || k.startsWith('_timer')) {
                continue;
            }
            const child = current[k];
            if (child && typeof child === 'object') {
                recursiveSearch(child, depth + 1);
            }
        }
    };

    recursiveSearch(obj);
    return result;
};

// sessions
export const sesi = (from, data) => {
    if (!data || !data[from]) return false;
    return data[from];
};

// check sessions
export const playerOnGame = (sender, data) => {
    if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
            const room = data[key];
            if (room && Array.isArray(room.player)) {
                if (room.player.some((player) => player && player.id === sender)) {
                    return true;
                }
            }
        }
    }
    let result = findObject(data, "id", sender);
    return result.length > 0;
};

// in room
export const playerOnRoom = (sender, from, data) => {
    const room = data?.[from] || (data?.room === from ? data : null);
    if (room && Array.isArray(room.player)) {
        return room.player.some((player) => player && player.id === sender);
    }
    let result = findObject(data, "id", sender);
    return result.length > 0 && result[0].sesi === from;
};

// get data player
export const dataPlayer = (sender, data) => {
    if (data && Array.isArray(data.player)) {
        return data.player.find((player) => player && player.id === sender) || false;
    }
    if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
            const room = data[key];
            if (room && Array.isArray(room.player)) {
                const found = room.player.find((player) => player && player.id === sender);
                if (found) return found;
            }
        }
    }
    let result = findObject(data, "id", sender);
    return (result.length > 0 && result[0].id === sender) ? result[0] : false;
};

// get data player by id
export const dataPlayerById = (id, data) => {
    if (data && Array.isArray(data.player)) {
        return data.player.find((player) => player && player.number === id) || false;
    }
    if (data && typeof data === 'object') {
        for (const key of Object.keys(data)) {
            const room = data[key];
            if (room && Array.isArray(room.player)) {
                const found = room.player.find((player) => player && player.number === id);
                if (found) return found;
            }
        }
    }
    let result = findObject(data, "number", id);
    return (result.length > 0 && result[0].number === id) ? result[0] : false;
};

// keluar game
export const playerExit = (from, id, data) => {
    room = sesi(from, data);
    if (!room) return false;
    const indexPlayer = room.player.findIndex((i) => i.id === id);
    if (indexPlayer === -1) return false;
    room.player.splice(indexPlayer, 1);
    room.player.forEach((player, index) => {
        player.number = index + 1;
    });
    return true;
};

// get player id
export const getPlayerById = (from, sender, id, data) => {
    room = sesi(from, data);
    if (!room) return false;
    const indexPlayer = room.player.findIndex((i) => i.number === id);
    if (indexPlayer === -1) return false;
    return {
        index: indexPlayer,
        sesi: room.player[indexPlayer].sesi,
        db: room.player[indexPlayer],
    };
};

// get player id 2
export const getPlayerById2 = (sender, id, data) => {
    let result = findObject(data, "id", sender);
    if (result.length > 0 && result[0].id === sender) {
        let from = result[0].sesi;
        room = sesi(from, data);
        if (!room) return false;
        const indexPlayer = room.player.findIndex((i) => i.number === id);
        if (indexPlayer === -1) return false;
        return {
            index: indexPlayer,
            sesi: room.player[indexPlayer].sesi,
            db: room.player[indexPlayer],
        };
    }
};

// werewolf kill
export const killWerewolf = (sender, id, data) => {
    let result = getPlayerById2(sender, id, data);
    if (!result) return false;
    let {
        index,
        sesi,
        db
    } = result;
    if (data[sesi].player[index].number === id) {
        if (db.effect.includes("guardian")) {
            data[sesi].guardian.push(parseInt(id));
            data[sesi].dead.push(parseInt(id));
        } else if (absorbWardenAttack(db)) {
        } else {
            data[sesi].dead.push(parseInt(id));
        }
    }
};

// seer dreamy
export const dreamySeer = (sender, id, data) => {
    let result = getPlayerById2(sender, id, data);
    if (!result) return false;
    let {
        index,
        sesi,
        db
    } = result;
    if (isAntagonistRole(data[sesi].category, data[sesi].player[index].role)) {
        data[sesi].seer = true;
    }
    return data[sesi].player[index].role;
};

// seer dreamy
export const sorcerer = (sender, id, data) => {
    let result = getPlayerById2(sender, id, data);
    if (!result) return false;
    let {
        index,
        sesi,
        db
    } = result;
    return data[sesi].player[index].role;
};

export const witchAction = (sender, id, action, data) => {
    const result = getPlayerById2(sender, id, data);
    if (!result) return false;
    const current = dataPlayer(sender, data);
    const target = result.db;
    const game = data[result.sesi];
    if (action === "poison") {
        if (target.isdead) return false;
        game.dead.push(target.number);
        return true;
    }
    if (action === "revive") {
        if (!target.isdead && !game.dead.includes(target.number)) return false;
        target.isdead = false;
        game.dead = game.dead.filter((number) => number !== target.number);
        return true;
    }
    return false;
};

export const hunterShoot = (sender, id, data) => {
    const hunter = dataPlayer(sender, data);
    const result = getPlayerById2(sender, id, data);
    if (!hunter || hunter.role !== "hunter" || hunter.isdead !== true || hunter.hunterUsed || !result) return false;
    if (result.db.isdead || result.db.id === sender) return false;
    result.db.isdead = true;
    hunter.hunterUsed = true;
    return true;
};

// guardian protect
export const protectGuardian = (sender, id, data) => {
    let result = getPlayerById2(sender, id, data);
    if (!result) return false;
    let {
        index,
        sesi,
        db
    } = result;
    data[sesi].player[index].effect.push("guardian");
};

// pengacakan role
export const roleShuffle = (array) => {
    let currentIndex = array.length,
        randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
};

// memberikan role ke player
export const roleChanger = (from, id, role, data) => {
    room = sesi(from, data);
    if (!room) return false;
    var index = room.player.findIndex((i) => i.id === id);
    if (index === -1) return false;
    room.player[index].role = role;
};

// memberikan peran ke semua player
export const roleAmount = (from, data, forcedAntagonistRole, countOverride, excludedRoles = []) => {
    const result = sesi(from, data);
    if (!result) return false;
    const count = countOverride ?? result.player.filter((player) => !player.isDummy).length;
    if (count < 1 || count > 15) return false;
    const roles = [];
    const excluded = new Set(excludedRoles);
    const addRole = (role, amount = 1) => {
        for (let i = 0; i < amount; i++) roles.push(role);
    };

    const wwRoll = Math.random();
    let werewolf = count <= 1
        ? 0
        : count <= 5
            ? 1
            : count >= 13
                ? (wwRoll < 0.12 ? 1 : wwRoll < 0.72 ? 2 : 3)
                : count >= 9
                    ? (wwRoll < 0.08 ? 0 : wwRoll < 0.62 ? 1 : 2)
                    : count >= 6
                        ? (wwRoll < 0.12 ? 0 : wwRoll < 0.78 ? 1 : 2)
                        : (wwRoll < 0.2 ? 0 : 1);

    const canAdd = () => roles.length < count - 1;
    const addOptional = (role, chance, minimumPlayers = 5) => {
        if (!excluded.has(role) && count >= minimumPlayers && canAdd() && Math.random() < chance) addRole(role);
    };

    const antagonistRole = forcedAntagonistRole || getGameCategory(result.category).antagonist;
    if (werewolf > 0) addRole(antagonistRole, werewolf);
    if (count >= 5) addRole('seer');
    if (count >= 6) addRole('guardian');

    if (werewolf === 0) {
        if (canAdd() && !excluded.has('sorcerer')) addRole('sorcerer');
        if (canAdd() && !excluded.has('jester')) addRole('jester');
        if (roles.filter((roleName) => [antagonistRole, 'sorcerer', 'jester'].includes(roleName)).length === 0) {
            addRole(antagonistRole);
        }
    } else {
        addOptional('sorcerer', count >= 13 ? 0.9 : count >= 9 ? 0.55 : 0.25, 6);
        addOptional('jester', count >= 12 ? 0.9 : count >= 9 ? 0.6 : 0.25, 7);
    }

    addOptional('cipher', count >= 12 ? 0.9 : count >= 9 ? 0.6 : 0.25, 7);
    addOptional('fixer', count >= 12 ? 0.75 : 0.35, 8);
    addOptional('warden', count >= 12 ? 1 : 0.65, 6);
    addOptional('hunter', count >= 12 ? 1 : 0.7, 7);
    addOptional('mayor', count >= 12 ? 1 : 0.65, 8);

    while (roles.length < count) roles.push('warga');
    return roles.reduce((result, role) => {
        result[role] = (result[role] || 0) + 1;
        return result;
    }, {});
};

export const autoAssignCustomRoles = (from, data) => {
    const currentRoom = sesi(from, data);
    if (!currentRoom || currentRoom.category !== 'custom' || currentRoom.status) return false;

    const players = currentRoom.player.filter((player) => !player.isDummy && !player.isAiCitizen);
    const assigned = players.map((player) => currentRoom.customRoles?.[player.id] || player.role || null);
    const existingValidation = validateCustomRoles(assigned);
    if (!existingValidation.valid) return false;

    const assignedAntagonist = assigned.find((role) => CUSTOM_ANTAGONIST_ROLES.includes(role));
    const unassignedPlayers = players.filter((player, index) => !assigned[index]);
    if (!unassignedPlayers.length) {
        return validateCustomRoles(assigned, { requireAntagonist: true }).valid;
    }

    const antagonistRole = assignedAntagonist ||
        CUSTOM_ANTAGONIST_ROLES[Math.floor(Math.random() * CUSTOM_ANTAGONIST_ROLES.length)];
    const excludedRoles = assigned.filter((role) => role && !CUSTOM_ANTAGONIST_ROLES.includes(role));
    const generated = roleAmount(from, data, antagonistRole, unassignedPlayers.length, excludedRoles);
    if (!generated) return false;

    const roles = Object.entries(generated).flatMap(([role, amount]) => Array(amount).fill(role));
    if (!roles.some((role) => CUSTOM_ANTAGONIST_ROLES.includes(role))) {
        const wargaIndex = roles.indexOf('warga');
        if (wargaIndex >= 0) {
            roles[wargaIndex] = antagonistRole;
        } else {
            const replaceIndex = roles.findIndex((role) => role !== 'warga');
            if (replaceIndex < 0) return false;
            roles[replaceIndex] = antagonistRole;
        }
    }

    const combinedRoles = [...assigned.filter(Boolean), ...roles];
    if (roles.length !== unassignedPlayers.length ||
        !validateCustomRoles(combinedRoles, { requireAntagonist: true }).valid) return false;
    roleShuffle(roles);
    currentRoom.customRoles ||= {};
    unassignedPlayers.forEach((player, index) => {
        const role = roles[index];
        currentRoom.customRoles[player.id] = role;
        player.role = role;
    });
    return true;
};

export const roleGenerator = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;

    room.player.forEach((player) => {
        if (player.isDummy) {
            player.role = 'warga';
            player.isdead = false;
        }
    });

    if (room.category === 'custom') {
        room.player.forEach((player) => {
            if (player.isAiCitizen) {
                player.role = 'warga';
                player.isdead = false;
            } else if (!player.isDummy) {
                player.role = room.customRoles?.[player.id] || player.role || false;
            }
        });
        const customRoles = room.player.filter((player) => !player.isDummy && !player.isAiCitizen).map((player) => player.role);
        if (room.player.some((player) => !player.isDummy && !normalizeRoleName(player.role)) ||
            !validateCustomRoles(customRoles, { requireAntagonist: true }).valid) return false;
    } else {
        const participants = room.player.filter((player) => !player.isDummy);
        const humanPlayers = participants.filter((player) => !player.isAiCitizen);
        const aiPlayers = participants.filter((player) => player.isAiCitizen);
        if (!humanPlayers.length) return false;
        const role = roleAmount(from, data, undefined, participants.length);
        if (!role) return false;
        const roleList = roleShuffle(Object.entries(role).flatMap(([roleName, amount]) => Array(amount).fill(roleName)));
        const antagonist = getGameCategory(room.category).antagonist;
        let antagonistCount = roleList.filter((roleName) => isAntagonistRole(room.category, roleName)).length;
        if (!antagonistCount) {
            const replacementIndex = roleList.findIndex((roleName) => roleName !== 'warga');
            if (replacementIndex < 0) return false;
            roleList[replacementIndex] = antagonist;
            antagonistCount = 1;
        }
        while (antagonistCount > humanPlayers.length) {
            const index = roleList.findIndex((roleName) => isAntagonistRole(room.category, roleName));
            if (index < 0) break;
            roleList[index] = 'warga';
            antagonistCount--;
        }

        const remainingRoles = [...roleList];
        const assigned = new Map();
        const takeRole = (player, predicate) => {
            const index = remainingRoles.findIndex(predicate);
            if (index < 0) return false;
            assigned.set(player.id, remainingRoles.splice(index, 1)[0]);
            return true;
        };
        for (const player of humanPlayers) {
            takeRole(player, (roleName) => isAntagonistRole(room.category, roleName));
        }
        for (const player of humanPlayers.filter((entry) => !assigned.has(entry.id))) {
            takeRole(player, (roleName) => ['jester', 'cipher', 'fixer'].includes(roleName));
        }
        for (const player of aiPlayers) {
            if (!takeRole(player, (roleName) => AI_PROTAGONIST_ROLES.includes(roleName))) {
                assigned.set(player.id, 'warga');
            }
        }
        for (const player of humanPlayers.filter((entry) => !assigned.has(entry.id))) {
            if (!takeRole(player, () => true)) assigned.set(player.id, 'warga');
        }
        participants.forEach((player) => roleChanger(from, player.id, assigned.get(player.id) || 'warga', data));
    }
    if (room.player.some((player) => !player.isDummy && (!player.role || player.role === false))) return false;
    room.player.forEach((player) => {
        if (player.isDummy) {
            player.role = 'warga';
            player.vote = 0;
            player.isvote = false;
        }
        if (player.role === "warden") player.armor = true;
        player.cipherIntroSent = false;
        player.fixerContractShown = false;
        delete player.contractTargetId;
        delete player.contractTargetNumber;
        player.nightDone = false;
        player.lastNightAction = null;
        player.hasUsedSeerAbility = false;
        player.hasUsedGuardianAbility = false;
        player.secretCodes = {};
        player.voteCodes = {};
        player.deathNoticeSent = false;
    });
    if (!assignFixerContracts(room)) return false;
    room.nightActions = {};
    shortPlayer(from, data);
    room.player.forEach((player) => buildRoleCodeMap(room, player));
    return true;
};

// add cooldown
export const addTimer = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    room.cooldown = Date.now() + toMs(90 + "s");
};

// merubah status room, dalam permainan
export const startGame = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    room.status = true;
    room.time = "malem";
    room.nightActions = {};
    room.player.forEach((player) => {
        player.nightDone = false;
        player.lastNightAction = null;
        player.secretCodes = {};
        player.voteCodes = {};
        buildRoleCodeMap(room, player);
    });
    return true;
};

// rubah hari
export const changeDay = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    if (room.time === "pagi") {
        room.time = "voting";
    } else if (room.time === "malem") {
        room.time = "pagi";
        room.day += 1;
    } else if (room.time === "voting") {
        room.time = "malem";
    }
};

// hari voting
export const dayVoting = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    if (room.time === "malem") {
        room.time = "voting";
    } else if (room.time === "pagi") {
        room.time = "voting";
    }
};

// voting
export const vote = (from, id, sender, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    const idGet = room.player.findIndex((i) => i.id === sender);
    if (idGet === -1 || room.player[idGet].isdead || room.player[idGet].isDummy) return false;
    const indexPlayer = room.player.findIndex((i) => i.number === id);
    if (indexPlayer === -1 || room.player[indexPlayer].isdead) return false;
    room.player[idGet].isvote = true;
    room.player[indexPlayer].vote += room.player[idGet].role === "mayor" ? 2 : 1;
    room.player[indexPlayer].voteCount = (Number(room.player[indexPlayer].voteCount) || 0) + 1;
    return true;
};

// hasil voting
export const voteResult = (from, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    const alive = room.player.filter((player) => !player.isdead).sort((a, b) => (Number(b.vote) || 0) - (Number(a.vote) || 0));
    if (!alive.length || (Number(alive[0].vote) || 0) === 0) return 0;
    if ((Number(alive[0].vote) || 0) === (Number(alive[1]?.vote) || 0)) return 1;
    return alive[0];
};

// vote killing
export const voteKill = (from, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    const target = voteResult(from, data);
    if (target === 0) return 0;
    if (target === 1) return 1;
    if (target.role === "hunter") {
        target.pendingExecution = true;
        target.canShoot = true;
        target.pendingHunter = true;
        target.isdead = true;
        target.deathNoticeSent = false;
        room.pendingHunter = target.id;
        return target;
    }
    target.isdead = true;
    target.deathNoticeSent = false;
    if (target.role === "jester") room.jesterWin = true;
    if (target.role === 'sorcerer' && getWerewolfPlayerFaction(room, target) === 'neutral') {
        room.neutralWinner = target.id;
    }
    return target;
};

// voting reset
export const resetVote = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].vote = 0;
        room.player[i].voteCount = 0;
    }
};

export const voteDone = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    room.voting = false;
};

export const voteStart = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    room.voting = true;
};

// clear vote
export const clearAllVote = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].vote = 0;
        room.player[i].voteCount = 0;
        room.player[i].isvote = false;
    }
};

export const resolveNightActions = (from, data) => {
    const room = sesi(from, data);
    if (!room || !Array.isArray(room.player)) return false;

    if (!Array.isArray(room.dead)) room.dead = [];
    if (!Array.isArray(room.guardian)) room.guardian = [];

    const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;

    // 1. Terapkan efek perlindungan Guardian
    if (room.guardianTarget !== undefined && room.guardianTarget !== null) {
        const guardianTarget = room.player.find((player) => player && player.number === safeNumber(room.guardianTarget));
        if (guardianTarget && !guardianTarget.effect.includes('guardian')) {
            guardianTarget.effect.push('guardian');
        }
    }

    // 2. Fungsi eksekusi kematian malam
    const setDead = (targetNumber, cause = 'attack') => {
        const target = room.player.find((player) => player && player.number === targetNumber);
        if (!target || target.isdead) return;

        // Jika diserang Werewolf tapi dilindungi Guardian Angel
        if (cause === 'werewolf' && target.effect?.includes('guardian')) {
            if (!room.guardian.includes(target.number)) {
                room.guardian.push(target.number);
            }
            return;
        }

        if (cause === 'werewolf' && absorbWardenAttack(target)) return;

        target.isdead = true;
        target.deathNoticeSent = false;
        if (target.role === 'hunter') {
            target.canShoot = true;
            target.pendingHunter = true;
            room.pendingHunter = target.id;
        }
        if (!room.dead.includes(target.number)) {
            room.dead.push(target.number);
        }
    };

    // 3. Eksekusi racun Sorcerer
    if (room.poisonTarget !== undefined && room.poisonTarget !== null) {
        setDead(safeNumber(room.poisonTarget), 'poison');
    }

    // 4. Eksekusi terkaman Werewolf
    if (room.nightTarget !== undefined && room.nightTarget !== null) {
        setDead(safeNumber(room.nightTarget), 'werewolf');
    }

    // 5. Eksekusi hidupkan kembali Sorcerer
    if (room.reviveTarget !== undefined && room.reviveTarget !== null) {
        const reviveTarget = room.player.find((player) => player && player.number === safeNumber(room.reviveTarget));
        if (reviveTarget && reviveTarget.isdead) {
            reviveTarget.isdead = false;
            reviveTarget.deathNoticeSent = false;
            room.dead = room.dead.filter((number) => number !== reviveTarget.number);
        }
    }

    room.nightTarget = null;
    room.guardianTarget = null;
    room.poisonTarget = null;
    room.reviveTarget = null;
    room.hunterTarget = null;
    room.nightActions = {};
    return true;
};

// clearAll
export const clearAll = (from, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    room.dead = [];
    room.seer = false;
    room.guardian = [];
    room.voting = false;
    room.nightActions = {};
    room.player.forEach((player) => {
        player.nightDone = false;
        player.lastNightAction = null;
        player.secretCodes = {};
        player.voteCodes = {};
        buildRoleCodeMap(room, player);
    });
};

// clear all status player
export const clearAllSTATUS = (from, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].effect = [];
    }
};

export const skillOn = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].status = false;
    }
};

export const skillOff = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].status = true;
    }
};

export const playerHidup = (data) => {
    const hasil = data.player.filter((x) => x.isdead === false);
    return hasil.length;
};

export const playerMati = (data) => {
    const hasil = data.player.filter((x) => x.isdead === true);
    return hasil.length;
};

// get player win
export const getWinner = (from, data) => {
    const room = sesi(from, data);
    if (!room || !room.player) return { voting: false, status: null };
    const fixer = room.player.find((player) =>
        player.role === 'fixer' &&
        !player.isdead &&
        player.contractTargetId &&
        room.player.some((target) => target.id === player.contractTargetId && target.isdead)
    );
    if (fixer) {
        room.fixerWinnerId = fixer.id;
        return { voting: room.voting, status: 'fixer', winnerId: fixer.id };
    }
    if (room.jesterWin) return { voting: true, status: "jester" };
    if (room.neutralWinner) return { voting: true, status: "neutral" };
    let ww = 0;
    let orang_baek = 0;
    for (let i = 0; i < room.player.length; i++) {
        const p = room.player[i];
        if (p.isdead === false) {
            const faction = getWerewolfPlayerFaction(room, p);
            if (faction === 'antagonist') {
                ww += 1;
            } else if (faction === 'protagonist') {
                orang_baek += 1;
            }
        }
    }
    if (room.voting) {
        const b = voteResult(from, data);
        if (b != 0 && b != 1) {
            const faction = getWerewolfPlayerFaction(room, b);
            if (faction === 'antagonist') {
                ww -= 1;
            } else if (faction === 'protagonist') {
                orang_baek -= 1;
            }
        }
    }
    const livingNeutralSorcerer = room.player.find((player) =>
        !player.isdead &&
        player.role === 'sorcerer' &&
        getWerewolfPlayerFaction(room, player) === 'neutral'
    );
    if (ww === 0 && livingNeutralSorcerer && orang_baek === 0) {
        room.neutralWinner = livingNeutralSorcerer.id;
        return { voting: room.voting, status: 'neutral' };
    }
    if (ww === 0 && livingNeutralSorcerer) {
        room.iswin = null;
        return {
            voting: room.voting,
            status: null
        };
    } else if (ww === 0) {
        room.iswin = true;
        return {
            voting: room.voting,
            status: true
        };
    } else if (ww >= orang_baek) {
        room.iswin = false;
        return {
            voting: room.voting,
            status: false
        };
    } else {
        return {
            voting: room.voting,
            status: null
        };
    }
};


// shorting
export const shortPlayer = (from, data) => {
    const room = sesi(from, data);
    if (!room) return false;
    room.player.sort((a, b) => a.number - b.number);
};

// werewolf killing
export const killww = (from, id, data) => {
    const room = sesi(from, data);
    if (!room || !Array.isArray(room.player)) return false;
    for (let j = 0; j < (room.dead || []).length; j++) {
        const targetNumber = room.dead[j];
        const target = room.player.find((p) => p && p.number === targetNumber);
        if (!target) continue;
        if (target.effect?.includes("guardian")) continue;
        if (target.isdead) continue;
        target.isdead = true;
        target.deathNoticeSent = false;
        if (target.role === "hunter") target.canShoot = true;
    }
};

export const pagii = (data) => {
    const deadList = (data.dead || []).map((num) => data.player.find((p) => p && p.number === num)).filter(Boolean);
    const savedList = (data.guardian || []).map((num) => data.player.find((p) => p && p.number === num)).filter(Boolean);
    const game = getGameCategory(data.category);

    if (deadList.length === 0 && savedList.length === 0) {
        return `*⌂ ${game.name.toUpperCase()} - GAME*\n\nMentari telah terbit di ${game.location}; tidak ada korban berjatuhan malam ini, warga kembali melakukan aktivitas seperti biasa.\n90 detik tersisa sebelum waktu penentuan, para pemain dipersilakan untuk berdiskusi\n*Hari ke ${data.day}*`;
    }

    const formatNames = (list) => {
        const labels = list.map((p) => formatPlayerLabel(p));
        if (labels.length === 0) return '';
        if (labels.length === 1) return labels[0];
        if (labels.length === 2) return `${labels[0]} dan ${labels[1]}`;
        return `${labels.slice(0, -1).join(', ')}, dan ${labels[labels.length - 1]}`;
    };

    const deadText = deadList.map((player) => {
        const specialStories = ROLE_DEATH_STORIES[player.role];
        const isHiding = player.lastNightAction?.type === 'dummy' && player.lastNightAction.label;
        const stories = specialStories || (isHiding ? HIDE_ANTAGONIST_STORIES : ANTAGONIST_STORIES);
        const story = stories[Math.floor(Math.random() * stories.length)];
        const storyText = story
            .replaceAll('{antagonist}', game.antagonistName)
            .replaceAll('{location}', game.location)
            .replaceAll('{target}', formatPlayerLabel(player))
            .replaceAll('{hideAction}', player.lastNightAction?.label || '');
        return `${storyText}\n> ☠️ *Role:* ${formatRoleTitle(player.role)} ${emoji_role(player.role)}`;
    }).join('\n');
    const savedText = savedList.length > 0 ? `${formatNames(savedList)} hampir dibunuh, namun *Guardian Angel* berhasil melindunginya.` : '';

    let statusLine = '';
    if (deadText && savedText) {
        statusLine = `${deadText} ${savedText}`;
    } else if (deadText) {
        statusLine = deadText;
    } else {
        statusLine = `Semalam ${game.antagonistName} mencoba menyerang, namun beruntung ${savedText}`;
    }

    return `*⌂ ${game.name.toUpperCase()} - GAME*\n\nPagi telah tiba, suasana ${game.location} mencekam. ${statusLine}\n\nTak terasa hari sudah siang, matahari tepat di atas kepala, terik panas matahari membuat suasana menjadi riuh, warga mempunyai 90 detik untuk berdiskusi\n*Hari ke ${data.day}*`;
};

const notifyDeadPlayers = async (conn, room) => {
    if (!conn || !room || !Array.isArray(room.player)) return;
    for (const player of room.player) {
        if (!player || !player.isdead || player.deathNoticeSent) continue;
        player.deathNoticeSent = true;
    }
};

export async function pagi(conn, x, data) {
    if (!x || !x.player) return;
    skillOff(x.room, data)
    let ment = [];
    for (let i = 0; i < x.player.length; i++) {
        ment.push(x.player[i].id);
    }
    shortPlayer(x.room, data);
    killww(x.room, x.dead, data);
    await notifyDeadPlayers(conn, x);
    shortPlayer(x.room, data);
    changeDay(x.room, data);
    return await conn.sendMessage(x.room, {
        image: { url: thumb1 },
        caption: pagii(x),
        mentions: ment
    });
}

export async function voting(conn, x, data) {
    if (!x || !x.player) return;
    const game = getGameCategory(x.category);
    let row = [];
    let ment = [];
    voteStart(x.room, data)
    textnya =
        `*⌂ ${game.name.toUpperCase()} - GAME*\n\nSenja telah tiba. Seluruh warga berkumpul untuk memilih siapa yang akan dieksekusi. Kalian mempunyai waktu selama 90 detik untuk memilih! Hati-hati, ada pengkhianat di antara kalian!\n\n*L I S T - P L A Y E R*:\n`;
    shortPlayer(x.room, data);
    for (let i = 0; i < x.player.length; i++) {
        textnya += `(${x.player[i].number}) ${formatPlayerLabel(x.player[i])} ${x.player[i].isdead === true ? "☠️" : ""}\n`;
        ment.push(x.player[i].id);
    }
    textnya += `\nketik *${x.commandBase || '.ww'} vote nomor* untuk voting player`;
    dayVoting(x.room, data);
    clearAll(x.room, data);
    clearAllSTATUS(x.room, data);
    return await conn.sendMessage(x.room, {
        image: { url: thumb2 },
        caption: textnya,
        mentions: ment
    });
}

export async function malam(conn, x, data) {
    if (!x || !x.player) return;
    const game = getGameCategory(x.category);
    var hasil_vote = voteResult(x.room, data);
    if (hasil_vote === 0) {
        textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nTerlalu bimbang menentukan pilihan. Warga pun pulang ke rumah masing-masing, tidak ada yang dieksekusi hari ini. Bulan bersinar terang, malam yang mencekam telah datang. Semoga tidak ada yang mati malam ini. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
        return conn
            .sendMessage(x.room, {
                image: { url: thumb3 },
                caption: textnya
            })
            .then(() => {
                changeDay(x.room, data);
                voteDone(x.room, data);
                resetVote(x.room, data);
                clearAllVote(x.room, data);
                if (getWinner(x.room, data).status != null)
                    return win(x, 1, conn, data);
            });
    } else if (hasil_vote === 1) {
        textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nWarga desa telah memilih, namun hasilnya seri.\n\nBintang memancarkan cahaya indah malam ini, warga desa beristirahat di kediaman masing masing. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
        let ment = [];
        return conn
            .sendMessage(x.room, {
                image: { url: thumb3 },
                caption: textnya,
                mentions: ment
            })
            .then(() => {
                changeDay(x.room, data);
                voteDone(x.room, data);
                resetVote(x.room, data);
                clearAllVote(x.room, data);
                if (getWinner(x.room, data).status != null)
                    return win(x, 1, conn, data);
            });
    } else if (hasil_vote != 0 && hasil_vote != 1) {
        if (getWerewolfPlayerFaction(x, hasil_vote) === 'antagonist') {
            textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nWarga desa telah memilih dan sepakat @${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} dieksekusi mati.\n\n@${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} adalah ${formatRoleTitle(hasil_vote.role)} ${emoji_role(hasil_vote.role)}`;
            const execution = voteKill(x.room, data);
            if (execution?.protected) {
                textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nWarga telah memilih @${hasil_vote.id.replace("@s.whatsapp.net", "")}, tetapi armor satu kali menahan eksekusi. Target tetap hidup.`;
            }
            await notifyDeadPlayers(conn, x);
            let ment = [];
            ment.push(hasil_vote.id);
            return await conn
                .sendMessage(x.room, {
                    image: { url: thumb4 },
                    caption: textnya,
                    mentions: ment
                })
                .then(() => {
                    changeDay(x.room, data);
                    voteDone(x.room, data);
                    resetVote(x.room, data);
                    clearAllVote(x.room, data);
                    if (getWinner(x.room, data).status != null)
                        return win(x, 1, conn, data);
                });
        } else {
            textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nWarga desa telah memilih dan sepakat @${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} dieksekusi mati.\n\n@${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} adalah ${formatRoleTitle(hasil_vote.role)} ${emoji_role(
        hasil_vote.role
      )}\n\nBulan bersinar terang malam ini, warga desa beristirahat di kediaman masing masing. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
            const execution = voteKill(x.room, data);
            if (execution?.protected) {
                textnya = `*⌂ ${game.name.toUpperCase()} - GAME*\n\nWarga telah memilih @${hasil_vote.id.replace("@s.whatsapp.net", "")}, tetapi armor satu kali menahan eksekusi. Target tetap hidup.`;
            }
            await notifyDeadPlayers(conn, x);
            let ment = [];
            ment.push(hasil_vote.id);
            return await conn
                .sendMessage(x.room, {
                    image: { url: thumb4 },
                    caption: textnya,
                    mentions: ment
                })
                .then(() => {
                    changeDay(x.room, data);
                    voteDone(x.room, data);
                    resetVote(x.room, data);
                    clearAllVote(x.room, data);
                    if (getWinner(x.room, data).status != null)
                        return win(x, 1, conn, data);
                });
        }
    }
}

export async function skill(conn, x, data) {
    skillOn(x.room, data)
    if (getWinner(x.room, data).status != null || x.win != null) {
        return win(x, 1, conn, data);
    }
}

const closeRoomWithNotice = async (conn, roomId, data, note = "Permainan sudah selesai.") => {
    if (!conn || !roomId || !data || !data[roomId]) return false;
    await refundWerewolfWager(data[roomId]);
    await conn.sendMessage(roomId, {
        text: `⚠️ *ROOM ${getGameCategory(data[roomId].category).name.toUpperCase()} DITUTUP OTOMATIS*\n\n${note}`
    }).catch(() => {});
    delete data[roomId];
    return true;
};

export const refundWerewolfWager = async (game) => {
    if (!game || game.wagerSettled) return false;
    const wager = Number(game.wager) || 0;
    const playerIds = Array.isArray(game.wagerPlayers) ? game.wagerPlayers : [];
    if (!Number.isSafeInteger(wager) || wager <= 0 || !playerIds.length) return false;
    const wdb = loadDB();
    playerIds.forEach((id) => {
        wdb.money[id] = addRpgMoney(wdb.money[id], wager);
    });
    game.wagerSettled = true;
    await saveDB(wdb);
    return true;
};

const recordCompletedGame = async (game, winnerStatus) => {
    if (game.statsRecorded || ![true, false, 'jester', 'neutral', 'fixer'].includes(winnerStatus)) return;
    game.statsRecorded = true;
    const wdb = loadDB();
    const playerCount = game.player.filter((player) => !player.isDummy && !player.isAiCitizen).length;
    const completedAt = Date.now();
    const winner = ['jester', 'neutral', 'fixer'].includes(winnerStatus) ? 'neutral' : winnerStatus === false ? 'antagonist' : 'protagonist';

    for (const player of game.player.filter((entry) => !entry.isDummy && !entry.isAiCitizen)) {
        const account = wdb.users[player.id];
        if (!account) continue;
        const stats = account.werewolfStats && typeof account.werewolfStats === 'object'
            ? account.werewolfStats
            : (account.werewolfStats = {});
        stats.antagonistWins = Number(stats.antagonistWins) || 0;
        stats.protagonistWins = Number(stats.protagonistWins) || 0;
        stats.neutralWins = Number(stats.neutralWins) || 0;
        stats.score = Number(stats.score) || 0;
        if (!Array.isArray(stats.history)) stats.history = [];
        const isCipherWinner = player.role === 'cipher' && !player.isdead && [true, false].includes(winnerStatus);
        const isWinner = winner === 'neutral'
            ? winnerStatus === 'jester' ? player.role === 'jester' : winnerStatus === 'fixer' ? game.fixerWinnerId === player.id : game.neutralWinner === player.id
            : getWerewolfPlayerFaction(game, player) === winner || isCipherWinner;
        const score = isWinner ? playerCount : 0;
        if (isWinner) {
            if (player.role === 'cipher') {
                stats.neutralWins += 1;
            } else if (winner === 'antagonist') {
                stats.antagonistWins += 1;
                stats.score += score;
            } else if (winner === 'protagonist') stats.protagonistWins += 1;
            else stats.neutralWins += 1;
        }
        stats.history.unshift({
            id: `${completedAt}-${player.number}`,
            playedAt: completedAt,
            category: game.category || 'werewolf',
            role: player.role,
            result: isWinner ? 'win' : 'loss',
            winner,
            players: playerCount,
            score
        });
        stats.history = stats.history.slice(0, 100);
    }
    await saveDB(wdb);
};

const settleWerewolfWager = async (game, winnerStatus) => {
    const wager = Number(game.wager) || 0;
    if (!Number.isSafeInteger(wager) || wager <= 0 || game.wagerSettled || ![true, false, 'jester', 'neutral', 'fixer'].includes(winnerStatus)) {
        return { text: '', mentions: [] };
    }

    const playerIds = Array.isArray(game.wagerPlayers)
        ? game.wagerPlayers
        : game.player.filter((player) => !player.isDummy && !player.isAiCitizen).map((player) => player.id);
    const playerIdSet = new Set(playerIds);
    const pot = wager * playerIds.length;
    if (!Number.isSafeInteger(pot)) {
        throw new Error(`Werewolf wager pot exceeds safe integer range for room ${game.room}`);
    }

    game.wagerSettled = true;
    const wdb = loadDB();
    const payouts = new Map();
    let neutralRefund = null;

    if (winnerStatus === 'jester' || winnerStatus === 'neutral' || winnerStatus === 'fixer') {
        const neutralWinner = game.player.find((player) =>
            !player.isDummy && !player.isAiCitizen &&
            playerIdSet.has(player.id) &&
            (winnerStatus === 'jester' ? player.role === 'jester'
                : winnerStatus === 'fixer' ? player.id === game.fixerWinnerId
                    : player.id === game.neutralWinner)
        );
        if (neutralWinner) {
            payouts.set(neutralWinner.id, pot);
        } else {
            playerIds.forEach((id) => payouts.set(id, wager));
        }
    } else {
        const neutralPlayer = game.player.find((player) =>
            !player.isDummy && !player.isAiCitizen && playerIdSet.has(player.id) &&
            player.role === 'sorcerer' && getWerewolfPlayerFaction(game, player) === 'neutral'
        );
        if (neutralPlayer) {
            neutralRefund = neutralPlayer.id;
            payouts.set(neutralPlayer.id, wager);
        }

        const winners = game.player.filter((player) =>
            !player.isDummy && !player.isAiCitizen && playerIdSet.has(player.id) &&
            (winnerStatus === true
                ? getWerewolfPlayerFaction(game, player) === 'protagonist' || (player.role === 'cipher' && !player.isdead)
                : getWerewolfPlayerFaction(game, player) === 'antagonist' || (player.role === 'cipher' && !player.isdead))
        );
        const distributablePot = pot - (neutralRefund ? wager : 0);

        if (winners.length) {
            const basePayout = Math.floor(distributablePot / winners.length);
            let remainder = distributablePot % winners.length;
            winners.forEach((player) => {
                payouts.set(player.id, (payouts.get(player.id) || 0) + basePayout + (remainder-- > 0 ? 1 : 0));
            });
        } else {
            playerIds.forEach((id) => payouts.set(id, wager));
        }
    }

    for (const [id, amount] of payouts) {
        wdb.money[id] = addRpgMoney(wdb.money[id], amount);
    }
    await saveDB(wdb);

    const payoutLines = [...payouts]
        .filter(([, amount]) => amount > 0)
        .map(([id, amount]) => `> @${id.split('@')[0]}: +Rp ${amount.toLocaleString('id-ID')}`);
    const mentions = [...payouts.keys()];
    const title = ['jester', 'neutral', 'fixer'].includes(winnerStatus) ? 'Pemenang netral mengambil seluruh pot' : 'Pot dibagikan kepada tim pemenang';
    return {
        text: `\n\n💰 *HASIL TARUHAN*\n> Taruhan: Rp ${wager.toLocaleString('id-ID')} per pemain\n> Total pot: Rp ${pot.toLocaleString('id-ID')}\n> ${title}\n${payoutLines.join('\n')}`,
        mentions
    };
};

export async function win(x, t, conn, data) {
    if (!x || !x.player) return;
    const sesinya = x.room;
    const game = getGameCategory(x.category);
    const winnerStatus = getWinner(x.room, data).status;
    const eliminatedMentions = x.player
        .filter((player) => player.isdead && !player.isDummy && !player.isAiCitizen)
        .map((player) => player.id);
    await recordCompletedGame(x, winnerStatus);
    const wagerResult = await settleWerewolfWager(x, winnerStatus);
    if (winnerStatus === 'fixer') {
        const fixer = x.player.find((player) => player.id === x.fixerWinnerId);
        const target = x.player.find((player) => player.id === fixer?.contractTargetId);
        textnya = `*${game.name.toUpperCase()} · FIXER CONTRACT COMPLETE*\n\n🕵️ *KONTRAK BERHASIL DISELESAIKAN!*\n\n> Fixer: ${formatPlayerLabel(fixer)}\n> Target: ${formatPlayerLabel(target)}\n> ${formatPlayerLabel(target)} telah gugur dan Fixer masih hidup.\n\n*Pemenang tunggal: Fixer*`;
        textnya += formatEliminatedRoles(x.player) + wagerResult.text;
        x.ended = true;
        x.iswin = false;
        await conn.sendMessage(sesinya, {
            image: { url: thumb5 },
            caption: textnya,
            mentions: [...new Set([...(fixer ? [fixer.id] : []), ...(target ? [target.id] : []), ...eliminatedMentions, ...wagerResult.mentions])]
        });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, 'Kontrak Fixer selesai; permainan berakhir.');
        }
        return;
    } else if (winnerStatus === "jester" || winnerStatus === 'neutral') {
        const neutralWinner = x.player.find((player) =>
            winnerStatus === 'jester' ? player.role === "jester" : player.id === x.neutralWinner
        );
        const isSorcerer = neutralWinner?.role === 'sorcerer';
        textnya = `*${game.name.toUpperCase()} · ${isSorcerer ? 'SORCERER' : 'JESTER'} NEUTRAL WIN*\n\n${isSorcerer ? '🔮' : '🃏'} *KEMENANGAN NETRAL!*\n\n`;
        if (neutralWinner) textnya += `${neutralWinner.number}) ${formatPlayerLabel(neutralWinner)}\n     *Role* : ${formatRoleTitle(neutralWinner.role)} ${emoji_role(neutralWinner.role)}\n`;
        textnya += formatEliminatedRoles(x.player) + wagerResult.text;
        x.ended = true;
        x.iswin = false;
        await conn.sendMessage(sesinya, { image: { url: thumb5 }, caption: textnya, mentions: [...new Set([...(neutralWinner ? [neutralWinner.id] : []), ...eliminatedMentions, ...wagerResult.mentions])] });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, "Permainan sudah selesai.");
        }
        return;
    } else if (winnerStatus === false || x.iswin === false) {
        textnya = `*${game.name.toUpperCase()} · ANTAGONIST WIN*\n\nTEAM ${game.antagonistName.toUpperCase()}\n\n`;
        let ment = [];
        for (let i = 0; i < x.player.length; i++) {
            const role = normalizeRoleName(x.player[i].role);
            if (x.player[i].isDummy) continue;
            if (role && (getWerewolfPlayerFaction(x, x.player[i]) === 'antagonist' ||
                (role === 'cipher' && !x.player[i].isdead))) {
                textnya += `${x.player[i].number}) ${formatPlayerLabel(x.player[i])}\n     *Role* : ${formatRoleTitle(role)}\n\n`;
                if (!x.player[i].isAiCitizen) ment.push(x.player[i].id);
            }
        }
        textnya += formatEliminatedRoles(x.player) + wagerResult.text;
        x.ended = true;
        x.iswin = false;
        ment.push(...eliminatedMentions, ...wagerResult.mentions);
        await conn.sendMessage(sesinya, {
            image: { url: thumb5 },
            caption: textnya,
            mentions: [...new Set(ment)]
        });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, "Permainan sudah selesai.");
        }
        return;
    } else if (getWinner(x.room, data).status === true) {
        const victoryStory = PROTAGONIST_WIN_STORIES[Math.floor(Math.random() * PROTAGONIST_WIN_STORIES.length)]
            .replaceAll('{protagonist}', game.protagonistName)
            .replaceAll('{antagonist}', game.antagonistName)
            .replaceAll('{location}', game.location);
        textnya = `*${game.name.toUpperCase()} · PROTAGONIST WIN*\n\n${victoryStory}\n\nTEAM ${game.protagonistName.toUpperCase()}\n\n`;
        let ment = [];
        for (let i = 0; i < x.player.length; i++) {
            const role = normalizeRoleName(x.player[i].role);
            if (x.player[i].isDummy) continue;
            if (role && (getWerewolfPlayerFaction(x, x.player[i]) === 'protagonist' ||
                (role === 'cipher' && !x.player[i].isdead))) {
                textnya += `${x.player[i].number}) ${formatPlayerLabel(x.player[i])}\n     *Role* : ${formatRoleTitle(role)}\n\n`;
                if (!x.player[i].isAiCitizen) ment.push(x.player[i].id);
            }
        }
        textnya += formatEliminatedRoles(x.player) + wagerResult.text;
        x.ended = true;
        x.iswin = true;
        ment.push(...eliminatedMentions, ...wagerResult.mentions);
        await conn.sendMessage(sesinya, {
            image: { url: thumb6 },
            caption: textnya,
            mentions: [...new Set(ment)]
        });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, "Permainan sudah selesai.");
        }
        return;
    }
}

// playing
export async function run(conn, id, data) {
    while (getWinner(id, data).status === null) {
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await pagi(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await voting(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await malam(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await skill(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) break;
    }
    await win(sesi(id, data), 1, conn, data);
}

export async function run_vote(conn, id, data) {
    while (getWinner(id, data).status === null) {
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await voting(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await malam(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await skill(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await pagi(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) break;
    }
    await win(sesi(id, data), 1, conn, data);
}

export async function run_malam(conn, id, data) {
    while (getWinner(id, data).status === null) {
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await skill(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
 }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await pagi(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await voting(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await malam(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) break;
    }
    await win(sesi(id, data), 1, conn, data);
}

export async function run_pagi(conn, id, data) {
    while (getWinner(id, data).status === null) {
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await pagi(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await voting(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await malam(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await skill(conn, sesi(id, data), data);
        }
        if (getWinner(id, data).status != null) {
            win(getWinner(id, data), 1, conn, data);
            break;
        } else {
            await sleep(90000);
        }
        if (getWinner(id, data).status != null) break;
    }
    await win(sesi(id, data), 1, conn, data);
}
 
