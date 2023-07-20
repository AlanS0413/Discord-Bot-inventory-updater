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
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');
const { filteredValuesString } = require('../../commands/tools/updatestock.js')
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const CREDENTIALS_PATH = path.join(process.cwd(), '/key.json');
const TOKEN_PATH = path.join(process.cwd(), '/token.json');

module.exports = {
  data:{
    name: `updatestockvalue`
  },
  async execute(interaction, client) {
    const { GoogleAuth } = require('google-auth-library');
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
      credentials: JSON.parse((await fs.readFile(CREDENTIALS_PATH)).toString()),
    });

    async function updateCellValues(spreadsheetId) {
      const sheets = google.sheets({ version: 'v4', auth });
      const range = 'Active stock!A:E'; // Range to retrieve all columns
      spreadsheetId = '1MzxHodB_dBEX9E0mAJkznP8s5FL7bZtct4h1-lBxC-0';
      const { filteredValuesString } = require('../../commands/tools/updatestock.js');

      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = response.data.values;

        if (rows && rows.length) {
          let updatedRow = null;
          let rowIndex = null;

          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            // Convert the row array into a string
            const rowString = row.join(',\t\t\t\t\t\t');

            // Check if the entire row matches the filteredValuesString
            if (rowString === filteredValuesString) {
              updatedRow = [...row];

              // Only update the price if the input is not empty
              const productPrice = interaction.fields.getTextInputValue('productPrice');
              if (productPrice.trim() !== "") {
                updatedRow[1] = productPrice;  // update the price
              }

              updatedRow[2] = interaction.fields.getTextInputValue('productQuantity');  // update the quantity
              rowIndex = i;
              break;
            }
          }

          if (updatedRow) {
            const request = {
              spreadsheetId,
              resource: {
                valueInputOption: 'USER_ENTERED',
                data: [{
                  range: `Active stock!B${rowIndex+1}:C${rowIndex+1}`, // Update the range
                  values: [updatedRow.slice(1,3)], // Only pass the corresponding values for those columns
                }],
              },
            };

            sheets.spreadsheets.values.batchUpdate(request);

            await interaction.reply({
              content: `Stock quantity updated successfully. \n Values Updated: \n Product Quantity: ${interaction.fields.getTextInputValue('productQuantity')} \n Product Price: ${updatedRow[1]}`,
              ephemeral: true
            });
          } else {
            await interaction.reply({
              content: 'No matching cells found.',
            });
          }
        } else {
          console.log('No data found in the sheet.');
        }
      } catch (error) {
        console.error('Error occurred while updating cell values:', error);
      }
    }

    // Call the function to update the cell values
    await updateCellValues().catch(console.error);
  },
};
