/**
 * @module eslint-flat-config-resolver
 *
 * This module is for resolving the ESLint config with rule metadata.
 *
 * This file includes code modified from the ESLint Config Inspector project
 * (https://github.com/eslint/config-inspector/blob/8a65a0b00a5f32b4e28699d66b1c125fbeb7fa24/src/configs.ts)
 * Original code copyright: Copyright (c) ESLint contributors
 * Licensed under the Apache License, Version 2.0
 *
 * Changes from source code:
 * - Drop legacy ESLint support
 * - handle ESLint violations
 * - only accepts root: string as parameter
 * - explicitly move to the directory of the eslint config file
 * - use empathic instead of find-up to find the config file
 * - suppress unnecessary output when importing the config module
 *
 * For full license and copyright information, see the LICENSE and NOTICE files.
 */

import type { RuleMetaData } from "@typescript-eslint/utils/ts-eslint";
import type { Linter, Rule } from "eslint";

import { bundleRequire } from "bundle-require";
import { any as findUpAny } from "empathic/find";
import { resolve as resolveModule } from "mlly";
import { dirname } from "pathe";

import {
  executeWithSilentLogs,
  isNonEmptyString,
  runInDirectory,
} from "./utils.js";

export interface ESLintConfig {
  configs: FlatConfigItem[];
  dependencies: string[];
  payload: Payload;
}

export const resolveConfigPath = (
  root: string,
): { basePath: string; fullPath: string } => {
  const configPath = findUpAny(
    [
      "eslint.config.js",
      "eslint.config.mjs",
      "eslint.config.cjs",
      "eslint.config.ts",
      "eslint.config.mts",
      "eslint.config.cts",
    ],
    { cwd: root },
  );

  if (!isNonEmptyString(configPath)) {
    throw new Error("No eslint config found");
  }

  return {
    basePath: dirname(configPath),
    fullPath: configPath,
  };
};

interface ReadFlatConfigOptions {
  suppressOutput?: boolean;
}

export const resolveFlatConfig = async (
  root: string,
  options: ReadFlatConfigOptions = {},
): Promise<ESLintConfig> => {
  const { suppressOutput = false } = options;
  const { basePath, fullPath } = resolveConfigPath(root);

  const moduleImportPromise = runInDirectory(basePath, async () => {
    return bundleRequire({
      cwd: basePath,
      filepath: fullPath,
      tsconfig: false,
    });
  });

  const importPromise = suppressOutput
    ? executeWithSilentLogs(async () => moduleImportPromise)
    : moduleImportPromise;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { dependencies, mod } = await importPromise;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const configModule = (await (mod.default ?? mod)) as
    | FlatConfigItem
    | FlatConfigItem[];

  const rawConfigs = Array.isArray(configModule)
    ? configModule
    : [configModule];

  // ESLint applies these default configs to all files
  // https://github.com/eslint/eslint/blob/21d3766c3f4efd981d3cc294c2c82c8014815e6e/lib/config/default-config.js#L66-L69
  rawConfigs.unshift(
    {
      languageOptions: {
        ecmaVersion: "latest",
        parserOptions: {},
        sourceType: "module",
      },
      linterOptions: {
        reportUnusedDisableDirectives: 1,
      },
      name: "eslint/defaults/languages",
    } as FlatConfigItem,
    {
      ignores: ["**/node_modules/", ".git/"],
      name: "eslint/defaults/ignores",
    } as FlatConfigItem,
    {
      files: ["**/*.js", "**/*.mjs"],
      name: "eslint/defaults/files",
    } as FlatConfigItem,
    {
      files: ["**/*.cjs"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "commonjs",
      },
      name: "eslint/defaults/files-cjs",
    } as FlatConfigItem,
  );

  const rulesMap = new Map<string, RuleInfo>();

  // Try resolve `eslint` module from the same directory as the config file
  // Otherwise fallback to bare import
  const eslintPath =
    (await resolveModule("eslint/use-at-your-own-risk", {
      url: basePath,
    }).catch(() => null)) ?? "eslint/use-at-your-own-risk";
  const eslintRules = (await import(eslintPath).then(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    (r) => r.default.builtinRules,
  )) as Map<string, Rule.RuleModule>;

  for (const [name, rule] of eslintRules.entries()) {
    rulesMap.set(name, {
      ...rule.meta,
      // @ts-expect-error We cannot adjust it.
      messages: undefined,
      name,
      plugin: "eslint",
      // @ts-expect-error We cannot adjust it.
      schema: undefined,
    });
  }

  for (const item of rawConfigs) {
    for (const [prefix, plugin] of Object.entries(item.plugins ?? {})) {
      for (const [name, rule] of Object.entries(plugin.rules ?? {})) {
        rulesMap.set(`${prefix}/${name}`, {
          ...rule.meta,
          // @ts-expect-error We cannot adjust it.
          messages: undefined,
          name: `${prefix}/${name}`,
          plugin: prefix,
          // @ts-expect-error We cannot adjust it.
          schema: undefined,
        });
      }
    }
  }

  const rules = Object.fromEntries(rulesMap.entries());
  const configs = rawConfigs.map((c, index): FlatConfigItem => {
    return {
      ...c,
      index: index,
      // @ts-expect-error We cannot adjust it.
      languageOptions: c.languageOptions
        ? {
            ...c.languageOptions,
            parser: c.languageOptions.parser?.meta?.name,
          }
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      plugins: c.plugins
        ? Object.fromEntries(
            Object.entries(c.plugins ?? {})
              .map(([prefix]) => [prefix, {}])
              .filter((index_) => index_[0]),
          )
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      processor: (c.processor as any)?.meta?.name,
    };
  });

  const payload: Payload = {
    configs,
    files: null,
    meta: {
      basePath,
      configPath: fullPath,
      lastUpdate: Date.now(),
    },
    rules,
  };

  return {
    configs: rawConfigs,
    dependencies,
    payload,
  };
};

interface FlatConfigItem extends Linter.Config {
  index: number;
}

interface Payload {
  configs: FlatConfigItem[];
  files: null;
  meta: PayloadMeta;
  rules: Record<string, RuleInfo>;
}

interface PayloadMeta {
  basePath: string;
  configPath: string;
  lastUpdate: number;
  wsPort?: number;
}

export interface RuleInfo extends RuleMetaData<string, unknown> {
  /**
   * The rule may be removed
   */
  invalid?: boolean;
  name: string;
  plugin: string;
}
