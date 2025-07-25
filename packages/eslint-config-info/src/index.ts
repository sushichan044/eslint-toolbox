import type { Args } from "gunshi";

import { readFlatConfig } from "@sushichan044/eslint-config-resolver";
import { cli, define } from "gunshi";
import { cwd } from "node:process";

import {
  description as pkgDescription,
  name as pkgName,
  version as pkgVersion,
} from "../package.json";

const mainCmd = define({
  args: {
    json: {
      default: false,
      description: "Output as JSON",
      type: "boolean",
    },
    root: {
      description:
        "Root directory of the project (default: current working directory)",
      type: "string",
    },
    rule: {
      description:
        "Rule name to search for (e.g., 'no-unused-vars', '@typescript-eslint/no-explicit-any')",
      required: true,
      type: "positional",
    },
  } as const satisfies Args,
  name: "root",
  run: async (c) => {
    const { json: printAsJSON, rule: ruleName } = c.values;

    const rootDir = c.values.root ?? cwd();
    // const printAsJSON = c.values.json;
    const eslintConfig = await readFlatConfig(rootDir);

    console.dir(eslintConfig, {
      colors: true,
      depth: null,
    });
  },
});

export const run = async (argv: string[]): Promise<string | undefined> =>
  cli(argv, mainCmd, {
    description: pkgDescription,
    name: pkgName,
    renderHeader: null, // disable header rendering
    // subCommands,
    version: pkgVersion,
  });
