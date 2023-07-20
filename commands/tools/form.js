const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('form')
        .setDescription('Order Form'),
    async execute(interaction, client) {
        await interaction.reply({
            content: "https://docs.google.com/forms/d/e/1FAIpQLSd8E0FFLuRheHBYOCEZZdyAmBv_VVpZDjoBf6xIiyAcbl-mkA/viewform?usp=sf_link"
        });
  }

}