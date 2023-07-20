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

  module.exports = {
    data: new SlashCommandBuilder()
      .setName('createprofile')
      .setDescription('Creates a new profile')
      .addStringOption(option => option.setName('first_name').setDescription(`First Name`).setRequired(true))
      .addStringOption(option => option.setName('last_name').setDescription(`Last Name`).setRequired(true))
      .addStringOption(option => option.setName('email').setDescription(`Email Address`).setRequired(true))
      .addStringOption(option => option.setName('phone').setDescription(`Phone Number`).setRequired(true))
      .addStringOption(option => option.setName('street').setDescription(`Street Address`).setRequired(true))
      .addStringOption(option => option.setName('city').setDescription(`City`).setRequired(true))
      .addStringOption(option => option.setName('state').setDescription(`State / Region`).setRequired(true))
      .addStringOption(option => option.setName('zip').setDescription(`Zip Code`).setRequired(true))
      .addStringOption(option => option.setName('country').setDescription(`Country`).setRequired(true))
      ,
    async execute(interaction, client) {
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
        const sheetName = interaction.user.username.capitalize()
        const firstName = interaction.options.getString("first_name").capitalize()
        const lastName = interaction.options.getString("last_name").capitalize()
        const email = interaction.options.getString("email").capitalize()
        const phoneNumber = interaction.options.getString("phone")
        const streetName = interaction.options.getString("street")
        const city = interaction.options.getString("city").capitalize()
        const state = interaction.options.getString("state").capitalize()
        const zip = interaction.options.getString("zip")
        const country = interaction.options.getString("country").capitalize()

        async function createNewProfile () {
            const {
                GoogleAuth
              } = require('google-auth-library');
              const {
                google
              } = require('googleapis');
              const spreadsheetId = '1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0'
              const auth = new GoogleAuth({
                scopes: 'https://www.googleapis.com/auth/spreadsheets',
                credentials: JSON.parse((await fs.readFile(CREDENTIALS_PATH)).toString()),
              });
              const sheets = google.sheets({
                version: 'v4',
                auth
              });

            // Create a new sheet
            const createResponse = await sheets.spreadsheets.batchUpdate({
              auth: auth,
              spreadsheetId: spreadsheetId,
              resource: {
                requests: [
                  {
                    addSheet: {
                      properties: {
                        title: `${sheetName}`.capitalize(),
                        gridProperties: {
                          frozenRowCount: 1
                        }
                      }
                    }
                  }
                ]
              }
            });

            // Extract the sheetId of the new sheet from the response
            const newSheetId = createResponse.data.replies[0].addSheet.properties.sheetId;

            // Copy data from the first sheet to the new sheet
            const copyResponse = await sheets.spreadsheets.batchUpdate({
              auth: auth,
              spreadsheetId: '1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0',
              resource: {
                requests: [
                  {
                    copyPaste: {
                      source: {
                        sheetId: 448158935,
                        startRowIndex: 0,
                        endRowIndex: 1
                      },
                      destination: {
                        sheetId: `${newSheetId}`,
                        startRowIndex: 0,
                        endRowIndex: 1
                      },
                      pasteType: "PASTE_NORMAL"
                    }
                  }
                ]
              }
            });
            console.log(`Copied ${copyResponse} cells`);
            return { newSheetId };
        }
        async function addProfileInfo () {
            const spreadsheetId = '1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0'
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
                spreadsheetId: spreadsheetId,

                range: 'Subsection Credit Profiles!A:K',

                valueInputOption: 'USER_ENTERED',

                insertDataOption: 'INSERT_ROWS',

                resource: {
                    "majorDimension": "ROWS",
                    "values": [[String(sheetName), String(firstName), String(lastName), String(email), String(phoneNumber),
                        String(streetName), String(city), String(state), String(zip), String(country)]]
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
        authorize()
            .then(createNewProfile)
            .then(({newSheetId}) => {
                return addProfileInfo()
                    .then(() => {
                        return interaction.reply({
                            content: `Profile created for ${sheetName.capitalize()}\nYou can access your sheet at https://docs.google.com/spreadsheets/d/1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0/view#gid=${newSheetId}`,
                            ephemeral: false,
                        });
                    });
            })
            .catch(console.error);

    }
}
