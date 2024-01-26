const {
  SlashCommandBuilder,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle
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


const modal = new ModalBuilder()
    .setCustomId('updatestockvalue')
    .setTitle(`Update Stock`);

const productQuantity = new TextInputBuilder()
    .setCustomId('productQuantity')
    .setLabel(`Product Quantity`)
    .setRequired(true)
    .setStyle(TextInputStyle.Short);

const productPrice = new TextInputBuilder()
    .setCustomId('productPrice')
    .setLabel(`Product Price`)
    .setRequired(false)
    .setStyle(TextInputStyle.Short);


const firstActionRow = new ActionRowBuilder().addComponents(productQuantity);
const secondActionRow = new ActionRowBuilder().addComponents(productPrice);
modal.addComponents(firstActionRow, secondActionRow);

const editButton = new ButtonBuilder()
  .setCustomId('updatevalue')
  .setLabel('Update Inventory')
  .setStyle(ButtonStyle.Primary);
const row = new ActionRowBuilder()
  .addComponents(editButton);


module.exports = {
  data: new SlashCommandBuilder()
    .setName('update')
    .setDescription('Updates Stock Counts in Active Stock Sheet')
    .addStringOption(option => option.setName('name').setDescription(`Name of Item to Update`).setRequired(true))
    .addStringOption(option => option.setName('size').setDescription(`Size of Item to Update`))
    .addStringOption(option => option.setName('stylecode').setDescription(`Style Code of Item to Update`)),
  async execute(interaction) {
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
    async function batchGetValues(spreadsheetId, _ranges) {
      const {
        GoogleAuth
      } = require('google-auth-library');
      const {
        google
      } = require('googleapis');
      _ranges = 'sheet_name!A2:E2'
      spreadsheetId = 'sheet_id'
      const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
        credentials: JSON.parse((await fs.readFile(CREDENTIALS_PATH)).toString()),
      });

      const service = google.sheets({
        version: 'v4',
        auth
      });
      let ranges = [
        'Active stock!A:E'
      ];
      try {
        const result = await service.spreadsheets.values.batchGet({
          spreadsheetId,
          ranges,
        });
        for (let i = 0; i < result.data.valueRanges.length; i++) {
          const values = result.data.valueRanges[i].values;
          const searchStringName = interaction.options.getString("name").capitalize()
          const searchStringSize = interaction.options.getString("size")
          const searchStringCode = interaction.options.getString("stylecode")


          if (values && values.length) {
            const filteredValues = values.filter((value) => {
              const itemName = value[0];
              const itemSize = value[3];
              const itemCode = value[4];

              // Check if at least three out of five information match
              let matchCount = 0;
              if (itemName === searchStringName) matchCount++;
              if (itemSize === searchStringSize) matchCount++;
              if (itemCode === searchStringCode) matchCount++;

              return matchCount >= 2;
            });

            if (filteredValues.length > 0) {
              const filteredValuesString = filteredValues.map((value, index) => {
                return value.join(',\t\t\t\t\t\t');
              }).join('\n');

              module.exports.filteredValuesString = filteredValuesString;

              const firstLine = values[0].join(', \t');
              await interaction.reply({
                content: firstLine + '\n' + filteredValuesString,
                ephemeral: true,
                components: [row]
              })

            } else {
              await interaction.reply({
                content: "No Matching Values",
                ephemeral: true
              });
            }
          } else {
            await interaction.reply({
              content: "No values found in this range.",
              ephemeral: true
            });
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    authorize().then(batchGetValues).catch(console.error);
  },
  modal: modal,
}
