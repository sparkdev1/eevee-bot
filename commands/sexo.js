const { SlashCommandBuilder } = require('@discordjs/builders');

const horario = ['pela manha', 'durante o dia', 'no decorrer da tarde', 'no começo da noite', 'no fim da madrugada']
const tipoSexo = ['renal', 'patologico', 'not sexo', 'vaginal', 'virgem']

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sexo')
        .setDescription('Transcreve como foi seu sexo ontem'),
    async execute(interaction) {
        await interaction.reply(`Ontem, ${interaction.user} ` + '__' + horario[Math.floor(Math.random() * horario.length)] + '__' + '\nRealizou um sexo ' + '***' + tipoSexo[Math.floor(Math.random() * tipoSexo.length)] + '***');
    },
};