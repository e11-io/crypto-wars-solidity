# Crypto Wars

[![Build Status](https://travis-ci.org/e11-io/crypto-wars-solidity.svg?branch=master)](https://travis-ci.org/e11-io/crypto-wars-solidity)
[![Coverage Status](https://coveralls.io/repos/github/e11-io/crypto-wars-solidity/badge.svg?branch=master)](https://coveralls.io/github/e11-io/crypto-wars-solidity?branch=master)
[![Join the chat at https://gitter.im/e11-io/crypto-wars-solidity](https://badges.gitter.im/e11-io/crypto-wars-solidity.svg)](https://gitter.im/e11-io/crypto-wars-solidity?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository holds all the smart contracts that are going to be used on the game [Crypto Wars](https://alpha.cryptowars.jp).

## Requirements

- [geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
- [metamask](https://metamask.io), [mist](https://github.com/ethereum/mist/releases) or similar web3 alternative.


## Installation

1. Install truffle and an ethereum client. For local development, try EthereumJS TestRPC.
    ```shell
    npm install -g truffle
    npm install -g ganache-cli
    truffle version
    # Truffle v4.1.11 (core: 4.1.11)
    # Solidity v0.4.24 (solc-js)
    ```

2. Install dependencies.
    ```shell
    npm i # or yarn
    ```

3. Compile the contracts.
    ```shell
    truffle compile
    ```

4. Run the tests.
    ```shell
    npm run test
    ```

5. Run test coverage.
    ```shell
    npm run coverage
    ```

6. Run local testrpc.
    ```shell
    npm run rpc
    ```

7. Migrate the contracts.
    ```shell
    truffle migrate
    ```

8. a. Run the web app locally.
    ```shell
    npm run start # to use your local RPC network
    # Open http://localhost:4200 on your favorite web3 browser
    # Remember to switch your network on Metamask to localhost 8545
    ```

8. b. To run the web app with the PoA e11 (311) network.

    - Console 1:
    ```shell
    ./scripts/full-node.sh # this will create a local full node of the e11 Proof of Authority chain (311)
    ```

    - Console 2:
    ```shell
    npm run start:poa # this will start the angular server with the PoA environment.
    # Remember to switch your network on Metamask to http://localhost:8311
    ```

  Lastly open http://localhost:4200 and on Metamask connect to http://localhost:8311


## How to migrate new contracts into e11 (311) PoA network

  - `truffle migrate --network=e11`

## How to send e11 and ether to contributors

  - Duplicate the file `src/scripts/contributors.sample.json` and name it `contributors.json`
    - Add all the accounts you want to send to
    - Set the amount of ether and e11 you want to send

  - `truffle exec ./scripts/send-testnet-tokens.js --network=e11`

**NOTE**: This project is still a WIP, we encourage you to create a Pull Request and to participate in the ongoing discussions [here](https://github.com/e11-io/crypto-wars-solidity/issues).
