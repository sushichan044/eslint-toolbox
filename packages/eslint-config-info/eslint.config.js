import ts from "@virtual-live-lab/eslint-config/presets/ts";
import { defineConfig } from "eslint/config";
import globals from "globals";

export default defineConfig(ts, {
  files: ["bin/eslint-config-info.mjs"],
  languageOptions: {
    globals: {
      ...globals.node,
    },
  },
});
