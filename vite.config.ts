import { defineConfig } from "vite";
import type { ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:11434",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err: Error) => {
            console.error("Proxy error:", err.message);
          });
          proxy.on("proxyReq", (proxyReq, req) => {
            proxyReq.removeHeader("Origin");
          });
        },
      },
    },
    hmr: {
      protocol: "ws",
      host: "localhost",
      clientPort: 5174,
    },
  },
});
