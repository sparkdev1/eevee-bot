const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const Card = require('../models/card.js')
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
            let cardAnimeFrom = 'Anime Name'

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
                .addFields({ name: 'Stars', value: cardStarsE }, { name: '\u200b', value: '\u200b', inline: false }, { name: 'Ataque     ', value: `***:crossed_swords: ${cardAttack}***`, inline: true }, { name: 'Defesa     ', value: `***:shield: ${cardDefense}***`, inline: true }, { name: 'Inteligência     ', value: `***:books: ${cardIntelligence}***`, inline: true }, )
                .setImage(cardPhoto)
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] })
        })
    });
}

const createDropTemplate = async(drop) => {
    const canvas = createCanvas(1900, 1000)
    registerFont('./custom-fonts/PublicSans-Regular.otf', { family: 'Public Sans' })
    const ctx = canvas.getContext('2d')

    ctx.drawImage(await loadImage('images/background2.jpg'), null, null, 1900, 1000)
    ctx.drawImage(await loadImage(drop[0][0].img), 50, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][1].img), 700, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[0][2].img), 1350, 100, 500, 800)

    ctx.font = '70px Public Sans'
    ctx.fillStyle = "#FFFFFF";
    if (drop[0][0].char.last !== null){
        ctx.fillText(drop[0][0].char.first + ' ' + drop[0][0].char.last ?? '', 100, 80, 400)
    } else {
        ctx.fillText(drop[0][0].char.first, 100, 80, 400)
    }
    if (drop[0][1].char.last !== null){
        ctx.fillText(drop[0][1].char.first + ' ' + drop[0][1].char.last ?? '', 750, 80, 400)
    } else {
        ctx.fillText(drop[0][1].char.first, 750, 80, 400)
    }
    if (drop[0][2].char.last !== null){
        ctx.fillText(drop[0][2].char.first + ' ' + drop[0][2].char.last ?? '', 1400, 80, 400)
    } else {
        ctx.fillText(drop[0][2].char.first, 1400, 80, 400)
    }

    ctx.fillText(drop[0][0].title, 50, 980, 500)
    ctx.fillText(drop[0][1].title, 700, 980, 500)
    ctx.fillText(drop[0][2].title, 1350, 980, 500)

    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/drop.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => console.log('The Drop PNG file was created.'))

    const attachment = new MessageAttachment(__dirname + '/drop.png');

    return { files: [attachment] }
}

module.exports.searchSpecificCard = searchSpecificCard
module.exports.createDropTemplate = createDropTemplate