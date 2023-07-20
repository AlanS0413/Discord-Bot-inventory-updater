const { InteractionType } = require('discord.js')
module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const {
                commands
            } = client;
            const {
                commandName
            } = interaction;
            const command = commands.get(commandName)
            if (!command) return;

            try {
                await command.execute(interaction, client);

            } catch (error) {
                console.error(error);
                await interaction.reply({
                    content: `Error in this command`,
                    ephmeral: true
                })
            }
        }else if(interaction.isButton()){
            const { buttons } = client;
            const { customId } = interaction;
            const button = buttons.get(customId)
            if(!button) return new Error("This dont exits");
            try{
                await button.execute(interaction, client)
            }catch(error){
                console.error(error)
            }
        }else if (interaction.type == InteractionType.ModalSubmit){
            const {modals} = client;
            const {customId} = interaction;
            const modal = modals.get(customId)
            if(!modal)return new Error ("This dosent exist")

            try{
                await modal.execute(interaction, client);
            }   catch(error){
                console.error(error);
            }
        }
    },
}