const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: './credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const SHEET_ID = '1QAiTe-C6OU9-IQloQchp-8EKEiW8vNcWzt34Ikx93bs';

async function main() {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    includeGridData: false,
  });

  const deleteRequests = [];

  for (const sheet of meta.data.sheets) {
    const tables = sheet.tables || [];
    console.log(`Sheet "${sheet.properties.title}": ${tables.length} table(s)`);
    for (const table of tables) {
      console.log(`  Removing table ID: ${table.tableId}`);
      deleteRequests.push({ deleteTable: { tableId: table.tableId } });
    }
  }

  if (deleteRequests.length === 0) {
    console.log('No tables found via API. They may be named ranges or banded rows instead.');

    // Try removing banded ranges (alternating row colors) which also act like tables
    const bandedRequests = [];
    for (const sheet of meta.data.sheets) {
      const banded = sheet.bandedRanges || [];
      console.log(`Sheet "${sheet.properties.title}": ${banded.length} banded range(s)`);
      for (const b of banded) {
        console.log(`  Removing banded range ID: ${b.bandedRangeId}`);
        bandedRequests.push({ deleteBanding: { bandedRangeId: b.bandedRangeId } });
      }
    }

    if (bandedRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: bandedRequests },
      });
      console.log('Banded ranges removed.');
    } else {
      console.log('No banded ranges either. Check named ranges below:');
      const named = meta.data.namedRanges || [];
      named.forEach(n => console.log(' -', n.name, n.namedRangeId));
    }
    return;
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: deleteRequests },
  });

  console.log(`\nRemoved ${deleteRequests.length} table(s).`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
