const contracts = require('../data/contracts');

const BuildingsData = artifacts.require('./assets/buildings/BuildingsData.sol');
const AssetsRequirements = artifacts.require('./assets/buildings/AssetsRequirements.sol');
const buildingsMock = require('../data/production/buildings');

let activeAccount;

module.exports = async (callback) => {

  const buildingsData = BuildingsData.at(contracts.BuildingsData);
  const assetsRequirements = AssetsRequirements.at(contracts.AssetsRequirements);

  web3.eth.getAccounts(async (err,res) => {
    activeAccount = res[0];

    // Update buildings
    console.time('Updated buildings data');
    for (let i = 0; i < buildingsMock.initialBuildings.length; i++) {
      const building = buildingsMock.initialBuildings[i];
      if (i === (buildingsMock.initialBuildings.length - 1)) {
        await buildingsData.updateBuilding(building.id, building.name, building.stats, { from: activeAccount });
      } else {
        buildingsData.updateBuilding(building.id, building.name, building.stats, { from: activeAccount });
      }
    }
    console.timeEnd('Updated buildings data');


    // Update buildings requirements
    console.time('Updated buildings requirements');
    for (let i = 0; i < buildingsMock.initialBuildings.length; i++) {
      const building = buildingsMock.initialBuildings[i];
      const oldRequirements = await assetsRequirements.getRequirements(building.id);
      for (let y = 0; y < oldRequirements.length; y++) {
        if (i === (buildingsMock.initialBuildings.length - 1) && y === (oldRequirements.length - 1)) {
          await assetsRequirements.updateAssetRequirement(building.id, oldRequirements[y], building.requirements[y]);
        } else {
          assetsRequirements.updateAssetRequirement(building.id, oldRequirements[y], building.requirements[y]);
        }
      }
    }
    console.timeEnd('Updated buildings requirements');

    process.exit(0);
  });
}
