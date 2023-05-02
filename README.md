# Polygon ID JS SDK

SDK to work with Polygon ID using JavaScript and TypeScript languages.

## Disclaimer

Polygon ID JS SDK is in public beta. It may still contain bugs or missing functionality.
We provide limited support for it and would love to hear your feedback.

## Usage

Installation:

```bash
npm install @0xpolygonid/js-sdk
```

See [tests](/tests) for examples on how to use SDK.

## Tests

Run unit tests:

```bash
npm run test
```

Note: mtp / sig / auth / rhs files contain integration tests!

To run them, please set following variables:

```bash
export WALLET_KEY="...key in hex format"
export RPC_URL="...url to polygon network rpc node"
export RHS_URL="..reverse hash service url"
```

And place actual circuits to `test/proofs/testdata`

## Documentation

### Generate documentation

1. Define path where documentation repository is located, for example:

    ```typescript
        const DOCS_DIR = '../js-sdk-tutorials/docs/api';
    ```

2. ```bash
        npm run tsc:declaration:watch
    ```

3. ```bash
        npm run doc:watch:website
    ```

Documentation can be found [here](https://0xpolygonid.github.io/js-sdk-tutorials/)
