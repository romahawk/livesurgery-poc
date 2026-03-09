import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // force a single React instance if anything tries to import its own
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // make sure recharts is prebundled with the same React
    include: ["recharts"],
  },
});
