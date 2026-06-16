const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const PORTFOLIO_ID = '197qkXcwXKHJ0jvAHTYa7LIEJxOedGKl7XwQfboDjzoc';

const rh = (sid, r0, r1, px) => ({
  updateDimensionProperties: {
    range: { sheetId: sid, dimension: 'ROWS', startIndex: r0, endIndex: r1 },
    properties: { pixelSize: px },
    fields: 'pixelSize',
  },
});

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({ spreadsheetId: PORTFOLIO_ID });
  const tabs = {};
  meta.data.sheets.forEach(s => { tabs[s.properties.title] = s.properties.sheetId; });

  const requests = [];

  // KEY
  const key = tabs['Key'];
  requests.push(
    rh(key, 4, 5, 42),   // header
    rh(key, 5, 9, 35),   // data
    rh(key, 9, 10, 55),  // notes
  );

  // TOTAL PORTFOLIO OVERVIEW
  const ov = tabs['Total Portfolio Overview'];
  requests.push(
    rh(ov, 0, 1, 42),    // header
    rh(ov, 1, 4, 35),    // performance data
    rh(ov, 4, 5, 35),    // type sub-header
    rh(ov, 5, 7, 35),    // type data
    rh(ov, 7, 9, 5),     // thin dark divider — keep tiny
    rh(ov, 9, 10, 35),   // sector sub-header
    rh(ov, 10, 14, 35),  // sector data
  );

  // YEARLY OVERVIEW
  const yr = tabs['Yearly Overview'];
  requests.push(
    rh(yr, 0, 1, 42),
    rh(yr, 1, 4, 35),
    rh(yr, 4, 5, 5),     // thin divider
    rh(yr, 5, 6, 42),
    rh(yr, 6, 9, 35),
  );

  // CURRENT PORTFOLIO
  const cp = tabs['Current Portfolio'];
  requests.push(
    rh(cp, 0, 1, 42),    // header
    rh(cp, 1, 4, 35),    // active data
    rh(cp, 4, 20, 28),   // placeholder rows
    rh(cp, 20, 21, 5),   // thin divider
    rh(cp, 21, 22, 38),  // total row
  );

  // PLANNED TRADES
  const pt = tabs['Planned Trades'];
  requests.push(
    rh(pt, 0, 1, 42),
    rh(pt, 1, 15, 35),
  );

  // TRADE HISTORY
  const th = tabs['Trade History'];
  requests.push(
    rh(th, 0, 1, 42),    // header
    rh(th, 1, 10, 35),   // real trades
    rh(th, 10, 20, 8),   // collapsed empty rows
    rh(th, 20, 21, 38),  // total
  );

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: PORTFOLIO_ID,
    requestBody: { requests },
  });

  console.log('Row heights updated on all portfolio tabs.');
}

main().catch(e => { console.error(e.message); process.exit(1); });
