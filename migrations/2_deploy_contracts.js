const AssetsRequirements = artifacts.require('./assets/AssetsRequirements.sol');
const BattleSystem = artifacts.require('./system/BattleSystem.sol');
const BuildingsData = artifacts.require('./assets/buildings/BuildingsData.sol');
const BuildingsQueue = artifacts.require('./assets/buildings/BuildingsQueue.sol');
const PointsSystem = artifacts.require('./token/PointsSystem.sol');
const ExperimentalToken = artifacts.require('./token/ExperimentalToken.sol');
const UnitsData = artifacts.require('./assets/units/UnitsData.sol');
const UnitsQueue = artifacts.require('./assets/units/UnitsQueue.sol');
const UserBuildings = artifacts.require('./user/UserBuildings.sol');
const UserResources = artifacts.require('./user/UserResources.sol');
const UserUnits = artifacts.require('./user/UserUnits.sol');
const UserVault = artifacts.require('./user/UserVault.sol');
const UserVillage = artifacts.require('./user/UserVillage.sol');

const { initializeContracts } = require('../test/helpers/initializeContracts');
const buildingsMock = require('../data/production/buildings');
const resourcesMock = require('../data/production/resources');
const unitsMock = require('../data/production/units');
const battleMock = require('../data/production/battle');
const pointsMock = require('../data/production/points');

const cityCenter_1 = buildingsMock.initialBuildings.find(building => building.name === 'city_center_1');

const initialUserBuildings = [cityCenter_1.id];

module.exports = function(deployer) {

  console.time('Deployed contracts');
  // Deploy contracts
  deployer.deploy([
    AssetsRequirements,
    BattleSystem,
    BuildingsData,
    BuildingsQueue,
    PointsSystem,
    ExperimentalToken,
    UnitsData,
    UnitsQueue,
    UserBuildings,
    UserResources,
    UserUnits,
    UserVault,
    UserVillage
  ]).then(async () => {

    console.timeEnd('Deployed contracts');

    let assetsRequirements = await AssetsRequirements.deployed();
    let battleSystem = await BattleSystem.deployed();
    let buildingsData = await BuildingsData.deployed();
    let buildingsQueue = await BuildingsQueue.deployed();
    let pointsSystem = await PointsSystem.deployed();
    let experimentalToken = await ExperimentalToken.deployed();
    let unitsData = await UnitsData.deployed();
    let unitsQueue = await UnitsQueue.deployed();
    let userBuildings = await UserBuildings.deployed();
    let userResources = await UserResources.deployed();
    let userUnits = await UserUnits.deployed();
    let userVault = await UserVault.deployed();
    let userVillage = await UserVillage.deployed();

    console.time('Initialized contracts');
    // Setup deployed contracts
    await initializeContracts({
      assetsRequirements,
      battleSystem,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      unitsData,
      unitsQueue,
      userBuildings,
      userResources,
      userUnits,
      userVault,
      userVillage,
    }, true);
    console.timeEnd('Initialized contracts');

    console.time('Setted up initial data and requirements');
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
          if (i == assets[j].initialAssets.length - 1) {
            await assetsRequirements.setAssetRequirements(assets[j].initialAssets[i].id, assets[j].initialAssets[i].requirements);
          } else {
            assetsRequirements.setAssetRequirements(assets[j].initialAssets[i].id, assets[j].initialAssets[i].requirements);
          }
        }
      }
    };
    console.timeEnd('Setted up initial data and requirements');

    console.time('Setted up initial buildings and resources');
    userVillage.setInitialBuildings(initialUserBuildings);
    await userResources.setInitialResources(...resourcesMock.initialResources);
    console.timeEnd('Setted up initial buildings and resources');

    console.time('Setted up points system properties');
    await pointsSystem.setPointsThreshold(pointsMock.properties.lowerPointsThreshold, pointsMock.properties.upperPointsThreshold);
    console.timeEnd('Setted up points system properties');

    console.time('Setted up battle system properties');
    battleSystem.setAttackCooldown(battleMock.properties.attackCooldown);
    battleSystem.setRewardDefenderModifier(battleMock.properties.rewardDefenderModifier);
    battleSystem.setRevengeTimeThreshold(battleMock.properties.revengeTimeThreshold);
    await battleSystem.setRewardAttackerModifier(battleMock.properties.rewardAttackerModifier);
    console.timeEnd('Setted up battle system properties');

  });
};
