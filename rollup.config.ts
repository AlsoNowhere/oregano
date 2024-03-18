import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";

export default {
  input: "./src/main.ts",
  output: {
    file: "./dist/app.js",
    format: "iife",
  },
  plugins: [resolve(), typescript(), json()],
};
