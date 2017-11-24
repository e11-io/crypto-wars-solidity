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
    # Truffle v4.0.1 (core: 4.0.1)
    # Solidity v0.4.18 (solc-js)
    ```

2. Install dependencies.
    ```shell
    npm i # or yarn
    ```

3. Run testrpc on a separate terminal
    ```shell
    npm run rpc
    ```

4. Compile and migrate the contracts.
    ```shell
    truffle compile
    truffle migrate
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

8. Run the web app.
    ```shell
    npm run start # and navigate to http://localhost:4200
    ```

**NOTE**: This project is still a WIP, we encourage you to create a Pull Request and to participate in the ongoing discussions [here](https://github.com/e11-io/crypto-wars-solidity/issues).
