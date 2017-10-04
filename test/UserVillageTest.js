var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');
var UserVillage = artifacts.require('UserVillage');
var UserResources = artifacts.require('UserResources');
var UserBuildings = artifacts.require('UserBuildings');
var BuildingsData = artifacts.require('BuildingsData');
var buildingsMock = require('../mocks/buildings');

contract('UserVillage', (accounts) => {

  let ether = Math.pow(10, 18);
  acc_zero = accounts[0];
  acc_one = accounts[1];
  acc_two = accounts[2];
  acc_three = accounts[3];
  let transactions = [];
  let experimentalToken;
  let userVault;
  let userVillage;
  let userResources;
  let userBuildings;
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
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[1])
    }).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[2])
    })
  })



  it('Create village', () => {
    return experimentalToken.approve(userVault.address, 1 * ether).then((result) => {
      return userVillage.create('My new village!', 'Cool player')
    }).then((result) => {
      transactions.push({test: 'Create Village',function: 'create', gasUsed: result.receipt.gasUsed})
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
    })
  });

  it('Create village from acc_one', () => {
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_one}).then((result) => {
      return experimentalToken.transfer(acc_one, 1 * ether);
    }).then((result) => {
      return userVillage.create('Village number two','acc_one', {from: acc_one});
    })
  });

  it('Create another village with same User', () => {
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether).then((result) => {
      return userVillage.create('Another Village','Another username');
    }).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village from account without e11', () => {
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_one}).then(() => {
      return userVillage.create('AccOneVillage','acc_one', {from: acc_one});
    }).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village with taken Username', () => {
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_two}).then(() => {
      return experimentalToken.transfer(acc_two, 5 * ether);
    }).then((result) => {
      return userVillage.create('AccTwoVillage','acc_one', {from: acc_two});
    }).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  }),

  it('Create village with empty Village Name', () => {
    let expectedError = true;
    return experimentalToken.approve(userVault.address, 1 * ether, {from: acc_three}).then(() => {
      return experimentalToken.transfer(acc_three, 5 * ether);
    }).then((result) => {
      return userVillage.create('','acc_one', {from: acc_three});
    }).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  })

});
