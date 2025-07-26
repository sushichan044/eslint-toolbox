import type { RuleMetaData } from "./types";

const formatSectionHeader = (title: string): string => {
  return `\n${title}`;
};

const formatBulletPoint = (content: string): string => {
  return `  • ${content}`;
};

const formatMetadataSection = (ruleInfo: RuleMetaData): string[] => {
  const lines: string[] = [];
  const docs = ruleInfo.docs as Record<string, unknown> | null | undefined;

  lines.push(formatSectionHeader("🔧 METADATA"));

  // Rule type with emoji
  if (ruleInfo.type) {
    const typeEmoji = {
      layout: "🎨",
      problem: "🚨",
      suggestion: "💡",
    };
    const emoji = typeEmoji[ruleInfo.type] || "";
    lines.push(formatBulletPoint(`Type: ${emoji} ${ruleInfo.type}`));
  }

  // Rule category
  if (
    docs &&
    typeof docs === "object" &&
    "category" in docs &&
    typeof docs["category"] === "string"
  ) {
    lines.push(formatBulletPoint(`Category: ${docs["category"]}`));
  }

  // Recommended status
  if (docs && typeof docs === "object" && "recommended" in docs) {
    const recommended = docs["recommended"] === true ? "✅ Yes" : "❌ No";
    lines.push(formatBulletPoint(`Recommended: ${recommended}`));
  }

  // Fixable information
  if (ruleInfo.fixable) {
    lines.push(formatBulletPoint(`Fixable: ✅ ${ruleInfo.fixable}`));
  }

  // Suggestions availability
  if (ruleInfo.hasSuggestions === true) {
    lines.push(formatBulletPoint("Suggestions: 💭 Available"));
  }

  // TypeScript type checking requirement
  if (
    docs &&
    typeof docs === "object" &&
    "requiresTypeChecking" in docs &&
    docs["requiresTypeChecking"] === true
  ) {
    lines.push(formatBulletPoint("TypeScript: ⚡ Required"));
  }

  return lines;
};

const formatConfigurationSection = (ruleInfo: RuleMetaData): string[] => {
  const lines: string[] = [];

  if (ruleInfo.schema !== undefined && ruleInfo.schema !== null) {
    lines.push(formatSectionHeader("⚙️  CONFIGURATION"));

    // Schema information
    if (Array.isArray(ruleInfo.schema)) {
      lines.push(
        formatBulletPoint(`Options: ${ruleInfo.schema.length} parameter(s)`),
      );
    } else if (typeof ruleInfo.schema === "object") {
      lines.push(formatBulletPoint("Options: configurable"));
    }
  }

  return lines;
};

const formatDocumentationSection = (ruleInfo: RuleMetaData): string[] => {
  const lines: string[] = [];
  const docs = ruleInfo.docs as Record<string, unknown> | null | undefined;

  if (
    docs &&
    typeof docs === "object" &&
    "url" in docs &&
    typeof docs["url"] === "string"
  ) {
    lines.push(formatSectionHeader("📖 DOCUMENTATION"));
    lines.push(formatBulletPoint(`URL: ${docs["url"]}`));
  }

  return lines;
};

export const formatRuleInfo = (ruleInfo: RuleMetaData): string => {
  const lines: string[] = [];
  const docs = ruleInfo.docs as Record<string, unknown> | null | undefined;

  // Rule name and plugin header
  let ruleName = ruleInfo.name;
  if (ruleInfo.plugin && ruleInfo.plugin !== "eslint") {
    ruleName += ` (${ruleInfo.plugin})`;
  }
  lines.push(`📌 Rule: ${ruleName}`);

  // Deprecation warning
  if (ruleInfo.deprecated !== undefined && ruleInfo.deprecated !== false) {
    let deprecatedLine = "📋 DEPRECATED";
    if (
      typeof ruleInfo.deprecated === "object" &&
      ruleInfo.deprecated !== null
    ) {
      const deprecatedInfo = ruleInfo.deprecated as Record<string, unknown>;
      if (
        "reason" in deprecatedInfo &&
        typeof deprecatedInfo["reason"] === "string"
      ) {
        deprecatedLine += `: ${deprecatedInfo["reason"]}`;
      }
    }
    lines.push(deprecatedLine);
    lines.push("");
  }

  // Description
  if (
    docs &&
    typeof docs === "object" &&
    "description" in docs &&
    typeof docs["description"] === "string"
  ) {
    lines.push(`📝 ${docs["description"]}`);
  }

  // Metadata section
  lines.push(...formatMetadataSection(ruleInfo));

  // Configuration section
  lines.push(...formatConfigurationSection(ruleInfo));

  // Documentation section
  lines.push(...formatDocumentationSection(ruleInfo));

  return lines.join("\n");
};
