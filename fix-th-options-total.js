const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const OUTER     = { style: 'SOLID_MEDIUM', color: rgb(100, 116, 139) };
const INNER     = { style: 'SOLID',        color: rgb(226, 232, 240) };
const HDR_LINE  = { style: 'SOLID_MEDIUM', color: rgb(255, 255, 255) };
const NONE      = { style: 'NONE' };

const HDR_BG    = rgb(30,  41,  59);   // slate-800 — header bg
const TOTAL_BG  = rgb(51,  65,  85);   // slate-700 — total row bg

const rh = (sid, r0, r1, px) => ({
  updateDimensionProperties: {
    range: { sheetId: sid, dimension: 'ROWS', startIndex: r0, endIndex: r1 },
    properties: { pixelSize: px },
    fields: 'pixelSize',
  },
});

function fillRow(sid, r, c0, c1, color) {
  return {
    repeatCell: {
      range: { sheetId: sid, startRowIndex: r, endRowIndex: r+1, startColumnIndex: c0, endColumnIndex: c1 },
      cell: { userEnteredFormat: { backgroundColor: color } },
      fields: 'userEnteredFormat.backgroundColor',
    },
  };
}

function clearFormatRow(sid, r, c0, c1) {
  return {
    repeatCell: {
      range: { sheetId: sid, startRowIndex: r, endRowIndex: r+1, startColumnIndex: c0, endColumnIndex: c1 },
      cell: { userEnteredFormat: { backgroundColor: rgb(255,255,255), textFormat: { bold: false, foregroundColor: rgb(15,23,42) } } },
      fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat',
    },
  };
}

function boldWhite(sid, r, c0, c1) {
  return {
    repeatCell: {
      range: { sheetId: sid, startRowIndex: r, endRowIndex: r+1, startColumnIndex: c0, endColumnIndex: c1 },
      cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: rgb(255,255,255) } } },
      fields: 'userEnteredFormat.textFormat',
    },
  };
}

function tableBorder(sid, r0, r1, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      top: OUTER, bottom: OUTER, left: OUTER, right: OUTER,
      innerHorizontal: INNER,
      innerVertical:   INNER,
    },
  };
}

function hdrLine(sid, r, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId: sid, startRowIndex: r, endRowIndex: r+1, startColumnIndex: c0, endColumnIndex: c1 },
      bottom: HDR_LINE,
    },
  };
}

function clearBorder(sid, r0, r1, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      top: NONE, bottom: NONE, left: NONE, right: NONE,
      innerHorizontal: NONE,
      innerVertical:   NONE,
    },
  };
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: PORTFOLIO_ID });
  const th = meta.data.sheets.find(s => s.properties.title === 'Trade History').properties.sheetId;

  // Step 1: Move options total data from row 16 to row 20 (align with stocks total)
  // Options total currently at row idx 16, cols K-O (indices 10-14):
  //   "Total Gain:", "Percent -", value, "Amount -", value
  // We read it and write to row idx 20 in the same columns.

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!K17:O17',  // row idx 16 = sheet row 17
  });
  const optionsTotalValues = (readRes.data.values || [[]])[0];
  console.log('Options total values at row 16:', optionsTotalValues);

  // Write options total to row 20 (sheet row 21), cols K-O
  await sheets.spreadsheets.values.update({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!K21:O21',  // row idx 20 = sheet row 21
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [optionsTotalValues] },
  });

  // Clear the old options total from row 16
  await sheets.spreadsheets.values.clear({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!K17:O17',
  });

  // Step 2: Fix formatting
  const requests = [
    // Revert the bad row height fix — restore all padding rows to 8px, total to 38px
    rh(th, 10, 20, 8),    // all collapsed empty rows (10-19)
    rh(th, 20, 21, 38),   // total row (now has BOTH stocks + options totals)

    // Clear stale styling from old options total position (row 16)
    clearFormatRow(th, 16, 10, 17),

    // Style the total row (row 20) for the options section
    fillRow(th, 20, 10, 17, TOTAL_BG),
    boldWhite(th, 20, 10, 17),

    // Redraw full table borders for both sections
    // Stocks section
    tableBorder(th, 0, 10, 0, 9),
    hdrLine(th, 0, 0, 9),
    tableBorder(th, 10, 20, 0, 9),
    tableBorder(th, 20, 21, 0, 9),
    // Options section
    tableBorder(th, 0, 10, 10, 17),
    hdrLine(th, 0, 10, 17),
    tableBorder(th, 10, 20, 10, 17),
    tableBorder(th, 20, 21, 10, 17),
  ];

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: PORTFOLIO_ID,
    requestBody: { requests },
  });

  console.log('Done — options total moved to row 20, aligned with stocks total.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
