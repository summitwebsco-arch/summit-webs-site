const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

// ── Design system (matches clean-format.js exactly) ───────────────
const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const D = {
  hdrGreen:  rgb(20, 83, 45),
  hdrBlue:   rgb(30, 58, 138),
  hdrDark:   rgb(15, 23, 42),
  hdrWhite:  { red:1, green:1, blue:1 },
  white:     { red:1, green:1, blue:1 },
  empty:     rgb(248, 250, 252),
  totalBg:   rgb(241, 245, 249),
  border:    rgb(226, 232, 240),
  textDark:  rgb(15, 23, 42),
  textMuted: rgb(100, 116, 139),
  sepCol:    rgb(15, 23, 42),
  posBg:     rgb(240, 253, 244),
  posText:   rgb(21, 128, 61),
  negBg:     rgb(254, 242, 242),
  negText:   rgb(185, 28, 28),
};

const FONT = { fontFamily: 'Arial', fontSize: 10 };
const CURRENCY = { type:'CURRENCY', pattern:'"$"#,##0.00' };
const PERCENT  = { type:'PERCENT',  pattern:'0.00%' };
const NUM2     = { type:'NUMBER',   pattern:'#,##0.00' };
const NUM4     = { type:'NUMBER',   pattern:'#,##0.0000' };

// Row structure: 50 data/padding rows + total at row 50
const DATA_END  = 10;  // real trades end (rows 1-9)
const PAD_END   = 50;  // empty padding ends (rows 10-49)
const TOTAL_ROW = 50;  // total row index

const cell = (sid, r0, r1, c0, c1, fmt, fields) => ({
  repeatCell: {
    range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
    cell: { userEnteredFormat: fmt },
    fields,
  },
});

const cw  = (sid, c0, c1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh  = (sid, r0, r1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const frz = (sid, rows=1)     => ({ updateSheetProperties: { properties:{ sheetId:sid, gridProperties:{ frozenRowCount:rows } }, fields:'gridProperties.frozenRowCount' } });

const base = (sid) => cell(sid, 0, 500, 0, 30, {
  backgroundColor: D.white,
  textFormat: { ...FONT, bold:false, foregroundColor:D.textDark },
  verticalAlignment: 'MIDDLE',
  wrapStrategy: 'CLIP',
  horizontalAlignment: 'LEFT',
  borders: {},
}, 'userEnteredFormat');

const hdr = (sid, r, c0, c1, bg) => cell(sid, r, r+1, c0, c1, {
  backgroundColor: bg,
  textFormat: { ...FONT, bold:true, foregroundColor:D.hdrWhite },
  horizontalAlignment: 'CENTER',
  verticalAlignment: 'MIDDLE',
}, 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)');

const dataRows = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  backgroundColor: D.white,
  borders: { bottom: { style:'SOLID', color:D.border } },
}, 'userEnteredFormat(backgroundColor,borders)');

const emptyRows = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, {
  backgroundColor: D.empty,
  borders: { bottom: { style:'SOLID', color:D.border } },
  textFormat: { ...FONT, foregroundColor:D.textMuted },
}, 'userEnteredFormat(backgroundColor,borders,textFormat)');

const totalRow = (sid, r, c0, c1) => cell(sid, r, r+1, c0, c1, {
  backgroundColor: D.totalBg,
  textFormat: { ...FONT, bold:true, foregroundColor:D.textDark },
  borders: {
    top:    { style:'SOLID_MEDIUM', color:rgb(148,163,184) },
    bottom: { style:'SOLID_MEDIUM', color:rgb(148,163,184) },
  },
}, 'userEnteredFormat(backgroundColor,textFormat,borders)');

const sepColumn = (sid, col, r0, r1) => cell(sid, r0, r1, col, col+1, {
  backgroundColor: D.sepCol,
}, 'userEnteredFormat.backgroundColor');

const right  = (sid, r0, r1, c0, c1) => cell(sid, r0, r1, c0, c1, { horizontalAlignment:'RIGHT'  }, 'userEnteredFormat.horizontalAlignment');
const nf     = (sid, r0, r1, c0, c1, fmt) => cell(sid, r0, r1, c0, c1, { numberFormat:fmt }, 'userEnteredFormat.numberFormat');

const plCondText = (sid, r0, r1, col) => [
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_NOT_CONTAINS', values:[{ userEnteredValue:'-' }] }, format:{ backgroundColor:D.posBg, textFormat:{ foregroundColor:D.posText, bold:true } } } }, index:0 } },
  { addConditionalFormatRule: { rule: { ranges:[{ sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:col, endColumnIndex:col+1 }], booleanRule: { condition:{ type:'TEXT_CONTAINS',     values:[{ userEnteredValue:'-' }] }, format:{ backgroundColor:D.negBg, textFormat:{ foregroundColor:D.negText, bold:true } } } }, index:0 } },
];

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: PORTFOLIO_ID });
  const th = meta.data.sheets.find(s => s.properties.title === 'Trade History').properties.sheetId;

  // Step 1: Move total row from idx 20 → idx 50 (sheet rows 21 → 51)
  const totalRes = await sheets.spreadsheets.values.get({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!A21:Q21',
  });
  const totalData = (totalRes.data.values || [[]])[0];
  console.log('Total row data:', totalData);

  await sheets.spreadsheets.values.update({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!A51:Q51',
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [totalData] },
  });
  await sheets.spreadsheets.values.clear({
    spreadsheetId: PORTFOLIO_ID,
    range: 'Trade History!A21:Q21',
  });
  console.log('Total row moved from row 20 to row 50.');

  // Step 2: Reset conditional formats
  const fresh = await sheets.spreadsheets.get({ spreadsheetId: PORTFOLIO_ID });
  const thSheet = fresh.data.sheets.find(s => s.properties.sheetId === th);
  const resetReqs = [];
  (thSheet?.conditionalFormats || []).forEach(() =>
    resetReqs.push({ deleteConditionalFormatRule: { sheetId: th, index: 0 } })
  );
  if (resetReqs.length) {
    await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests: resetReqs } });
    console.log(`Cleared ${resetReqs.length} conditional format rule(s).`);
  }

  // Step 3: Apply full formatting matching the design system
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: PORTFOLIO_ID,
    requestBody: {
      requests: [
        // Base reset
        base(th),

        // Headers: green for stocks (cols 0-8), blue for options (cols 10-16)
        hdr(th, 0, 0, 9,  D.hdrGreen),
        hdr(th, 0, 10, 17, D.hdrBlue),

        // Dark separator column between sections
        sepColumn(th, 9, 0, TOTAL_ROW + 1),

        // Real trade data rows (rows 1-9)
        dataRows(th, 1, DATA_END, 0, 9),
        dataRows(th, 1, DATA_END, 10, 17),

        // Empty placeholder rows (rows 10-49)
        emptyRows(th, DATA_END, PAD_END, 0, 9),
        emptyRows(th, DATA_END, PAD_END, 10, 17),

        // Total row (row 50)
        totalRow(th, TOTAL_ROW, 0, 9),
        totalRow(th, TOTAL_ROW, 10, 17),

        // Right-align number columns
        right(th, 1, TOTAL_ROW + 1, 3, 9),
        right(th, 1, TOTAL_ROW + 1, 11, 17),

        // Number formats — stocks
        nf(th, 1, TOTAL_ROW + 1, 3, 4, CURRENCY),  // Price Bought
        nf(th, 1, TOTAL_ROW + 1, 4, 5, CURRENCY),  // Price Sold
        nf(th, 1, TOTAL_ROW + 1, 5, 6, NUM4),       // Shares
        nf(th, 1, TOTAL_ROW + 1, 6, 7, CURRENCY),  // Purchase Value
        nf(th, 1, DATA_END,      8, 9, CURRENCY),   // P/L (data rows only)
        // Number formats — options
        nf(th, 1, TOTAL_ROW + 1, 11, 12, NUM2),    // Contracts
        nf(th, 1, TOTAL_ROW + 1, 12, 13, CURRENCY),// Price Bought
        nf(th, 1, TOTAL_ROW + 1, 13, 14, CURRENCY),// Price Sold
        nf(th, 1, TOTAL_ROW + 1, 15, 16, CURRENCY),// Purchase Value
        nf(th, 1, DATA_END,      16, 17, CURRENCY), // P/L (data rows only)
        // Total row number formats
        nf(th, TOTAL_ROW, TOTAL_ROW + 1, 2, 3, PERCENT),  // stocks percent
        nf(th, TOTAL_ROW, TOTAL_ROW + 1, 4, 5, CURRENCY), // stocks amount
        nf(th, TOTAL_ROW, TOTAL_ROW + 1, 12, 13, PERCENT),// options percent
        nf(th, TOTAL_ROW, TOTAL_ROW + 1, 14, 15, CURRENCY),// options amount

        // Row heights
        rh(th, 0, 1,        34),  // header
        rh(th, 1, DATA_END, 28),  // real trade rows
        rh(th, DATA_END, PAD_END, 10), // empty padding (thin)
        rh(th, TOTAL_ROW, TOTAL_ROW + 1, 32), // total

        // Freeze header row
        frz(th),

        // Column widths
        cw(th, 0, 1, 220), cw(th, 1, 2, 65),  cw(th, 2, 3, 160),
        cw(th, 3, 4, 110), cw(th, 4, 5, 110), cw(th, 5, 6, 75),
        cw(th, 6, 7, 120), cw(th, 7, 8, 150), cw(th, 8, 9, 100),
        cw(th, 9, 10, 10),
        cw(th, 10, 11, 100), cw(th, 11, 12, 85),
        cw(th, 12, 13, 110), cw(th, 13, 14, 110),
        cw(th, 14, 15, 150), cw(th, 15, 16, 120), cw(th, 16, 17, 100),
      ],
    },
  });
  console.log('Formatting applied.');

  // Step 4: Add P/L conditional formatting (after base formatting)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: PORTFOLIO_ID,
    requestBody: {
      requests: [
        ...plCondText(th, 1, TOTAL_ROW + 1, 8),   // stocks P/L col I
        ...plCondText(th, 1, TOTAL_ROW + 1, 16),  // options P/L col Q
      ],
    },
  });

  console.log('Done — Trade History extended to 50 rows with consistent formatting.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
