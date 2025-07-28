# eslint-rule-explorer

> A powerful CLI tool for exploring and analyzing ESLint rules in your projects

[![npm version](https://img.shields.io/npm/v/eslint-rule-explorer.svg)](https://www.npmjs.com/package/eslint-rule-explorer)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

![command: npx eslint-rule-explorer perfectionist/sort-jsx-props --json | jq -r '.[].info.docs.url'  output: https://perfectionist.dev/rules/sort-jsx-props](docs/images/extract-url.png)

eslint-rule-explorer is a modern CLI tool that helps developers explore, search, and analyze ESLint rules in their projects. It provides comprehensive information about rule configurations, supports both fuzzy and exact search modes, and works seamlessly with ESLint's flat config format.

> [!WARNING]
> This tool only available for ESLint flat config.
>
> Not work with ESLint legacy config (e.g. `.eslintrc.js`, `.eslintrc.json`).

## Installation

### Global Installation

Recommended for CLI usage.

```bash
npm install -g eslint-rule-explorer
```

Or you can just use `npx` to run it without installing globally:

```bash
npx eslint-rule-explorer
```

### Local Installation

Recommended for programmatic use.

```bash
npx npym add eslint-rule-explorer
```

## Usage

### CLI Examples

```bash
# See information about `@typescript-eslint/no-explicit-any`
eslint-rule-explorer @typescript-eslint/no-explicit-any

# Find all TypeScript-related rules
eslint-rule-explorer typescript

# Check if a specific rule exists
eslint-rule-explorer --exact no-console

# Get machine-readable output for scripts
eslint-rule-explorer --json react | jq '.[].name'

# Search in a specific directory
eslint-rule-explorer --root ./my-project unused

# Find all rules related to imports
eslint-rule-explorer import

# Extract documentation URLs with shell scripts
eslint-rule-explorer no-unused-vars --json | jq -r '.[].info.docs.url'
# https://eslint.org/docs/latest/rules/no-unused-vars
```

### JavaScript API

For programmatic use in Node.js applications:

```bash
npm install eslint-rule-explorer
```

```javascript
import { searchESLintRule } from 'eslint-rule-explorer';

// Search for rules with fuzzy matching using `Array.includes`
const results = await searchESLintRule('no-unused');

// Exact search
const exactResults = await searchESLintRule('no-unused-vars', {
  exact: true
});

// Custom project root
const customResults = await searchESLintRule('typescript', {
  rootDir: '/path/to/your/project'
});

// Suppress console output from side effect of resolving ESLint config
// (useful for JSON pipelines)
const quietResults = await searchESLintRule('react', {
  suppressOutput: true
});
```

#### API Reference

For detailed API documentation including all available options and return types, see the [implementation](./src/index.ts).

#### Integration Examples

```javascript
// Find all TypeScript ESLint rules
const tsRules = await searchESLintRule('@typescript-eslint', {
  suppressOutput: true
});

// Extract documentation URLs
const urls = tsRules
  .filter(rule => rule.info.docs?.url)
  .map(rule => rule.info.docs.url);

// Find fixable rules only
const fixableRules = await searchESLintRule('', {
  exact: false
}).then(rules =>
  rules.filter(rule => rule.info.fixable)
);
```

## CLI Output Format

### Human-Readable Output (Default)

The default output format provides comprehensive information about each rule:

```
🚨 no-unused-vars (eslint)
  Type: problem
  📖 https://eslint.org/docs/rules/no-unused-vars
  Description: Disallow unused variables
  ✅ Fixable: Yes
  💭 Has suggestions: Yes
```

### JSON Output (`--json`)

Perfect for integration with other tools and scripts:

```json
{
  "rules": [
    {
      "name": "no-unused-vars",
      "plugin": "eslint",
      "type": "problem",
      "deprecated": false,
      "fixable": "code",
      "hasSuggestions": true,
      "docs": {
        "description": "Disallow unused variables",
        "url": "https://eslint.org/docs/rules/no-unused-vars"
      }
    }
  ]
}
```

## Contributing

We welcome contributions! Please see the [main repository](https://github.com/sushichan044/eslint-toolbox) for contributing guidelines.

## License

Apache-2.0 License - see [LICENSE](./LICENSE) for details.

## Links

- 📦 [npm Package](https://www.npmjs.com/package/eslint-rule-explorer)
- 🏠 [Homepage](https://github.com/sushichan044/eslint-toolbox)
- 🐛 [Issue Tracker](https://github.com/sushichan044/eslint-toolbox/issues)
- 📖 [Documentation](https://github.com/sushichan044/eslint-toolbox/tree/main/packages/eslint-rule-explorer)

---

**Happy rule exploring! 🔍**
