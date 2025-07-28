import type { Args } from "gunshi";

import { cli, define } from "gunshi";

import { searchESLintRule } from ".";
import {
  description as pkgDescription,
  name as pkgName,
  version as pkgVersion,
} from "../package.json";
import { formatRuleInfo } from "./format";

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
    const {
      exact: searchExact,
      json: printAsJSON,
      root: rootDir,
      rule: ruleName,
    } = c.values;

    const searchResult = await searchESLintRule(ruleName, {
      strategy: searchExact ? "exact" : "includes",
      suppressOutput: printAsJSON,
      ...(rootDir != null && { rootDir }),
    });

    if (printAsJSON) {
      console.log(JSON.stringify(searchResult, null, 2));
      return;
    }

    if (searchResult.length === 0) {
      console.log(`No rules found for input "${ruleName}"`);
      return;
    }

    for (const { info, name } of searchResult) {
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
    version: pkgVersion,
  });
