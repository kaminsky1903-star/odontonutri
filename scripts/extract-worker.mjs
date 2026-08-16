import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bin = fs.readFileSync(path.join(root, "worker-content.bin"));
const text = bin.toString("utf8");
const boundary = text.split("\r\n")[0].slice(2);
const parts = text.split(`--${boundary}`);

fs.mkdirSync(path.join(root, "src"), { recursive: true });

for (const part of parts) {
  if (!part.includes("Content-Disposition")) continue;
  const name = (part.match(/name="([^"]+)"/) || [])[1];
  const filename = (part.match(/filename="([^"]+)"/) || [])[1];
  const body = part.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n$/, "");
  console.log({ name, filename, len: body.length });
  console.log(body);
  if (filename === "index.js" || name === "index.js") {
    fs.writeFileSync(path.join(root, "src", "index.js"), body.endsWith("\n") ? body : `${body}\n`);
  }
}
