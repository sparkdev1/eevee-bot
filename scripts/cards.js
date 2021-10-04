const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const Card = require('../models/card.js')
const { createCanvas, loadImage } = require('canvas')

const searchSpecificCard = (code, client) => {
    Card.findOne({
        cardID: code
    }, (err, data) => {
        if (err) console.log(err);

        if (!data) 
            return 'Por favor, utilize código de card válido'

        if (!code) 
            return 'Por favor, utilize código de card válido'

        
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
            return { embeds: [exampleEmbed] }
        })
    });
}

const createDropTemplate = async (drop) => {
    const canvas = createCanvas(1900, 1000)
    const ctx = canvas.getContext('2d')

    ctx.drawImage(await loadImage('images/background2.jpg'), null, null, 1900, 1000)
    ctx.drawImage(await loadImage(drop[0].image), 50, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[1].image), 700, 100, 500, 800)
    ctx.drawImage(await loadImage(drop[2].image), 1350, 100, 500, 800)
    
    ctx.font = '70px Public Sans'
    ctx.fillStyle = "#FFFFFF";

    ctx.fillText(drop[0].name, 100, 80, 400)
    ctx.fillText(drop[1].name, 750, 80, 400)
    ctx.fillText(drop[2].name, 1400, 80, 400)

    ctx.fillText(drop[0].animeTitle, 100, 980, 450)
    ctx.fillText(drop[1].animeTitle, 750, 980, 450)
    ctx.fillText(drop[2].animeTitle, 1350, 980, 450)

    const fs = require('fs')
    const out = fs.createWriteStream(__dirname + '/drop.png')
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () =>  console.log('The Drop PNG file was created.'))

    const attachment = new MessageAttachment(__dirname + '/drop.png');

    return { files:[attachment] }
}

module.exports.searchSpecificCard = searchSpecificCard
module.exports.createDropTemplate = createDropTemplate