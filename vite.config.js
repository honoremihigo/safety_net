import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Safety Net",
        short_name: "SafetyNet",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#ffffff",
        icons: [
          {
            src: "/safetynet-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/safetynet-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
     
      injectRegister: "auto",
      devOptions: {
        enabled: true,
      },
    }),
  ],
  
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  base: "/",
});
