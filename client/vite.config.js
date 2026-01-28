import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173, // Change this to your desired port
  },
  build: {
    // Optimize build for production
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
      },
    },
    // Generate source maps for debugging (set to false in production)
    sourcemap: false,
    // Increase chunk size for better loading
    chunkSizeWarningLimit: 1000,
    // Configure rollup options for better code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux': ['@reduxjs/toolkit', 'react-redux'],
          'ui': ['lucide-react', 'framer-motion'],
        }
      }
    }
  },
  // Enable compression
  compress: true,
});
