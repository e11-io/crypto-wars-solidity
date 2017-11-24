module.exports = {
    copyPackages: [
      'zeppelin-solidity',
      'e11-contracts'
    ],
    norpc: true,
    testCommand: 'node --max-old-space-size=4096 ../node_modules/.bin/truffle test --network coverage',
};
