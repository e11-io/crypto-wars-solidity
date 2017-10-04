var UserVillage = artifacts.require('UserVillage');
var BuildingsData = artifacts.require('BuildingsData');
var UserBuildings = artifacts.require('UserBuildings');
var ExperimentalToken = artifacts.require('ExperimentalToken');
var UserVault = artifacts.require('UserVault');
var UserResources = artifacts.require('UserResources');
var buildingsMock = require('../mocks/buildings');

contract('Add User Building Test', (accounts) => {
  let userVillage;
  let buildingsData;
  let userBuildings;
  let experimentalToken;
  let userVault;
  let userResources;

  acc_zero = accounts[0];
  acc_one = accounts[1];
  let ether = Math.pow(10,18);

  it('Set Deployed Contracts', () => {
    return UserVillage.deployed().then((instance) => {
      userVillage = instance;
      return BuildingsData.deployed().then((instance) => {
        buildingsData = instance;
        return UserBuildings.deployed().then((instance) => {
          userBuildings = instance;
          return ExperimentalToken.deployed().then((instance) => {
            experimentalToken = instance;
            return UserVault.deployed().then((instance) => {
              userVault = instance;
              return UserResources.deployed().then((instance) => {
                userResources = instance;
              })
            })
          })
        })
      })
    })
  });

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


  it('Add multiple buildings to User', () => {
    let ids = [0, 1, 2];
    return experimentalToken.approve(userVault.address, 1 * ether).then((result) => {
      return userVillage.create('My new village!','Cool player');
    }).then((result) => {
      return userBuildings.getUserBuildings.call(acc_zero);
    }).then((buildings) => {
      assert.equal(buildings.toString(), ids.toString(), 'Buildings are not the expected');
    })
  });

  // TODO: To user this test, you must go to the UserBuildings contract
  //       and comment the line "require(msg.sender == address(userVillage));"
  //
  // it('Add non-existent building to User', () => {
  //   let expectedError = true;
  //   let ids = [20, 99, 40];
  //   return userBuildings.addUserBuildings(ids).then(() => {
  //     expectedError = false;
  //     assert(false, 'Test should fail');
  //   }).catch((error) => {
  //     if (!expectedError) {
  //       assert(false, error.toString());
  //     }
  //   })
  // });

});
