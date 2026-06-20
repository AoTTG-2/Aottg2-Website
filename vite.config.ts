import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/accounts-api": {
        target: "https://accounts.aottg2.com",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/accounts-api/, ""),
      },
    },
  },
  plugins: [
    react(),
    svgr(),
    viteCompression({ algorithm: "brotliCompress", ext: ".br" }),
    viteCompression({ algorithm: "gzip", ext: ".gz" }),
  ],
  build: {
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          icons: ["react-icons/fa"],
        },
      },
    },
  },
});
