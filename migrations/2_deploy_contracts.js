const ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');

const AssetsRequirements = artifacts.require('./AssetsRequirements.sol');
const BuildingsData = artifacts.require('./BuildingsData.sol');
const BuildingsQueue = artifacts.require('./BuildingsQueue.sol');
const UnitsData = artifacts.require('./UnitsData.sol');
const UnitsQueue = artifacts.require('./UnitsQueue.sol');
const UserBuildings = artifacts.require('./UserBuildings.sol');
const UserResources = artifacts.require('./UserResources.sol');
const UserUnits = artifacts.require('./UserUnits.sol');
const UserVault = artifacts.require('./UserVault.sol');
const UserVillage = artifacts.require('./UserVillage.sol');

const { initializeContracts } = require('../test/helpers/initializeContracts');
const buildingsMock = require('../mocks/buildings-production');
const resourcesMock = require('../mocks/resources-production');
const unitsMock = require('../mocks/units-production');

const initialUserBuildings = [
  buildingsMock.initialBuildings[0].id,
];

module.exports = function(deployer) {
  // Deploy contracts
  deployer.deploy([
    AssetsRequirements,
    BuildingsData,
    BuildingsQueue,
    ExperimentalToken,
    UnitsData,
    UnitsQueue,
    UserBuildings,
    UserResources,
    UserUnits,
    UserVault,
    UserVillage
  ]).then(async () => {

    let assetsRequirements = await AssetsRequirements.deployed();
    let buildingsData = await BuildingsData.deployed();
    let buildingsQueue = await BuildingsQueue.deployed();
    let experimentalToken = await ExperimentalToken.deployed();
    let unitsData = await UnitsData.deployed();
    let unitsQueue = await UnitsQueue.deployed();
    let userBuildings = await UserBuildings.deployed();
    let userResources = await UserResources.deployed();
    let userUnits = await UserUnits.deployed();
    let userVault = await UserVault.deployed();
    let userVillage = await UserVillage.deployed();

    // Setup deployed contracts
    await initializeContracts({
      assetsRequirements,
      buildingsData,
      buildingsQueue,
      experimentalToken,
      unitsData,
      unitsQueue,
      userBuildings,
      userResources,
      userUnits,
      userVault,
      userVillage,
    }, true);

    // Initialize Buildings and Units data & requirements
    let assets = [{
        initialAssets: buildingsMock.initialBuildings,
        contractFunction: buildingsData.addBuilding
      },{
        initialAssets: unitsMock.initialUnits,
        contractFunction: unitsData.addUnit
      }];

    for (var j = 0; j < assets.length; j++) {
      // Initialize Data
      for (var i = 0; i < assets[j].initialAssets.length; i++) {
        // If is the last asset wait for confirmation
        if (i == assets[j].initialAssets.length - 1) {
          await assets[j].contractFunction(assets[j].initialAssets[i].id, assets[j].initialAssets[i].name, assets[j].initialAssets[i].stats);
        } else {
          assets[j].contractFunction(assets[j].initialAssets[i].id, assets[j].initialAssets[i].name, assets[j].initialAssets[i].stats);
        }
      }
      // Initialize Requirements
      for (var i = 0; i < assets[j].initialAssets.length; i++) {
        if (assets[j].initialAssets[i].requirements.length > 0) {
          assetsRequirements.setAssetRequirements(assets[j].initialAssets[i].id, assets[j].initialAssets[i].requirements);
        }
      }
    };


    userVillage.setInitialBuildings(initialUserBuildings);
    userResources.setInitialResources(...resourcesMock.initialResources);

  })
};
