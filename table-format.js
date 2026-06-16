const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const rgb = (r, g, b) => ({ red: r/255, green: g/255, blue: b/255 });

const BORDER_OUTER = { style: 'SOLID_MEDIUM', color: rgb(71, 85, 105) };   // slate-600
const BORDER_INNER = { style: 'SOLID',        color: rgb(203, 213, 225) }; // slate-300
const BORDER_HDR   = { style: 'SOLID_MEDIUM', color: rgb(255, 255, 255) }; // white line under header

// Draw complete table borders: medium outer frame + thin inner grid
function tableBorder(sid, r0, r1, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      top: BORDER_OUTER, bottom: BORDER_OUTER,
      left: BORDER_OUTER, right: BORDER_OUTER,
      innerHorizontal: BORDER_INNER,
      innerVertical:   BORDER_INNER,
    },
  };
}

// Bold white line under header row to separate it from data
function headerUnderline(sid, r, c0, c1) {
  return {
    updateBorders: {
      range: { sheetId:sid, startRowIndex:r, endRowIndex:r+1, startColumnIndex:c0, endColumnIndex:c1 },
      bottom: BORDER_HDR,
    },
  };
}

// Auto-resize all columns for a tab
function autoResize(sid, c0, c1) {
  return {
    autoResizeDimensions: {
      dimensions: { sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 },
    },
  };
}

// Force a column to a fixed width (after auto-resize, for fine-tuning)
const cw  = (sid, c0, c1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'COLUMNS', startIndex:c0, endIndex:c1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });
const rh  = (sid, r0, r1, px) => ({ updateDimensionProperties: { range:{ sheetId:sid, dimension:'ROWS',    startIndex:r0, endIndex:r1 }, properties:{ pixelSize:px }, fields:'pixelSize' } });

async function apply(sheets, id, reqs) {
  if (reqs.length) await sheets.spreadsheets.batchUpdate({ spreadsheetId:id, requestBody:{ requests:reqs } });
}

async function getTabs(sheets, id) {
  const m = await sheets.spreadsheets.get({ spreadsheetId:id });
  const t = {};
  m.data.sheets.forEach(s => { t[s.properties.title] = s.properties.sheetId; });
  return t;
}

// ── Portfolio ──────────────────────────────────────────────────────

async function doPortfolio(sheets, tabs) {

  // KEY — simple table: rows 4-9, cols 1-5
  const key = tabs['Key'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(key, 0, 8),
    tableBorder(key, 4, 10, 1, 6),
    headerUnderline(key, 4, 1, 6),
    rh(key, 0, 4, 6),   // tiny blank rows at top
    rh(key, 4, 5, 38),  // header
    rh(key, 5, 9, 30),  // data
    rh(key, 9, 10, 50), // notes
    cw(key, 0, 1, 14),  // keep col A thin
  ]);
  console.log('  Key ✓');

  // TOTAL PORTFOLIO OVERVIEW
  // Left table: rows 0-6, cols 0-2  |  Right table: rows 0-3, cols 4-7
  // Sector table: rows 9-13, cols 0-2
  const ov = tabs['Total Portfolio Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(ov, 0, 8),
    // Left panel: performance + type allocation as one connected table
    tableBorder(ov, 0, 7, 0, 3),
    headerUnderline(ov, 0, 0, 3),
    // Right panel: benchmark comparison
    tableBorder(ov, 0, 4, 4, 8),
    headerUnderline(ov, 0, 4, 8),
    // Sector table (separated by dark divider row)
    tableBorder(ov, 9, 14, 0, 3),
    headerUnderline(ov, 9, 0, 3),
    // Row heights
    rh(ov, 0, 1, 38),   // header
    rh(ov, 1, 4, 30),   // portfolio data
    rh(ov, 4, 5, 30),   // type sub-header
    rh(ov, 5, 7, 30),   // type data
    rh(ov, 7, 9, 5),    // thin dark divider
    rh(ov, 9, 10, 30),  // sector sub-header
    rh(ov, 10, 14, 30), // sector data
    // Sep column
    cw(ov, 3, 4, 10),
  ]);
  console.log('  Total Portfolio Overview ✓');

  // YEARLY OVERVIEW
  // 2025 table: rows 0-3, cols 0-2 and 4-7
  // 2026 table: rows 5-8, cols 0-2 and 4-7
  const yr = tabs['Yearly Overview'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(yr, 0, 8),
    tableBorder(yr, 0, 4, 0, 3), headerUnderline(yr, 0, 0, 3),
    tableBorder(yr, 0, 4, 4, 8), headerUnderline(yr, 0, 4, 8),
    tableBorder(yr, 5, 9, 0, 3), headerUnderline(yr, 5, 0, 3),
    tableBorder(yr, 5, 9, 4, 8), headerUnderline(yr, 5, 4, 8),
    rh(yr, 0, 1, 38), rh(yr, 1, 4, 30),
    rh(yr, 4, 5, 5),
    rh(yr, 5, 6, 38), rh(yr, 6, 9, 30),
    cw(yr, 3, 4, 10),
  ]);
  console.log('  Yearly Overview ✓');

  // CURRENT PORTFOLIO
  // Stocks: rows 0-21, cols 0-9  |  Options: rows 0-21, cols 11-22
  const cp = tabs['Current Portfolio'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(cp, 0, 22),
    tableBorder(cp, 0, 22, 0, 10),  headerUnderline(cp, 0, 0, 10),
    tableBorder(cp, 0, 22, 11, 23), headerUnderline(cp, 0, 11, 23),
    rh(cp, 0, 1, 38),
    rh(cp, 1, 4, 30),   // active data
    rh(cp, 4, 20, 26),  // placeholder rows
    rh(cp, 20, 21, 5),  // thin divider
    rh(cp, 21, 22, 34), // total row
    cw(cp, 10, 11, 10), // sep column
  ]);
  console.log('  Current Portfolio ✓');

  // PLANNED TRADES
  // Stocks: rows 0-14, cols 0-6  |  Options: rows 0-14, cols 8-13
  const pt = tabs['Planned Trades'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(pt, 0, 14),
    tableBorder(pt, 0, 15, 0, 7),  headerUnderline(pt, 0, 0, 7),
    tableBorder(pt, 0, 15, 8, 14), headerUnderline(pt, 0, 8, 14),
    rh(pt, 0, 1, 38),
    rh(pt, 1, 15, 28),
    cw(pt, 7, 8, 10),
  ]);
  console.log('  Planned Trades ✓');

  // TRADE HISTORY
  // Stocks: rows 0-20, cols 0-8  |  Options: rows 0-20, cols 10-16
  const th = tabs['Trade History'];
  await apply(sheets, PORTFOLIO_ID, [
    autoResize(th, 0, 17),
    tableBorder(th, 0, 21, 0, 9),  headerUnderline(th, 0, 0, 9),
    tableBorder(th, 0, 21, 10, 17), headerUnderline(th, 0, 10, 17),
    rh(th, 0, 1, 38),
    rh(th, 1, 10, 30),  // real trades
    rh(th, 10, 20, 8),  // collapsed empty rows
    rh(th, 20, 21, 34), // total
    cw(th, 9, 10, 10),
  ]);
  console.log('  Trade History ✓');
}

// ── Journal ────────────────────────────────────────────────────────

async function doJournal(sheets, tabs) {

  // SUMMARY
  const sm = tabs['Summary'];
  await apply(sheets, JOURNAL_ID, [
    autoResize(sm, 0, 5),
    // Stats table: col header (row 2) + metric rows (3-7)
    tableBorder(sm, 2, 8, 0, 5),
    headerUnderline(sm, 2, 0, 5),
    // R/R table (rows 9-11)
    tableBorder(sm, 9, 12, 0, 5),
    // Expectancy table (row 13)
    tableBorder(sm, 13, 14, 0, 5),
    rh(sm, 0, 1, 44),  // title
    rh(sm, 1, 2, 6),   // gap
    rh(sm, 2, 3, 34),  // col headers
    rh(sm, 3, 8, 30),  // metric rows
    rh(sm, 8, 9, 5),   // divider
    rh(sm, 9, 12, 30), // R/R rows
    rh(sm, 12, 13, 5), // divider
    rh(sm, 13, 14, 30),// expectancy
    rh(sm, 14, 15, 5), // divider
    rh(sm, 15, 17, 36),// notes
  ]);
  console.log('  Summary ✓');

  // TRADING TABS
  for (const [name, dataRows] of [['Backtesting', 80], ['Forward Testing', 4], ['Live Account', 9]]) {
    const sid = tabs[name];
    const end = dataRows + 1;
    await apply(sheets, JOURNAL_ID, [
      autoResize(sid, 0, 14),
      tableBorder(sid, 0, end, 0, 14),
      headerUnderline(sid, 0, 0, 14),
      rh(sid, 0, 1, 38),
      rh(sid, 1, end, 30),
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
  await doPortfolio(sheets, ptabs);

  console.log('Journal:');
  await doJournal(sheets, jtabs);

  console.log('\nAll done.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
