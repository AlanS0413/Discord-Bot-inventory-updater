const { modal } = require('C:\\Users\\Alan\\Documents\\Discord Bots\\Active Stock\\commands\\tools\\updatestock.js');

module.exports = {
    data: {
        name: 'updatevalue'
    },
    async execute(interaction, client) {
        await interaction.showModal(modal); // Show the exported modal
    }
}