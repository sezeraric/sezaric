import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    /*
     * The WebGL scene is imperative by design.
     *
     * react-three-fiber's frame loop exists precisely to mutate three.js
     * objects — materials, uniforms, transforms — sixty times a second without
     * going through React state. The immutability and ref rules are written for
     * ordinary render code and flag every one of those writes, so they are
     * scoped off here rather than silenced file by file. Everything outside
     * this directory is still held to them.
     */
    files: ["src/components/scene/**/*.tsx"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
