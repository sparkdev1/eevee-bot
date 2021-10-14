// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment, ReactionCollector } = require('discord.js');
const { token, prefix, mongoConst } = require('./config.json');
const mongoose = require('mongoose');
const card = require('./scripts/cards.js');
const char = require('./scripts/characters.js');
const mal = require('./scripts/mal.js')
const player = require("./scripts/player.js")


mongoose.connect(mongoConst, { useNewUrlParser: true, useUnifiedTopology: true })
console.log('Successfully connected to MongoDB')
    // Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
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
        await mal.zeraDrop()
        const drop = []
        drop.push(await mal.setDrop())
        // sleep
        message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
        message.channel.send(await card.createDropTemplate(drop)).then(sendMessage => {
            sendMessage.react("1️⃣")
            sendMessage.react("2️⃣")
            sendMessage.react("3️⃣")       
            const filter = (reaction, user) => ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && user.id != '889885729273020516';
            const collector = sendMessage.createReactionCollector({ filter, max: 3, time: 30000 });

            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === "1️⃣") {
                    var values = await card.generateCardValues();
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    message.channel.send(`<@${user.id}> pegou ***${drop[0][0].char.first}*** com ${cardStarsE} estrelas`)
                    return;
                }
                if (reaction.emoji.name === "2️⃣") {
                    var values = await card.generateCardValues();
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    message.channel.send(`<@${user.id}> pegou ***${drop[0][1].char.first}*** com ${cardStarsE} estrelas`)
                    return;
                }
                if (reaction.emoji.name === "3️⃣") {
                    var values = await card.generateCardValues();
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    message.channel.send(`<@${user.id}> pegou ***${drop[0][2].char.first}*** com ${cardStarsE} estrelas`)
                    return;
                }
            });

            return setTimeout(function() {
                sendMessage.edit('_Esse drop expirou e não pode mais ser resgatado_')
                return;
            }, 30000)
        })
    }

    if (command === 'bag') {
        return await player.playerBalance(args[0], message, client)
    }
});

client.login(token);