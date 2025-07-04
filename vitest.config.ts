import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Set environment variables directly
    env: {
      RPC_URL: 'https://polygon-amoy.g.alchemy.com/v2/kO8U960IMeF0bm62nEgxxrvWCg0VUJ4E',
      //   RPC_URL: 'http://billions-testnet-rpc.eu-north-2.gateway.fm',
      // "RPC_URL": "https://linea-sepolia.g.alchemy.com/v2/h0ybsi5WtTqveFhwEgzgMnyDuqm0xm4_",
      WALLET_KEY: '9ba8c7602524da43ce844234d143db92104d7f19c0a9d2da273d7e691e0ff568',
      // "WALLET_KEY": "0x733db797969f6a08cc1631d7b01b1d7aac5ba01437b95213fa0c16f7d8fb17ec",
      // "WALLET_KEY": "0x3d6114e1757498e81398603cf4fabdeada3ec813cf6ee81401634cae7e621378",
      ISSUER_WALLET_KEY: '0x3d6114e1757498e81398603cf4fabdeada3ec813cf6ee81401634cae7e621378',
      RHS_URL: 'https://rhs-staging.polygonid.me',
      //   STATE_CONTRACT_ADDRESS: '0x3C9acB2205Aa72A05F6D77d708b5Cf85FCa3a896',
      STATE_CONTRACT_ADDRESS: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
      IPFS_URL:
        'https://2DWLwk8jLS4BuidUcf2SZ0DhHKL:28635fa4521cf6cf18be4e42f77e7daf@ipfs.infura.io:5001',
      RHS_CONTRACT_ADDRESS: '0x3d3763eC0a50CE1AdF83d0b5D99FBE0e3fEB43fb'
    },
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
