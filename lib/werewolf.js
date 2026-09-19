import toMs from "ms";
import * as jimpPkg from 'jimp';
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
    if (role === "warga") {
        return "👱‍♂️";
    } else if (role === "seer") {
        return "👳";
    } else if (role === "guardian") {
        return "👼";
    } else if (role === "sorcerer") {
        return "🔮";
    } else if (role === "werewolf") {
        return "🐺";
    } else if (role === "hunter") {
        return "🏹";
    } else if (role === "mayor") {
        return "👑";
    } else if (role === "jester") {
        return "🃏";
    } else if (role === "blacksmith") {
        return "⚒️";
    } else {
        return "";
    }
}

const normalizeRoleName = (role) => {
    const clean = String(role || '').trim().toLowerCase();
    return ['werewolf', 'warga', 'seer', 'guardian', 'sorcerer', 'hunter', 'mayor', 'jester', 'blacksmith'].includes(clean) ? clean : null;
};

export const formatPlayerLabel = (player) => {
    if (!player) return '—';
    if (player.isDummy) return `Warga ${player.number}`;
    return `@${String(player.id || '').replace('@s.whatsapp.net', '')}`;
};

const getSelectableLivingTargets = (room, player, { includeSelf = false } = {}) => {
    if (!room || !Array.isArray(room.player)) return [];
    return room.player.filter((entry) => {
        if (!entry || entry.isDummy || entry.isdead) return false;
        if (!includeSelf && entry.id === player?.id) return false;
        return true;
    });
};

const isValidActionTarget = (room, targetNumber, { allowDead = false } = {}) => {
    if (!room || !Array.isArray(room.player) || targetNumber === null || targetNumber === undefined) return false;
    const numericTarget = Number(targetNumber);
    if (!Number.isFinite(numericTarget)) return false;
    const target = room.player.find((entry) => entry && entry.number === numericTarget);
    if (!target || target.isDummy) return false;
    if (target.isdead && !allowDead) return false;
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
    const aliveTargets = getSelectableLivingTargets(room, player);

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

    if (player.role === "werewolf") {
        addTargetEntries(aliveTargets, "kill");
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "seer") {
        addTargetEntries(aliveTargets, "check");
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "guardian") {
        addTargetEntries(aliveTargets, "guard");
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "sorcerer") {
        addTargetEntries(aliveTargets, "poison");
        const reviveTargets = room.player.filter((p) => !p.isDummy && p.isdead && p.id !== player.id);
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
        }
        addEntry({ type: "skip", label: "Lewati Malam" });
    } else if (player.role === "mayor" || player.role === "jester" || player.role === "blacksmith" || player.role === "warga") {
        const dummyLabels = ["Kunci Pintu & Tidur", "Jaga Pos Ronda", "Berdoa di Rumah", "Lewati Malam"];
        dummyLabels.forEach((label) => {
            addEntry({
                type: "dummy",
                label
            });
        });
    }

    if (Object.keys(secret).length === 0) {
        const dummyLabels = ["Rumah", "Gudang", "Gereja", "Hutan"];
        dummyLabels.forEach((label) => {
            addEntry({
                type: "dummy",
                label
            });
        });
    }

    player.secretCodes = secret;
    return secret;
};

export const generateVoteCodeMap = (room, player) => {
    if (!room || !player) return {};
    const used = new Set();
    const voteCodes = {};
    const addEntry = (target) => {
        const code = generateCode(used);
        voteCodes[code] = {
            targetNumber: target.number,
            targetId: target.id,
            targetRole: target.role || null
        };
    };

    const aliveTargets = getSelectableLivingTargets(room, player);
    aliveTargets.forEach((target) => addEntry(target));

    if (Object.keys(voteCodes).length === 0) {
        const allProtected = getSelectableLivingTargets(room, player);
        allProtected.forEach((target) => addEntry(target));
    }

    player.voteCodes = voteCodes;
    return voteCodes;
};

export const resolveSecretCodeAction = (from, sender, code, data, phase = "night") => {
    const room = sesi(from, data);
    if (!room) return { ok: false, reason: "room" };
    const player = room.player.find((p) => p.id === sender);
    if (!player) return { ok: false, reason: "player" };

    const normalized = String(code || "").trim().toUpperCase();
    if (!normalized) return { ok: false, reason: "code" };
    if (player.isdead) return { ok: false, reason: "dead-player" };

    if (phase === "vote") {
        const voteCodes = player.voteCodes || generateVoteCodeMap(room, player);
        const choice = voteCodes[normalized];
        if (!choice) return { ok: false, reason: "invalid-vote-code" };
        if (player.isvote) return { ok: false, reason: "already-voted" };
        const target = room.player.find((p) => p.number === choice.targetNumber && !p.isdead && !p.isDummy);
        if (!target) return { ok: false, reason: "invalid-vote-target" };
        const voteBoost = player.role === "mayor" ? 2 : 1;
        target.vote += voteBoost;
        player.isvote = true;
        return { ok: true, action: "vote", targetNumber: target.number, voteBoost };
    }

    if (player.nightDone) return { ok: false, reason: "night-done" };

    const secretCodes = player.secretCodes || buildRoleCodeMap(room, player);
    const choice = secretCodes[normalized];
    if (!choice) return { ok: false, reason: "invalid-night-code" };

    if (choice.type !== "skip" && choice.type !== "dummy") {
        const isReviveChoice = choice.type === "revive";
        const allowsDeadTarget = isReviveChoice;
        if (!isValidActionTarget(room, choice.targetNumber, { allowDead: allowsDeadTarget })) {
            return { ok: false, reason: "invalid-target" };
        }
        if (isReviveChoice) {
            const target = room.player.find((p) => p && p.number === Number(choice.targetNumber));
            if (!target || target.isDummy || !target.isdead) {
                return { ok: false, reason: "invalid-target" };
            }
        }
    }

    player.nightDone = true;
    player.lastNightAction = choice;
    const nightMap = room.nightActions || (room.nightActions = {});
    nightMap[sender] = choice;

    if (choice.type === "kill") {
        room.nightTarget = choice.targetNumber;
    }
    if (choice.type === "skip") {
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
    if (choice.type === "poison") {
        room.poisonTarget = choice.targetNumber;
    }
    if (choice.type === "revive") {
        room.reviveTarget = choice.targetNumber;
    }
    if (choice.type === "hunter") {
        room.hunterTarget = choice.targetNumber;
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
        } else if (db.role === "blacksmith" && db.armor !== false) {
            db.armor = false;
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
    if (data[sesi].player[index].role === "werewolf") {
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
export const roleAmount = (from, data) => {
    const result = sesi(from, data);
    if (!result) return false;
    const count = result.player.filter((player) => !player.isDummy).length;
    if (count < 1 || count > 15) return false;
    const roles = [];
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
        if (count >= minimumPlayers && canAdd() && Math.random() < chance) addRole(role);
    };

    if (werewolf > 0) addRole('werewolf', werewolf);
    if (count >= 5) addRole('seer');
    if (count >= 6) addRole('guardian');

    if (werewolf === 0) {
        if (canAdd()) addRole('sorcerer');
        if (canAdd()) addRole('jester');
        if (roles.filter((roleName) => ['werewolf', 'sorcerer', 'jester'].includes(roleName)).length === 0) {
            addRole('werewolf');
        }
    } else {
        addOptional('sorcerer', count >= 13 ? 0.9 : count >= 9 ? 0.55 : 0.25, 6);
        addOptional('jester', count >= 12 ? 0.9 : count >= 9 ? 0.6 : 0.25, 7);
    }

    addOptional('blacksmith', count >= 12 ? 1 : 0.65, 6);
    addOptional('hunter', count >= 12 ? 1 : 0.7, 7);
    addOptional('mayor', count >= 12 ? 1 : 0.65, 8);

    while (roles.length < count) roles.push('warga');
    return roles.reduce((result, role) => {
        result[role] = (result[role] || 0) + 1;
        return result;
    }, {});
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

    const role = roleAmount(from, data);
    if (!role) return false;
    const roleList = Object.entries(role).flatMap(([roleName, amount]) => Array(amount).fill(roleName));
    const players = roleShuffle(room.player.filter((player) => !player.isDummy && (!player.role || player.role === false)));
    if (players.length !== roleList.length) return false;
    players.forEach((player, index) => roleChanger(from, player.id, roleList[index], data));
    if (room.player.some((player) => !player.isDummy && (!player.role || player.role === false))) return false;
    room.player.forEach((player) => {
        if (player.isDummy) {
            player.role = 'warga';
            player.vote = 0;
            player.isvote = false;
        }
        if (player.role === "blacksmith") player.armor = true;
        player.nightDone = false;
        player.lastNightAction = null;
        player.secretCodes = {};
        player.voteCodes = {};
        player.deathNoticeSent = false;
    });
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
    room = sesi(from, data);
    if (!room) return false;
    const idGet = room.player.findIndex((i) => i.id === sender);
    if (idGet === -1 || room.player[idGet].isdead || room.player[idGet].isDummy) return false;
    const indexPlayer = room.player.findIndex((i) => i.number === id && !i.isDummy);
    if (indexPlayer === -1 || room.player[indexPlayer].isdead) return false;
    room.player[idGet].isvote = true;
    room.player[indexPlayer].vote += room.player[idGet].role === "mayor" ? 2 : 1;
    return true;
};

// hasil voting
export const voteResult = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    const alive = room.player.filter((player) => !player.isdead && !player.isDummy).sort((a, b) => b.vote - a.vote);
    if (!alive.length || alive[0].vote === 0) return 0;
    if (alive[0].vote === alive[1]?.vote) return 1;
    return alive[0];
};

// vote killing
export const voteKill = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    const target = voteResult(from, data);
    if (target === 0) return 0;
    if (target === 1) return 1;
    target.isdead = true;
    target.deathNoticeSent = false;
    if (target.role === "jester") room.jesterWin = true;
    if (target.role === "hunter") target.canShoot = true;
    return target;
};

// voting reset
export const resetVote = (from, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let i = 0; i < room.player.length; i++) {
        room.player[i].vote = 0;
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
        room.player[i].isvote = false;
    }
};

export const resolveNightActions = (from, data) => {
    room = sesi(from, data);
    if (!room || !Array.isArray(room.player)) return false;

    const safeNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
    const setDead = (targetNumber) => {
        const target = room.player.find((player) => player.number === targetNumber && !player.isDummy);
        if (!target || target.isdead) return;
        if (target.effect?.includes('guardian')) return;
        target.isdead = true;
        target.deathNoticeSent = false;
        if (target.role === 'hunter') target.canShoot = true;
        if (!room.dead.includes(target.number)) room.dead.push(target.number);
    };

    if (room.guardianTarget !== undefined && room.guardianTarget !== null) {
        const guardianTarget = room.player.find((player) => player.number === safeNumber(room.guardianTarget) && !player.isDummy);
        if (guardianTarget && !guardianTarget.effect.includes('guardian')) {
            guardianTarget.effect.push('guardian');
        }
    }

    if (room.poisonTarget !== undefined && room.poisonTarget !== null) {
        setDead(safeNumber(room.poisonTarget));
    }

    if (room.nightTarget !== undefined && room.nightTarget !== null) {
        setDead(safeNumber(room.nightTarget));
    }

    if (room.reviveTarget !== undefined && room.reviveTarget !== null) {
        const reviveTarget = room.player.find((player) => player.number === safeNumber(room.reviveTarget) && !player.isDummy);
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
    room = sesi(from, data);
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
    room = sesi(from, data);
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
    const hasil = data.player.filter((x) => x.isdead === false && !x.isDummy);
    return hasil.length;
};

export const playerMati = (data) => {
    const hasil = data.player.filter((x) => x.isdead === true && !x.isDummy);
    return hasil.length;
};

// get player win
export const getWinner = (from, data) => {
    room = sesi(from, data);
    if (!room || !room.player) return { voting: false, status: null };
    if (room.jesterWin) return { voting: true, status: "jester" };
    var ww = 0;
    var orang_baek = 0;
    for (let i = 0; i < room.player.length; i++) {
        if (room.player[i].isDummy) continue;
        if (room.player[i].isdead === false) {
            if (
                room.player[i].role === "werewolf" ||
                room.player[i].role === "sorcerer"
            ) {
                ww += 1;
            } else if (
                room.player[i].role === "warga" ||
                room.player[i].role === "guardian" ||
                room.player[i].role === "seer" ||
                room.player[i].role === "hunter" ||
                room.player[i].role === "mayor" ||
                room.player[i].role === "blacksmith" ||
                room.player[i].role === "jester"
            ) {
                orang_baek += 1;
            }
        }
    }
    if (room.voting) {
        b = voteResult(from, data);
        if (b != 0 && b != 1) {
            if (b.role === "werewolf" || b.role === "sorcerer") {
                ww -= 1;
            } else if (
                b.role === "warga" ||
                b.role === "seer" ||
                b.role === "guardian"
            ) {
                orang_baek -= 1;
            }
        }
    }
    if (ww === 0) {
        room.iswin = true;
        return {
            voting: room.voting,
            status: true
        };
    } else if (ww === orang_baek) {
        room.iswin = false;
        return {
            voting: room.voting,
            status: false
        };
    } else if (orang_baek === 0) {
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
    room = sesi(from, data);
    if (!room) return false;
    room.player.sort((a, b) => a.number - b.number);
};

// werewolf killing
export const killww = (from, id, data) => {
    room = sesi(from, data);
    if (!room) return false;
    for (let j = 0; j < room.dead.length; j++) {
        idd = getPlayerById(from, room.player[0].id, room.dead[j], data);
        if (!idd) return false;
        if (room.player[idd.index].effect.includes("guardian")) return;
        if (room.player[idd.index].isdead) continue;
        if (room.player[idd.index].role === "blacksmith" && room.player[idd.index].armor !== false) {
            room.player[idd.index].armor = false;
            continue;
        }
        room.player[idd.index].isdead = true;
        room.player[idd.index].deathNoticeSent = false;
        if (room.player[idd.index].role === "hunter") room.player[idd.index].canShoot = true;
    }
};

export const pagii = (data) => {
    if (data.dead.length < 1) {
        return `*⌂ W E R E W O L F - G A M E*\n\nMentari telah terbit, tidak ada korban berjatuhan malam ini, warga kembali melakukan aktifitasnya seperti biasa.\n90 detik tersisa sebelum waktu penentuan, para warga dipersilahkan untuk berdiskusi\n*Hari ke ${data.day}*`;
    } else {
        a = "";
        d = "";
        e = [];
        f = [];
        for (let i = 0; i < data.dead.length; i++) {
            b = data.player.findIndex((x) => x.number === data.dead[i]);
            if (data.player[b].effect.includes("guardian")) {
                e.push(data.player[b].id);
            } else {
                f.push(data.player[b].id);
            }
        }
        for (let i = 0; i < f.length; i++) {
            const label = formatPlayerLabel(data.player.find((player) => player.id === f[i]));
            if (i === f.length - 1) {
                if (f.length > 1) {
                    a += ` dan ${label}`;
                } else {
                    a += `${label}`;
                }
            } else if (i === f.length - 2) {
                a += `${label}`;
            } else {
                a += `${label}, `;
            }
        }
        for (let i = 0; i < e.length; i++) {
            const label = formatPlayerLabel(data.player.find((player) => player.id === e[i]));
            if (i === e.length - 1) {
                if (e.length > 1) {
                    d += ` dan ${label}`;
                } else {
                    d += `${label}`;
                }
            } else if (i === e.length - 2) {
                d += `${label}`;
            } else {
                d += `${label}, `;
            }
        }
        textnya = `*⌂ W E R E W O L F - G A M E*\n\nPagi telah tiba, warga desa menemukan ${
      data.dead.length > 1 ? "beberapa" : "1"
    } mayat di tumpukan puing dan darah berceceran. ${a ? a + " telah mati! " : ""}${
      d.length > 1
        ? ` ${d} hampir dibunuh, namun *Guardian Angel* berhasil melindunginya.`
        : ""
    }\n\nTak terasa hari sudah siang, matahari tepat di atas kepala, terik panas matahari membuat suasana menjadi riuh, warga desa mempunyai 90 detik untuk berdiskusi\n*Hari ke ${
      data.day
    }*`;
        return textnya;
    }
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
    let row = [];
    let ment = [];
    voteStart(x.room, data)
    textnya =
        "*⌂ W E R E W O L F - G A M E*\n\nSenja telah tiba. Seluruh warga berkumpul di balai desa untuk memilih siapa yang akan dieksekusi. Sebagian warga terlihat sibuk menyiapkan alat penyiksaan untuk malam ini. Kalian mempunyai waktu selama 90 detik untuk memilih! Hati-hati, ada penghianat diantara kalian!\n\n*L I S T - P L A Y E R*:\n";
    shortPlayer(x.room, data);
    for (let i = 0; i < x.player.length; i++) {
        textnya += `(${x.player[i].number}) ${formatPlayerLabel(x.player[i])} ${x.player[i].isdead === true ? "☠️" : ""}\n`;
        ment.push(x.player[i].id);
    }
    textnya += "\nketik *.ww vote nomor* untuk voting player";
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
    var hasil_vote = voteResult(x.room, data);
    if (hasil_vote === 0) {
        textnya = `*⌂ W E R E W O L F - G A M E*\n\nTerlalu bimbang menentukan pilihan. Warga pun pulang ke rumah masing-masing, tidak ada yang dieksekusi hari ini. Bulan bersinar terang, malam yang mencekam telah datang. Semoga tidak ada yang mati malam ini. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
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
        textnya = `*⌂ W E R E W O L F - G A M E*\n\nWarga desa telah memilih, namun hasilnya seri.\n\nBintang memancarkan cahaya indah malam ini, warga desa beristirahat di kediaman masing masing. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
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
        if (hasil_vote.role === "werewolf") {
            textnya = `*⌂ W E R E W O L F - G A M E*\n\nWarga desa telah memilih dan sepakat @${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} dieksekusi mati.\n\n@${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} adalah ${hasil_vote.role} ${emoji_role(hasil_vote.role)}`;
            voteKill(x.room, data);
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
            textnya = `*⌂ W E R E W O L F - G A M E*\n\nWarga desa telah memilih dan sepakat @${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} dieksekusi mati.\n\n@${hasil_vote.id.replace(
        "@s.whatsapp.net",
        ""
      )} adalah ${hasil_vote.role} ${emoji_role(
        hasil_vote.role
      )}\n\nBulan bersinar terang malam ini, warga desa beristirahat di kediaman masing masing. Pemain malam hari: kalian punya 90 detik untuk beraksi!`;
            voteKill(x.room, data);
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
    await conn.sendMessage(roomId, {
        text: `⚠️ *ROOM WEREWOLF DITUTUP OTOMATIS*\n\n${note}`
    }).catch(() => {});
    delete data[roomId];
    return true;
};

export async function win(x, t, conn, data) {
    if (!x || !x.player) return;
    const sesinya = x.room;
    const winnerStatus = getWinner(x.room, data).status;
    if (winnerStatus === "jester") {
        const jester = x.player.find((player) => player.role === "jester");
        textnya = `*J E S T E R - W I N*\n\n🃏 *HHA HA HA!!*\n\n`;
        if (jester) textnya += `${jester.number}) @${jester.id.replace("@s.whatsapp.net", "")}\n     *Role* : Jester 🃏\n`;
        x.ended = true;
        x.iswin = false;
        await conn.sendMessage(sesinya, { image: { url: thumb5 }, caption: textnya, mentions: jester ? [jester.id] : [] });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, "Permainan sudah selesai.");
        }
        return;
    } else if (winnerStatus === false || x.iswin === false) {
        textnya = `*W E R E W O L F - W I N*\n\nTEAM WEREWOLF\n\n`;
        let ment = [];
        for (let i = 0; i < x.player.length; i++) {
            const role = normalizeRoleName(x.player[i].role);
            if (x.player[i].isDummy) continue;
            if (role && ['sorcerer', 'werewolf'].includes(role)) {
                textnya += `${x.player[i].number}) ${formatPlayerLabel(x.player[i])}\n     *Role* : ${role}\n\n`;
                ment.push(x.player[i].id);
            }
        }
        x.ended = true;
        x.iswin = false;
        await conn.sendMessage(sesinya, {
            image: { url: thumb5 },
            caption: textnya,
            mentions: ment
        });
        if (data && data[x.room]) {
            await closeRoomWithNotice(conn, x.room, data, "Permainan sudah selesai.");
        }
        return;
    } else if (getWinner(x.room, data).status === true) {
        textnya = `*T E A M - W A R G A - W I N*\n\nTEAM WARGA\n\n`;
        let ment = [];
        for (let i = 0; i < x.player.length; i++) {
            const role = normalizeRoleName(x.player[i].role);
            if (x.player[i].isDummy) continue;
            if (role && !['werewolf', 'sorcerer', 'jester'].includes(role)) {
                textnya += `${x.player[i].number}) ${formatPlayerLabel(x.player[i])}\n     *Role* : ${role}\n\n`;
                ment.push(x.player[i].id);
            }
        }
        x.ended = true;
        x.iswin = true;
        await conn.sendMessage(sesinya, {
            image: { url: thumb6 },
            caption: textnya,
            mentions: ment
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
 
