// at the top of your file
const { SlashCommandBuilder } = require('@discordjs/builders');

const { MessageEmbed, User, Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

const testUser = new User(client, data)

const exampleEmbed = new MessageEmbed()
.setColor("#fa5700")
.setTitle('Some title')
.setURL('https://discord.js.org/')
.setAuthor('Some name', testUser.avatarURL(), 'https://discord.js.org')
.setDescription('Some description here')
.setThumbnail('https://i.imgur.com/AfFp7pu.png')
.addFields(
{ name: 'Regular field title', value: 'Some value here' },
{ name: '\u200B', value: '\u200B' },
{ name: 'Inline field title', value: 'Some value here', inline: true },
{ name: 'Inline field title', value: 'Some value here', inline: true },
)
.addField('Inline field title', 'Some value here', true)
.setImage('https://i.imgur.com/AfFp7pu.png')
.setTimestamp()
.setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');
var a = { embeds: [exampleEmbed] }
module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('development'),
    async execute(interaction) {
        await interaction.reply(a);
    },
};