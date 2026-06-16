const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';
const JOURNAL_ID   = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

const CURRENCY = { type: 'CURRENCY', pattern: '"$"#,##0.00' };
const PERCENT  = { type: 'PERCENT',  pattern: '0.00%' };
const NUM2     = { type: 'NUMBER',   pattern: '#,##0.00' };
const NUM4     = { type: 'NUMBER',   pattern: '#,##0.0000' };

function nf(sheetId, r0, r1, c0, c1, format) {
  return {
    repeatCell: {
      range: { sheetId, startRowIndex:r0, endRowIndex:r1, startColumnIndex:c0, endColumnIndex:c1 },
      cell: { userEnteredFormat: { numberFormat: format } },
      fields: 'userEnteredFormat.numberFormat',
    },
  };
}

async function getTabMap(sheets, spreadsheetId) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const m = {};
  meta.data.sheets.forEach(s => { m[s.properties.title] = s.properties.sheetId; });
  return m;
}

async function fixPortfolio(sheets) {
  const tabs = await getTabMap(sheets, PORTFOLIO_ID);
  const requests = [];

  // ── Total Portfolio Overview ─────────────────────────────────
  const ov = tabs['Total Portfolio Overview'];
  requests.push(
    // Portfolio block (rows 1-3): starting $, amount, P/L $, current $, change %, benchmark %
    nf(ov, 1, 4, 0, 1, CURRENCY),   // A: Starting Amount
    nf(ov, 1, 4, 1, 2, CURRENCY),   // B: Amount
    nf(ov, 1, 4, 2, 3, CURRENCY),   // C: P/L $
    nf(ov, 1, 4, 5, 6, CURRENCY),   // F: Current Amount
    nf(ov, 1, 4, 6, 7, PERCENT),    // G: Increase/Decrease %
    nf(ov, 1, 4, 7, 8, PERCENT),    // H: Benchmark %
    // Type block (rows 5-6): amount, percent
    nf(ov, 5, 7, 1, 2, CURRENCY),   // B: Amount
    nf(ov, 5, 7, 2, 3, PERCENT),    // C: Percent
    // Sector block (rows 10-13): purchase value, percent
    nf(ov, 10, 14, 1, 2, CURRENCY), // B: Purchase Value
    nf(ov, 10, 14, 2, 3, PERCENT),  // C: Percent
  );

  // ── Yearly Overview ──────────────────────────────────────────
  const yr = tabs['Yearly Overview'];
  // 2025 block: rows 1-3 | 2026 block: rows 6-8
  for (const [r0, r1] of [[1,4],[6,9]]) {
    requests.push(
      nf(yr, r0, r1, 0, 1, CURRENCY),  // A: Starting Amount
      nf(yr, r0, r1, 1, 2, CURRENCY),  // B: EOY Amount
      nf(yr, r0, r1, 2, 3, CURRENCY),  // C: P/L $
      nf(yr, r0, r1, 5, 6, CURRENCY),  // F: Asset Price
      nf(yr, r0, r1, 6, 7, PERCENT),   // G: P/L %
      nf(yr, r0, r1, 7, 8, PERCENT),   // H: Benchmark %
    );
  }

  // ── Current Portfolio ────────────────────────────────────────
  const cp = tabs['Current Portfolio'];
  requests.push(
    // Stocks (cols A-J, data rows 1-21)
    nf(cp, 1, 22, 4, 5, CURRENCY),   // E: Purchase Value
    nf(cp, 1, 22, 5, 6, CURRENCY),   // F: Share Price
    nf(cp, 1, 22, 6, 7, CURRENCY),   // G: Market Value
    nf(cp, 1, 22, 7, 8, NUM4),       // H: Shares Owned
    nf(cp, 1, 22, 8, 9, CURRENCY),   // I: Unrealized Gain $
    nf(cp, 1, 22, 9, 10, PERCENT),   // J: Unrealized Gain %
    // Options (cols L-V, indices 11-21)
    nf(cp, 1, 22, 12, 13, NUM2),     // M: Contracts
    nf(cp, 1, 22, 13, 14, CURRENCY), // N: Contract Price
    nf(cp, 1, 22, 16, 17, CURRENCY), // Q: Strike Price
    nf(cp, 1, 22, 18, 19, CURRENCY), // S: Purchase Value
    nf(cp, 1, 22, 19, 20, CURRENCY), // T: Market Value
    nf(cp, 1, 22, 20, 21, CURRENCY), // U: Unrealized Gain $
    nf(cp, 1, 22, 21, 22, PERCENT),  // V: Unrealized Gain %
    // Total row (index 21): percent and currency
    nf(cp, 21, 22, 2, 3, PERCENT),   // C: stock gain %
    nf(cp, 21, 22, 4, 5, CURRENCY),  // E: stock gain $
    nf(cp, 21, 22, 13, 14, PERCENT), // N: option gain %
    nf(cp, 21, 22, 15, 16, CURRENCY),// P: option gain $
  );

  // ── Planned Trades ───────────────────────────────────────────
  const pt = tabs['Planned Trades'];
  requests.push(
    nf(pt, 1, 20, 3, 4, CURRENCY),   // D: Planned Purchase Value
    nf(pt, 1, 20, 4, 5, CURRENCY),   // E: Share Price
    nf(pt, 1, 20, 5, 6, NUM4),       // F: Planned Shares
    nf(pt, 1, 20, 13, 14, CURRENCY), // N: Options Planned Value
  );

  // ── Trade History ────────────────────────────────────────────
  const th = tabs['Trade History'];
  requests.push(
    // Stocks (cols A-I)
    nf(th, 1, 21, 3, 4, CURRENCY),   // D: Price Bought
    nf(th, 1, 21, 4, 5, CURRENCY),   // E: Price Sold
    nf(th, 1, 21, 5, 6, NUM4),       // F: Shares
    nf(th, 1, 21, 6, 7, CURRENCY),   // G: Purchase Value
    nf(th, 1, 21, 8, 9, CURRENCY),   // I: P/L $
    // Options (cols K-Q, indices 10-16)
    nf(th, 1, 21, 11, 12, NUM2),     // L: Contracts
    nf(th, 1, 21, 12, 13, CURRENCY), // M: Price Bought
    nf(th, 1, 21, 13, 14, CURRENCY), // N: Price Sold
    nf(th, 1, 21, 15, 16, CURRENCY), // P: Purchase Value
    nf(th, 1, 21, 16, 17, CURRENCY), // Q: P/L $
    // Options total row (index 16)
    nf(th, 16, 17, 12, 13, PERCENT), // M: options gain %
    nf(th, 16, 17, 14, 15, CURRENCY),// O: options gain $
    // Stocks total row (index 20)
    nf(th, 20, 21, 2, 3, PERCENT),   // C: stocks gain %
    nf(th, 20, 21, 4, 5, CURRENCY),  // E: stocks gain $
  );

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: PORTFOLIO_ID, requestBody: { requests } });
  console.log('Portfolio: number formats applied.');
}

async function fixJournal(sheets) {
  const tabs = await getTabMap(sheets, JOURNAL_ID);
  const requests = [];

  const sm = tabs['Summary'];
  requests.push(
    // Win Rate row (index 7): cols B-E as percent
    nf(sm, 7, 8, 1, 5, PERCENT),
    // Numeric stat rows: 2 decimal places
    nf(sm, 3, 7, 1, 5, NUM2),   // Total/Wins/Losses/BreakEven
    nf(sm, 9, 12, 1, 5, NUM2),  // Avg R/R rows
    nf(sm, 11, 12, 1, 5, NUM2), // Total P&L
    nf(sm, 13, 14, 1, 5, NUM2), // Expectancy
  );

  // Trading tabs: Risk/Reward (col J=9) and P&L (col L=11) → 2 decimal
  for (const tab of ['Backtesting', 'Forward Testing', 'Live Account']) {
    const sid = tabs[tab];
    if (!sid) continue;
    requests.push(
      nf(sid, 1, 200, 9,  10, NUM2), // J: Risk/Reward
      nf(sid, 1, 200, 11, 12, NUM2), // L: P&L (R)
    );
  }

  await sheets.spreadsheets.batchUpdate({ spreadsheetId: JOURNAL_ID, requestBody: { requests } });
  console.log('Journal: number formats applied.');
}

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await fixPortfolio(sheets);
  await fixJournal(sheets);

  console.log('\nAll number formats fixed.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
