# eslint-config-info

A CLI tool for retrieving and displaying detailed ESLint configuration information from flat configs. Uses advanced rule search and formatting capabilities.

## CLI Architecture

### gunshi Framework Implementation

The CLI is built using the `gunshi` library, providing a modern command-line interface:

```typescript
// Core CLI structure in src/index.ts
const mainCmd = define({
  args: {
    exact: { type: "boolean", default: false },
    json: { type: "boolean", default: false },
    root: { type: "string" },
    rule: { type: "positional" },
  },
  run: async (c) => {
    /* implementation */
  },
});
```

### Usage Patterns

```bash
# Fuzzy search (default)
eslint-config-info no-unused

# Exact search
eslint-config-info --exact no-unused-vars

# Plugin rules
eslint-config-info @typescript-eslint/no-explicit-any

# JSON output for tooling
eslint-config-info --json no-unused-vars

# Custom project root
eslint-config-info --root /path/to/project no-unused
```

## Core Implementation Details

### Rule Search Algorithm (`src/search.ts`)

**Rule Name Parsing:**

- Splits rule names on `/` delimiter
- Single part: `"no-unused-vars"` → `{plugin: "eslint", name: "no-unused-vars"}`
- Two parts: `"@typescript-eslint/no-explicit-any"` → `{plugin: "@typescript-eslint", name: "no-explicit-any"}`

**Search Modes:**

- **Exact Search** (`searchRuleExact`): Direct key lookup in flattened rules map
- **Fuzzy Search** (`searchRuleFuzzy`): Case-insensitive substring matching using `toLowerCase().includes()`

### Rule Aggregation Strategy

The `aggregateRules` function merges two sources:

1. **Plugin Rules** (`flattenPluginRules`): Extracts from `config.configs[].plugins[].rules`
2. **Builtin Rules** (`flattenBuiltinRules`): Extracts from `config.payload.rules` (non-plugin rules only)

Both are normalized into `FlattenRules` structure:

```typescript
{
  [pluginName: string]: {
    [ruleName: string]: RuleMetaData
  }
}
```

### Japanese Localization (`src/format.ts`)

**Visual Enhancement Features:**

- Emoji indicators: `🚨` (problem), `💡` (suggestion), `🎨` (layout)
- Deprecation warnings: `⚠️ DEPRECATED`
- Status icons: `✅` (fixable), `💭` (has suggestions)
- Documentation links: `📖 URL`

**Japanese Comments**: Code contains Japanese comments for developer context, indicating this tool was designed with Japanese developers in mind.

## Development Workflow Details

### Debug Output Feature

The CLI automatically generates `plugin-rules.json` in the current directory:

```typescript
await writeFile("plugin-rules.json", JSON.stringify(aggregateRules(eslintConfig), null, 2));
```

This file contains the complete flattened rule registry and is invaluable for:

- Debugging rule resolution issues
- Understanding available rules in a project
- Verifying plugin configuration

### Type Safety Integration

Uses `@eslint/core` types for maximum compatibility:

```typescript
import type { RulesMeta } from "@eslint/core";

export type RuleMetaData = RulesMeta<string, unknown[], unknown> & {
  name: string;
  plugin: string;
};
```

### CLI Testing Strategy

**Current Gap**: No test files exist (violates TDD principles from project guidelines)

**Recommended Testing Approach:**

```bash
# Manual CLI testing
pnpm build
./bin/eslint-config-info.mjs no-unused
./bin/eslint-config-info.mjs --json @typescript-eslint/no-explicit-any

# Integration testing with different config types
cd ../eslint-config-resolver/fixtures/basic-config
../../../eslint-config-info/bin/eslint-config-info.mjs no-unused
```

## Architecture Decisions

### Dependencies Analysis

**Core Dependencies:**

- `@sushichan044/eslint-config-resolver`: Handles flat config resolution and working directory management
- `gunshi`: Modern CLI framework choice over alternatives like `commander` or `yargs`

**Why gunshi?**

- Type-safe argument definition
- Built-in help generation
- Modern ESM-first approach
- Minimal API surface

### Build Configuration Optimizations

**tsdown Settings (`tsdown.config.ts`):**

- `unbundle: true`: Preserves separate modules for better debugging
- `dce-only`: Dead code elimination without aggressive minification
- `publint: true`: Automatic package.json validation
- `unused: true`: Unused export detection

### Integration with eslint-config-resolver

**Key Integration Points:**

- Uses `readFlatConfig(rootDir)` for config resolution
- Relies on resolver's working directory management for MCP compatibility
- Leverages resolver's rule metadata extraction from `config.payload.rules`

## Quality Assurance

### Missing Test Coverage

**Critical Areas Needing Tests:**

- Rule name parsing edge cases (`extractRuleIdentifier`)
- Fuzzy search accuracy
- JSON output format validation
- CLI argument handling
- Error scenarios (missing config, invalid rule names)

### Package Validation Pipeline

The `build:check` command runs:

1. `pnpm build` - TypeScript compilation
2. `pnpm pack` - Package creation
3. `attw` - Type definition validation via @arethetypeswrong/cli

## Common Development Tasks

### Adding New Search Features

1. Extend `Args` type in `mainCmd` definition
2. Update search functions in `src/search.ts`
3. Add corresponding format options in `src/format.ts`
4. Update CLI help text

### Debugging Config Resolution Issues

1. Check generated `plugin-rules.json` for available rules
2. Verify working directory with `--root` option
3. Test with different config file formats in resolver

### Performance Optimization

Current bottlenecks for large configs:

- `Object.entries()` iterations in rule flattening
- String manipulation in fuzzy search
- JSON serialization for debug output

Consider caching strategies for repeated searches in the same project.
