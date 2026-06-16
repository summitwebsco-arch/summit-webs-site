const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

// Color palette
const COLORS = {
  win:       { bg: rgb(183, 225, 205), text: rgb(11, 83, 48)  },  // green
  loss:      { bg: rgb(244, 199, 195), text: rgb(134, 32, 23) },  // red
  breakeven: { bg: rgb(255, 232, 173), text: rgb(122, 81, 0)  },  // amber
  buy:       { bg: rgb(201, 218, 248), text: rgb(28, 69, 135) },  // blue
  sell:      { bg: rgb(252, 229, 205), text: rgb(159, 74, 0)  },  // orange
};

function conditionalRule(sheetId, colIndex, matchText, bg, text, numRows = 200) {
  return {
    addConditionalFormatRule: {
      rule: {
        ranges: [{
          sheetId,
          startRowIndex: 1,
          endRowIndex: numRows,
          startColumnIndex: colIndex,
          endColumnIndex: colIndex + 1,
        }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: matchText }] },
          format: {
            backgroundColor: bg,
            textFormat: { foregroundColor: text, bold: true },
          },
        },
      },
      index: 0,
    },
  };
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });

  const requests = [];

  for (const sheet of meta.data.sheets) {
    const name = sheet.properties.title;
    const sheetId = sheet.properties.sheetId;

    // Clear existing conditional format rules
    requests.push({ deleteConditionalFormatRule: { sheetId, index: 0 } });

    if (!['Backtesting', 'Forward Testing', 'Live Account'].includes(name)) continue;
    console.log(`Adding colors to: ${name}`);

    // Result column (K = index 10)
    requests.push(conditionalRule(sheetId, 10, 'Win',        COLORS.win.bg,       COLORS.win.text));
    requests.push(conditionalRule(sheetId, 10, 'Loss',       COLORS.loss.bg,      COLORS.loss.text));
    requests.push(conditionalRule(sheetId, 10, 'Break Even', COLORS.breakeven.bg, COLORS.breakeven.text));

    // Trade Side column (E = index 4)
    requests.push(conditionalRule(sheetId, 4, 'Buy',  COLORS.buy.bg,  COLORS.buy.text));
    requests.push(conditionalRule(sheetId, 4, 'Sell', COLORS.sell.bg, COLORS.sell.text));

    // Header: deep navy blue
    requests.push({
      repeatCell: {
        range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: {
          userEnteredFormat: {
            backgroundColor: rgb(26, 35, 126),
            textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 }, fontFamily: 'Arial', fontSize: 10 },
            horizontalAlignment: 'CENTER',
            verticalAlignment: 'MIDDLE',
          },
        },
        fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
      },
    });
  }

  // Run delete rules one at a time safely (ignore errors if none exist)
  // Instead, just send all non-delete requests and handle deletes separately
  const deleteReqs = [];
  const otherReqs = [];
  requests.forEach(r => {
    if (r.deleteConditionalFormatRule) deleteReqs.push(r);
    else otherReqs.push(r);
  });

  // Try deleting existing rules (may fail if none exist — that's fine)
  for (const sheet of meta.data.sheets) {
    const sheetId = sheet.properties.sheetId;
    try {
      const sheetInfo = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
      const s = sheetInfo.data.sheets.find(x => x.properties.sheetId === sheetId);
      const ruleCount = (s.conditionalFormats || []).length;
      const delRequests = [];
      for (let i = ruleCount - 1; i >= 0; i--) {
        delRequests.push({ deleteConditionalFormatRule: { sheetId, index: i } });
      }
      if (delRequests.length > 0) {
        await sheets.spreadsheets.batchUpdate({ spreadsheetId: SHEET_ID, requestBody: { requests: delRequests } });
      }
    } catch (_) {}
  }

  // Apply all formatting + conditional rules
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: otherReqs },
  });

  console.log('\nColors applied to all tabs.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
