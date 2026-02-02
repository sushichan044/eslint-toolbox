# eslint-toolbox

> A modern toolkit for ESLint configuration analysis and rule exploration

## Overview

eslint-toolbox is a monorepo project designed to solve ESLint configuration complexity through modern analysis and exploration tools. It provides comprehensive flat config analysis and information display functionality for developers working with ESLint in modern JavaScript and TypeScript projects.

## Architecture

This monorepo contains two packages that work together to provide ESLint configuration analysis:

```
eslint-toolbox/
├── packages/
│   ├── eslint-rule-explorer/      # 🔍 CLI tool for rule exploration
│   └── eslint-config-array-resolver/  # ⚙️  Internal flat config resolver
└── ...
```

### Packages

| Package                                                                                   | Description                                                                      |
| ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **[eslint-rule-explorer](./packages/eslint-rule-explorer)**                               | CLI tool for retrieving and displaying detailed ESLint configuration information |
| **[@sushichan044/eslint-config-array-resolver](./packages/eslint-config-array-resolver)** | Internal library for resolving ESLint flat configuration modules                 |

## Development Setup

This project uses [pnpm](https://pnpm.io/) workspaces for efficient monorepo management.

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Format code
pnpm format

# Lint code with ESLint
pnpm lint

# Type check with TypeScript
pnpm typecheck
```

## Project Status

⚠️ **Pre-release Software**: This project is currently in active development (version 0.0.0). APIs and functionality may change before the first stable release.

## Contributing

We welcome contributions! Feel free to open issues or submit pull requests.

---

**Made with ❤️ for the ESLint community**
