import type { Args } from "gunshi";

import { readFlatConfig } from "@sushichan044/eslint-config-resolver";
import { cli, define } from "gunshi";
import { cwd } from "node:process";

import {
  description as pkgDescription,
  name as pkgName,
  version as pkgVersion,
} from "../package.json";
import { formatRuleInfo } from "./format";
import { searchRuleExact, searchRuleFuzzy } from "./search";

const mainCmd = define({
  args: {
    exact: {
      default: false,
      description: "Search for the exact rule name",
      type: "boolean",
    },
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
      type: "positional",
    },
  } as const satisfies Args,
  name: "root",
  run: async (c) => {
    const { exact: searchExact, json: printAsJSON, rule: ruleName } = c.values;

    const rootDir = c.values.root ?? cwd();
    const eslintConfig = await readFlatConfig(rootDir);

    const searchInput = {
      config: eslintConfig,
      ruleName,
    };

    const searchResult = searchExact
      ? searchRuleExact(searchInput)
      : searchRuleFuzzy(searchInput);

    if (printAsJSON) {
      console.log(JSON.stringify(searchResult.rules, null, 2));
      return;
    }

    if (!searchResult.found) {
      console.log(`No rules found for input "${ruleName}"`);
      return;
    }

    for (const { info, name } of searchResult.rules) {
      const formattedInfo = formatRuleInfo(info);
      console.log(`### ${name}\n\n${formattedInfo}\n`);
    }
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
