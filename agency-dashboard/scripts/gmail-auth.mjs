// One-time setup script: obtains a Gmail OAuth refresh token for the
// business inbox (summitwebsco@gmail.com) so the dashboard can create
// outreach drafts on its behalf.
//
// Usage:
//   1. Fill in GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env.local first
//      (see README.md for how to create the OAuth client in Google Cloud Console).
//   2. Run: node scripts/gmail-auth.mjs
//   3. Open the printed URL, sign in as summitwebsco@gmail.com, and approve access.
//   4. Copy the printed GMAIL_REFRESH_TOKEN line into .env.local.

import { google } from "googleapis";
import http from "http";
import { readFileSync, existsSync } from "fs";
import path from "path";

const REDIRECT_URI = "http://localhost:53682/oauth2callback";
const SCOPES = ["https://www.googleapis.com/auth/gmail.compose"];

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvLocal();

const clientId = process.env.GMAIL_CLIENT_ID;
const clientSecret = process.env.GMAIL_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error(
    "Missing GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET.\n" +
      "Add them to .env.local first (see README.md for the Google Cloud OAuth setup steps)."
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: SCOPES,
});

console.log("\n1. Open this URL in your browser and sign in as summitwebsco@gmail.com:\n");
console.log(authUrl);
console.log("\n2. Approve access. This page will then show your refresh token.\n");
console.log("Waiting for authorization...");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  if (url.pathname !== "/oauth2callback") {
    res.writeHead(404).end("Not found");
    return;
  }

  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end(`Authorization failed: ${error || "no code returned"}`);
    server.close();
    console.error(`\nAuthorization failed: ${error || "no code returned"}`);
    process.exit(1);
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      res
        .writeHead(200, { "Content-Type": "text/plain" })
        .end("No refresh token returned. Revoke prior access at https://myaccount.google.com/permissions and try again.");
      console.error(
        "\nNo refresh token returned. This usually happens if you've already authorized this app before.\n" +
          "Revoke access at https://myaccount.google.com/permissions for this app, then re-run this script."
      );
    } else {
      res
        .writeHead(200, { "Content-Type": "text/plain" })
        .end("Success! Copy the GMAIL_REFRESH_TOKEN line from your terminal into .env.local. You can close this tab now.");
      console.log("\nAdd this line to agency-dashboard/.env.local:\n");
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
    }
  } catch (err) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end("Token exchange failed. See terminal for details.");
    console.error("\nToken exchange failed:", err.message);
  } finally {
    server.close();
  }
});

server.listen(53682);
