// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const { token, prefix, mongoConst } = require('./config.json');
const malScraper = require('mal-scraper');
const mongoose = require('mongoose');
const prefixCommand = require('./command');
const Data = require("./models/data.js");
const card = require('./models/card.js');
const { send } = require('process');


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

client.on('messageCreate', (message) => {

    function getUserFromMention(mention) {
        if (!mention) return;

        if (mention.startsWith('<@') && mention.endsWith('>')) {
            mention = mention.slice(2, -1);

            if (mention.startsWith('!')) {
                mention = mention.slice(1);
            }

            return client.users.cache.get(mention);
        }
    }

    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();


    if (command === 'ping') {
        return message.channel.send('pong')
    }

    if (command === 'avatar') {
        if (args[0]) {
            const user = getUserFromMention(args[0]);
            if (!user) {
                return message.reply('Por favor, utilize alguma menção válida caso queria ver o avatar de alguém.');
            }

            return message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
        }
        const user = message.author;

        return message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
    }

    if (command === 'view' || command === 'v') {
        const Card = require("./models/card.js")
        if (args[0]) {
            const code = args[0]
            Card.findOne({
                cardID: code
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    return message.channel.send('Por favor, utilize código de card válido')
                }
                if (!code) {
                    return message.reply('Por favor, utilize código de card válido');
                }
                client.users.fetch(data.userID).then((user) => {
                    let cardNameURL = data.cardName.replace(/[^A-Z0-9]+/ig, "+")
                    let cardAnimeFrom = 'Anime Name'
                    switch (data.cardStars) {
                        case "1":
                            var cardStarsE = ":star: "
                            break;
                        case "2":
                            var cardStarsE = ":star: :star: "
                            break;
                        case "3":
                            var cardStarsE = ":star: :star: :star: "
                            break;
                        case "4":
                            var cardStarsE = ":star: :star: :star: :star: "
                            break;
                        case "5":
                            var cardStarsE = ":star: :star: :star: :star: :star: "
                            break;
                    }
                    let cardAttack = data.cardAttack
                    let cardDefense = data.cardDefense
                    let cardIntelligence = data.cardIntelligence
                    const exampleEmbed = new MessageEmbed()
                        .setColor("#fa5700")
                        .setTitle(data.cardName)
                        .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                        .setAuthor(`${data.cardID} owned by ${user.username}`)
                        .setDescription(`__${cardAnimeFrom}__`)
                        .setThumbnail(user.avatarURL())
                        .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true }, )
                        .setImage(data.cardPhoto)
                        .setTimestamp()
                        .setFooter(user.tag, user.avatarURL());
                    var cardInfo = { embeds: [exampleEmbed] }
                    console.log (`${user.tag} viewed a card`)
                    return message.reply(cardInfo)
                })
            });

        } else {
            return message.reply('Insira o __código__ do card que gostaria de ver')
        }
    }

    if (command === 'drop' || command === 'd') {


        //random anime character with AniList API
        function getRandomCharacter(min, max) {
            return Math.ceil(Math.random() * (max - min) + min);
        }
        const anilist = require('anilist-node');
        const Anilist = new anilist();


        var drop = []
        
        
        Anilist.people.character(getRandomCharacter(1,250000)).then(data => {
            Anilist.people.character(getRandomCharacter(1, 250000)).then(data2 => {
                Anilist.people.character(getRandomCharacter(1, 250000)).then(data3 => {
                    if (Array.isArray(data)) {
                        drop.push({ 'name': 'LUCKY DROP!', 'image': './images/lucky.png', 'animeTitle': 'Boa sorte rs' });
                    } else {
                        drop.push({ 'name': (data.name.english), 'image': data.image.large, 'animeTitle': data.media['0'].title.userPreferred });
                    }
                    if (Array.isArray(data2)) {
                        drop.push({ 'name': 'LUCKY DROP!', 'image': './images/lucky.png', 'animeTitle': 'Boa sorte rs' });
                    } else {
                        drop.push({ 'name': data2.name.english, 'image': data2.image.large, 'animeTitle': data2.media['0'].title.userPreferred });
                    }
                    if (Array.isArray(data3)) {
                        drop.push({ 'name': 'LUCKY DROP!', 'image': './images/lucky.png', 'animeTitle': 'Boa sorte rs' });
                    } else {
                        drop.push({ 'name': data3.name.english, 'image': data3.image.large, 'animeTitle': data3.media['0'].title.userPreferred });
                    }
                    message.reply(`Estou dropando 3 cartas, boa sorte ${message.author}!`)
                    //image drop creation with canvas
                    const { createCanvas, loadImage, registerFont } = require('canvas')
                    registerFont('custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
                    const canvas = createCanvas(1900, 1000)
                    const ctx = canvas.getContext('2d')

                    // Draw drop image
                    loadImage('images/background2.jpg').then((background) => {

                        ctx.drawImage(background, null, null, 1900, 1000)

                        loadImage(drop[0].image).then((character1, dropInfo = drop) => {
                            ctx.drawImage(character1, 50, 100, 500, 800)


                            loadImage(drop[1].image).then((character2) => {
                                ctx.drawImage(character2, 700, 100, 500, 800)

                                loadImage(drop[2].image).then((character3) => {

                                    ctx.drawImage(character3, 1350, 100, 500, 800)

                                    ctx.font = '70px Public Sans'
                                    ctx.fillStyle = "#FFFFFF";
                                    ctx.fillText(dropInfo['0'].name, 100, 80, 400)
                                    ctx.fillText(dropInfo['1'].name, 750, 80, 400)
                                    ctx.fillText(dropInfo['2'].name, 1400, 80, 400)
                                    ctx.fillText(dropInfo['0'].animeTitle, 100, 980, 450)
                                    ctx.fillText(dropInfo['1'].animeTitle, 750, 980, 450)
                                    ctx.fillText(dropInfo['2'].animeTitle, 1350, 980, 450)

                                    const fs = require('fs')
                                    const out = fs.createWriteStream(__dirname + '/drop.png')
                                    const stream = canvas.createPNGStream()
                                    stream.pipe(out)
                                    out.on('finish', () => console.log('The Drop PNG file was created.'))

                                    const attachment = new MessageAttachment(__dirname + '/drop.png');
                                    console.log('Send Drop')
                                    message.channel.send({files: [attachment]}).then(sendMessage => {
                                        sendMessage.react("1️⃣")
                                        sendMessage.react("2️⃣")
                                        sendMessage.react("3️⃣")
                                        setTimeout(function(){
                                            sendMessage.edit('_Esse drop expirou e não pode mais ser resgatado_')
                                        }, 30000)
                                    })
                                    




                                })
                            })
                        })
                    })
                })
            })
        })
    }

    if (command === 'bag') {
        const Data = require("./models/data.js")

        if (args[0]) {
            const user = getUserFromMention(args[0]);
            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    const newData = new Data({
                        name: user.username,
                        userID: user.id,
                        lb: "all",
                        money: 0,
                        daily: 0,
                    })
                    newData.save().catch(err => console.log(err));
                    return message.channel.send(`${user.username} tem :moneybag: 0 gold.`);
                } else {
                    return message.channel.send(`${user.username} tem :moneybag: ${data.money} gold.`);
                }
            })
            if (!user) {
                return message.reply('Por favor, utilize alguma menção válida');
            }
        } else {

            const user = message.author;

            Data.findOne({
                userID: user.id
            }, (err, data) => {
                if (err) console.log(err);
                if (!data) {
                    const newData = new Data({
                        name: user.username,
                        userID: user.id,
                        lb: "all",
                        money: 0,
                        daily: 0,
                    })
                    newData.save().catch(err => console.log(err));
                    return message.channel.send(`${user.username} tem :moneybag: 0 gold.`);
                } else {
                    return message.channel.send(`${user.username} tem :moneybag: ${data.money} gold.`);
                }
            })
        }
    }
});
client.login(token);