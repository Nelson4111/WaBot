const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'jodoh',
    aliases: ['ship', 'match', 'cekkodam', 'kecocokan'],
    description: 'Cek persentase kecocokan jodoh antara dua orang.',
    category: 'Pasangan',
    slashOptions: [
        {
            name: 'target1',
            description: 'Nama / user pertama',
            type: 3, // STRING
            required: true
        },
        {
            name: 'target2',
            description: 'Nama / user kedua (kosongkan jika dirimu)',
            type: 3,
            required: false
        }
    ],
    args: true,
    usage: '<nama1> [nama2]',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const t1 = interaction.options.getString('target1');
        const t2 = interaction.options.getString('target2') || interaction.user.username;
        return handleJodoh(interaction, t1, t2, client, true);
    },

    async execute(message, args, client) {
        let t1 = args[0];
        let t2 = args[1] || message.author.username;
        if (!t1) {
            return message.reply('❌ Masukkan nama yang ingin dicek!\nContoh: `.jodoh Sasuke Sakura`');
        }
        return handleJodoh(message, t1, t2, client, false);
    }
};

function handleJodoh(context, name1, name2, client, isSlash) {
    let combined = (name1.toLowerCase() + name2.toLowerCase()).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    let percent = (combined % 101);

    let barFilled = Math.floor(percent / 10);
    let bar = '💖'.repeat(barFilled) + '🖤'.repeat(10 - barFilled);

    let status = '';
    if (percent >= 90) status = '💍 **Pasangan Sejati!** Cocok banget sampai ke pelaminan!';
    else if (percent >= 75) status = '💘 **Sangat Cocok!** Tinggal nunggu restu mertua nih.';
    else if (percent >= 50) status = '💞 **Lumayan Cocok!** Asal sering ngobrol dan saling pengertian.';
    else if (percent >= 25) status = '💔 **Kurang Cocok!** Banyak drama dan salah paham.';
    else status = '💀 **Zona Bahaya!** Lebih baik jadi teman aja daripada hancur hatinya.';

    const embed = new EmbedBuilder()
        .setColor(percent >= 50 ? '#FF69B4' : '#708090')
        .setTitle('💘 RAMALAN KECOCOKAN JODOH')
        .setDescription(
            `👤 **${name1}** 💕 **${name2}**\n\n` +
            `📊 **Persentase Kecocokan:** \`${percent}%\`\n` +
            `[${bar}]\n\n` +
            `${status}`
        )
        .setFooter({ text: 'Zeta Relationship & Matchmaker Engine' })
        .setTimestamp();

    if (isSlash) return context.reply({ embeds: [embed] });
    return context.reply({ embeds: [embed] });
}
