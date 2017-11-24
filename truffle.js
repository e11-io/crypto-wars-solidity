module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 6718909,
      network_id: "*"
    },
    ganache: {
      host: "localhost",
      port: 7545,
      gas: 6718909,
      network_id: "*"
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- Use port 8555
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    }
  }
};
