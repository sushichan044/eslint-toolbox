import type { Rule } from "eslint";

type RulesMeta = Rule.RuleModule["meta"];
export type SearchStrategy = "exact" | "includes";

export type RuleMetaData = RulesMeta & {
  name: string;
  plugin: string;
};

export type RuleIdentifierInput = {
  name: string;
  plugin: "eslint" | AnyStringLiteral;
};

export type FlattenRules = {
  [pluginName: string]: {
    [ruleName: string]: RuleMetaData;
  };
};

/**
 * This is utility type to trigger literal completion while it accepts any string.
 *
 * @internal
 */
type AnyStringLiteral = string & {};
