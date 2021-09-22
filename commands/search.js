const { SlashCommandBuilder } = require('@discordjs/builders');

const malScraper = require('mal-scraper')

const name = "Naruto"

malScraper.getPictures(name)
    .then((data) => console.log(data))
    .catch((err) => console.log(err))

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('development only'),
    async execute(interaction) {
        await interaction.reply(`Ontem, ${interaction.user}`);
    },
};