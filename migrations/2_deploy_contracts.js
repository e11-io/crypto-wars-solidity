const ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');
const SimpleToken = artifacts.require('zeppelin-solidity/contracts/examples/SimpleToken.sol');

const BuildingsData = artifacts.require('./BuildingsData.sol');
const BuildingsQueue = artifacts.require('./BuildingsQueue.sol');
const UserBuildings = artifacts.require('./UserBuildings.sol');
const UserResources = artifacts.require('./UserResources.sol');
const UserVault = artifacts.require('./UserVault.sol');
const UserVillage = artifacts.require('./UserVillage.sol');

const buildingsMock = require('../mocks/buildings-production');
const resourcesMock = require('../mocks/resources-production');

const initialUserBuildings = [
  buildingsMock.initialBuildings[0].id,
];

module.exports = function(deployer) {
  deployer.deploy(ExperimentalToken).then(async () => {
    // Deploy contracts
    await deployer.deploy(BuildingsData);
    await deployer.deploy(BuildingsQueue);
    await deployer.deploy(SimpleToken);
    await deployer.deploy(UserBuildings);
    await deployer.deploy(UserResources);
    await deployer.deploy(UserVault);
    await deployer.deploy(UserVillage);

    // Setup deployed contracts
    let buildingsData = await BuildingsData.deployed();
    let buildingsQueue = await BuildingsQueue.deployed();
    let userBuildings = await UserBuildings.deployed();
    let userResources = await UserResources.deployed();
    let userVault = await UserVault.deployed();
    let userVillage = await UserVillage.deployed();

    buildingsQueue.setBuildingsData(BuildingsData.address);
    buildingsQueue.setUserBuildings(UserBuildings.address);
    buildingsQueue.setUserResources(UserResources.address);

    userBuildings.setBuildingsData(BuildingsData.address);
    userBuildings.setBuildingsQueue(BuildingsQueue.address);
    userBuildings.setUserResources(UserResources.address);
    userBuildings.setUserVillage(UserVillage.address);

    userResources.setBuildingsQueue(BuildingsQueue.address);
    userResources.setUserBuildings(UserBuildings.address);
    userResources.setUserVillage(UserVillage.address);

    userVault.setExperimentalToken(ExperimentalToken.address);
    userVault.setUserVillage(UserVillage.address);

    await userVillage.setBuildingsData(BuildingsData.address);
    userVillage.setUserBuildings(UserBuildings.address);
    userVillage.setUserResources(UserResources.address);
    userVillage.setUserVault(UserVault.address);

    // Initialize buildings data
    for (var i = 0; i < buildingsMock.initialBuildings.length; i++) {
      if (i == 0) {
        await buildingsData.addBuilding(buildingsMock.initialBuildings[i].id,
          buildingsMock.initialBuildings[i].name,
          buildingsMock.initialBuildings[i].stats);
      }
      buildingsData.addBuilding(buildingsMock.initialBuildings[i].id,
        buildingsMock.initialBuildings[i].name,
        buildingsMock.initialBuildings[i].stats);
    }

    userVillage.setInitialBuildings(initialUserBuildings);
    userResources.setInitialResources(...resourcesMock.initialResources);

  })
};
