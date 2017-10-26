# Crypto Wars

[![Join the chat at https://gitter.im/e11-io/crypto-wars-solidity](https://badges.gitter.im/e11-io/crypto-wars-solidity.svg)](https://gitter.im/e11-io/crypto-wars-solidity?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This repository holds all the smart contracts that are going to be used on the game [Crypto Wars](https://e11.io).
Please check the [documentation](https://e11-io.github.io/crypto-wars-solidity/) for more details.

## Installation

1. Install truffle and an ethereum client. For local development, try EthereumJS TestRPC.
    ```shell
    npm install -g truffle
    npm install -g ethereumjs-testrpc
    truffle version
    # Truffle v3.4.11 (core: 3.4.11)
    # Solidity v0.4.15 (solc-js)
    ```

2. Install dependencies.
    ```shell
    yarn # or npm install
    ```
3. Compile and migrate the contracts.
    ```shell
    truffle compile
    truffle migrate
    ```

4. Run the tets.
    ```shell
    npm run test
    ```

5. Compile the docs.
    ```shell
    npm install @digix/doxity # This might take a while
    npm run docs
    ```

**NOTE**: This project is still a WIP, we encourage you to create a Pull Request and to participate in the ongoing discussions [here](https://github.com/e11-io/crypto-wars-solidity/issues).
