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

// Use globalThis so the cache survives Next.js hot-module-replacement in dev.
const g = globalThis as typeof globalThis & {
  _crmCache?: { data: CrmData | null; ts: number };
  _crmAuth?:  InstanceType<typeof google.auth.GoogleAuth>;
};

const CACHE_TTL = 60_000; // 1 minute

function getAuth() {
  if (!g._crmAuth) {
    g._crmAuth = new google.auth.GoogleAuth({
      keyFile: path.join(process.cwd(), "..", "credentials.json"),
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
  }
  return g._crmAuth;
}

function rowsToObjects<T>(rows: string[][], mapper: (cells: string[]) => T): T[] {
  if (rows.length < 2) return [];
  return rows.slice(1).map((row) => mapper(row));
}

export function invalidateCrmCache() {
  g._crmCache = undefined;
}

export async function getCrmData(): Promise<CrmData | null> {
  if (g._crmCache && Date.now() - g._crmCache.ts < CACHE_TTL) {
    return g._crmCache.data;
  }

  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (!sheetId) return null;

  try {
    const sheets = google.sheets({ version: "v4", auth: getAuth() });

    const [leadsRes, clientsRes, tasksRes] = await Promise.all([
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Leads!A:G" }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Clients!A:E" }),
      sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: "Tasks!A:D" }),
    ]);

    const leads = rowsToObjects(leadsRes.data.values ?? [], (c) => ({
      business:    c[0] ?? "",
      contact:     c[1] ?? "",
      email:       c[2] ?? "",
      phone:       c[3] ?? "",
      status:      c[4] ?? "",
      lastContact: c[5] ?? "",
      notes:       c[6] ?? "",
    }));

    const clients = rowsToObjects(clientsRes.data.values ?? [], (c) => ({
      business:     c[0] ?? "",
      contact:      c[1] ?? "",
      retainerTier: c[2] ?? "",
      mrr:          c[3] ?? "",
      status:       c[4] ?? "",
    }));

    const tasks = rowsToObjects(tasksRes.data.values ?? [], (c) => ({
      task:   c[0] ?? "",
      owner:  c[1] ?? "",
      status: c[2] ?? "",
      due:    c[3] ?? "",
    }));

    const result = { leads, clients, tasks };
    g._crmCache = { data: result, ts: Date.now() };
    return result;
  } catch (err) {
    console.error("Failed to load CRM data from Google Sheets:", err);
    return null;
  }
}
