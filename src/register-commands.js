require('dotenv').config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'balance',
        description: 'Xem số dư tài khoản của bạn',
    },
    {
        name: 'daily',
        description: 'Nhận quà tặng hàng ngày (1000 xu)',
    },
    {
        name: 'gamble',
        description: 'Thử vận may với trò chơi tài xỉu',
        options: [
            {
                name: 'amount',
                description: 'Số tiền muốn đặt cược',
                type: ApplicationCommandOptionType.Integer,
                required: true,
            },
        ],
    },
    {
        name: 'leaderboard',
        description: 'Xem bảng xếp hạng đại gia',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('Đang đăng ký Slash Commands...');

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );

        console.log('Đăng ký thành công!');
    } catch (error) {
        console.log(`Có lỗi xảy ra: ${error}`);
    }
})();
