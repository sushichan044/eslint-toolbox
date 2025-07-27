import type { ESLintConfig } from "@sushichan044/eslint-config-array-resolver";

import type { FlattenRules } from "./types";

export const extractRules = (config: ESLintConfig): FlattenRules => {
  return {
    ...flattenBuiltinRules(config),
    ...flattenPluginRules(config),
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
