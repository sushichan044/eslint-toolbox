import type { RuleMetaData } from "./types";

export const formatRuleInfo = (ruleInfo: RuleMetaData): string => {
  const lines: string[] = [];

  // ルール名とプラグイン
  let ruleName = ruleInfo.name;
  if (ruleInfo.plugin && ruleInfo.plugin !== "eslint") {
    ruleName += ` (${ruleInfo.plugin})`;
  }
  lines.push(ruleName);

  // 廃止予定の警告
  if (ruleInfo.deprecated !== undefined && ruleInfo.deprecated !== false) {
    let deprecatedLine = "⚠️  DEPRECATED";
    if (
      typeof ruleInfo.deprecated === "object" &&
      ruleInfo.deprecated !== null
    ) {
      const deprecatedInfo = ruleInfo.deprecated as Record<string, unknown>;
      if (
        "reason" in deprecatedInfo &&
        typeof deprecatedInfo["reason"] === "string"
      ) {
        deprecatedLine += ` - ${deprecatedInfo["reason"]}`;
      }
    }
    lines.push(deprecatedLine);
  }

  // 説明
  const docs = ruleInfo.docs as Record<string, unknown> | null | undefined;
  if (
    docs &&
    typeof docs === "object" &&
    "description" in docs &&
    typeof docs["description"] === "string"
  ) {
    lines.push(docs["description"]);
  }

  // 詳細情報
  const details: string[] = [];

  if (ruleInfo.type) {
    const typeEmoji = {
      layout: "🎨",
      problem: "🚨",
      suggestion: "💡",
    };
    const emoji = typeEmoji[ruleInfo.type] || "";
    details.push(`Type: ${emoji} ${ruleInfo.type}`);
  }

  if (ruleInfo.fixable) {
    details.push(`Fixable: ✅ ${ruleInfo.fixable}`);
  }

  if (ruleInfo.hasSuggestions === true) {
    details.push("Has suggestions: 💭 Yes");
  }

  if (details.length > 0) {
    lines.push(details.join(" | "));
  }

  // ドキュメントURL
  if (
    docs &&
    typeof docs === "object" &&
    "url" in docs &&
    typeof docs["url"] === "string"
  ) {
    lines.push(`📖 ${docs["url"]}`);
  }

  return lines.join("\n");
};
