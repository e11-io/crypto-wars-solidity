module.exports = {
  evmMine: async (blocksToSkip = 1) => {
    for (var i = 0; i < blocksToSkip; i++) {
      await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
    }
  }
};
