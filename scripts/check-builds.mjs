import fs from "node:fs";
import path from "node:path";

const toml = fs.readFileSync(
  path.join(process.env.APPDATA, "xdg.config/.wrangler/config/default.toml"),
  "utf8",
);
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const accountId = "455ddfcb7b812fc7bf48ba620b65f1d9";
const tag = "91ecfe570c3f4c27b953ce8862b633e1";
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

async function cf(urlPath) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${urlPath}`, {
    headers,
  });
  const json = await res.json();
  return { status: res.status, json };
}

const triggers = await cf(`/accounts/${accountId}/builds/workers/${tag}/triggers`);
console.log("TRIGGERS", triggers.status);
console.log(JSON.stringify(triggers.json, null, 2).slice(0, 4000));

const builds = await cf(`/accounts/${accountId}/builds/workers/${tag}/builds`);
console.log("BUILDS", builds.status);
console.log(JSON.stringify(builds.json, null, 2).slice(0, 4000));
