import resolve from "@rollup/plugin-node-resolve";

export default {
  input: "./src/main.js",
  output: {
    file: "./dist/app.js",
    format: "iife",
  },
  plugins: [resolve()],
  watch: {
    exclude: "node_modules/**",
  },
};
