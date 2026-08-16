import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const base = "https://www.odontonutri.com";

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, "assets"), { recursive: true });

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

async function fetchBin(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, buf);
  console.log(`saved ${url} (${buf.length} bytes)`);
}

const indexHtml = await fetchText(`${base}/`);
fs.writeFileSync(path.join(dist, "index.html"), indexHtml, "utf8");
console.log(`saved index.html (${indexHtml.length} chars)`);

const paths = new Set();
for (const m of indexHtml.matchAll(/(?:href|src)=["'](\/[^"']+)["']/g)) {
  paths.add(m[1]);
}

for (const p of paths) {
  await fetchBin(`${base}${p}`, path.join(dist, p.slice(1)));
}

const jsFiles = fs
  .readdirSync(path.join(dist, "assets"))
  .filter((f) => f.endsWith(".js"));

for (const file of jsFiles) {
  const js = fs.readFileSync(path.join(dist, "assets", file), "utf8");
  const more = new Set();
  for (const m of js.matchAll(/\/assets\/[A-Za-z0-9._/-]+\.(?:png|jpe?g|webp|svg|gif|ico|woff2?|mp4|json)/g)) {
    more.add(m[0]);
  }
  for (const m of js.matchAll(/["'](\/?assets\/[^"']+\.(?:png|jpe?g|webp|svg|gif|ico|woff2?))["']/g)) {
    const p = m[1].startsWith("/") ? m[1] : `/${m[1]}`;
    more.add(p);
  }
  for (const p of more) {
    const dest = path.join(dist, p.replace(/^\//, ""));
    if (fs.existsSync(dest)) continue;
    try {
      await fetchBin(`${base}${p}`, dest);
    } catch (err) {
      console.warn(`skip ${p}: ${err.message}`);
    }
  }
}

console.log("done");
