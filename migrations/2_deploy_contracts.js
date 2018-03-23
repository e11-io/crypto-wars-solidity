const ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');
const SimpleToken = artifacts.require('zeppelin-solidity/contracts/examples/SimpleToken.sol');

const AssetsRequirements = artifacts.require('./AssetsRequirements.sol');
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
    await deployer.deploy(AssetsRequirements);
    await deployer.deploy(BuildingsData);
    await deployer.deploy(BuildingsQueue);
    await deployer.deploy(SimpleToken);
    await deployer.deploy(UserBuildings);
    await deployer.deploy(UserResources);
    await deployer.deploy(UserVault);
    await deployer.deploy(UserVillage);

    // Setup deployed contracts
    let assetsRequirements = await AssetsRequirements.deployed();
    let buildingsData = await BuildingsData.deployed();
    let buildingsQueue = await BuildingsQueue.deployed();
    let userBuildings = await UserBuildings.deployed();
    let userResources = await UserResources.deployed();
    let userVault = await UserVault.deployed();
    let userVillage = await UserVillage.deployed();

    assetsRequirements.setBuildingsData(BuildingsData.address);
    assetsRequirements.setBuildingsQueue(BuildingsQueue.address);
    assetsRequirements.setUserBuildings(UserBuildings.address);

    buildingsQueue.setAssetsRequirements(AssetsRequirements.address);
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
      if (i == 0 || i == buildingsMock.initialBuildings.length - 1) {
        await buildingsData.addBuilding(buildingsMock.initialBuildings[i].id,
          buildingsMock.initialBuildings[i].name,
          buildingsMock.initialBuildings[i].stats);
      } else {
        buildingsData.addBuilding(buildingsMock.initialBuildings[i].id,
          buildingsMock.initialBuildings[i].name,
          buildingsMock.initialBuildings[i].stats);
      }
    }

    // Set Assets requirements
    for (var i = 0; i < buildingsMock.initialBuildings.length; i++) {
      if (buildingsMock.initialBuildings[i].requirements.length > 0) {
        assetsRequirements.setAssetRequirements(buildingsMock.initialBuildings[i].id, buildingsMock.initialBuildings[i].requirements);
      }
    }

    userVillage.setInitialBuildings(initialUserBuildings);
    userResources.setInitialResources(...resourcesMock.initialResources);

  })
};
