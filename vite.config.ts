import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        // type: "module",
      },

      manifest: {
        short_name: "Grocery",
        name: "Grocery shopping",
        icons: [
          {
            src: "grocery-cart.png",
            sizes: "48x48 72x72 96x96 128x128 192x192 512x512",
            type: "image/png",
          },
        ],
        // start_url: ".",
        start_url: "/",
        display: "standalone",
        theme_color: "#7C9B6D",
        background_color: "#7C9B6D",
      },
    }),
  ],
});
