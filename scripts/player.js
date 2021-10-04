const Data = require("../models/data.js");

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

const playerBalance = (player = '', message , client) => {

    if (player != '') {
        player = getUserFromMention(player, client);

        if (!player) 
            return 'Por favor, utilize alguma menção válida'
    } else
        player = message.author

    let finalMessage = 'fds'
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
                daily: 0,
            })
            newData.save().catch(err => console.log(err));
            finalMessage = `${player.username} tem :moneybag: 0 gold.`
        } 

        finalMessage = `${player.username} tem :moneybag: ${data.money} gold.`
    })  
    return finalMessage 
}


module.exports.playerBalance = playerBalance