import type { ESLintConfig } from "@sushichan044/eslint-config-array-resolver";

import type { FlattenRules, RuleIdentifierInput, RuleMetaData } from "./types";

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

/**
 * Searches for an ESLint rule with exact name matching.
 *
 * @param input - The search input containing config and rule name
 * @returns Search result with found flag and matching rules array
 *
 * @example
 * ```typescript
 * const result = searchRuleExact({
 *   config: eslintConfig,
 *   ruleName: "no-unused-vars"
 * });
 * // Returns exact match for "eslint/no-unused-vars"
 * ```
 */
export const searchRuleExact = (input: RuleSearchInput): RuleSearchResult => {
  const prepared = filterByPlugin(input);
  if (!prepared) {
    return createNotFoundResult();
  }

  return findExactRule(prepared);
};

/**
 * Searches for ESLint rules using fuzzy matching (case-insensitive substring search).
 *
 * @param input - The search input containing config and rule name
 * @returns Search result with found flag and array of matching rules
 *
 * @example
 * ```typescript
 * const result = searchRuleFuzzy({
 *   config: eslintConfig,
 *   ruleName: "unused"
 * });
 * // Returns rules like "no-unused-vars", "no-unused-labels", etc.
 * ```
 */
export const searchRuleFuzzy = (input: RuleSearchInput): RuleSearchResult => {
  const prepared = filterByPlugin(input);
  if (!prepared) {
    return createNotFoundResult();
  }

  return findFuzzyRules(prepared);
};

interface PluginFilteredResult {
  candidatePluginRules: Record<string, RuleMetaData>;
  ruleIdentifier: RuleIdentifierInput;
}

const filterByPlugin = (
  input: RuleSearchInput,
): PluginFilteredResult | null => {
  const ruleIdentifier = extractRuleIdentifier(input.ruleName);
  const rules = aggregateRules(input.config);

  const pluginRules = rules[ruleIdentifier.plugin];
  if (!pluginRules) {
    return null;
  }

  return {
    candidatePluginRules: pluginRules,
    ruleIdentifier,
  };
};

const findExactRule = (prepared: PluginFilteredResult): RuleSearchResult => {
  const { candidatePluginRules, ruleIdentifier } = prepared;

  const exactRule = candidatePluginRules[ruleIdentifier.name];
  if (exactRule !== undefined) {
    return {
      found: true,
      rules: [
        {
          info: exactRule,
          name: `${ruleIdentifier.plugin}/${ruleIdentifier.name}`,
        },
      ],
    };
  }

  return createNotFoundResult();
};

const findFuzzyRules = (prepared: PluginFilteredResult): RuleSearchResult => {
  const { candidatePluginRules, ruleIdentifier } = prepared;

  const matchedRules = Object.entries(candidatePluginRules)
    .filter(([ruleKey]) =>
      ruleKey.toLowerCase().includes(ruleIdentifier.name.toLowerCase()),
    )
    .map(([ruleKey, ruleValue]) => ({
      info: ruleValue,
      name: `${ruleIdentifier.plugin}/${ruleKey}`,
    }));

  return {
    found: matchedRules.length > 0,
    rules: matchedRules,
  };
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

export const aggregateRules = (config: ESLintConfig): FlattenRules => {
  const pluginRules = flattenPluginRules(config);
  const builtinRules = flattenBuiltinRules(config);

  return {
    ...pluginRules,
    ...builtinRules,
  };
};

const flattenPluginRules = (config: ESLintConfig): FlattenRules => {
  const result: FlattenRules = {};

  for (const c of config.configs) {
    const plugins = c.plugins;
    if (!plugins) continue;

    for (const [pluginName, plugin] of Object.entries(plugins)) {
      const rules = plugin.rules;
      if (!rules) continue;

      result[pluginName] ??= {};

      for (const [ruleName, rule] of Object.entries(rules)) {
        if (rule.meta) {
          result[pluginName][ruleName] = {
            ...rule.meta,
            name: ruleName,
            plugin: pluginName,
          };
        }
      }
    }
  }

  return result;
};

const flattenBuiltinRules = (config: ESLintConfig): FlattenRules => {
  const result: FlattenRules = {};

  for (const [ruleName, ruleInfo] of Object.entries(config.payload.rules)) {
    if (ruleName.includes("/")) continue; // Skip plugin rules

    const pluginName = ruleInfo.plugin;
    result[pluginName] ??= {};
    result[pluginName][ruleName] = {
      ...ruleInfo,
      name: ruleName,
      plugin: pluginName,
    };
  }

  return result;
};
