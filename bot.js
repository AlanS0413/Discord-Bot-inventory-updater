const fs = require('fs');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config()
const {token} = process.env



const client = new Client({ intents: [GatewayIntentBits.Guilds] });


client.commands = new Collection();
client.commandsArray = [];
client.buttons = new Collection();
client.modals = new Collection();

const functionFolders = fs.readdirSync(`C:\\Users\\Alan\\Documents\\Discord Bots\\Active Stock\\functions`)

for (const folder of functionFolders) {
	const functionFiles = fs
		.readdirSync(`C:\\Users\\Alan\\Documents\\Discord Bots\\Active Stock\\functions\\${folder}`)
		.filter((file) => file.endsWith('.js'))
	for(const file of functionFiles){
		require(`C:\\Users\\Alan\\Documents\\Discord Bots\\Active Stock\\functions\\${folder}\\${file}`)(client)
	}

}

client.handleEvents()
client.handleCommands()
client.handleComponents()
client.login(token);
