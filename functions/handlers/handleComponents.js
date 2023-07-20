const fs = require('fs');

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentFolders = fs.readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\components`)
        for (const folder of componentFolders) {
            const componentFiles = fs
                .readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\components\\${folder}`)
                .filter((file) => file.endsWith(".js"))

            const {buttons , modals} = client;

            switch (folder) {
                case "buttons":
                    for (const file of componentFiles) {
                        const button = require(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\components\\${folder}\\${file}`);
                        buttons.set(button.data.name, button)
                    }
                    break;

                case "modals":
                    for (const file of componentFiles) {
                        const modal = require(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\components\\${folder}\\${file}`);
                        modals.set(modal.data.name, modal)
                    }
                    break;




                default:
                    break;
            }
        }
    }
}