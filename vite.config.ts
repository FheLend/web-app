import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import wasm from "vite-plugin-wasm";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    wasm(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/tfhe/tfhe_bg.wasm",
          dest: "",
        },
      ],
    }),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  optimizeDeps: {
    esbuildOptions: { target: "esnext" },
    exclude: ["cofhejs", "tfhe"],
  },
  assetsInclude: ["**/*.wasm"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      tweetnacl: "tweetnacl/nacl-fast.js",
    },
  },
}));
