var ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');
var SimpleToken = artifacts.require('zeppelin-solidity/contracts/examples/SimpleToken.sol');
var UserVault = artifacts.require('./UserVault.sol');
var UserVillage = artifacts.require('./UserVillage.sol');
var UserResources = artifacts.require('./UserResources.sol');
var BuildingsData = artifacts.require('./BuildingsData.sol');
var UserBuildings = artifacts.require('./UserBuildings.sol');
var BuildingsQueue = artifacts.require('./BuildingsQueue.sol');

var buildingsMock = require('../mocks/buildings');

module.exports = function(deployer) {
  deployer.deploy(ExperimentalToken).then(async () => {
    // Deploy contracts
    await deployer.deploy(SimpleToken);
    await deployer.deploy(UserVault, ExperimentalToken.address);
    await deployer.deploy(UserResources);
    await deployer.deploy(BuildingsData);
    await deployer.deploy(UserBuildings, BuildingsData.address);
    await deployer.deploy(UserVillage,
      UserVault.address,
      UserResources.address,
      UserBuildings.address);
    await deployer.deploy(BuildingsQueue);

    // Setup deployed contracts
    let userVillage = await UserVillage.deployed();
    let userResources = await UserResources.deployed();
    let userBuildings = await UserBuildings.deployed();
    let buildingsData = await BuildingsData.deployed();
    let buildingsQueue = await BuildingsQueue.deployed();

    await userResources.setUserVillage(UserVillage.address);
    await userResources.setUserBuildings(UserBuildings.address);
    await userResources.setBuildingsQueue(BuildingsQueue.address);

    await userBuildings.setUserVillage(UserVillage.address);
    await userBuildings.setUserResources(UserResources.address);
    await userBuildings.setBuildingsQueue(BuildingsQueue.address);

    await buildingsQueue.setUserResources(UserResources.address);
    await buildingsQueue.setUserBuildings(UserBuildings.address);
    await buildingsQueue.setBuildingsData(BuildingsData.address);

    // Initialize buildings data
    await buildingsData.addBuilding(buildingsMock.initialBuildings[0].id,
      buildingsMock.initialBuildings[0].name,
      buildingsMock.initialBuildings[0].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[1].id,
      buildingsMock.initialBuildings[1].name,
      buildingsMock.initialBuildings[1].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[2].id,
      buildingsMock.initialBuildings[2].name,
      buildingsMock.initialBuildings[2].stats)
  })
};
