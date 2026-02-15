# Testing Guide - ComunidadePsi

This document describes how to run tests, lint code, and ensure quality standards.

## Test Coverage Requirements

- **Backend:** Minimum 70% coverage (statements, branches, functions, lines)
- **Frontend:** Minimum 70% coverage (statements, branches, functions, lines)

## Running Tests

### Backend Tests

```bash
cd apps/api

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Frontend Tests

```bash
cd apps/web

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## Coverage Reports

After running tests with coverage, view the HTML reports:

```bash
# Backend
open apps/api/coverage/index.html

# Frontend
open apps/web/coverage/index.html
```

## Linting

### Check Linting (No Fixes)

```bash
# Backend
cd apps/api && npm run lint

# Frontend
cd apps/web && npm run lint

# Both
npm run lint
```

### Fix Linting Issues

```bash
# Backend
cd apps/api && npm run lint:fix

# Frontend
cd apps/web && npm run lint:fix
```

## Type Checking

Ensure TypeScript compiles without errors:

```bash
# Backend
cd apps/api && npm run typecheck

# Frontend
cd apps/web && npm run typecheck

# Both
npm run typecheck
```

## Code Formatting

Format code with Prettier:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

## Pre-commit Hooks

Husky hooks are configured to run linting and type checks before commits:

```bash
# Install hooks
husky install

# These run automatically on:
# - Pre-commit: lint, typecheck
# - Pre-push: test
```

## CI/CD Pipeline

The following checks run in CI/CD:

1. **Lint:** `npm run lint`
2. **TypeCheck:** `npm run typecheck`
3. **Test:** `npm test -- --coverage`
4. **Build:** `npm run build`

All must pass before merging to main.

## Test Examples

### Backend - Auth Service

```typescript
import { describe, it, expect } from 'vitest'
import { ContentSafetyScanner } from './contentSafety'

describe('ContentSafetyScanner', () => {
  it('should detect CPF', () => {
    const scanner = new ContentSafetyScanner()
    const result = scanner.scanContent('CPF: 123.456.789-10')
    expect(result.flags.some(f => f.type === 'cpf')).toBe(true)
  })
})
```

### Frontend - useAuth Hook

```typescript
import { renderHook } from '@testing-library/react'
import { useAuth } from './useAuth'
import { AuthProvider } from '../context/AuthContext'

it('should provide auth context', () => {
  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
  const { result } = renderHook(() => useAuth(), { wrapper })
  expect(result.current).toHaveProperty('user')
})
```

## Troubleshooting

### Tests Not Running

1. Check Node version: `node --version` (should be 18+)
2. Clear cache: `npm run clean`
3. Reinstall: `rm -rf node_modules && npm install`

### Coverage Too Low

1. Identify uncovered files: Check coverage HTML report
2. Add tests for missing coverage
3. Aim for 100% coverage on critical paths (auth, safety, core CRUD)

### Linting Errors

1. Run `npm run lint:fix` first (auto-fixes most issues)
2. Check `.eslintrc.json` for rules
3. Format with `npm run format`

### Type Errors

1. Run `npm run typecheck`
2. Check `tsconfig.json` for configuration
3. Ensure imports use correct paths

## Quality Gates

All the following must pass before deployment:

- [ ] `npm run lint` - Zero errors
- [ ] `npm run typecheck` - Zero errors
- [ ] `npm test -- --coverage` - 70%+ coverage
- [ ] `npm run build` - Builds successfully

## Best Practices

1. **Write tests as you code:** Don't leave testing for the end
2. **Test edge cases:** Not just the happy path
3. **Mock external dependencies:** API calls, DB, etc.
4. **Keep tests focused:** One assertion per test when possible
5. **Use descriptive names:** `should_block_high_risk_content` is better than `test1`
6. **Maintain coverage:** Don't commit code that reduces coverage

## Performance Testing

For performance-critical paths:

```bash
# Benchmark with hyperfine
hyperfine 'npm test -- auth.test.ts' 'npm test -- auth.test.ts'
```

## Further Reading

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
