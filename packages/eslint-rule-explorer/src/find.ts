import type { ESLintConfig } from "@sushichan044/eslint-config-array-resolver";

import type {
  RuleIdentifierInput,
  RuleMetaData,
  SearchStrategy,
} from "./types";

import { extractRules } from "./utils";

interface RuleFindParams {
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

export interface RuleFindOptions {
  /**
   * A function to filter rules based on custom criteria.
   *
   * @param rule - The rule metadata to evaluate.
   * @returns True if the rule matches the criteria, false otherwise.
   */
  filter?: (rule: RuleMetaData) => boolean;

  /**
   * Search strategy to use.
   * - `exact`: Match the rule name exactly.
   * - `includes`: Match the rule name using `String.includes`.
   *
   * @default `includes`
   */
  strategy?: SearchStrategy;
}

interface RuleFindResult {
  found: boolean;
  rules: Array<{
    info: RuleMetaData;
    name: string;
  }>;
}

const createNotFoundResult = (): RuleFindResult => ({
  found: false,
  rules: [],
});

export const findRule = (
  params: RuleFindParams,
  options: RuleFindOptions,
): RuleFindResult => {
  const prepared = filterByPlugin(params);
  if (!prepared) {
    return createNotFoundResult();
  }
  const strategy = options.strategy ?? "includes";

  const foundRules = (() => {
    switch (strategy) {
      case "exact":
        return findExactRule(prepared);
      case "includes":
        return findFuzzyRules(prepared);
      default:
        throw new Error(
          `Unknown search strategy: ${String(strategy satisfies never)}`,
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
  params: RuleFindParams,
): PluginFilteredResult | null => {
  const ruleIdentifier = extractRuleIdentifier(params.ruleName);
  const rules = extractRules(params.config);

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
): RuleFindResult["rules"] => {
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
): RuleFindResult["rules"] => {
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
