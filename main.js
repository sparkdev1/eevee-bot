// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment, ReactionCollector } = require('discord.js');
const { token, prefix, mongoConst } = require('./config.json');
const mongoose = require('mongoose');
const cardSchema = require('./models/card')
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

const talkedRecently = new Set();

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
        if (typeof activeDrop !== 'undefined') {
            message.reply('Aguarde um momento, tem outro drop ativo.')
            return
        }
        delete(activeDrop)
        var activeDrop = true
        const drop = []
        drop.push(await mal.setDrop())
        // sleep
        message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
        message.channel.send(await card.createDropTemplate(drop)).then(sendMessage => {
            sendMessage.react("1️⃣")
            sendMessage.react("2️⃣")
            sendMessage.react("3️⃣")       
            const filter = (reaction, user) => ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && user.id != '889885729273020516';
            const collector = sendMessage.createReactionCollector({ filter, max: 4, time: 20000 });
            var today = new Date();

            var date = today.getDate()+'-'+(today.getMonth()+1)+'-'+today.getFullYear();
            collector.on('collect', async (reaction, user) => {
                if (reaction.emoji.name === "1️⃣") {
                    if (drop[0][0]['picked']) {
                        return message.channel.send(`<@${user.id}> ${drop[0][0]['picked'].message}`)
                    }
                    var values = await card.generateCardValues();
                    var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                    cardSchema.incrementID(cardID)
                    var firstName = drop[0][0].char.first ?? ' ';
                    var lastName = drop[0][0].char.last ?? ' ';
                    var fullName = firstName + ' ' + lastName;
                    const newCard = new cardSchema({
                        userID: user.id,
                        cardID: cardID,
                        cardName: fullName,
                        cardFrom: drop[0][0].title,
                        cardStars: values[0].s,
                        cardAttack: values[0].a,
                        cardDefense: values[0].d,
                        cardIntelligence: values[0].i,
                        cardDateGet: date,
                        cardPhoto: drop[0][0].img
                    })
                    newCard.save().catch(err => console.log(err));
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    let aspas = "`"
                    await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${drop[0][0].char.first}*** com  ${cardStarsE} estrelas`)
                    drop[0][0]['picked'] = {message: 'Essa carta já foi pega'}
                    return;
                }
                if (reaction.emoji.name === "2️⃣") {
                    if (drop[0][1]['picked']) {
                        return message.channel.send(`<@${user.id}> ${drop[0][1]['picked'].message}`)
                    }
                    var values = await card.generateCardValues();
                    var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                    cardSchema.incrementID(cardID)
                    var firstName = drop[0][1].char.first ?? ' ';
                    var lastName = drop[0][1].char.last ?? ' ';
                    var fullName = firstName +  ' ' + lastName;
                    const newCard = new cardSchema({
                        userID: user.id,
                        cardID: cardID,
                        cardName: fullName,
                        cardFrom: drop[0][1].title,
                        cardStars: values[0].s,
                        cardAttack: values[0].a,
                        cardDefense: values[0].d,
                        cardIntelligence: values[0].i,
                        cardDateGet: date,
                        cardPhoto: drop[0][1].img
                    })
                    newCard.save().catch(err => console.log(err));
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    let aspas = "`"
                    await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${drop[0][1].char.first}*** com  ${cardStarsE} estrelas`)
                    drop[0][1]['picked'] = {message: 'Essa carta já foi pega'}
                    return;
                }
                if (reaction.emoji.name === "3️⃣") {
                    if (drop[0][2]['picked']) {
                        return message.channel.send(`<@${user.id}> ${drop[0][2]['picked'].message}`)
                    }
                    var values = await card.generateCardValues();
                    var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                    cardSchema.incrementID(cardID)
                    var firstName = drop[0][2].char.first ?? ' ';
                    var lastName = drop[0][2].char.last ?? ' ';
                    var fullName = firstName +  ' ' + lastName;
                    const newCard = new cardSchema({
                        userID: user.id,
                        cardID: cardID,
                        cardName: fullName,
                        cardFrom: drop[0][2].title,
                        cardStars: values[0].s,
                        cardAttack: values[0].a,
                        cardDefense: values[0].d,
                        cardIntelligence: values[0].i,
                        cardDateGet: date,
                        cardPhoto: drop[0][2].img
                    })
                    newCard.save().catch(err => console.log(err));
                    let cardStarsE = ''
                    for (let i = 1; i <= values[0].s; i++) {
                        cardStarsE += ":star: "
                    }
                    let aspas = "`"
                    await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${drop[0][2].char.first}*** com  ${cardStarsE} estrelas`)
                    drop[0][2]['picked'] = {message: 'Essa carta já foi pega'}
                    return;
                }
            });

            return setTimeout(function() {
                sendMessage.edit('_Esse drop expirou e não pode mais ser resgatado_')
                return;
            }, 20000)
        })
    }

    if (command === 'collection' || command === 'c') {
        if (talkedRecently.has(message.author.id)) {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}2${aspas} segundos antes de usar o comando denovo - <@${message.author.id}>`)
    } else {

        await card.searchCardCollection(args[0] ?? message.author.id, client, message)

        // Adds the user to the set so that they can't talk for a minute
        talkedRecently.add(message.author.id);
        setTimeout(() => {
          // Removes the user from the set after a minute
          talkedRecently.delete(message.author.id);
        }, 2000);
    }
        
    }

    if (command === 'bag') {
        return await player.playerBalance(args[0], message, client)
    }
});

client.login(token);