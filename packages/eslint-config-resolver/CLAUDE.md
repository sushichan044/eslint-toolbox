# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# eslint-config-resolver

A TypeScript library for resolving ESLint flat configuration modules with rule metadata. This package is designed for internal use within the eslint-toolbox project.

## Core Architecture

### ESLint Flat Config Resolution Process

The main `readFlatConfig` function follows this process:

1. **Config Discovery**: Uses `empathic/find` library to locate ESLint config files in priority order:
   - `eslint.config.js`
   - `eslint.config.mjs`
   - `eslint.config.cjs`
   - `eslint.config.ts`
   - `eslint.config.mts`
   - `eslint.config.cts`

2. **Working Directory Management**: Critical for MCP environments where current working directory may not match the project directory. Uses `runInDirectory` utility to safely execute bundling operations in the correct context.

3. **Module Bundling**: Uses `bundle-require` to dynamically import and bundle config modules, handling both default exports and direct exports.

4. **Default Config Application**: Automatically prepends ESLint's built-in default configurations:
   - Language options (ECMAScript latest, module mode)
   - Default ignores (`**/node_modules/`, `.git/`)
   - File type handlers (`.js`, `.mjs`, `.cjs`)

5. **Rule Metadata Extraction**:
   - Resolves ESLint built-in rules from `eslint/use-at-your-own-risk`
   - Extracts plugin rules and metadata from config items
   - Creates unified rule registry with plugin prefixes

### Key Components

- **`resolver.ts`**: Core logic for config resolution and rule extraction
- **`utils.ts`**: Helper utilities including safe directory execution
- **`index.ts`**: Public API exports

## Development Commands

```bash
# Run tests with Vitest
pnpm test

# Build with tsdown (ESM + TypeScript definitions)
pnpm build

# Build and validate package structure
pnpm build:check

# Format code with Biome
pnpm format
```

## Testing Strategy

Uses `fs-fixture` for filesystem-based testing scenarios:

- **Config Resolution Priority**: Tests precedence of different config file formats
- **Directory Traversal**: Verifies upward search for parent configs
- **Nested Configurations**: Tests behavior with multiple config levels
- **Error Handling**: Validates proper error reporting when configs are missing

Test files create temporary filesystem structures to simulate real project scenarios.

## Important Implementation Details

### MCP Environment Considerations

The `runInDirectory` utility is crucial because:

- MCP servers typically execute from user's home directory
- Some ESLint configs (like `eslint-config-flat-gitignore`) depend on current working directory
- Must explicitly change to config file's directory before bundling

### ESLint Config Inspector Integration

Code includes modifications from the original ESLint Config Inspector:

- Removed legacy ESLint support
- Added ESLint violation handling
- Simplified API to accept only root directory string
- Replaced `find-up` with `empathic` for better performance
- Added explicit directory management for MCP compatibility

### Bundle Requirements

Uses `bundle-require` with specific configuration:

- Disables TypeScript config resolution (`tsconfig: false`)
- Executes from config file's directory for proper dependency resolution
- Handles both CommonJS and ESM module formats

## Internal Library Purpose

This package is marked as "For internal use only" because it contains code modified and redistributed from the ESLint Config Inspector project:

- **Original Source**: Modified from [ESLint Config Inspector](https://github.com/eslint/config-inspector/blob/8a65a0b00a5f32b4e28699d66b1c125fbeb7fa24/src/configs.ts)
- **Copyright**: Original code © ESLint contributors, licensed under Apache License 2.0
- **Redistribution Considerations**: To avoid potential licensing or attribution confusion, this modified version is kept as internal-use only
- **License Compliance**: Full license and copyright information available in LICENSE and NOTICE files

## File Structure

```
src/
├── index.ts          # Public exports
├── resolver.ts       # Core resolution logic
├── utils.ts          # Helper utilities
└── resolver.test.ts  # Comprehensive test suite
```
