const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const fs = require('fs')
const Card = require('../models/card.js')
const Data = require("../models/data.js");
const { createCanvas, loadImage, registerFont } = require('canvas')

const searchSpecificCard = (code, client, message) => {
    Card.findOne({
        cardID: code
    }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Por favor, utilize código de card válido')
        }
        if (!code) {
            return message.reply('Por favor, utilize código de card válido')
        }
        client.users.fetch(data.userID).then((user) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardNameURL = cardName.replace(/[^A-Z0-9]+/ig, "+")
            let cardCode = data.cardID
            let cardAnimeFrom = data.cardFrom

            let cardStarsE = ''

            for (let i = 1; i <= data.cardStars; i++) {
                cardStarsE += ":star: "
            }

            let cardAttack = data.cardAttack
            let cardDefense = data.cardDefense
            let cardIntelligence = data.cardIntelligence
            const exampleEmbed = new MessageEmbed()
                .setColor("#fa5700")
                .setTitle(cardName)
                .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                .setAuthor(`${cardCode} owned by ${user.username}`)
                .setDescription(`__${cardAnimeFrom}__`)
                .setThumbnail(user.avatarURL())
                .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] })
        })
    });
}

const searchLastCard = (client, message) => {
    Card.findOne({
        userID: message.author.id
    }, {}, { sort: { cardID: -1 } }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Você não possui cartas.')
        }
        client.users.fetch(data.userID).then((user) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardNameURL = cardName.replace(/[^A-Z0-9]+/ig, "+")
            let cardCode = data.cardID
            let cardAnimeFrom = data.cardFrom

            let cardStarsE = ''

            for (let i = 1; i <= data.cardStars; i++) {
                cardStarsE += ":star: "
            }

            let cardAttack = data.cardAttack
            let cardDefense = data.cardDefense
            let cardIntelligence = data.cardIntelligence
            const exampleEmbed = new MessageEmbed()
                .setColor("#fa5700")
                .setTitle(cardName)
                .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardNameURL}`)
                .setAuthor(`${cardCode} owned by ${user.username}`)
                .setDescription(`__${cardAnimeFrom}__`)
                .setThumbnail(user.avatarURL())
                .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true },)
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] })
        })
    });
}

const searchCardCollection = (id, client, args, message) => {
    if (id.match(/\d+/g) !== null) {

        var page = 0;// 10 = page 1, 20 = page 2...
        switch (client) {
            case 'p=':
                page = (args.match(/\d+/g)[0] - 1) * 10
        }
        Card.find({
            userID: id.match(/\d+/g)[0]
        }, {}, { skip: page, limit: 10, sort: { cardID: -1 } }, async (err, data) => {
            if (err) console.log(err);

            if (!data) {
                return message.reply('Nenhuma carta encontrada')
            }
            if (!id) {
                return message.reply('Usuário inválido.')
            }

            var string = [];
            data.forEach((element, index, array) => {
                string.push(element.cardID + ' - ' + element.cardStars + ' - ' + element.cardName + ' - ' + element.cardFrom + '\n')
            })
            let aspas = "```"
            message.channel.send(`${aspas} # | ☆ | Nome     |  Anime ${'\n'}${'\n'}${string.join(`\n`)} ${aspas}`);
        });
    } else {
        message.reply('Houve um erro ao buscar');
    }
}

const createDropTemplate = async (drop) => {
    const canvas = createCanvas(1900, 1000)
    registerFont('./custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
    const ctx = canvas.getContext('2d')

    ctx.drawImage(await loadImage('images/background2.jpg'), null, null, 1900, 1000)
    ctx.drawImage(await loadImage(drop[0][0].img), 50, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][1].img), 700, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][2].img), 1350, 100, 500, 800)

    ctx.font = '70px Public Sans'
    ctx.fillStyle = "#FFFFFF";

    var fullName =  drop[0][0].char
    ctx.fillText(fullName, 100, 80, 400)


    var fullName = drop[0][1].char
    ctx.fillText(fullName, 750, 80, 400)

    var fullName = drop[0][2].char
    ctx.fillText(fullName, 1400, 80, 400)


    ctx.fillText(drop[0][0].title, 50, 980, 500)
    ctx.fillText(drop[0][1].title, 700, 980, 500)
    ctx.fillText(drop[0][2].title, 1350, 980, 500)

    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync(__dirname + '/drop.png', buffer)

    
    // const out = fs.createWriteStream(__dirname + '/drop.png')
    // const stream = canvas.createPNGStream()
    // stream.pipe(out)
    // out.on('finish', () => console.log('The Drop PNG file was created.'))
    const attachment = new MessageAttachment(__dirname + '/drop.png');
    return { files: [attachment] }
}

const giveCard = (toUser, code, message, client) => {

    Card.findOne({
        userID: message.author.id,
        cardID: code
    }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            return message.reply('Essa carta não pertence a você ou não existe.')
        }
        if (!code) {
            return message.reply('Por favor, utilize código de card válido.')
        }
        client.users.fetch(data.userID).then((user) => {
            client.users.fetch(toUser.match(/\d+/g)[0]).then((theuser) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardCode = data.cardID

            let aspas = "`"
            let cardStars = data.cardStars
            let cardDateGet = data.cardDateGet
            const exampleEmbed = new MessageEmbed()
                .setColor("#ffffff")
                .setTitle(`Deseja transferir essa carta para ${theuser.tag}?`)
                .setDescription(`${aspas}${cardCode}${aspas} - :star: ${cardStars} ***${cardName}*** adquirida dia ${cardDateGet}`)
                .setThumbnail(user.avatarURL())
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] }).then(sendMessage => {
                sendMessage.react("❌")
                sendMessage.react("✅")
                const filter = (reaction, user) => ["❌", "✅"].includes(reaction.emoji.name) && user.id === message.author.id;
                const collector = sendMessage.createReactionCollector({ filter, max: 1, time: 20000 });

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === "❌" && user.id === message.author.id) {
                        sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] })
                        await message.channel.send('Operação cancelada!')
                        return
                    }
                    if (reaction.emoji.name === "✅" && user.id === message.author.id) {
                        Data.findOne({
                            userID: user.id
                        }, (err, data) => {
                            if (err) console.log(err);
                            console.log(data)
                            if (!data) {
                                const newData = new Data({
                                    name: player.username,
                                    userID: player.id,
                                    lb: "all",
                                    money: 0,
                                    star: 0,
                                    daily: 0,
                                })
                                newData.save().catch(err => console.log(err))
                            }
                            if (code.match(/\d+/g) !== null) {
                                Card.findOneAndUpdate({
                                    userID: message.author.id,
                                    cardID: code
                                }, { userID: toUser.match(/\d+/g)[0] }, { new: true }, function (err, docs) {
                                    if (err) {
                                        console.log(err)
                                        message.reply('Essa cartão não pertence a você ou o usuário não existe.')
                                        return
                                    }
                                })

                                sendMessage.edit({ embeds: [exampleEmbed.setColor("#00ff11")] })
                                message.channel.send('Operação concluída!')
                                return
                            }
                        })

                    }
                })
            })

        })
    })
    })

}

function random(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}


const generateCardValues = async () => {
    var values = []
    var randomNumber = random(0, 100)

    if (randomNumber <= 20) {
        let stars = 1
        let attack = random(0, 30)
        let defense = random(0, 30)
        let intelligence = random(0, 30)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 20 && randomNumber <= 40) {
        let stars = 2
        let attack = random(30, 50)
        let defense = random(30, 50)
        let intelligence = random(30, 50)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 40 && randomNumber <= 70) {
        let stars = 3
        let attack = random(50, 100)
        let defense = random(50, 100)
        let intelligence = random(50, 100)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 70 && randomNumber <= 90) {
        let stars = 4
        let attack = random(100, 250)
        let defense = random(100, 250)
        let intelligence = random(100, 250)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }

    if (randomNumber > 90) {
        let stars = 5
        let attack = random(250, 500)
        let defense = random(250, 500)
        let intelligence = random(250, 500)
        values.push({ s: stars, a: attack, d: defense, i: intelligence })
    }
    console.log(values)
    return values
}
module.exports.giveCard = giveCard
module.exports.searchLastCard = searchLastCard
module.exports.searchCardCollection = searchCardCollection
module.exports.searchSpecificCard = searchSpecificCard
module.exports.createDropTemplate = createDropTemplate
module.exports.generateCardValues = generateCardValues