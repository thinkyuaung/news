import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// `base` must match the GitHub repo name, because GitHub Pages serves the site
// from https://<user>.github.io/<repo-name>/ and not from the domain root.
export default defineConfig({
  plugins: [react()],
  base: "/news/",
});
