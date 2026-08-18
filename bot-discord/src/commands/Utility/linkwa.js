const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getDB() {
    if (global.db && global.db.data) return global.db.data;
    try {
        const dbPath = path.resolve(__dirname, '../../../../database.json');
        if (fs.existsSync(dbPath)) {
            return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        }
    } catch (e) {}
    return { users: {}, linkCodes: {}, linkedUsers: {} };
}

function saveDB(dbData) {
    try {
        const dbPath = path.resolve(__dirname, '../../../../database.json');
        fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (e) {
        console.error('[LinkWA Save Error]', e.message);
    }
}

function maskNumber(jid) {
    if (!jid) return 'WhatsApp User';
    let num = jid.replace(/[^0-9]/g, '');
    if (num.length < 8) return jid;
    return `+${num.slice(0, 5)}****${num.slice(-4)}`;
}

module.exports = {
    name: 'linkwa',
    aliases: ['tautkanwa', 'linkwhatsapp'],
    description: 'Menautkan akun Discord dengan akun WhatsApp RPG/Bot Anda via kode OTP.',
    category: 'Utility',
    slashOptions: [
        {
            name: 'kode',
            description: 'Kode 6-digit OTP yang didapatkan dari WhatsApp (.linkdc)',
            type: 3, // STRING
            required: true
        }
    ],
    args: true,
    usage: '<kode_otp>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const kode = interaction.options.getString('kode')?.trim();
        return handleLink(interaction, interaction.user, kode, true);
    },

    async execute(message, args, client) {
        const kode = args[0]?.trim();
        if (!kode) {
            return message.reply('❌ Masukkan kode OTP!\nContoh: `!linkwa 123456`\n_Dapatkan kode dengan mengetik `.linkdc` di WhatsApp._');
        }
        return handleLink(message, message.author, kode, false);
    }
};

async function handleLink(context, user, kode, isSlash) {
    const db = getDB();
    db.linkCodes = db.linkCodes || {};
    db.users = db.users || {};
    db.linkedUsers = db.linkedUsers || {};

    const record = db.linkCodes[kode];

    if (!record) {
        const errEmbed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Verifikasi Gagal')
            .setDescription('Kode OTP tidak valid atau salah.\nSilakan ketik `.linkdc` di WhatsApp untuk membuat kode baru.');
        return isSlash ? context.reply({ embeds: [errEmbed], ephemeral: true }) : context.reply({ embeds: [errEmbed] });
    }

    if (Date.now() > record.expiresAt) {
        delete db.linkCodes[kode];
        saveDB(db);
        const errEmbed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏰ Kode Kadaluarsa')
            .setDescription('Kode OTP telah melewati batas waktu 3 menit.\nSilakan generate kode baru di WhatsApp dengan `.linkdc`.');
        return isSlash ? context.reply({ embeds: [errEmbed], ephemeral: true }) : context.reply({ embeds: [errEmbed] });
    }

    const waJid = record.waJid;
    const pushName = record.pushName || 'Player';

    // Tautkan akun
    if (!db.users[waJid]) db.users[waJid] = {};
    db.users[waJid].discordId = user.id;
    db.users[waJid].discordTag = user.tag || user.username;

    db.linkedUsers[user.id] = {
        waJid: waJid,
        linkedAt: Date.now()
    };

    // Hapus kode setelah sukses
    delete db.linkCodes[kode];
    saveDB(db);

    const successEmbed = new EmbedBuilder()
        .setColor('#00FF88')
        .setTitle('🎉 Akun Berhasil Ditautkan!')
        .setDescription(`Akun Discord **${user.tag || user.username}** telah berhasil terhubung dengan akun WhatsApp Anda.`)
        .addFields(
            { name: '📱 WhatsApp User', value: `${pushName} (${maskNumber(waJid)})`, inline: true },
            { name: '🎧 Discord ID', value: `\`${user.id}\``, inline: true },
            { name: '🛡️ Status Sinkronisasi', value: '✅ Aktif & Terlindungi (Shared State)', inline: false }
        )
        .setFooter({ text: 'NelBot Multi-Device Bridge System' })
        .setTimestamp();

    return isSlash ? context.reply({ embeds: [successEmbed] }) : context.reply({ embeds: [successEmbed] });
}
