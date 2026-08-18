const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require('discord.js');

module.exports = {
    name: 'pacaran',
    aliases: ['tembak', 'propose', 'jadian'],
    description: 'Menembak gebetan kamu untuk jadian berpacaran.',
    category: 'Pasangan',
    slashOptions: [
        {
            name: 'target',
            description: 'User yang ingin kamu tembak / ajak jadian',
            type: 6,
            required: true
        }
    ],
    args: true,
    usage: '<@user>',
    userPerms: [],
    owner: false,

    async slashExecute(interaction, client) {
        const target = interaction.options.getUser('target');
        return handlePropose(interaction, interaction.user, target, client, true);
    },

    async execute(message, args, client) {
        const target = message.mentions.users.first();
        if (!target) {
            return message.reply('❌ Tag orang yang ingin kamu tembak!\nContoh: `.tembak @gebetan`');
        }
        return handlePropose(message, message.author, target, client, false);
    }
};

async function handlePropose(context, sender, target, client, isSlash) {
    if (target.id === sender.id) {
        const msg = '❌ Kamu tidak bisa pacaran dengan dirimu sendiri!';
        return isSlash ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
    }
    if (target.bot) {
        const msg = '❌ Kamu tidak bisa pacaran dengan bot!';
        return isSlash ? context.reply({ content: msg, ephemeral: true }) : context.reply(msg);
    }

    const embed = new EmbedBuilder()
        .setColor('#FF1493')
        .setTitle('💌 SURAT CINTA / AJAKAN PACARAN')
        .setDescription(
            `Hai <@${target.id}>! 💕\n\n` +
            `**${sender.username}** menyatakan perasaannya kepadamu dan mengajakmu berpacaran!\n\n` +
            `_Apakah kamu menerima perasaannya?_`
        )
        .setThumbnail('https://files.cloudkuimages.guru/images/604a2923cef9.jpeg')
        .setFooter({ text: 'Batas waktu respon: 60 detik' });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('propose_accept').setLabel('Terima (Jadian) ❤️').setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId('propose_reject').setLabel('Tolak (Friendzone) 💔').setStyle(ButtonStyle.Danger)
    );

    let msg = isSlash ? await context.reply({ embeds: [embed], components: [row], fetchReply: true }) : await context.reply({ embeds: [embed], components: [row] });

    const collector = msg.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async (i) => {
        if (i.user.id !== target.id) {
            return i.reply({ content: '❌ Hanya orang yang ditembak yang boleh menjawab!', ephemeral: true });
        }

        if (i.customId === 'propose_accept') {
            const acceptEmbed = new EmbedBuilder()
                .setColor('#00FF88')
                .setTitle('🎉 SELAMAT! RESMI JADIAN!')
                .setDescription(
                    `💖 <@${sender.id}> dan <@${target.id}> sekarang resmi berpacaran!\n\n` +
                    `Semoga langgeng dan bahagia selalu ya! 💐💍`
                )
                .setTimestamp();

            await i.update({ embeds: [acceptEmbed], components: [] });
            return collector.stop();
        } else {
            const rejectEmbed = new EmbedBuilder()
                .setColor('#708090')
                .setTitle('💔 PENOLAKAN')
                .setDescription(
                    `😢 Maaf ya <@${sender.id}>, <@${target.id}> menolak ajakanmu.\n\n` +
                    `_"Kamu orangnya terlalu baik buat aku..."_ 🥺`
                )
                .setTimestamp();

            await i.update({ embeds: [rejectEmbed], components: [] });
            return collector.stop();
        }
    });

    collector.on('end', async (_, reason) => {
        if (reason === 'time') {
            const timeoutEmbed = new EmbedBuilder().setColor('#808080').setDescription('⏰ Waktu habis! Ajakan pacaran tidak dijawab.');
            await msg.edit({ embeds: [timeoutEmbed], components: [] }).catch(() => {});
        }
    });
}
