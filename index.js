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
cardSchema.findOne({},{},{ sort: { cardID: -1 }},(err, data) => fs.writeFile('./models/id.txt', (data.cardID + 1).toString(), (error) => {
    if (error) throw err;
    console.log(`Current ID is: ${data.cardID}`)
}))
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
const talkedRecentlyBurn = new Set();

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(prefix.toLowerCase()) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    if (command === 'help') {
        let aspas = "```"
        message.reply(`${aspas}eview ou ev - visualiza a última carta ou uma específica (ex: ev 23)${'\n'}${'\n'}
ebag - visualiza inventário${'\n'}${'\n'}
eburn ou eb - exibe um menu mostrando o valor da carta e depois a queima (ex: eb 23)${'\n'}${'\n'}
emultiburn ou emb - exibe um menu mostrando o valor das cartas e depois as queima (ex: eb 23 435 5123 42)${'\n'}${'\n'}
ecollection ou ec - exibe as 10 últimas cartas da sua coleção ou de alguém, para ver mais, usar o seguinte parâmetro (ec @spark p= *, sendo * o número da página)${'\n'}${'\n'}
edrop ou ed - dropa 3 cartas de personagens de animes e jogos${'\n'}${'\n'}
egive ou eg - permite dar uma carta a algum usuário (eg @spark 234)${'\n'}${'\n'}
eshop - visualiza a loja${'\n'}${'\n'}
eshopinfo ou esi - exibe as informações de um item e permite compra-lo (esi 1)${'\n'}${'\n'}
einventory ou ei - exibe seu inventário ou de alguém${'\n'}${'\n'}
euse - usa algum item em alguma carta (euse 435 2)${'\n'}${'\n'}
${aspas}`)
    }

    if (command === 'view' || command === 'v') {
        if (args[0]) {
            return (card.searchSpecificCard(args[0], client, message))
        }
        return (card.searchLastCard(client, message))
    }

    if (command === 'drop' || command === 'd' && !talkedRecently.has(message.author.id)) {
        if (talkedRecently.has(message.author.id) && message.author.id != '212640369261674496') {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}3${aspas} minutos antes de usar o comando denovo - <@${message.author.id}>`)
            return
        } else {
            if (message.author.id != '212640369261674496') {
            talkedRecently.add(message.author.id);
            }
                    setTimeout(() => {
                        // Removes the user from the set after a minute
                        talkedRecently.delete(message.author.id);
                    }, 180000);
            try {
                console.log(`${message.author.tag} is dropping.`)
                await mal.zeraDrop()
                if (typeof activeDrop !== 'undefined') {
                    message.reply('Aguarde um momento, tem outro drop ativo.')
                    return
                }
                delete (activeDrop)
                var activeDrop = true
                const drop = []
                drop.push(await mal.setDrop())
                // sleep
                message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
                message.channel.send(await card.createDropTemplate(drop)).then(sendMessage => {
                    sendMessage.react("1️⃣")
                    sendMessage.react("2️⃣")
                    sendMessage.react("3️⃣")
                    const filter = (reaction, user) => ["1️⃣", "2️⃣", "3️⃣"].includes(reaction.emoji.name) && user.id == message.author.id && user.id != '889885729273020516';
                    const collector = sendMessage.createReactionCollector({ filter, max: 4, time: 20000 });
                    var today = new Date();

                    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
                    collector.on('collect', async (reaction, user) => {
                        if (reaction.emoji.name === "1️⃣") {
                            if (drop[0][0]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][0]['picked'].message}`)
                            }
                            drop[0][0]['picked'] = { message: 'Essa carta já foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][0].char
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
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][0]['picked'] = { message: 'Essa carta já foi pega' }
                            return;
                        }
                        if (reaction.emoji.name === "2️⃣") {
                            if (drop[0][1]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][1]['picked'].message}`)
                            }
                            drop[0][1]['picked'] = { message: 'Essa carta já foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][1].char
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
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][1]['picked'] = { message: 'Essa carta já foi pega' }
                            return;
                        }
                        if (reaction.emoji.name === "3️⃣") {
                            if (drop[0][2]['picked']) {
                                return message.channel.send(`<@${user.id}> ${drop[0][2]['picked'].message}`)
                            }
                            drop[0][2]['picked'] = { message: 'Essa carta já foi pega' }
                            var values = await card.generateCardValues();
                            var cardID = fs.readFileSync('./models/id.txt', 'utf-8')
                            cardSchema.incrementID(cardID)
                            var fullName = drop[0][2].char
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
                            await message.channel.send(`<@${user.id}> pegou ${aspas}${cardID}${aspas} ***${fullName}*** com  ${cardStarsE} estrelas`)
                            drop[0][2]['picked'] = { message: 'Essa carta já foi pega' }
                            return;
                        }
                    });

                    setTimeout(function () {
                        sendMessage.edit('_Esse drop expirou e não pode mais ser resgatado_')
                        return;
                    }, 20000)
                    if (message.author.id != '212640369261674496') {
                    talkedRecently.add(message.author.id);
                    }
                    setTimeout(() => {
                        // Removes the user from the set after a minute
                        talkedRecently.delete(message.author.id);
                    }, 180000);
                })
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve umm erro, perdão.')
            }
        }
    } 
    if (command === 'drop' || command === 'd' && talkedRecently.has(message.author.id)) {
        let aspas = "`"
        return message.channel.send(`Espere ${aspas}3${aspas} minutos antes de usar o comando denovo - <@${message.author.id}>`)
    }

    if (command === 'collection' || command === 'c') {


        await card.searchCardCollection(args[0] ?? message.author.id, args[1], message, client)

        // Adds the user to the set so that they can't talk for a minute
    }


    if (command === 'bag') {
        return await player.playerBalance(args[0], message, client)
    }

    if (command === 'burn' || command === 'b') {


        if (talkedRecentlyBurn.has(message.author.id)) {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}5${aspas} segundos antes de usar o comando denovo - <@${message.author.id}>`)
        } else {
            try {
                if (!args[0]) {
                    player.burnLastCard(message, client)
                } else {
                    player.burnCards(args[0], message, client)
                }
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a ação.')
            }
        }
        talkedRecentlyBurn.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            talkedRecentlyBurn.delete(message.author.id);
        }, 5000);
    }
    if (command === 'multiburn' || command === 'mb') {


        if (talkedRecentlyBurn.has(message.author.id)) {
            let aspas = "`"
            message.channel.send(`Espere ${aspas}5${aspas} segundos antes de usar o comando denovo - <@${message.author.id}>`)
        } else {
            try {
                if (args) {
                    player.multiBurnCards(args, message, client)
                } else {
                    message.channel.send('Insira as cartas que deseja queimar')
                    return
                }
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a ação.')
            }
        }
        talkedRecentlyBurn.add(message.author.id);
        setTimeout(() => {
            // Removes the user from the set after a minute
            talkedRecentlyBurn.delete(message.author.id);
        }, 10000);
    }
    if (command === 'give' || command === 'g') {
        try {
            card.giveCard(args[0], args[1], message, client)
        } catch (e) {
            console.log(e)
            return message.channel.send('Houve um erro ao realizar a ação.')
        }
    }

    if (command === 'shop') {
        player.showShop(args[0] ?? '1', message, client)
    }

    if (command === 'shopinfo' || command === 'si') {
        if (args[0]) {
            try {
                player.showItemInfo(args[0], message, client)
            } catch (e) {
                console.log(e)
                return message.channel.send('Houve um erro ao realizar a ação.')
            }
        } else {
            return message.reply('Insira o item que deseja ver.')
        }
    }

    if (command === 'inventory' || command === 'i') {
        await player.searchPlayerItems(args[0] ?? message.author.id, args[1], args[2], message)
    }

    if (command === 'use') {
        if (!args[0] || !args[1]) {
            let aspas = "`"
            return message.channel.send(`Os parâmetros estão inválidos, utilize ${aspas}euse códigoDaCarta códigoDoItem${aspas}`)
        }
        try {
        player.useItem(args[0], args[1], message) //  cardID, itemID
        } catch (e) {
            console.log(e)
            return message.reply('Houve algum erro')
        }
    }

 });

client.login(token);