import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 400000,
    setupFiles: ['dotenv/config']
  }
});
