import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/index.ts',
        'node_modules/**'
      ],
      lines: 70,
      functions: 70,
      branches: 70,
      statements: 70
    },
    testTimeout: 10000
  },
  resolve: {
    alias: {
      shared: path.resolve(__dirname, '../../packages/shared/src')
    }
  }
})
