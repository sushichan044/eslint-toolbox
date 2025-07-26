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

### Global Installation (Recommended)

```bash
npm install -g eslint-rule-explorer
```

### Local Installation

```bash
npx npym add -D eslint-rule-explorer
```

## Examples

### Common Use Cases

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
```

### Integrate with shell scripts

```bash
$ eslint-rule-explorer no-unused-vars --json | jq -r '.[].info.docs.url'

https://eslint.org/docs/latest/rules/no-unused-vars
```

## Output Format

### Human-Readable Output

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
