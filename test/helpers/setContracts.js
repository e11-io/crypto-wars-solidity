const { assertRevert } = require('./assertThrow');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const SimpleToken = artifacts.require('SimpleToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

module.exports = {
  setContracts: async (instance) => {
    let simpleToken = await SimpleToken.new();
    let contracts = {
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
            await instance[`set${contractName}`](simpleToken.address);
          });
        }
      }
    }

    return true;
  }
};
