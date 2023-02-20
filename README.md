# @0xpolygonid/js-sdk

SDK to work with Polygon ID


# Usage 

Installation:

```
npm install @0xpolygonid/js-sdk
```

See [tests](/tests) for examples on how to use SDK.

# Tests

Run unit tests:
```
npm run test
```

Note: mtp / sig / auth / rhs files contain integration tests!

To run them, please set following variables:
```
export WALLET_KEY="...key in hex format"
export RPC_URL="...url to polygon network rpc node"
export RHS_URL="..reverse hash service url"
```

And place actual circuits to `test/proofs/testdata`

# Documentation

Documentation can be found here: https://0xpolygonid.github.io/polygonid-js-sdk-website/
