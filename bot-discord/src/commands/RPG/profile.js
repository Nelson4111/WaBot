const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');
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
    return { users: {}, linkedUsers: {}, money: {} };
}

function getEquipmentName(type, level) {
    if (!level || level <= 0) return 'Tidak Ada';
    const names = {
        sword: ['Kayu', 'Batu', 'Besi', 'Emas', 'Berlian', 'Mythic', 'Legendary', 'Godly'],
        armor: ['Kulit', 'Rantai', 'Besi', 'Emas', 'Berlian', 'Netherite', 'Celestial'],
        pickaxe: ['Kayu', 'Batu', 'Besi', 'Emas', 'Berlian', 'Netherite', 'Titanium'],
        fishingrod: ['Bambu', 'Fiber', 'Baja', 'Karbon', 'Mutiara', 'Kraken']
    };
    let list = names[type] || [];
    let name = list[Math.min(level - 1, list.length - 1)] || 'Tier ' + level;
    return `${name} (Lv.${level})`;
}

module.exports = {
    name: 'profile',
    aliases: ['inv', 'inventory', 'status', 'profil', 'me'],
    description: 'Menampilkan profil RPG, inventory status, dan saldo kamu.',
    category: 'RPG',
    slashOptions: [
        {
            name: 'user',
            description: 'User yang ingin dilihat profilnya',
            type: 6,
            required: false
        }
    ],
    args: false,
    usage: '[@user]',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const targetUser = interaction.options.getUser('user') || interaction.user;
        return this.sendProfile(interaction, targetUser, client, true);
    },

    async execute(message, args, client) {
        const targetUser = message.mentions.users.first() || message.author;
        return this.sendProfile(message, targetUser, client, false);
    },

    async sendProfile(context, user, client, isSlash) {
        const db = getDB();
        const linkInfo = db.linkedUsers ? db.linkedUsers[user.id] : null;

        let waJid = linkInfo ? linkInfo.waJid : null;
        let userData = waJid && db.users ? db.users[waJid] : null;
        let userRPG = userData && userData.rpg ? userData.rpg : (userData || {});

        // Data default jika user belum main atau belum linked
        let level = userRPG.level || 1;
        let exp = userRPG.exp || 0;
        let threshold = level * 500;
        let armorLvl = userRPG.armor || 0;
        let maxHP = 100 + (armorLvl * 20) + (userRPG.maxDarahBonus || 0);
        let darah = typeof userRPG.darah !== 'undefined' ? userRPG.darah : maxHP;
        let money = (db.money && waJid ? db.money[waJid] : 0) || userRPG.money || 0;
        let bank = userRPG.bank || 0;

        let diamond = (userRPG.diamond || 0) + (userRPG.inventory?.diamond || 0) + (userRPG.ores?.diamond || 0);
        let gold = (userRPG.gold || 0) + (userRPG.inventory?.gold || 0) + (userRPG.ores?.gold || 0);
        let iron = (userRPG.iron || 0) + (userRPG.inventory?.iron || 0) + (userRPG.ores?.iron || 0);
        let wood = (userRPG.wood || 0) + (userRPG.inventory?.wood || 0) + (userRPG.ores?.wood || 0);
        let stone = (userRPG.stone || 0) + (userRPG.inventory?.stone || 0) + (userRPG.ores?.stone || 0);

        let hpPercent = Math.max(0, Math.min(10, Math.floor((darah / maxHP) * 10)));
        let hpBar = '█'.repeat(hpPercent) + '░'.repeat(10 - hpPercent);

        let expPercent = Math.max(0, Math.min(10, Math.floor((exp / threshold) * 10)));
        let expBar = '█'.repeat(expPercent) + '░'.repeat(10 - expPercent);

        const embed = new EmbedBuilder()
            .setColor('#00D4FF')
            .setAuthor({ name: `Profil RPG: ${user.username}`, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setDescription(
                `🔗 **Status Tautan:** ${linkInfo ? `✅ *Tersinkron WhatsApp* (\`${linkInfo.waJid.split('@')[0]}\`)` : '⚠️ *Belum Ditautkan* (Ketik `/linkwa` untuk sinkronkan data)'}\n\n` +
                `❤️ **Darah (HP):** \`[${hpBar}]\` **${darah}/${maxHP}**\n` +
                `🆙 **Level:** **Lv.${level}** \`[${expBar}]\` (${exp}/${threshold} XP)`
            )
            .addFields(
                {
                    name: '💰 Keuangan',
                    value: `💵 Saldo: **Rp ${money.toLocaleString('id-ID')}**\n🏦 Bank: **Rp ${bank.toLocaleString('id-ID')}**`,
                    inline: true
                },
                {
                    name: '🗡️ Peralatan (Equipment)',
                    value: `⚔️ Weapon: **${getEquipmentName('sword', userRPG.sword)}**\n🛡️ Armor: **${getEquipmentName('armor', userRPG.armor)}**\n⛏️ Pickaxe: **${getEquipmentName('pickaxe', userRPG.pickaxe)}**\n🎣 Rod: **${getEquipmentName('fishingrod', userRPG.fishingrod)}**`,
                    inline: true
                },
                {
                    name: '💎 Penyimpanan Utama',
                    value: `💎 Diamond: **${diamond.toLocaleString()}** | ✨ Gold: **${gold.toLocaleString()}**\n⛓️ Iron: **${iron.toLocaleString()}** | 🪵 Wood: **${wood.toLocaleString()}**\n🪨 Stone: **${stone.toLocaleString()}**`,
                    inline: false
                }
            )
            .setFooter({ text: 'Gunakan .dungeon atau .hunt untuk meningkatkan level & exp' })
            .setTimestamp();

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rpg_refresh_profile')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄'),
            new ButtonBuilder()
                .setCustomId('rpg_goto_menu')
                .setLabel('Menu RPG')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📜')
        );

        let msg;
        if (isSlash) {
            msg = context.deferred || context.replied ? await context.editReply({ embeds: [embed], components: [btnRow] }) : await context.reply({ embeds: [embed], components: [btnRow] });
        } else {
            msg = await context.reply({ embeds: [embed], components: [btnRow] });
        }

        if (msg && typeof msg.createMessageComponentCollector === 'function') {
            const collector = msg.createMessageComponentCollector({ time: 60000 });
            collector.on('collect', async (i) => {
                if (i.user.id !== user.id) {
                    return i.reply({ content: '❌ Ini bukan profilmu!', ephemeral: true });
                }
                if (i.customId === 'rpg_refresh_profile') {
                    await i.deferUpdate();
                    return this.sendProfile(context, user, client, isSlash);
                } else if (i.customId === 'rpg_goto_menu') {
                    const menuCmd = client.commands.get('menurpg');
                    if (menuCmd) {
                        await i.deferReply({ ephemeral: true });
                        return menuCmd.sendRpgMenu(i, user, client, true);
                    }
                }
            });
        }
    }
};
