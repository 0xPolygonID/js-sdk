# Polygon ID JS SDK

SDK to work with Polygon ID using JavaScript and TypeScript languages.

## Disclaimer

Polygon ID JS SDK is in public now. It may still contain bugs or missing functionality, that it will be added in next versions.

## Usage

Installation:

```bash
npm install @0xpolygonid/js-sdk
```

## Circuits

And place actual circuits to `test/proofs/testdata`

```bash
curl -LO https://iden3-circuits-bucket.s3.eu-west-1.amazonaws.com/latest.zip
```

## Tests

Run unit tests:

```bash
npm run test
```

Note: mtp / sig / auth / rhs files contain integration tests!

To run them, please set following variables:

```bash
export WALLET_KEY="...key in hex format"
export RPC_URL="...url to network rpc node"
export RHS_URL="..reverse hash service url"
export IPFS_URL="url for ipfs"
export STATE_CONTRACT_ADDRESS="state contract address"
export RHS_CONTRACT_ADDRESS="reverse hash service contract address"
```

## Examples

Please see [examples](https://github.com/0xPolygonID/js-sdk-examples) for visit examples information.

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
