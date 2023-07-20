const { modal } = require('C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\commands\\tools\\updatestock.js');

module.exports = {
    data: {
        name: 'updatevalue'
    },
    async execute(interaction, client) {
        await interaction.showModal(modal); // Show the exported modal
    }
}