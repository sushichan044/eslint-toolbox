import type {
  ESLintConfig,
  RuleInfo,
} from "@sushichan044/eslint-config-resolver";

interface RuleSearchInput {
  config: ESLintConfig;
  ruleName: string;
}

interface RuleSearchResult {
  found: boolean;
  rules: Array<{
    info: RuleInfo;
    name: string;
  }>;
}

const searchRuleExact = (input: RuleSearchInput): RuleSearchResult => {
  const { config, ruleName } = input;
  const rules = config.payload.rules;

  const exactRule = rules[ruleName];
  if (exactRule !== undefined) {
    return {
      found: true,
      rules: [{ info: exactRule, name: ruleName }],
    };
  }

  return {
    found: false,
    rules: [],
  };
};

const searchRuleFuzzy = (input: RuleSearchInput): RuleSearchResult => {
  const { config, ruleName } = input;
  const rules = config.payload.rules;

  const matchedRules = Object.entries(rules)
    .filter(([ruleKey]) =>
      ruleKey.toLowerCase().includes(ruleName.toLowerCase()),
    )
    .map(([ruleKey, ruleValue]) => ({
      info: ruleValue,
      name: ruleKey,
    }));

  return {
    found: matchedRules.length > 0,
    rules: matchedRules,
  };
};
