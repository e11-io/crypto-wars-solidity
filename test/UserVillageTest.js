var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');
var UserVillage = artifacts.require('UserVillage');

contract('UserVillage', function(accounts) {

  let ether = Math.pow(10, 18);
  acc_zero = accounts[0];
  acc_one = accounts[1];
  acc_two = accounts[2];
  acc_three = accounts[3];
  let transactions = [];
  let experimentalToken;
  let userVault;
  let userVillage;

  it('Set Deployed Contracts', function() {
    return ExperimentalToken.deployed().then(function(instance) {
      experimentalToken = instance;
      return UserVault.deployed().then(function(instance) {
        userVault = instance;
        return UserVillage.deployed().then(function(instance) {
          userVillage = instance;
        })
      })
    })
  }),

  it('Create village', function() {
    return experimentalToken.approve(userVault.address, 1 * ether).then(function(result) {
      return userVillage.create('My new village!', 'Cool player')
    }).then(function(result) {
      transactions.push({test: 'Create Village',function: 'create', gasUsed: result.receipt.gasUsed})
      assert.equal(result.logs[0].event,'VillageCreated');
      assert.equal(result.logs[0].args.owner, acc_zero);
      assert.equal(result.logs[0].args.name,'My new village!');
      assert.equal(result.logs[0].args.username,'Cool player');
      assert('Village was created');
      return userVault.balanceOf(acc_zero);
    }).then(function(balance) {
      assert.equal(balance.toNumber(), 1 * ether, 'User E11 in Vault should be 1');
      return experimentalToken.balanceOf(userVault.address);
    }).then(function(balance){
      assert.equal(balance.toNumber(), 1 * ether, 'UserVault E11 balance should be 1');
    })
  });

  it('Create village from acc_one', function(){
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_one}).then(function(result) {
      return experimentalToken.transfer(acc_one, 1 * ether);
    }).then(function(result) {
      return userVillage.create('Village number two','acc_one', {from: acc_one})
    })
  });

  it('Create another village with same User', function(){
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether).then(function(result) {
      return userVillage.create('Another Village','Another username');
    }).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village from account without e11', function(){
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_one}).then(function() {
      return userVillage.create('AccOneVillage','acc_one', {from: acc_one});
    }).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village with taken Username', function(){
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_two}).then(function() {
      return experimentalToken.transfer(acc_two, 5 * ether);
    }).then(function(result) {
      return userVillage.create('AccTwoVillage','acc_one', {from: acc_two});
    }).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village with empty Village Name', function(){
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_three}).then(function() {
      return experimentalToken.transfer(acc_three, 5 * ether);
    }).then(function(result) {
      return userVillage.create('','acc_one', {from: acc_three});
    }).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  })

});
