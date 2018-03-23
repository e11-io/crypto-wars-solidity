# Crypto Wars

[![Build Status](https://travis-ci.org/e11-io/crypto-wars-solidity.svg?branch=master)](https://travis-ci.org/e11-io/crypto-wars-solidity)
[![Coverage Status](https://coveralls.io/repos/github/e11-io/crypto-wars-solidity/badge.svg?branch=master)](https://coveralls.io/github/e11-io/crypto-wars-solidity?branch=master)
[![Join the chat at https://gitter.im/e11-io/crypto-wars-solidity](https://badges.gitter.im/e11-io/crypto-wars-solidity.svg)](https://gitter.im/e11-io/crypto-wars-solidity?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository holds all the smart contracts that are going to be used on the game [Crypto Wars](https://cryptowars.e11.io).
Please check the [documentation](https://e11-io.github.io/crypto-wars-solidity/) for more details.

## Requirements

- [geth](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum)
- [metamask](https://metamask.io), [mist](https://github.com/ethereum/mist/releases) or similar web3 alternative.


## Installation

1. Install truffle and an ethereum client. For local development, try EthereumJS TestRPC.
    ```shell
    npm install -g truffle
    npm install -g ethereumjs-testrpc # or ganache-cli
    truffle version
    # Truffle v4.1.0 (core: 4.1.0)
    # Solidity v0.4.19 (solc-js)
    ```

2. Install dependencies.
    ```shell
    npm i # or yarn
    ```

3. Run testrpc on a separate terminal
    ```shell
    npm run rpc
    ```

4. Compile the contracts.
    ```shell
    truffle compile
    ```

5. Run the tests.
    ```shell
    truffle test
    ```

6. Compile the docs.
    ```shell
    npm run doxity init
    npm run docs
    ```

7. Run test coverage.
    ```shell
    npm run coverage
    ```

8. Migrate the contracts.
    ```shell
    truffle migrate
    ```

9a. Run the web app locally.
  ```shell
  npm run start # to use your local RPC network
  # Open http://localhost:4200 on your favorite web3 browser
  ```

9b. To run the web app with the PoA e11 (311) network.

  - Console 1:
  ```shell
  ./script/full-node.sh # this will create a local full node of the e11 Proof of Authority chain (311)
  ```

  - Console 2:
  ```shell
  npm run start:poa # this will start the angular server with the PoA environment.
  ```

  Lastly open http://localhost:4200 and on Metamask connect to http://localhost:8311


## How to migrate new contracts into e11 (311) PoA network

  - `./scripts/full-node.sh` # Console 1

  - `geth attach http://localhost:8311` # Console 2
    - `personal.importRawKey("secret","password")`
    - `personal.unlockAccount("0xAddress", "password", 0)`

  - `truffle migrate --network=e11` # Console 3

  - Update contract addresses on `src/environments/environment.poa`

  - Update ExperimentalToken address on `scripts/send-testnet-tokens.js`

  - Copy `build/contracts` folder and paste it on `src/assets/contracts`

## How to send e11 and ether to contributors

  - Duplicate the file `src/script/contributors.sample.json` and name it `contributors.json`
    - Add all the accounts you want to send to
    - Set the amount of ether and e11 you want to send

  - `./scripts/full-node.sh` # Console 1

  - `geth attach http://localhost:8311` # Console 2
    - `personal.importRawKey("secret","password")`
    - `personal.unlockAccount("0xAddress", "password", 0)`

  - `truffle exec ./scripts/send-testnet-tokens.js --network=e11` # Console 3

**NOTE**: This project is still a WIP, we encourage you to create a Pull Request and to participate in the ongoing discussions [here](https://github.com/e11-io/crypto-wars-solidity/issues).
