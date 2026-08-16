import fs from "node:fs";
import path from "node:path";

const toml = fs.readFileSync(
  path.join(process.env.APPDATA, "xdg.config/.wrangler/config/default.toml"),
  "utf8",
);
const token = toml.match(/oauth_token\s*=\s*"([^"]+)"/)[1];
const accountId = "455ddfcb7b812fc7bf48ba620b65f1d9";
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
  console.log(method, urlPath, res.status, JSON.stringify(json, null, 2).slice(0, 2000));
  return json;
}

const ghUser = await fetch("https://api.github.com/users/kaminsky1903-star", {
  headers: { "User-Agent": "odontonutri-setup" },
}).then((r) => r.json());
const ghRepo = await fetch("https://api.github.com/repos/kaminsky1903-star/odontonutri", {
  headers: { "User-Agent": "odontonutri-setup" },
}).then((r) => r.json());
console.log("github", { userId: ghUser.id, repoId: ghRepo.id });

await cf("PUT", `/accounts/${accountId}/builds/repos/connections`, {
  provider_type: "github",
  provider_account_id: String(ghUser.id),
  provider_account_name: "kaminsky1903-star",
  repo_id: String(ghRepo.id),
  repo_name: "odontonutri",
});

await cf("GET", `/accounts/${accountId}/builds/tokens`);
await cf(
  "GET",
  `/accounts/${accountId}/builds/workers/91ecfe570c3f4c27b953ce8862b633e1/triggers`,
);
