import { defineConfig } from 'vitest/config';
// import dotenv from 'dotenv';

export default defineConfig({
  test: {
    // Set environment variables directly
    globals: true,
    environment: 'node',
    testTimeout: 400000,
    setupFiles: ['dotenv/config']
    // poolOptions: {
    //   threads: {
    //     maxThreads: 3
    //   }
    // }
    // Allow files to run in parallel, but control test execution within files
    // pool: 'threads',
    // poolOptions: {
    //   threads: {
    //     singleThread: false
    //   }
    // },
    // // Configure sequence behavior
    // sequence: {
    //   // Allow files to run concurrently (parallel)
    //   concurrent: true,
    //   // Don't shuffle test order
    //   shuffle: false
    // }
  }
});
