const fs = require('fs')

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\events`)
        for (const folder of eventFolders) {
            const eventFiles = fs
                .readdirSync(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\events\\${folder}`)
                .filter((file) => file.endsWith(".js"))
            switch (folder) {
                case "client":
                    for (const file of eventFiles) {
                        const event = require(`C:\\Users\\Administrator\\Documents\\Discord Bots\\Discord-Bot-Sub\\events\\${folder}\\${file}`);
                        if (event.once) client.once(event.name, (...args) => event.execute(...args, client))
                        else client.on(event.name, (...args) => event.execute(...args, client))
                    }
                    break;




                default:
                    break;
            }
        }
    }
}