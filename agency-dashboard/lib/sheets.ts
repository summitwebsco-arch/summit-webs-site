import { google } from "googleapis";
import path from "path";

export type Lead = {
  business: string;
  contact: string;
  email: string;
  phone: string;
  status: string;
  lastContact: string;
  notes: string;
};

export type Client = {
  business: string;
  contact: string;
  retainerTier: string;
  mrr: string;
  status: string;
};

export type TaskRow = {
  task: string;
  owner: string;
  status: string;
  due: string;
};

export type CrmData = {
  leads: Lead[];
  clients: Client[];
  tasks: TaskRow[];
};

function rowsToObjects<T>(rows: string[][], mapper: (cells: string[]) => T): T[] {
  if (rows.length < 2) return [];
  return rows.slice(1).map((row) => mapper(row));
}

export async function getCrmData(): Promise<CrmData | null> {
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return null;

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "..", "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const [leadsRes, clientsRes, tasksRes] = await Promise.all([
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Leads!A:G",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Clients!A:E",
      }),
      sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: "Tasks!A:D",
      }),
    ]);

    const leads = rowsToObjects(leadsRes.data.values ?? [], (c) => ({
      business: c[0] ?? "",
      contact: c[1] ?? "",
      email: c[2] ?? "",
      phone: c[3] ?? "",
      status: c[4] ?? "",
      lastContact: c[5] ?? "",
      notes: c[6] ?? "",
    }));

    const clients = rowsToObjects(clientsRes.data.values ?? [], (c) => ({
      business: c[0] ?? "",
      contact: c[1] ?? "",
      retainerTier: c[2] ?? "",
      mrr: c[3] ?? "",
      status: c[4] ?? "",
    }));

    const tasks = rowsToObjects(tasksRes.data.values ?? [], (c) => ({
      task: c[0] ?? "",
      owner: c[1] ?? "",
      status: c[2] ?? "",
      due: c[3] ?? "",
    }));

    return { leads, clients, tasks };
  } catch (err) {
    console.error("Failed to load CRM data from Google Sheets:", err);
    return null;
  }
}
