import { resolveFlatConfig } from "@sushichan044/eslint-config-array-resolver";
import { cwd } from "node:process";

import type { RuleFindOptions } from "./find";
import type { RuleMetaData } from "./types";

import { findRule } from "./find";

interface RuleSearchOptions extends RuleFindOptions {
  /**
   * Root directory of the project
   *
   * @default `process.cwd()`
   */
  rootDir?: string;

  /**
   * Suppress any console output during ESLint configuration resolution.
   *
   * Useful when using the output in JSON pipelines where extra logs would break parsing.
   */
  suppressOutput?: boolean;
}

interface RuleSearchResult {
  info: RuleMetaData;
  name: string;
}

/**
 * Search for ESLint rules in the project configuration.
 *
 * @param ruleName - Rule name to search for (e.g., `no-unused-vars`, `@typescript-eslint/no-explicit-any`)
 * @param options - Search options
 * @returns Promise resolving to an array of matching rules
 * @throws Error if no rules are found or configuration is invalid
 */
export async function searchESLintRule(
  ruleName: string,
  options: RuleSearchOptions = {},
): Promise<RuleSearchResult[]> {
  const { rootDir = cwd(), suppressOutput, ...searchOptions } = options;

  const eslintConfig = await resolveFlatConfig(rootDir, {
    ...(suppressOutput != null && { suppressOutput }),
  });

  const searchResult = findRule(
    {
      config: eslintConfig,
      ruleName,
    },
    searchOptions,
  );

  return searchResult.rules;
}
