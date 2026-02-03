import license from "rollup-plugin-license";
import { defineConfig } from "tsdown";
export default defineConfig({
  attw: { level: "error", profile: "esm-only" },
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  external: ["rolldown"],
  fixedExtension: true,
  format: "esm",
  inlineOnly: ["unrun"],
  minify: "dce-only",
  nodeProtocol: true,
  noExternal: [
    // We need to bundle unrun to apply our patch fix.
    // But we don't want to bundle rolldown, so we mark it as external and mark as dependecy in package.json.
    "unrun",
  ],
  outDir: "dist",
  plugins: [
    license({
      thirdParty: {
        output: {
          file: "dist/THIRD-PARTY.txt",
        },
      },
    }),
  ],
  publint: true,
  sourcemap: false,
  treeshake: true,
  unused: {
    enabled: true,
    ignore: {
      dependencies: ["rolldown"],
    },
  },
});
