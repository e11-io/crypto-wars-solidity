module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      gas: 6718909,
      network_id: "*"
    },
    e11: {
      host: "localhost",
      port: 8311,
      gas: 6000000,
      gasPrice: 18000000000,
      from: "0xdec8e61b1aabde916bd8248c97e152337a27b660",
      network_id: "311"
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
  },
  rpc: {
    host: 'localhost',
    post:8080
  }
};
