// Require the necessary discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token } = require('./config.json');
const malScraper = require('mal-scraper');
const mongoose = require('mongoose');
const prefixCommand = require('./command');
const { prefix } = require('./config.json');
const Data = require("./models/data.js")


mongoose.connect('mongodb+srv://spark2x:FH8UljIyKXuZB4vM@cluster0.h4s7e.mongodb.net/test', { useNewUrlParser: true, useUnifiedTopology: true })
    // Create a new client instance
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.on('messageCreate', (message) => {



    if (message.content === prefix + 'ping') {
        message.reply({
            content: 'pong',
        })
    }

    if (message.content === prefix + 'test') {
        let cardPhoto = 'https://static.wikia.nocookie.net/rezero/images/3/3a/RemP.png/revision/latest/top-crop/width/360/height/450?cb=20161224170255&path-prefix=pt-br'
        let cardName = 'Rem'
        let cardCode = 'oqk531'
        let cardAnimeFrom = 'Re:Zero'
        let cardStars = ':star: :star: :star: :star:'
        let cardAttack = '79'
        let cardDefense = '57'
        let cardIntelligence = '238'
        const exampleEmbed = new MessageEmbed()
            .setColor("#fa5700")
            .setTitle(cardName)
            .setURL(`https://myanimelist.net/character.php?cat=character&q=${cardName}`)
            .setAuthor(`${cardCode} owned by ${message.author.username}`)
            .setDescription(`__${cardAnimeFrom}__`)
            .setThumbnail(message.author.avatarURL())
            .addFields(
                { name: 'Stars', value: cardStars },
                { name: '\u200b', value: '\u200b', inline: false},
                { name: 'Ataque     ', value: `***${cardAttack}***`, inline: true },
                { name: 'Defesa     ', value:  `***${cardDefense}***`, inline: true },
                { name: 'Inteligência     ', value: `***${cardIntelligence}***`, inline: true },
            )
            .setImage(cardPhoto)
            .setTimestamp()
            .setFooter(message.author.tag, message.author.avatarURL());
        var cardInfo = { embeds: [exampleEmbed] }
        message.reply(cardInfo)
    }
})
client.login(token);