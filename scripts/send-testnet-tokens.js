// Duplicate contributors.sample.json and modify the addresses and amount as you want.
const contributors = require('../data/contributors');
const contracts = require('../data/contracts');

const ExperimentalToken = artifacts.require('ExperimentalToken');
const ether = Math.pow(10, 18);


async function getAccounts() {
  return new Promise((res, rej) => {
    web3.eth.getAccounts(async (err, accounts) => {
      if (err) rej(err);
      res(accounts);
    });
  });
}

async function getBalance(address) {
  return new Promise((res, rej) => {
    web3.eth.getBalance(address, async (err, balance) => {
      if (err) rej(err);
      res(balance);
    });
  });
}

async function sendEth(amountOfEth, activeAccount, to) {
  return new Promise((res, rej) => {
    web3.eth.sendTransaction({from: activeAccount, to: to, value: amountOfEth * ether}, async (err, accounts) => {
      if (err) rej(err);
      res();
    });
  });
}

module.exports = async (callback) => {
  try {
    console.time('Sent tokens & eth');
    const experimentalToken = ExperimentalToken.at(contracts.ExperimentalToken);
    const accounts = await getAccounts();
    const activeAccount = accounts[0];
    for (var i = 0; i < contributors.accounts.length; i++) {
      const contributor = contributors.accounts[i];
      const ethBalance = web3.fromWei(await getBalance(contributor));
      const tokenBalance = web3.fromWei(await experimentalToken.balanceOf(contributor));
      const ethToSend = contributors.ether - ethBalance.toNumber();
      const tokensToSend = contributors.e11 - tokenBalance.toNumber();
      // console.log(contributor, tokensToSend, ethToSend);
      if (ethToSend > 0) sendEth(ethToSend, activeAccount, contributor);
      if (tokensToSend > 0 && i !== (contributors.accounts.length - 1)) {
        experimentalToken.transfer(contributor, tokensToSend * ether, { from: activeAccount });
      } else if (tokensToSend > 0 && i === (contributors.accounts.length - 1)) {
        await experimentalToken.transfer(contributor, tokensToSend * ether, { from: activeAccount });
      }
      if (i === (contributors.accounts.length - 1)) {
        console.timeEnd('Sent tokens & eth');
        process.exit(0);
      }
    }
  } catch (err) {
    console.log('Error while sending tokens & eth', err);
    process.exit(0);
  }
}
