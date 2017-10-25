const UserVillage = artifacts.require('UserVillage');
const BuildingsData = artifacts.require('BuildingsData');
const UserBuildings = artifacts.require('UserBuildings');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const UserResources = artifacts.require('UserResources');

var buildingsMock = require('../mocks/buildings');

contract('User Buildings Test', accounts => {
  let userVillage, buildingsData, userBuildings, experimentalToken, userVault, userResources = {};

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  beforeEach(async () => {
    experimentalToken = await ExperimentalToken.new();
    userVault = await UserVault.new(experimentalToken.address);
    userResources = await UserResources.new();
    buildingsData = await BuildingsData.new();
    userBuildings= await UserBuildings.new(buildingsData.address);
    userVillage = await UserVillage.new(userVault.address,
                                        userResources.address,
                                        userBuildings.address);

    await userResources.setUserVillageAddress(userVillage.address);
    await userBuildings.setUserVillage(userVillage.address);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[1]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[2]);
    await experimentalToken.approve(userVault.address, 1 * ether);
  })

  it('Check if initial buildings added correctly after user creation', async () => {
    let ids = [1, 2, 3];
    await userVillage.create('My new village!','Cool player');

    const buildings = await userBuildings.getUserBuildings.call(Alice);

    assert.equal(buildings.toString(), ids.toString(), 'Buildings are not the expected');
  })

  context('Existing initial buildings period', async () => {
    beforeEach(async () => {
      await userVillage.create('My new village!','Cool player');
    })

    it('Add new Gold Mine', async () => {
      // this test runs only if require(msg.sender == address(userVillage)) in
      //  UserBuildings.addUserBuildings is commented.
      let ids = [2];
      let indexes = [0];
      await userBuildings.addUserBuildings(Alice, ids, indexes);

      const buildings = await userBuildings.getUserBuildings.call(Alice);

      assert.equal(buildings.toString(), '1,2,3,2', 'Buildings are not the expected');
    })
  })
})
