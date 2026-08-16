import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tomlPath = path.join(
  process.env.APPDATA,
  "xdg.config",
  ".wrangler",
  "config",
  "default.toml",
);
const toml = fs.readFileSync(tomlPath, "utf8");
const match = toml.match(/oauth_token\s*=\s*"([^"]+)"/);
if (!match) {
  console.error("No wrangler oauth token found");
  process.exit(1);
}

const accountId = "455ddfcb7b812fc7bf48ba620b65f1d9";
const script = "odontonutri";
const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${script}/content/v2`;
const res = await fetch(url, {
  headers: { Authorization: `Bearer ${match[1]}` },
});
const buf = Buffer.from(await res.arrayBuffer());
const out = path.join(root, "worker-content.bin");
fs.writeFileSync(out, buf);
console.log(`status=${res.status}`);
console.log(`content-type=${res.headers.get("content-type")}`);
console.log(`len=${buf.length}`);
console.log(`preview=${buf.slice(0, 200).toString("utf8").replace(/\n/g, "\\n")}`);

// Also fetch domains / subdomain
const domainsRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/domains`,
  { headers: { Authorization: `Bearer ${match[1]}` } },
);
const domainsJson = await domainsRes.json();
fs.writeFileSync(
  path.join(root, "scripts", "cf-domains.json"),
  JSON.stringify(domainsJson, null, 2),
);
console.log(`domains status=${domainsRes.status} count=${domainsJson?.result?.length ?? 0}`);

const subRes = await fetch(
  `https://api.cloudflare.com/client/v4/accounts/${accountId}/workers/scripts/${script}/subdomain`,
  { headers: { Authorization: `Bearer ${match[1]}` } },
);
const subJson = await subRes.json();
console.log(`subdomain=${JSON.stringify(subJson)}`);
