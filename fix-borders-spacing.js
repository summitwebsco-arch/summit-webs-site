const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const OUTER  = { style: 'SOLID_MEDIUM', color: rgb(100, 116, 139) }; // slate-500 — table frame
const INNER  = { style: 'SOLID',        color: rgb(226, 232, 240) }; // slate-200 — grid lines
const HDR_LN = { style: 'SOLID_MEDIUM', color: rgb(255, 255, 255) }; // white     — under header
const NONE   = { style: 'NONE' };

// Draw a full bordered table: outer frame = medium, inner grid = thin
function table(sid, r0, r1, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      top: OUTER, bottom: OUTER, left: OUTER, right: OUTER,
      innerHorizontal: INNER,
      innerVertical:   INNER,
    },
  };
}

// Thick white line under header row to lift it off the data
function hdrLine(sid, r, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c0, endColumnIndex:c1 },
      bottom: HDR_LN,
    },
  };
}

// Column width / row height helpers
const cw = (sid, c0, c1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh = (sid, r0, r1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });

async function apply(sheets, spreadsheetId, requests) {
  await sheets.spreadsheets.batchUpdate({ spreadsheetId, requestBody:{ requests } });
}

async function getTabs(sheets, spreadsheetId) {
  const m = await sheets.spreadsheets.get({ spreadsheetId });
  const t = {};
  m.data.sheets.forEach(s => { t[s.properties.title] = s.properties.sheetId; });
  return t;
}

// ── Portfolio ──────────────────────────────────────────────────────

async function borderPortfolio(sheets, tabs) {

  // KEY
  await apply(sheets, PORTFOLIO_ID, [
    table(tabs['Key'], 4, 8, 1, 6),
    hdrLine(tabs['Key'], 4, 1, 6),
    rh(tabs['Key'], 0, 4, 6),
    rh(tabs['Key'], 4, 5, 36),
    rh(tabs['Key'], 5, 8, 28),
    rh(tabs['Key'], 8, 9, 6),
    rh(tabs['Key'], 9, 10, 52),
  ]);
  console.log('  Key ✓');

  // TOTAL PORTFOLIO OVERVIEW
  const ov = tabs['Total Portfolio Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    // Performance section — left and right panels
    table(ov, 0, 4, 0, 3),
    hdrLine(ov, 0, 0, 3),
    table(ov, 0, 4, 4, 8),
    hdrLine(ov, 0, 4, 8),
    // Type section
    table(ov, 4, 7, 0, 3),
    hdrLine(ov, 4, 0, 3),
    // Sector section
    table(ov, 9, 14, 0, 3),
    hdrLine(ov, 9, 0, 3),
    // Row heights
    rh(ov, 0, 1, 36),
    rh(ov, 1, 4, 28),
    rh(ov, 4, 5, 32),
    rh(ov, 5, 7, 28),
    rh(ov, 7, 9, 4),   // thin dark divider between sections
    rh(ov, 9, 10, 32),
    rh(ov, 10, 14, 28),
    // Column widths
    cw(ov, 0, 1, 190), cw(ov, 1, 2, 120), cw(ov, 2, 3, 120),
    cw(ov, 3, 4, 8),
    cw(ov, 4, 5, 130), cw(ov, 5, 6, 130), cw(ov, 6, 7, 140), cw(ov, 7, 8, 170),
  ]);
  console.log('  Total Portfolio Overview ✓');

  // YEARLY OVERVIEW
  const yr = tabs['Yearly Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    table(yr, 0, 4, 0, 3), hdrLine(yr, 0, 0, 3),
    table(yr, 0, 4, 4, 8), hdrLine(yr, 0, 4, 8),
    table(yr, 5, 9, 0, 3), hdrLine(yr, 5, 0, 3),
    table(yr, 5, 9, 4, 8), hdrLine(yr, 5, 4, 8),
    rh(yr, 0, 1, 36), rh(yr, 1, 4, 28),
    rh(yr, 4, 5, 4),
    rh(yr, 5, 6, 36), rh(yr, 6, 9, 28),
    cw(yr, 0, 1, 150), cw(yr, 1, 2, 130), cw(yr, 2, 3, 130),
    cw(yr, 3, 4, 8),
    cw(yr, 4, 5, 100), cw(yr, 5, 6, 120), cw(yr, 6, 7, 140), cw(yr, 7, 8, 170),
  ]);
  console.log('  Yearly Overview ✓');

  // CURRENT PORTFOLIO
  const cp = tabs['Current Portfolio'];
  await apply(sheets, PORTFOLIO_ID, [
    // Stocks section (rows 0-21, cols 0-9)
    table(cp, 0, 4,  0, 10), hdrLine(cp, 0, 0, 10),  // header + active rows
    table(cp, 4, 20, 0, 10),                           // placeholder rows
    table(cp, 21, 22, 0, 10),                          // total row
    // Options section (rows 0-21, cols 11-22)
    table(cp, 0, 4,  11, 23), hdrLine(cp, 0, 11, 23),
    table(cp, 4, 20, 11, 23),
    table(cp, 21, 22, 11, 23),
    // Row heights
    rh(cp, 0, 1, 36),
    rh(cp, 1, 4, 28),
    rh(cp, 4, 20, 22),
    rh(cp, 20, 21, 4),
    rh(cp, 21, 22, 32),
    // Column widths
    cw(cp, 0, 1, 200), cw(cp, 1, 2, 65),  cw(cp, 2, 3, 160), cw(cp, 3, 4, 88),
    cw(cp, 4, 5, 115), cw(cp, 5, 6, 100), cw(cp, 6, 7, 110), cw(cp, 7, 8, 100),
    cw(cp, 8, 9, 130), cw(cp, 9, 10, 120),
    cw(cp, 10, 11, 8),
    cw(cp, 11, 12, 100), cw(cp, 12, 13, 85),  cw(cp, 13, 14, 130),
    cw(cp, 14, 15, 90),  cw(cp, 15, 16, 65),  cw(cp, 16, 17, 90),  cw(cp, 17, 18, 110),
    cw(cp, 18, 19, 110), cw(cp, 19, 20, 110), cw(cp, 20, 21, 120), cw(cp, 21, 22, 110),
  ]);
  console.log('  Current Portfolio ✓');

  // PLANNED TRADES
  const pt = tabs['Planned Trades'];
  await apply(sheets, PORTFOLIO_ID, [
    table(pt, 0, 15, 0, 7),  hdrLine(pt, 0, 0, 7),
    table(pt, 0, 15, 8, 14), hdrLine(pt, 0, 8, 14),
    rh(pt, 0, 1, 36), rh(pt, 1, 15, 26),
    cw(pt, 0, 1, 200), cw(pt, 1, 2, 65),  cw(pt, 2, 3, 160), cw(pt, 3, 4, 130),
    cw(pt, 4, 5, 100), cw(pt, 5, 6, 110), cw(pt, 6, 7, 110),
    cw(pt, 7, 8, 8),
    cw(pt, 8, 9, 110), cw(pt, 9, 10, 90), cw(pt, 10, 11, 75),
    cw(pt, 11, 12, 100), cw(pt, 12, 13, 115), cw(pt, 13, 14, 120),
  ]);
  console.log('  Planned Trades ✓');

  // TRADE HISTORY
  const th = tabs['Trade History'];
  await apply(sheets, PORTFOLIO_ID, [
    // Stocks: active data rows (1-9)
    table(th, 0, 10, 0, 9), hdrLine(th, 0, 0, 9),
    // Stocks: padding rows collapsed into a thin band
    table(th, 10, 20, 0, 9),
    // Stocks: total row
    table(th, 20, 21, 0, 9),
    // Options: same structure
    table(th, 0, 10, 10, 17), hdrLine(th, 0, 10, 17),
    table(th, 10, 20, 10, 17),
    table(th, 20, 21, 10, 17),
    // Row heights — collapse the empty padding rows significantly
    rh(th, 0, 1, 36),
    rh(th, 1, 10, 28),
    rh(th, 10, 20, 6),  // collapse empty $0 rows to thin lines
    rh(th, 20, 21, 32),
    // Column widths
    cw(th, 0, 1, 220), cw(th, 1, 2, 65),  cw(th, 2, 3, 160), cw(th, 3, 4, 110),
    cw(th, 4, 5, 110), cw(th, 5, 6, 75),  cw(th, 6, 7, 120), cw(th, 7, 8, 150), cw(th, 8, 9, 100),
    cw(th, 9, 10, 8),
    cw(th, 10, 11, 100), cw(th, 11, 12, 85),  cw(th, 12, 13, 110),
    cw(th, 13, 14, 110), cw(th, 14, 15, 150), cw(th, 15, 16, 120), cw(th, 16, 17, 100),
  ]);
  console.log('  Trade History ✓');
}

// ── Journal ────────────────────────────────────────────────────────

async function borderJournal(sheets, tabs) {

  // SUMMARY
  const sm = tabs['Summary'];
  await apply(sheets, JOURNAL_ID, [
    // Title row (row 0): no border, just space
    // Column headers + all metrics in one table (rows 2-13)
    table(sm, 2, 8,  0, 5), hdrLine(sm, 2, 0, 5),  // header + counts/win rate
    table(sm, 9, 12, 0, 5),                           // R/R section
    table(sm, 13, 14, 0, 5),                          // Expectancy
    // Row heights
    rh(sm, 0, 1, 44),   // title
    rh(sm, 1, 2, 6),    // gap under title
    rh(sm, 2, 3, 32),   // column header
    rh(sm, 3, 8, 28),   // metric rows
    rh(sm, 8, 9, 4),    // divider
    rh(sm, 9, 12, 28),  // R/R rows
    rh(sm, 12, 13, 4),  // divider
    rh(sm, 13, 14, 28), // expectancy
    rh(sm, 14, 15, 4),  // divider
    rh(sm, 15, 17, 36), // notes
    // Column widths
    cw(sm, 0, 1, 185), cw(sm, 1, 2, 130), cw(sm, 2, 3, 140),
    cw(sm, 3, 4, 130), cw(sm, 4, 5, 130),
  ]);
  console.log('  Summary ✓');

  // TRADING TABS
  const tradingTabs = [
    ['Backtesting',     80],
    ['Forward Testing',  4],
    ['Live Account',     9],
  ];

  for (const [name, rows] of tradingTabs) {
    const sid = tabs[name];
    const end = rows + 1;
    await apply(sheets, JOURNAL_ID, [
      table(sid, 0, end, 0, 14),
      hdrLine(sid, 0, 0, 14),
      rh(sid, 0, 1, 36),
      rh(sid, 1, end, 28),
      // Column widths
      cw(sid, 0, 1, 75),   cw(sid, 1, 2, 100),  cw(sid, 2, 3, 75),
      cw(sid, 3, 4, 90),   cw(sid, 4, 5, 90),   cw(sid, 5, 6, 100),
      cw(sid, 6, 7, 100),  cw(sid, 7, 8, 100),  cw(sid, 8, 9, 100),
      cw(sid, 9, 10, 90),  cw(sid, 10, 11, 90), cw(sid, 11, 12, 80),
      cw(sid, 12, 13, 200), cw(sid, 13, 14, 130),
    ]);
    console.log(`  ${name} ✓`);
  }
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const [ptabs, jtabs] = await Promise.all([
    getTabs(sheets, PORTFOLIO_ID),
    getTabs(sheets, JOURNAL_ID),
  ]);

  console.log('Portfolio:');
  await borderPortfolio(sheets, ptabs);

  console.log('Journal:');
  await borderJournal(sheets, jtabs);

  console.log('\nDone.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
