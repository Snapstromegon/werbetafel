// Import rollup plugins
import html from "@web/rollup-plugin-html";
import resolve from "@rollup/plugin-node-resolve";
import minifyHTML from "rollup-plugin-minify-html-literals";
import typescript from "@rollup/plugin-typescript";

export default {
  plugins: [
    // Entry point for application build; can specify a glob to build multiple
    // HTML files for non-SPA app
    html({
      input: ["index.html", "admin.html"],
    }),
    // Resolve bare module specifiers to relative paths
    resolve(),
    // Minify HTML template literals
    minifyHTML(),
    typescript(),
  ],
  output: {
    sourcemap: true,
    dir: "build",
  },
  preserveEntrySignatures: "strict",
};
