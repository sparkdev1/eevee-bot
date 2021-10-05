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
                daily: 0,
            })
            newData.save().catch(err => console.log(err));
            message.reply(`${player.username} tem :moneybag: 0 gold.`)
            continue;
        } else

            message.reply(`${player.username} tem :moneybag: ${data.money} gold.`)

    })
}


module.exports.playerBalance = playerBalance