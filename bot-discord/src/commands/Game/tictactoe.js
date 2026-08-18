const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    name: 'tictactoe',
    aliases: ['ttt', 'catur-jawa'],
    description: 'Bermain TicTacToe 3x3 interaktif bersama temanmu.',
    category: 'Game',
    slashOptions: [
        {
            name: 'lawan',
            description: 'Teman yang ingin diajak tanding TicTacToe',
            type: 6,
            required: true
        }
    ],
    args: true,
    usage: '<@lawan>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const opponent = interaction.options.getUser('lawan');
        return handleTTT(interaction, interaction.user, opponent, client, true);
    },

    async execute(message, args, client) {
        const opponent = message.mentions.users.first();
        if (!opponent) {
            return message.reply('❌ Tag lawan yang ingin diajak main!\nContoh: `.ttt @teman`');
        }
        return handleTTT(message, message.author, opponent, client, false);
    }
};

async function handleTTT(context, p1, p2, client, isSlash) {
    if (p2.id === p1.id) {
        const msg = '❌ Kamu tidak bisa bermain melawan dirimu sendiri!';
        return isSlash ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
    }
    if (p2.bot) {
        const msg = '❌ Kamu tidak bisa menantang bot!';
        return isSlash ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
    }

    let board = Array(9).fill(null);
    let turn = p1.id; // p1 = X (❌), p2 = O (⭕)

    const renderRows = (disabled = false) => {
        let rows = [];
        for (let i = 0; i < 3; i++) {
            let row = new ActionRowBuilder();
            for (let j = 0; j < 3; j++) {
                let idx = i * 3 + j;
                let val = board[idx];
                let label = val === 'X' ? '❌' : val === 'O' ? '⭕' : '➖';
                let style = val === 'X' ? ButtonStyle.Danger : val === 'O' ? ButtonStyle.Primary : ButtonStyle.Secondary;

                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ttt_${idx}`)
                        .setLabel(label)
                        .setStyle(style)
                        .setDisabled(disabled || val !== null)
                );
            }
            rows.push(row);
        }
        return rows;
    };

    const checkWinner = () => {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Baris
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Kolom
            [0, 4, 8], [2, 4, 6]             // Diagonal
        ];
        for (let [a, b, c] of lines) {
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        if (board.every(cell => cell !== null)) return 'TIE';
        return null;
    };

    const embed = new EmbedBuilder()
        .setColor('#00D4FF')
        .setTitle('🎮 TICTACTOE 3x3 ARENA')
        .setDescription(
            `❌ **${p1.username}** vs ⭕ **${p2.username}**\n\n` +
            `👉 Giliran: <@${turn}> (${turn === p1.id ? '❌' : '⭕'})`
        )
        .setFooter({ text: 'Klik kotak untuk menempatkan bidak' });

    let msg = isSlash ? await context.reply({ embeds: [embed], components: renderRows(), fetchReply: true }) : await context.reply({ embeds: [embed], components: renderRows() });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (i) => {
        if (i.user.id !== turn) {
            return i.reply({ content: `❌ Bukan giliranmu! Menunggu <@${turn}> bergerak.`, ephemeral: true });
        }

        const idx = parseInt(i.customId.replace('ttt_', ''));
        if (board[idx] !== null) {
            return i.reply({ content: '❌ Kotak ini sudah terisi!', ephemeral: true });
        }

        board[idx] = turn === p1.id ? 'X' : 'O';
        const winner = checkWinner();

        if (winner) {
            let resEmbed = new EmbedBuilder();
            if (winner === 'TIE') {
                resEmbed.setColor('#FFA500').setTitle('🤝 PERMAINAN SERI!').setDescription('Semua kotak telah terisi tanpa pemenang.');
            } else {
                let winUser = winner === 'X' ? p1 : p2;
                resEmbed.setColor('#00FF88').setTitle('🎉 SELAMAT!').setDescription(`🏆 Pemenang: <@${winUser.id}> (${winner === 'X' ? '❌' : '⭕'})!`);
            }
            await i.update({ embeds: [resEmbed], components: renderRows(true) });
            return collector.stop();
        }

        turn = turn === p1.id ? p2.id : p1.id;
        embed.setDescription(
            `❌ **${p1.username}** vs ⭕ **${p2.username}**\n\n` +
            `👉 Giliran: <@${turn}> (${turn === p1.id ? '❌' : '⭕'})`
        );
        await i.update({ embeds: [embed], components: renderRows() });
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            const timeoutEmbed = new EmbedBuilder().setColor('#808080').setDescription('⏰ Waktu habis! Permainan TicTacToe berakhir.');
            await msg.edit({ embeds: [timeoutEmbed], components: renderRows(true) }).catch(() => {});
        }
    });
}
