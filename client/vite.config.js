import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Reuse the API port from server/.env so both apps stay in sync.
  const serverEnv = loadEnv(mode, path.resolve(__dirname, "../server"), "");
  const apiTarget = process.env.VITE_API_PROXY || `http://localhost:${serverEnv.PORT || 5000}`;

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks: {
            react: ["react", "react-dom", "react-router-dom"],
            mui: ["@mui/material", "@mui/icons-material", "@emotion/react", "@emotion/styled"],
            grid: ["@mui/x-data-grid"],
            charts: ["apexcharts", "react-apexcharts"],
          },
        },
      },
    },
    server: {
      port: 5173,
      open: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
      },
    },
  };
});
