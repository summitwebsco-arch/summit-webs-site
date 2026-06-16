import { google } from "googleapis";

const REDIRECT_URI = "http://localhost:53682/oauth2callback";

function getOAuthClient() {
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;

  const client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);
  client.setCredentials({ refresh_token: refreshToken });
  return client;
}

export function isGmailConfigured(): boolean {
  return getOAuthClient() !== null;
}

function base64url(input: string): string {
  return Buffer.from(input, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function encodeHeader(value: string): string {
  // Encode non-ASCII header values per RFC 2047 (subjects, display names).
  if (/^[\x00-\x7F]*$/.test(value)) return value;
  return `=?UTF-8?B?${Buffer.from(value, "utf-8").toString("base64")}?=`;
}

export type DraftEmail = {
  to: string;
  from: string;
  subject: string;
  body: string;
};

function buildMimeMessage({ to, from, subject, body }: DraftEmail): string {
  const lines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
    "",
    body,
  ];
  return base64url(lines.join("\r\n"));
}

export async function createGmailDraft(email: DraftEmail) {
  const auth = getOAuthClient();
  if (!auth) {
    throw new Error(
      "Gmail is not configured. Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN in .env.local (see scripts/gmail-auth.mjs)."
    );
  }

  const gmail = google.gmail({ version: "v1", auth });
  const raw = buildMimeMessage(email);

  const res = await gmail.users.drafts.create({
    userId: "me",
    requestBody: { message: { raw } },
  });

  return res.data;
}
