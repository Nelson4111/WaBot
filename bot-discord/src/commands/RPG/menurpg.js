const {
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
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
    return { users: {}, linkedUsers: {} };
}

module.exports = {
    name: 'menurpg',
    aliases: ['rpg', 'rpgmenu', 'help-rpg', 'rpghelp'],
    description: 'Menampilkan menu utama dan panduan perintah Zeta RPG di Discord.',
    category: 'RPG',
    slashOptions: [],
    args: false,
    usage: '',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        return this.sendRpgMenu(interaction, interaction.user, client, true);
    },

    async execute(message, args, client) {
        return this.sendRpgMenu(message, message.author, client, false);
    },

    async sendRpgMenu(context, user, client, isSlash) {
        const db = getDB();
        const linkInfo = db.linkedUsers ? db.linkedUsers[user.id] : null;
        const isLinked = !!linkInfo;

        const embed = new EmbedBuilder()
            .setColor('#00D4FF')
            .setTitle('⚔️ ZETA RPG - MAIN DASHBOARD')
            .setDescription(
                `Selamat datang di dunia **Zeta RPG Multi-Device**!\n` +
                `Jelajahi dungeon, latih pet, kembangkan bisnis ternak, dan bangun harem impianmu.\n\n` +
                `🔗 **Status Akun:** ${isLinked ? `✅ *Terhubung ke WhatsApp* (\`${linkInfo.waJid.split('@')[0]}\`)` : '⚠️ *Belum Ditautkan ke WhatsApp* (Ketik `/linkwa` untuk sinkronkan data)'}\n\n` +
                `📌 *Pilih kategori di bawah untuk melihat daftar perintah selengkapnya.*`
            )
            .addFields(
                { name: '👤 Karakter & Profil', value: '`.profile`, `.inv`, `/linkwa`', inline: true },
                { name: '⚔️ Dungeon & Hunt', value: '`.dungeon`, `.hunt`, `.heal`', inline: true },
                { name: '💖 Relationship & Harem', value: '`.rship`, `.duel`, `.gift`', inline: true },
                { name: '🐾 Pet Center', value: '`.pet`, `.pet feed`, `.pet train`', inline: true },
                { name: '🛒 Toko & Pasar', value: '`.shop`, `.beli`, `.jual all`', inline: true },
                { name: '🌾 Ternak & Panen', value: '`.ternak`, `.kawin`, `.kebun`', inline: true }
            )
            .setThumbnail('https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
            .setFooter({ text: 'Zeta RPG System • NelBot Multi-Device' })
            .setTimestamp();

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('rpg_category_select')
            .setPlaceholder('🔽 Pilih Kategori RPG untuk Melihat Detail...')
            .addOptions([
                {
                    label: 'Status & Inventory',
                    description: 'Lihat status darah, exp, saldo, dan senjata',
                    value: 'rpg_status',
                    emoji: '🎒'
                },
                {
                    label: 'Dungeon & Berburu',
                    description: 'Tantang monster dungeon dan dapatkan reward',
                    value: 'rpg_dungeon',
                    emoji: '⚔️'
                },
                {
                    label: 'Relationship & Harem',
                    description: 'Kelola pasangan harem, date, dan duel',
                    value: 'rpg_rship',
                    emoji: '💖'
                },
                {
                    label: 'Pet Center',
                    description: 'Rawat pet, beri makan, dan latihan',
                    value: 'rpg_pet',
                    emoji: '🐾'
                },
                {
                    label: 'Toko & Ekonomi',
                    description: 'Beli senjata, material, dan jual hasil panen',
                    value: 'rpg_shop',
                    emoji: '🛒'
                },
                {
                    label: 'Tautkan Akun (Account Link)',
                    description: 'Panduan menautkan akun Discord & WhatsApp',
                    value: 'rpg_link',
                    emoji: '🔐'
                }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('rpg_quick_profile')
                .setLabel('Lihat Profil Saya')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👤'),
            new ButtonBuilder()
                .setCustomId('rpg_quick_link')
                .setLabel('Tautkan WhatsApp')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔗')
        );

        let msg;
        if (isSlash) {
            msg = await context.reply({ embeds: [embed], components: [row, btnRow], fetchReply: true });
        } else {
            msg = await context.reply({ embeds: [embed], components: [row, btnRow] });
        }

        // Collector untuk dropdown menu & button
        const collector = msg.createMessageComponentCollector({
            time: 90000 // 1.5 Menit aktif
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== user.id) {
                return i.reply({ content: '❌ Menu ini dibuka oleh orang lain. Ketik `.menurpg` untuk membuka menumu sendiri!', ephemeral: true });
            }

            if (i.isStringSelectMenu()) {
                const val = i.values[0];
                let detailEmbed = new EmbedBuilder().setColor('#00D4FF');

                if (val === 'rpg_status') {
                    detailEmbed
                        .setTitle('🎒 KATEGORI: STATUS & INVENTORY')
                        .setDescription(
                            `**Perintah Utama:**\n` +
                            `• \`.profile\` / \`.inv\` — Melihat status level, exp, HP, dan senjata yang sedang dipakai.\n` +
                            `• \`.tas\` — Melihat seluruh isi tas material & tambang.\n` +
                            `• \`.heal\` — Memulihkan darah (HP) menggunakan potion/uang.\n` +
                            `• \`.dompet\` / \`.bank\` — Cek saldo tunai dan tabungan bank.`
                        );
                } else if (val === 'rpg_dungeon') {
                    detailEmbed
                        .setTitle('⚔️ KATEGORI: DUNGEON & BERBURU')
                        .setDescription(
                            `**Perintah Utama:**\n` +
                            `• \`.dungeon <tingkat>\` — Masuk ke dungeon (contoh: \`.dungeon easy\`, \`.dungeon normal\`).\n` +
                            `• \`.hunt\` / \`.berburu\` — Berburu monster liar untuk mencari exp & gold.\n` +
                            `• \`.adventure\` — Bertualang mencari harta karun tersembunyi.\n` +
                            `• \`.boss\` — Serangan boss harian bersama anggota server/guild.`
                        );
                } else if (val === 'rpg_rship') {
                    detailEmbed
                        .setTitle('💖 KATEGORI: RELATIONSHIP & HAREM')
                        .setDescription(
                            `**Perintah Utama:**\n` +
                            `• \`.rship harem\` — Menampilkan daftar pasangan harem kamu.\n` +
                            `• \`.rship date <no>\` — Mengajak pasangan jalan-jalan (naikkan love & exp).\n` +
                            `• \`.rship duel <no>\` — Duel seru melawan pasangan (menang/kalah reaksi seimbang).\n` +
                            `• \`.rship gift <item/money> <no>\` — Memberikan hadiah spesial kepada pasangan.\n` +
                            `• \`.rship nikah <no>\` — Menikahi pasangan jika sudah memenuhi level & cincin.`
                        );
                } else if (val === 'rpg_pet') {
                    detailEmbed
                        .setTitle('🐾 KATEGORI: PET CENTER')
                        .setDescription(
                            `**Perintah Utama:**\n` +
                            `• \`.pet\` — Menampilkan daftar hewan peliharaan kamu.\n` +
                            `• \`.pet feed\` — Memberi makan pet organik (diskon 50% jika punya Remy Ratatouille).\n` +
                            `• \`.pet train\` — Melatih otot pet agar level & stat meningkat.\n` +
                            `• \`.pet adopt <tipe>\` — Mengadopsi pet baru dari Zeta Pet Center.`
                        );
                } else if (val === 'rpg_shop') {
                    detailEmbed
                        .setTitle('🛒 KATEGORI: TOKO & PASAR')
                        .setDescription(
                            `**Perintah Utama:**\n` +
                            `• \`.shop\` — Melihat daftar item yang tersedia di toko.\n` +
                            `• \`.beli <item> <jumlah>\` — Membeli material / ore / ramuan.\n` +
                            `• \`.jual all\` — Menjual seluruh hasil panen, ikan, dan batu tambang sekaligus.\n` +
                            `• \`.jual ya\` — Mengonfirmasi penjualan semua item.`
                        );
                } else if (val === 'rpg_link') {
                    detailEmbed
                        .setTitle('🔐 PANDUAN MENAUTKAN AKUN WHATSAPP')
                        .setDescription(
                            `Agar progres RPG, level, dan saldo kamu di WhatsApp sinkron dengan akun Discord:\n\n` +
                            `1. Buka bot WhatsApp kamu, lalu ketik **\`.linkdc\`**\n` +
                            `2. Kamu akan mendapatkan **6-Digit Kode OTP** (aktif 3 menit).\n` +
                            `3. Di Discord ini, ketik perintah:\n` +
                            `   👉 **\`/linkwa kode:KODE_KAMU\`** *(atau \`.linkwa KODE\`)*\n\n` +
                            `✅ Setelah sukses, semua saldo uang, bank, harem, dan inventory akan langsung terhubung!`
                        );
                }

                detailEmbed.setFooter({ text: 'Gunakan select menu untuk beralih kategori' });
                await i.update({ embeds: [detailEmbed], components: [row, btnRow] });
            } else if (i.isButton()) {
                if (i.customId === 'rpg_quick_profile') {
                    const profileCmd = client.commands.get('profile');
                    if (profileCmd) {
                        await i.deferReply({ ephemeral: true });
                        return profileCmd.sendProfile(i, user, client, true);
                    } else {
                        return i.reply({ content: 'Ketik `.profile` untuk melihat profil kamu!', ephemeral: true });
                    }
                } else if (i.customId === 'rpg_quick_link') {
                    return i.reply({
                        content: '🔐 **Cara Tautkan Akun:**\nKetik `.linkdc` di bot WhatsApp kamu untuk mendapatkan kode OTP, lalu ketik `/linkwa kode:<otp>` di sini.',
                        ephemeral: true
                    });
                }
            }
        });

        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true).setPlaceholder('⏰ Menu telah kedaluwarsa. Ketik .menurpg lagi.')
            );
            const disabledBtnRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('d1').setLabel('Lihat Profil').setStyle(ButtonStyle.Primary).setDisabled(true),
                new ButtonBuilder().setCustomId('d2').setLabel('Tautkan WhatsApp').setStyle(ButtonStyle.Success).setDisabled(true)
            );
            await msg.edit({ components: [disabledRow, disabledBtnRow] }).catch(() => null);
        });
    }
};
