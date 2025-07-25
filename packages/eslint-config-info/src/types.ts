import type { RulesMeta } from "@eslint/core";

export type RuleMetaData = RulesMeta<string, unknown[], unknown> & {
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
