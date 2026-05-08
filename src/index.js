require('dotenv').config();
const { Client, IntentsBitField, EmbedBuilder } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const User = require('./models/User');

// --- Cấu hình Web Server để chạy trên Render ---
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
    res.send('Bot is running!');
});

app.listen(PORT, () => {
    console.log(`🌍 Web server đang chạy trên port ${PORT}`);
});

// --- Cấu hình Discord Bot ---
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// --- Kết nối MongoDB ---
(async () => {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🍃 Đã kết nối với MongoDB Atlas!');
    } catch (error) {
        console.log(`❌ Lỗi kết nối MongoDB: ${error}`);
    }
})();

client.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} đã sẵn sàng!`);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, user } = interaction;
    
    // Tìm hoặc tạo tài khoản người dùng trong DB
    let account = await User.findOne({ userId: user.id });
    if (!account) {
        account = new User({ userId: user.id });
        await account.save();
    }

    if (commandName === 'balance') {
        const embed = new EmbedBuilder()
            .setTitle('🏦 Ngân Hàng Discord')
            .setColor('#f1c40f')
            .setThumbnail(user.displayAvatarURL())
            .addFields({ name: 'Chủ tài khoản', value: `${user.username}`, inline: true })
            .addFields({ name: 'Số dư', value: `💰 ${account.balance.toLocaleString()} xu`, inline: true })
            .setFooter({ text: 'Hãy chăm chỉ làm việc để làm giàu!' });

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'daily') {
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;

        if (account.lastDaily && now - account.lastDaily < oneDay) {
            const remaining = oneDay - (now - account.lastDaily);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

            return interaction.reply({
                content: `⏳ Bạn đã nhận quà hôm nay rồi! Hãy quay lại sau **${hours} giờ ${minutes} phút**.`,
                ephemeral: true,
            });
        }

        const reward = 1000;
        account.balance += reward;
        account.lastDaily = now;
        await account.save();

        const embed = new EmbedBuilder()
            .setTitle('🎁 Quà Tặng Hàng Ngày')
            .setColor('#2ecc71')
            .setDescription(`Chúc mừng! Bạn đã nhận được **💰 ${reward.toLocaleString()} xu** vào tài khoản.`)
            .addFields({ name: 'Số dư mới', value: `💰 ${account.balance.toLocaleString()} xu` });

        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'gamble') {
        const amount = interaction.options.getInteger('amount');

        if (amount <= 0) {
            return interaction.reply({ content: '❌ Số tiền cược phải lớn hơn 0!', ephemeral: true });
        }

        if (account.balance < amount) {
            return interaction.reply({ content: '❌ Bạn không có đủ tiền để cược!', ephemeral: true });
        }

        const win = Math.random() > 0.5;
        const roll = Math.floor(Math.random() * 100) + 1;

        const embed = new EmbedBuilder().setTitle('🎲 Trò Chơi Tài Xỉu');

        if (win) {
            account.balance += amount;
            embed.setColor('#2ecc71')
                .setDescription(`Bạn đã thắng! Con số may mắn là **${roll}**.`)
                .addFields(
                    { name: 'Kết quả', value: `Thắng +${amount.toLocaleString()} xu` },
                    { name: 'Số dư hiện tại', value: `💰 ${account.balance.toLocaleString()} xu` }
                );
        } else {
            account.balance -= amount;
            embed.setColor('#e74c3c')
                .setDescription(`Rất tiếc, bạn đã thua! Con số may mắn là **${roll}**.`)
                .addFields(
                    { name: 'Kết quả', value: `Thua -${amount.toLocaleString()} xu` },
                    { name: 'Số dư hiện tại', value: `💰 ${account.balance.toLocaleString()} xu` }
                );
        }

        await account.save();
        await interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'leaderboard') {
        const topUsers = await User.find().sort({ balance: -1 }).limit(10);

        if (topUsers.length === 0) {
            return interaction.reply('Chưa có ai trên bảng xếp hạng!');
        }

        let description = '';
        for (let i = 0; i < topUsers.length; i++) {
            const userData = topUsers[i];
            const member = await interaction.guild.members.fetch(userData.userId).catch(() => null);
            const name = member ? member.user.username : 'Người dùng ẩn danh';
            description += `**#${i + 1}** ${name}: \`${userData.balance.toLocaleString()}\` xu\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Bảng Xếp Hạng Đại Gia')
            .setColor('#f39c12')
            .setDescription(description);

        await interaction.reply({ embeds: [embed] });
    }
});

client.on('messageCreate', (msg) => {
    if (msg.author.bot) return;
    if (msg.content === "hello") {
        msg.reply("hello" + ` ${msg.author}`);
    }
});

client.login(process.env.TOKEN);