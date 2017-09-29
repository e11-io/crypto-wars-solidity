var UserVillage = artifacts.require('UserVillage');
var BuildingsData = artifacts.require('BuildingsData');
var UserBuildings = artifacts.require('UserBuildings');
var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');

contract('Add User Building Test', function(accounts) {
  let userVillage;
  let buildingsData;
  let userBuildings;
  let experimentalToken;
  let userVault;

  acc_zero = accounts[0];
  acc_one = accounts[1];
  let ether = Math.pow(10,18);

  it('Set Deployed Contracts', function() {
    return UserVillage.deployed().then(function(instance) {
      userVillage = instance;
      return BuildingsData.deployed().then(function(instance) {
        buildingsData = instance;
        return UserBuildings.deployed().then(function(instance) {
          userBuildings = instance;
          return ExperimentalToken.deployed().then(function(instance) {
            experimentalToken = instance;
            return UserVault.deployed().then(function(instance) {
              userVault = instance;
            })
          })
        })
      })
    })
  });

  it('Create new building', function() {
    return experimentalToken.approve(userVault.address, 1 * ether).then(function(result) {
      return userVillage.create('My new village!','Cool player');
    }).then(function(result) {
      return buildingsData.addBuilding(20, 'City Center', 1500, 50, 0, 3000, 4000, 0, 0);
    }).then(function(result) {
      return userBuildings.addUserBuilding(20);
    }).then(function(result) {
      return userBuildings.getUserBuildings.call(acc_zero);
    }).then(function(buildings) {
      assert.equal(buildings.toString(), '20', 'Buildings are not the expected');
    })
  });

});
