const {REST} = require('@discordjs/rest')
const {Routes} = require('discord-api-types/v9')
const fs = require('fs')

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\commands`)
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\commands\\${folder}`)
                .filter((file) => file.endsWith(".js"))
            const { commands, commandsArray } = client
            for (const file of commandFiles) {
                const command = require(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\commands\\${folder}\\${file}`);
                commands.set(command.data.name, command);
                commandsArray.push(command.data.toJSON());
            }
        }

        const clientId = "1124342266866192455"
        const guildId = "1124420836720386090"
        const rest = new REST({version: 9}).setToken(process.env.token)
        try {
            console.log(`Started refreshing application (/) commands.`);

            // The put method is used to fully refresh all commands in the guild with the current set
            await rest.put(
                Routes.applicationGuildCommands(clientId,guildId),
                { body: client.commandsArray },
            );
    
            console.log(`Successfully reloaded application (/) commands.`);
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    }
}