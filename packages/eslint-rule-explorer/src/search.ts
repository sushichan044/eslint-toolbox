import type { ESLintConfig } from "@sushichan044/eslint-config-array-resolver";

import type { RuleIdentifierInput, RuleMetaData } from "./types";

import { extractRules } from "./utils";

interface RuleSearchInput {
  config: ESLintConfig;
  /**
   * The rule name to search for.
   *
   * @example
   * ```markdown
   * - `eslint/no-unused-vars`
   * - `@typescript-eslint/no-unused-vars`
   * - `no-unused-vars`
   * ```
   */
  ruleName: string;
}

interface RuleSearchOptions {
  /**
   * A function to filter rules based on custom criteria.
   *
   * @param rule - The rule metadata to evaluate.
   * @returns True if the rule matches the criteria, false otherwise.
   */
  filter?: (rule: RuleMetaData) => boolean;

  strategy: "exact" | "fuzzy";
}

interface RuleSearchResult {
  found: boolean;
  rules: Array<{
    info: RuleMetaData;
    name: string;
  }>;
}

const createNotFoundResult = (): RuleSearchResult => ({
  found: false,
  rules: [],
});

export const searchRule = (
  input: RuleSearchInput,
  options: RuleSearchOptions,
): RuleSearchResult => {
  const prepared = filterByPlugin(input);
  if (!prepared) {
    return createNotFoundResult();
  }

  const foundRules = (() => {
    switch (options.strategy) {
      case "exact":
        return findExactRule(prepared);
      case "fuzzy":
        return findFuzzyRules(prepared);
      default:
        throw new Error(
          `Unknown search strategy: ${String(options.strategy satisfies never)}`,
        );
    }
  })();

  const filteredRules = options.filter
    ? foundRules.filter((rule) => options.filter?.(rule.info) ?? true)
    : foundRules;

  if (filteredRules.length === 0) {
    return createNotFoundResult();
  }

  return {
    found: true,
    rules: filteredRules,
  };
};

interface PluginFilteredResult {
  candidatePluginRules: Record<string, RuleMetaData>;
  ruleIdentifier: RuleIdentifierInput;
}

const filterByPlugin = (
  input: RuleSearchInput,
): PluginFilteredResult | null => {
  const ruleIdentifier = extractRuleIdentifier(input.ruleName);
  const rules = extractRules(input.config);

  const pluginRules = rules[ruleIdentifier.plugin];
  if (!pluginRules) {
    return null;
  }

  return {
    candidatePluginRules: pluginRules,
    ruleIdentifier,
  };
};

const findExactRule = (
  prepared: PluginFilteredResult,
): RuleSearchResult["rules"] => {
  const { candidatePluginRules, ruleIdentifier } = prepared;

  const exactRule = candidatePluginRules[ruleIdentifier.name];
  if (!exactRule) {
    return [];
  }

  return [
    {
      info: exactRule,
      name: `${ruleIdentifier.plugin}/${ruleIdentifier.name}`,
    },
  ];
};

const findFuzzyRules = (
  prepared: PluginFilteredResult,
): RuleSearchResult["rules"] => {
  const { candidatePluginRules, ruleIdentifier } = prepared;

  return Object.entries(candidatePluginRules)
    .filter(([ruleKey]) =>
      ruleKey.toLowerCase().includes(ruleIdentifier.name.toLowerCase()),
    )
    .map(([ruleKey, ruleValue]) => ({
      info: ruleValue,
      name: `${ruleIdentifier.plugin}/${ruleKey}`,
    }));
};

const extractRuleIdentifier = (ruleName: string): RuleIdentifierInput => {
  const parts = ruleName.split("/");
  if (parts.length === 1) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { name: parts[0]!, plugin: "eslint" };
  } else if (parts.length === 2) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return { name: parts[1]!, plugin: parts[0]! };
  } else {
    throw new Error(`Invalid rule name format: ${ruleName}`);
  }
};
