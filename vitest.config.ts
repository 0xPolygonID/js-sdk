import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Set environment variables directly
    globals: true,
    environment: 'node',
    testTimeout: 40000
    // poolOptions: {
    //   threads: {
    //     maxThreads: 2
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
