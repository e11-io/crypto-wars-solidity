var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');
var UserVillage = artifacts.require('UserVillage');
var UserResources = artifacts.require('UserResources');
var UserBuildings = artifacts.require('UserBuildings');
var BuildingsData = artifacts.require('BuildingsData');
var buildingsMock = require('../mocks/buildings');
var resourcesMock = require('../mocks/resources');


contract('User Resources', (accounts) => {

  let ether = Math.pow(10, 18);
  acc_zero = accounts[0];
  acc_one = accounts[1];
  acc_two = accounts[2];
  acc_three = accounts[3];
  let experimentalToken;
  let userVault;
  let userVillage;
  let userResources;
  let userBuildings
  let buildingsData;

  it('Set Deployed Contracts', () => {
    return ExperimentalToken.deployed().then((instance) => {
      experimentalToken = instance;
      return UserVault.deployed().then((instance) => {
        userVault = instance;
        return UserVillage.deployed().then((instance) => {
          userVillage = instance;
          return UserResources.deployed().then((instance) => {
            userResources = instance;
            return UserBuildings.deployed().then((instance) => {
              userBuildings = instance;
              return BuildingsData.deployed().then((instance) => {
                buildingsData = instance;
              })
            })
          })
        })
      })
    })
  }),

  it('Set User Resources', () => {
    return userResources.setUserVillageAddress(userVillage.address);
  })

  it('Set User Buildings', () => {
    return userBuildings.setUserVillage(userVillage.address);
  })

  it('Create Buildings', () => {
    return buildingsData.addBuilding(...buildingsMock.initialBuildings[0]
    ).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[1]);
    }).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[2]);
    })
  })

  it('Initialize Resources', () => {
    return userResources.setInitialResources(...resourcesMock.initialResources);
  })



  it('Create village', () => {
    return experimentalToken.approve(userVault.address, 1 * ether).then((result) => {
      return userVillage.create('My new village!', 'Cool player')
    }).then((result) => {
      assert.equal(result.logs[0].event,'VillageCreated');
      assert.equal(result.logs[0].args.owner, acc_zero);
      assert.equal(result.logs[0].args.name,'My new village!');
      assert.equal(result.logs[0].args.username,'Cool player');
      assert('Village was created');
      return userVault.balanceOf(acc_zero);
    }).then((balance) => {
      assert.equal(balance.toNumber(), 1 * ether, 'User E11 in Vault should be 1');
      return experimentalToken.balanceOf(userVault.address);
    }).then((balance) => {
      assert.equal(balance.toNumber(), 1 * ether, 'UserVault E11 balance should be 1');
      return userResources.getUserResources.call(acc_zero);
    }).then((resources) => {
      assert.equal(resources[0].toNumber(), 4000, 'Initial gold amount is incorrect')
      assert.equal(resources[1].toNumber(), 4000, 'Initial crystal amount is incorrect')
      assert.equal(resources[2].toNumber(), 1, 'Initial quantum amount is incorrect')
    })
  });

  it('Set User Village from Not Owner', () => {
    expectedError = true;
    return userResources.setUserVillageAddress(
      userVillage.address, {from: acc_one}
    ).then(() => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if (!expectedError) {
        assert(false, error.toString());
      }
    })
  })

  it('Init User Resources from not User Village Contract', () => {
    expectedError = true;
    return userResources.initUserResources(acc_one).then(() => {
      return userResources.getUserResources.call(acc_one);
    }).then((resources) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if (!expectedError) {
        assert(false, error.toString());
      }
    })
  })

});
