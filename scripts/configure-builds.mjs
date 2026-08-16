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

async function cf(method, urlPath, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${urlPath}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  console.log(method, urlPath, res.status);
  console.log(JSON.stringify(json, null, 2).slice(0, 3000));
  return json;
}

const triggers = await cf(
  "GET",
  `/accounts/${accountId}/builds/workers/${tag}/triggers`,
);

for (const t of triggers.result || []) {
  const isProd = (t.branch_includes || []).includes("main");
  const body = {
    build_command: "npm run build",
    deploy_command: "npx wrangler deploy",
    root_directory: "/",
  };
  console.log("patching", t.trigger_uuid, t.trigger_name, "prod?", isProd);
  await cf("PATCH", `/accounts/${accountId}/builds/triggers/${t.trigger_uuid}`, body);
}
