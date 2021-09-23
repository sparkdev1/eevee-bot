// at the top of your file
const { SlashCommandBuilder } = require('@discordjs/builders');

const Discord = require('discord.js');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });
const userData = new SlashCommandBuilder();

const exampleEmbed = new Discord.MessageEmbed()
    .setColor("#fa5700")
    .setTitle('title')
    .setURL('https://discord.js.org/')
    .setAuthor('usererere')
    .setDescription('Some description here')
    .setThumbnail('')
    .addFields({ name: 'Regular field title', value: 'Some value here' }, { name: '\u200B', value: '\u200B' }, { name: 'Inline field title', value: 'Some value here', inline: true }, { name: 'Inline field title', value: 'Some value here', inline: true }, )
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