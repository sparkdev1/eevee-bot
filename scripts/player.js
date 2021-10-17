const Data = require("../models/data.js");
const Card = require("../models/card.js");
const { Client, Collection, Intents, MessageEmbed, MessageAttachment } = require('discord.js');
const { model } = require("mongoose");

const getUserFromMention = (mention, client) => {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

const playerBalance = (player = '', message, client) => {

    if (player != '') {
        player = getUserFromMention(player, client);

        if (!player)
            message.reply('Por favor, utilize alguma menção válida')

    } else
        player = message.author

    Data.findOne({
        userID: player.id
    }, (err, data) => {
        if (err) console.log(err);

        if (!data) {
            const newData = new Data({
                name: player.username,
                userID: player.id,
                lb: "all",
                money: 0,
                star:0,
                daily: 0,
            })
            newData.save().catch(err => console.log(err));
            message.reply(`${player.username} tem :moneybag: 0 gold e :star: 0 estrelas.`)
        } else

            message.reply(`${player.username} tem :moneybag: ${data.money} gold e :star: ${data.star} estrelas.`)

    })
}

const burnCards = (code, message, client) => {

    Card.findOne({
        userID: message.author.id,
        cardID: code
    }, (err, data) => {
        if (err) {
            message.channel.send('Essa carta não pertence a você ou não existe.')
            return console.log(err);
        }

        if (!data) {
            return message.reply('Essa carta não pertence a você ou não existe.')
        }
        if (!code) {
            return message.reply('Por favor, utilize código de card válido.')
        }
        client.users.fetch(data.userID).then((user) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardCode = data.cardID
            
            let aspas = "`"
            let cardStars = data.cardStars
            let cardDateGet = data.cardDateGet
            let cardGoldValue = parseInt(data.cardAttack) + parseInt(data.cardDefense) + parseInt(data.cardIntelligence)
            const exampleEmbed = new MessageEmbed()
                .setColor("#ffffff")
                .setTitle('Deseja queimar essa carta?')
                .setDescription(`${aspas}${cardCode}${aspas} - ***${cardName}*** adquirida dia ${cardDateGet}`)
                .setThumbnail(cardPhoto)
                .addField(':star: Stars:', cardStars.toString())
                .addField(':money_with_wings: Ouro:', cardGoldValue.toString())
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] }).then(sendMessage => {
                sendMessage.react("❌")
                sendMessage.react("🔥")    
                const filter = (reaction, user) => ["❌", "🔥"].includes(reaction.emoji.name) &&  user.id === message.author.id;
                const collector = sendMessage.createReactionCollector({ filter, max: 1, time: 5000 });

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === "❌" && user.id === message.author.id) {
                        sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] })
                        await message.channel.send('Operação cancelada!')
                        return
                    }
                    if (reaction.emoji.name === "🔥"  && user.id === message.author.id) {
                        Card.findOneAndDelete({
                            cardID: code
                        }, (err) => {
                            if (err) {
                                message.channel.send('Essa carta não pertence a você ou não existe.')
                                return console.log(err);
                            }
                            if (!err) {
                                Data.findOne({
                                    userID: user.id
                                }, (err, data) => {
                                    if (err) console.log(err);
                                    console.log(data)
                                    if (!data) {
                                        const newData = new Data({
                                            name: user.username,
                                            userID: user.id,
                                            lb: "all",
                                            money: 0,
                                            star:0,
                                            daily: 0,
                                        })
                                        newData.save().catch(err => console.log(err))
                                    }
                                    oldGold = parseInt(data.money)
                                    oldStar = parseInt(data.star)
                                    cardStars = parseInt(cardStars)
                                Data.updateOne({
                                    userID: user.id
                                },{money: oldGold + cardGoldValue, star: oldStar + cardStars},function (err, docs) {
                                    if (err){
                                        console.log(err)
                                    }
                                    else{
                                        console.log("Updated Docs : ", docs);
                                    }
                                })
                                })
                                
                    
                                sendMessage.edit({ embeds: [exampleEmbed.setColor("#00ff11")] })
                                message.channel.send('Operação concluída!')
                                return
                            } else {
                                console.log("Error removing :" + err);
                            }
                        })
                        
                    }
                })
        })
    });
})
}

const burnLastCard = (message, client) => {

    Card.findOne({
        userID: message.author.id,
    }, {}, { sort: { cardID: -1 } }, (err, data) => {
        if (err) {
            message.channel.send('Essa carta não pertence a você ou não existe.')
            return console.log(err);
        }
        if (!data) {
            return message.reply('Essa carta não pertence a você ou não existe.')
        }
        client.users.fetch(data.userID).then((user) => {
            let cardPhoto = data.cardPhoto
            let cardName = data.cardName
            let cardCode = data.cardID
            
            let aspas = "`"
            let cardStars = data.cardStars
            let cardDateGet = data.cardDateGet
            let cardGoldValue = parseInt(data.cardAttack) + parseInt(data.cardDefense) + parseInt(data.cardIntelligence)
            const exampleEmbed = new MessageEmbed()
                .setColor("#ffffff")
                .setTitle('Deseja queimar essa carta?')
                .setDescription(`${aspas}${cardCode}${aspas} - ***${cardName}*** adquirida dia ${cardDateGet}`)
                .setThumbnail(cardPhoto)
                .addField(':star: Stars:', cardStars.toString())
                .addField(':money_with_wings: Ouro:', cardGoldValue.toString())
                .setTimestamp()
                .setFooter(user.tag, user.avatarURL());
            message.reply({ embeds: [exampleEmbed] }).then(sendMessage => {
                sendMessage.react("❌")
                sendMessage.react("🔥")    
                const filter = (reaction, user) => ["❌", "🔥"].includes(reaction.emoji.name) &&  user.id === message.author.id;
                const collector = sendMessage.createReactionCollector({ filter, max: 1, time: 5000 });

                collector.on('collect', async (reaction, user) => {
                    if (reaction.emoji.name === "❌" && user.id === message.author.id) {
                        sendMessage.edit({ embeds: [exampleEmbed.setColor("#ff0000")] })
                        await message.channel.send('Operação cancelada!')
                        return
                    }
                    if (reaction.emoji.name === "🔥"  && user.id === message.author.id) {
                        Card.findOneAndDelete({
                            cardID: cardCode
                        }, (err) => {
                            if (err) {
                                message.channel.send('Essa carta não pertence a você ou não existe.')
                                return console.log(err);
                            }
                            if (!err) {
                                Data.findOne({
                                    userID: user.id
                                }, (err, data) => {
                                    if (err) console.log(err);
                                    console.log(data)
                                    if (!data) {
                                        const newData = new Data({
                                            name: user.username,
                                            userID: user.id,
                                            lb: "all",
                                            money: 0,
                                            star:0,
                                            daily: 0,
                                        })
                                        newData.save().catch(err => console.log(err))
                                    }
                                    oldGold = parseInt(data.money)
                                    oldStar = parseInt(data.star)
                                    cardStars = parseInt(cardStars)
                                Data.updateOne({
                                    userID: user.id
                                },{money: oldGold + cardGoldValue, star: oldStar + cardStars},function (err, docs) {
                                    if (err){
                                        console.log(err)
                                    }
                                    else{
                                        console.log("Updated Docs : ", docs);
                                    }
                                })
                                })
                                
                    
                                sendMessage.edit({ embeds: [exampleEmbed.setColor("#00ff11")] })
                                message.channel.send('Operação concluída!')
                                return
                            } else {
                                console.log("Error removing :" + err);
                            }
                        })
                        
                    }
                })
        })
    });
})
}




    // Data.findOneAndUpdate({
    //     userID: player.id
    // }, (err, data) => {
    //     if (err) console.log(err);

    //     if (!data) {
    //         const newData = new Data({
    //             name: player.username,
    //             userID: player.id,
    //             lb: "all",
    //             money: 0,
    //             daily: 0,
    //         })
    //         newData.save().catch(err => console.log(err));
    //         message.reply(`${player.username} tem :moneybag: 0 gold.`)
    //     } else

    //         message.reply(`${player.username} tem :moneybag: ${data.money} gold.`)

    // })



module.exports.burnCards = burnCards
module.exports.burnLastCard = burnLastCard
module.exports.playerBalance = playerBalance