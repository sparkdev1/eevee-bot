// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const { token, prefix, mongoConst } = require('./config.json');
const mongoose = require('mongoose');
const card = require('./scripts/cards.js');
const char = require('./scripts/characters.js');
const player = require("./scripts/player.js")


mongoose.connect(mongoConst, { useNewUrlParser: true, useUnifiedTopology: true })
console.log('Successfully connected to MongoDB')
    // Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES
    ]
});


const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.on('messageCreate', async(message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'view' || command === 'v') {
        if (args[0]) {
            return (card.searchSpecificCard(args[0], client, message))
        }
        return message.reply('Insira o __código__ do card que gostaria de ver')
    }

    if (command === 'drop' || command === 'd') {
        const drop = []
        drop.push(await char.getCharFromMAL())

        // sleep
        message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
        message.channel.send(await card.createDropTemplate(drop)).then(sendMessage => {
            sendMessage.react("1️⃣")
            sendMessage.react("2️⃣")
            sendMessage.react("3️⃣")
            setTimeout(function() {
                sendMessage.edit('_Esse drop expirou e não pode mais ser resgatado_')
            }, 30000)
        })
    }

    if (command === 'bag') {
        return await player.playerBalance(args[0], message, client)
    }
});

client.login(token);