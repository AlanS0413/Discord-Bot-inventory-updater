const {
  SlashCommandBuilder
} = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {
  authenticate
} = require('@google-cloud/local-auth');
const {
  google
} = require('googleapis');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(process.cwd(), '/key.json');
const TOKEN_PATH = path.join(process.cwd(), '/token.json');

Object.defineProperty(String.prototype, 'capitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName('add')
    .setDescription('Adds Stock To Targeted Items Sheet')
    .addStringOption(option => option.setName('name').setDescription(`Product Name`).setRequired(true))
    .addStringOption(option => option.setName('style').setDescription(`Product Style Code`).setRequired(true))
    .addStringOption(option => option.setName('price').setDescription(`Product Price`).setRequired(true))
    .addStringOption(option => option.setName('size').setDescription(`Product Size`).setRequired(true))
    .addStringOption(option => option.setName('quantity').setDescription(`Product Quantity`).setRequired(true))
    .addStringOption(option => option.setName('pass_rate').setDescription(`Product Pass Rate`).setRequired(true))
    ,
  async execute(interaction, client) {

    const name = interaction.options.getString('name').capitalize();
    const style_code = interaction.options.getString('style');
    const price = interaction.options.getString("price");
    const size = interaction.options.getString('size');
    const quantity = interaction.options.getString('quantity');
    const pass_rate = interaction.options.getString('pass_rate');
    

    async function loadSavedCredentialsIfExist() {
      try {
        const content = await fs.readFile(TOKEN_PATH);
        const credentials = JSON.parse(content);
        return google.auth.fromJSON(credentials);
      } catch (err) {
        return null;
      }
    }

    async function saveCredentials(client) {
      const content = await fs.readFile(CREDENTIALS_PATH);
      const keys = JSON.parse(content);
      const key = keys.installed || keys.web;
      const payload = JSON.stringify({
        type: 'authorized_user',
        client_id: key.client_id,
        client_secret: key.client_secret,
        refresh_token: client.credentials.refresh_token,
      });
      await fs.writeFile(TOKEN_PATH, payload);
    }

    async function authorize() {
      let client = await loadSavedCredentialsIfExist();
      if (client) {
        return client;
      }
      client = await authenticate({
        scopes: SCOPES,
        keyfilePath: CREDENTIALS_PATH,
      });
      if (client.credentials) {
        await saveCredentials(client);
      }
      return client;
    }

    async function appendValues () {
      const authClient = await authorize();
      const {
        GoogleAuth
      } = require('google-auth-library');
      const {
        google
      } = require('googleapis');
      const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
        credentials: JSON.parse((await fs.readFile(CREDENTIALS_PATH)).toString()),
      });
      const request = {
        spreadsheetId: '1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0',

        range: `${interaction.user.username}!A2:F2`,

        valueInputOption: 'USER_ENTERED',

        insertDataOption: 'INSERT_ROWS',

        resource: {
          "majorDimension": "ROWS",
          "values": [[String(name), String(style_code), String(price), String(size), String(quantity), String(pass_rate)]]
        },

        auth: authClient,
      };
      const service = google.sheets({
        version: 'v4',
        auth
      });

      try {
        const response = (await service.spreadsheets.values.append(request)).data;
        console.log(JSON.stringify(response, null, 2));
      } catch (err) {
        console.error(err);
      }
    }
    console.log(interaction.user.username, "Username")
    appendValues()
    await interaction.reply({
      content: "Added",
      ephemeral: true

    });


  }
}