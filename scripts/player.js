const Data = require("./models/data.js");

const getUserFromMention = (mention) => {
    if (!mention) return;

    if (mention.startsWith('<@') && mention.endsWith('>')) {
        mention = mention.slice(2, -1);

        if (mention.startsWith('!')) {
            mention = mention.slice(1);
        }

        return client.users.cache.get(mention);
    }
}

const playerBalance = (playername = '', message) => {

    if (playername != '') {
        const user = getUserFromMention(playername);

        if (!user) 
            return 'Por favor, utilize alguma menção válida'
    } else
        user = message.author

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
            return `${user.username} tem :moneybag: 0 gold.`
        } 

        return `${user.username} tem :moneybag: ${data.money} gold.`
    })  
}

module.exports.playerBalance = playerBalance