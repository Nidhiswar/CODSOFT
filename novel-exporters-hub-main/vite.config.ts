import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,        // Frontend port (safe & free)
    strictPort: true
  },
  build: {
    outDir: "dist"
  },
  plugins: [
    react()            // ❌ lovable-tagger removed
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  }
});
