const fs = require('fs-extra');
const cpr = require('cpr');

const AssetsRequirements = artifacts.require('./assets/AssetsRequirements.sol');
const BattleSystem = artifacts.require('./system/BattleSystem.sol');
const BuildingsData = artifacts.require('./assets/buildings/BuildingsData.sol');
const BuildingsQueue = artifacts.require('./assets/buildings/BuildingsQueue.sol');
const PointsSystem = artifacts.require('./system/PointsSystem.sol');
const ExperimentalToken = artifacts.require('./token/ExperimentalToken.sol');
const UnitsData = artifacts.require('./assets/units/UnitsData.sol');
const UnitsQueue = artifacts.require('./assets/units/UnitsQueue.sol');
const UserBuildings = artifacts.require('./user/UserBuildings.sol');
const UserResources = artifacts.require('./user/UserResources.sol');
const UserUnits = artifacts.require('./user/UserUnits.sol');
const UserVault = artifacts.require('./user/UserVault.sol');
const UserVillage = artifacts.require('./user/UserVillage.sol');

module.exports = function(deployer) {

  if (process.env.SOLIDITY_COVERAGE || process.env.SOLIDITY_TEST) {
    return;
  }

  return new Promise(async (resolve) => {
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

    // After correct deployment
    const addresses = {
      AssetsRequirements: AssetsRequirements.address,
      BuildingsQueue: BuildingsQueue.address,
      UnitsData: UnitsData.address,
      UserResources: UserResources.address,
      UserUnits: UserUnits.address,
      BuildingsData: BuildingsData.address,
      BattleSystem: BattleSystem.address,
      UserBuildings: UserBuildings.address,
      ExperimentalToken: ExperimentalToken.address,
      UnitsQueue: UnitsQueue.address,
      UserVillage: UserVillage.address,
      UserVault: UserVault.address,
      PointsSystem: PointsSystem.address,
    };

    fs.writeJSON('./data/contracts.json', addresses, { spaces: 2 }).then(() => {
      console.log('Saved contracts addresses.');
    }).catch((error) => {
      console.error('Error while writing contracts addresses', error);
    });

    cpr('./build/contracts/', './src/assets/contracts/', {
      deleteFirst: true,
      overwrite: true,
      confirm: true,
      filter: (filename) =>
        Object.keys(addresses).find((contractName) =>
        filename.indexOf(contractName) != -1
      )
    }, function (error, files) {
      if (error) {
        return console.error('Error while copying contracts to frontend assets', error);
      }
      files.forEach((file) => {
        let jsonContract = fs.readJsonSync(file);
        fs.outputJsonSync(file, {
          contractName:  jsonContract.contractName,
          abi:           jsonContract.abi,
          compiler:      jsonContract.compiler,
          networks:      jsonContract.networks,
          schemaVersion: jsonContract.schemaVersion,
          updatedAt:     jsonContract.updatedAt
        });
      })
      console.log('Contracts copied to frontend assets');
    });
  });
};
