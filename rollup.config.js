import typescript from "rollup-plugin-typescript2";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
  input: ["src/fold-editor-and-preview.ts"],
  output: {
    dir: "lib",
    format: "cjs",
  },
  plugins: [resolve(), commonjs(), typescript()],
};
