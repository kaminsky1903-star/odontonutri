import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    // Dual-stack bind. `0.0.0.0` is IPv4-only, so Chromium's localhost (::1)
    // gets ERR_CONNECTION_REFUSED and the Cursor Browser panel stays blank.
    host: "::",
    port: 5173,
    strictPort: true,
    allowedHosts: true,
  },
});
