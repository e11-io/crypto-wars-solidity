# Crypto Wars

This repository holds all the smart contracts that are going to be used on the game [Crypto Wars](https://e11.io).

## Installation

1. Install truffle and an ethereum client. For local development, try EthereumJS TestRPC.
    ```javascript
    npm install -g truffle
    npm install -g ethereumjs-testrpc
    truffle version
    // Truffle v3.4.9 (core: 3.4.8)
    // Solidity v0.4.15 (solc-js)
    ```

2. Compile and migrate the contracts.
    ```javascript
    truffle compile
    truffle migrate
    ```

3. Run the tets.
  ```javascript
  npm run test
  ```

4. Compile the docs.
  ```javascript
  npm install @digix/doxity // This might take a while
  npm run docs
  ```

**NOTE**: This project is still a WIP, we encourage you to create a Pull Request and to participate in the ongoing discussions [here](https://github.com/e11-io/crypto-wars-solidity/issues).
