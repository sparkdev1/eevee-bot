// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const { token } = require('./config.json');
const { prefix } = require('./config.json');
const card = require('./scripts/cards.js');
const char = require('./scripts/characters.js');
const player = require("./scripts/player.js")

const client = new Client({intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'view') {
        if (args[0]) 
            return message.reply(card.createDropTemplate(args[0], client))
        
        return message.reply('Insira o __código__ do card que gostaria de ver')
    }

    if (command === 'drop' || command === 'd') {
        const drop = []
        drop.push(await char.getCharFromMAL())                  

        // sleep
        return message.reply(await card.createDropTemplate(drop))
    }

    if (command === 'bag') {
        return message.reply(player.playerBalance(args[0], message))
    }
});

client.login(token);