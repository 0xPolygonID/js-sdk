# Privado ID JS SDK

SDK to work with Privado ID using JavaScript and TypeScript languages.

## Usage

Installation:

```bash
npm install @0xpolygonid/js-sdk
```

## Circuits

Place the actual circuits in `test/proofs/testdata`

```bash
curl -LO https://circuits.privado.id/latest.zip
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

Please see the [examples](https://github.com/0xPolygonID/js-sdk-examples) for more information.

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

## License

js-sdk is part of the 0xPolygonID project copyright 2024 ZKID Labs AG

This project is licensed under either of

- [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0) ([`LICENSE-APACHE`](LICENSE-APACHE))
- [MIT license](https://opensource.org/licenses/MIT) ([`LICENSE-MIT`](LICENSE-MIT))

at your option.
