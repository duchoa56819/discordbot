require('dotenv').config();
const {Client,IntentsBitField}= require('discord.js')

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent
    ]  
})

client.on('ready', (c) =>{
    console.log(`${c.user.tag}`)
})

client.on('messageCreate',(msg)=>{
    if(msg.author.bot) return;
    if(msg.content === "hello"){
        msg.reply("hello" + ` ${msg.author}`)
    }
    if(msg.content.includes('bgd') || msg.content.includes('everyone')){
        msg.reply("goi j day doi ti")
    }
})

client.login(process.env.TOKEN)