
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { dillx } from "rollup-plugin-dillx";

const output = {
    file: "./dist/app.js",
    format: "iife"
};

export default {
    input: "./src/main.js",
    output,
    plugins: [
        dillx(),
        commonjs(),
        resolve()
    ],
    watch: {
        exclude: "node_modules/**"
    }
};
