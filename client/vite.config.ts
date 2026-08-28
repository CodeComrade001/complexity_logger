import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Manually resolve __dirname for ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "../../attached_assets"),
    },
    // Only use dedupe if you are hitting "Hooks can only be called inside..." errors
    dedupe: ["react", "react-dom"],
  },
  server: {
    // Helpful for debugging blank screens: ensure errors are overlayed
    hmr: {
      overlay: true,
    },
  },
});