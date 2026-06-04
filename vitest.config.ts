import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 200_000,
    hookTimeout: 30_000,
    setupFiles: ['dotenv/config']
  }
});
