const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    name: 'suit',
    aliases: ['rps', 'suitpvp', 'batu-gunting-kertas'],
    description: 'Bermain suit (Batu, Gunting, Kertas) melawan bot atau tantang temanmu.',
    category: 'Game',
    slashOptions: [
        {
            name: 'lawan',
            description: 'Tantang user lain (kosongkan jika ingin lawan bot)',
            type: 6,
            required: false
        }
    ],
    args: false,
    usage: '[@lawan]',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const opponent = interaction.options.getUser('lawan');
        return handleSuit(interaction, interaction.user, opponent, client, true);
    },

    async execute(message, args, client) {
        const opponent = message.mentions.users.first();
        return handleSuit(message, message.author, opponent, client, false);
    }
};

async function handleSuit(context, player1, player2, client, isSlash) {
    // Mode Lawan Bot
    if (!player2 || player2.id === player1.id || player2.bot) {
        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('✊✌️🖐️ ARENA SUIT (VS BOT)')
            .setDescription(`Halo **${player1.username}**! Silakan pilih tanganmu dalam 30 detik:`)
            .setFooter({ text: 'Klik salah satu tombol di bawah' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('suit_batu').setLabel('Batu').setStyle(ButtonStyle.Primary).setEmoji('✊'),
            new ButtonBuilder().setCustomId('suit_gunting').setLabel('Gunting').setStyle(ButtonStyle.Success).setEmoji('✌️'),
            new ButtonBuilder().setCustomId('suit_kertas').setLabel('Kertas').setStyle(ButtonStyle.Danger).setEmoji('🖐️')
        );

        let msg = isSlash ? await context.reply({ embeds: [embed], components: [row], fetchReply: true }) : await context.reply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({ time: 30000 });
        collector.on('collect', async (i) => {
            if (i.user.id !== player1.id) {
                return i.reply({ content: '❌ Ini bukan giliranmu!', ephemeral: true });
            }

            const choices = ['batu', 'gunting', 'kertas'];
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            const userChoice = i.customId.replace('suit_', '');

            let result = '';
            let emojiUser = userChoice === 'batu' ? '✊' : userChoice === 'gunting' ? '✌️' : '🖐️';
            let emojiBot = botChoice === 'batu' ? '✊' : botChoice === 'gunting' ? '✌️' : '🖐️';

            if (userChoice === botChoice) {
                result = '🤝 **SERI!** Pilihan kalian sama.';
            } else if (
                (userChoice === 'batu' && botChoice === 'gunting') ||
                (userChoice === 'gunting' && botChoice === 'kertas') ||
                (userChoice === 'kertas' && botChoice === 'batu')
            ) {
                result = '🎉 **KAMU MENANG!** Hebat sekali!';
            } else {
                result = '💀 **KAMU KALAH!** Jangan menyerah, coba lagi!';
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(result.includes('MENANG') ? '#00FF88' : result.includes('SERI') ? '#FFA500' : '#FF0055')
                .setTitle('⚔️ HASIL PERTANDINGAN SUIT')
                .setDescription(
                    `👤 **${player1.username}:** ${emojiUser} (${userChoice.toUpperCase()})\n` +
                    `🤖 **Bot:** ${emojiBot} (${botChoice.toUpperCase()})\n\n` +
                    `${result}`
                )
                .setTimestamp();

            await i.update({ embeds: [resultEmbed], components: [] });
            collector.stop();
        });

        collector.on('end', async (_, reason) => {
            if (reason === 'time') {
                const timeoutEmbed = new EmbedBuilder().setColor('#808080').setDescription('⏰ Waktu habis! Permainan suit dibatalkan.');
                await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
            }
        });
        return;
    }

    // Mode PvP Lawan Teman
    const embedPvp = new EmbedBuilder()
        .setColor('#9B59B6')
        .setTitle('⚔️ TANTANGAN SUIT PVP')
        .setDescription(`**${player1.username}** menantang **${player2.username}** bermain suit!\n\nPilihlah tangan kalian masing-masing secara rahasia.`);

    const rowPvp = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('pvp_batu').setLabel('Batu').setStyle(ButtonStyle.Primary).setEmoji('✊'),
        new ButtonBuilder().setCustomId('pvp_gunting').setLabel('Gunting').setStyle(ButtonStyle.Success).setEmoji('✌️'),
        new ButtonBuilder().setCustomId('pvp_kertas').setLabel('Kertas').setStyle(ButtonStyle.Danger).setEmoji('🖐️')
    );

    let msgPvp = isSlash ? await context.reply({ embeds: [embedPvp], components: [rowPvp], fetchReply: true }) : await context.reply({ embeds: [embedPvp], components: [rowPvp] });

    let choicesPvp = {};
    const collectorPvp = msgPvp.createMessageComponentCollector({ time: 45000 });

    collectorPvp.on('collect', async (i) => {
        if (i.user.id !== player1.id && i.user.id !== player2.id) {
            return i.reply({ content: '❌ Kamu bukan peserta pertandingan ini!', ephemeral: true });
        }

        const pick = i.customId.replace('pvp_', '');
        choicesPvp[i.user.id] = pick;
        await i.reply({ content: `✅ Kamu memilih **${pick.toUpperCase()}**! Menunggu lawan...`, ephemeral: true });

        if (choicesPvp[player1.id] && choicesPvp[player2.id]) {
            const p1 = choicesPvp[player1.id];
            const p2 = choicesPvp[player2.id];
            let res = '';

            if (p1 === p2) res = '🤝 **HASIL SERI!**';
            else if ((p1 === 'batu' && p2 === 'gunting') || (p1 === 'gunting' && p2 === 'kertas') || (p1 === 'kertas' && p2 === 'batu')) {
                res = `🏆 **PEMENANG:** <@${player1.id}>!`;
            } else {
                res = `🏆 **PEMENANG:** <@${player2.id}>!`;
            }

            const pvpResult = new EmbedBuilder()
                .setColor('#00D4FF')
                .setTitle('🎉 PERTANDINGAN SELESAI!')
                .setDescription(
                    `👤 <@${player1.id}>: **${p1.toUpperCase()}**\n` +
                    `👤 <@${player2.id}>: **${p2.toUpperCase()}**\n\n` +
                    `${res}`
                )
                .setTimestamp();

            await msgPvp.edit({ embeds: [pvpResult], components: [] });
            collectorPvp.stop();
        }
    });
}
