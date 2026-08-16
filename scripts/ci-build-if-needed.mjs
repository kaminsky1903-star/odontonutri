import { execSync } from "node:child_process";

// Workers Builds still has build_command=npm ci; ensure Vite output exists before wrangler deploy.
if (process.env.WORKERS_CI === "1") {
  execSync("npm run build", { stdio: "inherit" });
}
