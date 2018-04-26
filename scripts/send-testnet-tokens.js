// Duplicate contributors.sample.json and modify the addresses and amount as you want.
const contributors = require('./contributors');
const contracts = require('./contracts');


const ExperimentalToken = artifacts.require('ExperimentalToken');


module.exports = async (callback, a, b, c) => {

  const ether = Math.pow(10, 18);

  let experimentalToken = await ExperimentalToken.at(contracts.ExperimentalToken);

  let activeAccount;
  web3.eth.getAccounts((err,res) => {
    activeAccount = res[0];

    contributors.accounts.forEach(account => {
      experimentalToken.transfer(account, contributors.e11 * ether, {from: activeAccount});

      let balanceToSend = contributors.ether;
      web3.eth.getBalance(account, (err, res) => {
        if (err) {
          web3.eth.sendTransaction({from: activeAccount, to: account, value: balanceToSend * ether});
          return;
        }
        let accountBalance = web3.fromWei(res);
        if (accountBalance < contributors.ether) {
          balanceToSend = contributors.ether - accountBalance;
          if (balanceToSend > 1) {
            web3.eth.sendTransaction({from: activeAccount, to: account, value: balanceToSend * ether});
          }
        }
      });
    });
  });

}
