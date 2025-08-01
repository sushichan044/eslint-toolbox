import { resolveFlatConfig } from "@sushichan044/eslint-config-array-resolver";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import { findRule } from "./find";
import { extractRules } from "./utils";

const loadFixture = async (fixtureName: string) => {
  const rootDir = resolve(import.meta.dirname, "../test/fixtures", fixtureName);
  return await resolveFlatConfig(rootDir);
};

describe("searchRule with exact strategy", () => {
  it("should find exact ESLint builtin rule", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      { config, ruleName: "no-unused-vars" },
      { strategy: "exact" },
    );

    expect(result.rules).toHaveLength(1);
    expect(result.rules[0]?.name).toBe("eslint/no-unused-vars");
    expect(result.rules[0]?.info.plugin).toBe("eslint");
    expect(result.rules[0]?.info.name).toBe("no-unused-vars");
  });

  it("should find exact plugin rule", async () => {
    const config = await loadFixture("plugin-config");
    const result = findRule(
      {
        config,
        ruleName: "@typescript-eslint/no-explicit-any",
      },
      { strategy: "exact" },
    );

    expect(result.rules).toHaveLength(1);
    expect(result.rules[0]?.name).toBe("@typescript-eslint/no-explicit-any");
    expect(result.rules[0]?.info.plugin).toBe("@typescript-eslint");
    expect(result.rules[0]?.info.name).toBe("no-explicit-any");
  });

  it("should return empty array for non-existent rule", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      { config, ruleName: "non-existent-rule" },
      { strategy: "exact" },
    );

    expect(result).toEqual({
      rules: [],
    });
  });

  it("should return empty array for non-existent plugin", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      {
        config,
        ruleName: "@non-existent/some-rule",
      },
      { strategy: "exact" },
    );

    expect(result).toEqual({
      rules: [],
    });
  });

  it("should handle invalid rule name format", async () => {
    const config = await loadFixture("basic-config");

    expect(() => {
      findRule(
        { config, ruleName: "invalid/rule/name/format" },
        { strategy: "exact" },
      );
    }).toThrow("Invalid rule name format: invalid/rule/name/format");
  });
});

describe("searchRule with fuzzy strategy", () => {
  it("should find rule by partial match", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      { config, ruleName: "unused" },
      { strategy: "includes" },
    );

    expect(result.rules.length).toBeGreaterThan(0);
    expect(
      result.rules.some((rule) => rule.name.includes("no-unused-vars")),
    ).toBe(true);
  });

  it("should perform case-insensitive search", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      { config, ruleName: "UNUSED" },
      { strategy: "includes" },
    );

    expect(result.rules.length).toBeGreaterThan(0);
    expect(
      result.rules.some((rule) => rule.name.includes("no-unused-vars")),
    ).toBe(true);
  });

  it("should find multiple results in multi-plugin config", async () => {
    const config = await loadFixture("multi-plugin-config");
    const result = findRule(
      { config, ruleName: "unused" },
      { strategy: "includes" },
    );

    expect(result.rules.length).toBeGreaterThan(1);

    const ruleNames = result.rules.map((rule) => rule.name);
    expect(
      ruleNames.some((name) => name.includes("eslint/no-unused-vars")),
    ).toBe(true);
  });

  it("should find plugin rule by fuzzy search", async () => {
    const config = await loadFixture("plugin-config");
    const result = findRule(
      {
        config,
        ruleName: "@typescript-eslint/explicit",
      },
      { strategy: "includes" },
    );

    expect(result.rules.length).toBeGreaterThan(0);
    expect(
      result.rules.some((rule) => rule.name.includes("no-explicit-any")),
    ).toBe(true);
  });

  it("should return empty array when no matches found", async () => {
    const config = await loadFixture("basic-config");
    const result = findRule(
      {
        config,
        ruleName: "definitely-non-existent-rule-name",
      },
      { strategy: "includes" },
    );

    expect(result).toEqual({
      rules: [],
    });
  });
});

describe("extractRules", () => {
  it("should extract rules from basic config", async () => {
    const config = await loadFixture("basic-config");
    const result = extractRules(config);

    expect(result).toHaveProperty("eslint");
    expect(result["eslint"]).toHaveProperty("no-unused-vars");
    expect(result["eslint"]).toHaveProperty("no-console");
    expect(result["eslint"]).toHaveProperty("prefer-const");

    const rule = result["eslint"]?.["no-unused-vars"];
    expect(rule).toEqual(
      expect.objectContaining({
        name: "no-unused-vars",
        plugin: "eslint",
      }),
    );
  });

  it("should integrate plugin and builtin rules", async () => {
    const config = await loadFixture("plugin-config");
    const result = extractRules(config);

    expect(result).toHaveProperty("@typescript-eslint");
    expect(result["@typescript-eslint"]).toHaveProperty("no-explicit-any");
    expect(result["@typescript-eslint"]).toHaveProperty("no-unused-vars");

    const pluginRule = result["@typescript-eslint"]?.["no-explicit-any"];
    expect(pluginRule).toEqual(
      expect.objectContaining({
        name: "no-explicit-any",
        plugin: "@typescript-eslint",
      }),
    );
  });

  it("should handle empty configuration", async () => {
    const config = await loadFixture("empty-config");
    const result = extractRules(config);

    // Should still have structure but may be empty or have minimal rules
    expect(result).toBeDefined();
    expect(typeof result).toBe("object");
  });

  it("should merge multiple plugins correctly", async () => {
    const config = await loadFixture("multi-plugin-config");
    const result = extractRules(config);

    expect(result).toHaveProperty("eslint");
    expect(result).toHaveProperty("@typescript-eslint");
    expect(result).toHaveProperty("react");

    // Check that rules from different plugins are correctly aggregated
    expect(result["eslint"]).toHaveProperty("no-unused-vars");
    expect(result["@typescript-eslint"]).toHaveProperty("no-explicit-any");
    expect(result["react"]).toHaveProperty("jsx-uses-react");
  });

  it("should preserve rule metadata correctly", async () => {
    const config = await loadFixture("basic-config");
    const result = extractRules(config);

    const rule = result["eslint"]?.["no-unused-vars"];
    expect(rule).toEqual(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        docs: expect.any(Object),
        name: "no-unused-vars",
        plugin: "eslint",
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        type: expect.any(String),
      }),
    );
  });
});

describe("searchRule strategy validation", () => {
  it("should throw error for unknown strategy", async () => {
    const config = await loadFixture("basic-config");

    expect(() => {
      findRule(
        { config, ruleName: "no-unused-vars" },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
        { strategy: "unknown" as any },
      );
    }).toThrow("Unknown search strategy: unknown");
  });
});
