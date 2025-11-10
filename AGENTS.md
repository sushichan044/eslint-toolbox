# eslint-toolbox

A monorepo project for ESLint configuration information retrieval and analysis.

## Project Overview

eslint-toolbox is a toolkit designed to solve ESLint configuration complexity. It provides Flat Config analysis and information display functionality.

## Tech Stack

- **Language**: TypeScript
- **Package Manager**: pnpm (workspace)
- **Build Tool**: tsdown
- **Formatter**: Biome
- **Testing**: Vitest
- **TypeScript Config**: @virtual-live-lab/tsconfig
- **ESLint Config**: @virtual-live-lab/eslint-config
- **License**: Apache-2.0

## Development Environment Setup

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run ESLint
pnpm lint

# Run type checks
pnpm typecheck

# Run tests
pnpm test

# Format code
pnpm format
```

## Project Structure

```
eslint-toolbox/
├── packages/
│   ├── eslint-config-info/      # ESLint configuration info CLI
│   └── eslint-config-resolver/  # Flat config resolver library
├── package.json                 # Root configuration
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── tsconfig.json               # TypeScript shared configuration
├── vitest.config.ts            # Test configuration
├── biome.json                  # Biome configuration
└── eslint.config.js            # ESLint configuration
```

## Package Overview

### @sushichan044/eslint-config-info

CLI tool for retrieving and displaying detailed ESLint configuration information
**Detailed Implementation**: See `packages/eslint-config-info/CLAUDE.md`

### @sushichan044/eslint-config-resolver

Internal library for resolving ESLint flat configuration modules
**Detailed Implementation**: See `packages/eslint-config-resolver/CLAUDE.md`

## Development Workflow

### Test-Driven Development

- All new features implemented with test-first approach
- Run tests with `vitest --run`
- Quality management focused on coverage

### Code Quality

- Automatic formatting with Biome
- Strict TypeScript configuration
- Consistent ESLint rule application

### Build Process

- High-speed builds with tsdown
- Package quality verification with publint
- Type definition validation with @arethetypeswrong/cli

## Development Principles

- **Monorepo Management**: Efficient dependency management with pnpm workspace
- **Type Safety**: Runtime error prevention through strict TypeScript configuration
- **High Quality**: Automated testing, linting, and formatting
- **Performance**: High-speed build environment with tsdown

## Command Reference

```bash
# Run all tests
pnpm test

# Format, Lint, Typecheck
pnpm format
pnpm lint
pnpm typecheck

# Work on specific package
cd packages/eslint-config-info
pnpm build
pnpm test
```

## Project Guidelines

- All documentation and comments must be written in English

---

*For detailed implementation guides for each package, refer to CLAUDE.md files in each directory under packages/*
