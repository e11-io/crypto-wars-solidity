var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');
var UserVillage = artifacts.require('UserVillage');
var SimpleToken = artifacts.require('SimpleToken');

contract('User Vault', (accounts) => {

  let ether = Math.pow(10, 18);
  acc_zero = accounts[0];
  acc_one = accounts[1];
  let experimentalToken;
  let userVault;
  let userVillage;
  let simpleToken;

  it('Set Deployed Contracts', () => {
    return ExperimentalToken.deployed().then((instance) => {
      experimentalToken = instance;
      return UserVault.deployed().then((instance) => {
        userVault = instance;
        return UserVillage.deployed().then((instance) => {
          userVillage = instance;
          return SimpleToken.deployed().then((instance) => {
            simpleToken = instance;
          })
        })
      })
    })
  }),


  it('Reclaim token != experimentalToken', () => {
    let amountA = 500 * ether;
    let amountB = 200 * ether;
    let initial_balance;
    return simpleToken.balanceOf(acc_zero).then((balance) => {
      initial_balance = balance.toNumber();
      assert.equal(initial_balance, 10000 * ether);
      return simpleToken.transfer(acc_one, amountA);
    }).then(() => {
      return simpleToken.transfer(userVault.address, amountB, {from: acc_one});
    }).then(() => {
      return simpleToken.balanceOf(userVault.address);
    }).then((balance) => {
      assert.equal(balance.toNumber(), amountB);
      return userVault.reclaimToken(simpleToken.address);
    }).then(() => {
      return simpleToken.balanceOf(userVault.address);
    }).then((balance) => {
      assert.equal(balance.toNumber(), 0);
      return simpleToken.balanceOf(acc_zero);
    }).then((balance) => {
      assert.equal(balance.toNumber(), initial_balance - (amountA - amountB), 'acc_zero, wrong balance after reclaimtken');
    })
  })

  it('Reclaim experimentalToken', () => {
    let amountA = 500 * ether;
    let amountB = 200 * ether;
    let initial_balance;
    let expectedError = true;
    return experimentalToken.balanceOf(acc_zero).then((balance) => {
      initial_balance = balance.toNumber();
      assert.equal(balance.toNumber(), 100000000 * ether);
      return experimentalToken.transfer(acc_one, amountA);
    }).then(() => {
      return experimentalToken.transfer(userVault.address, amountB, {from: acc_one});
    }).then(() => {
      return experimentalToken.balanceOf(userVault.address);
    }).then((balance) => {
      assert.equal(balance.toNumber(), amountB);
      return userVault.reclaimToken(experimentalToken.address);
    }).then(() => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if (!expectedError) {
        assert(false, error.toString());
      }
    })
  })


});
