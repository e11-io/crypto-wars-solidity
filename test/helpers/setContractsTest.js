const { assertRevert } = require('./assertThrow');
const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

module.exports = {
  setContractsTest: async (instance) => {
    let basicToken = await ExperimentalToken.new();
    let contracts = {
      'AssetsRequirements': await AssetsRequirements.new(),
      'BuildingsData': await BuildingsData.new(),
      'BuildingsQueue': await BuildingsQueue.new(),
      'UserBuildings': await UserBuildings.new(),
      'UserResources': await UserResources.new(),
      'UserVault': await UserVault.new(),
      'UserVillage': await UserVillage.new(),
    };

    for (let contractName in contracts) {
      if (contracts.hasOwnProperty(contractName)) {
        if(instance[`set${contractName}`]) {
          await instance[`set${contractName}`](contracts[contractName].address);
          await assertRevert(async () => {
            await instance[`set${contractName}`](basicToken.address);
          });
        }
      }
    }

    return true;
  }
};
