const contracts = require('../../data/contracts.json');

export const environment = {
  blockTime: 10,
  production: true,
  remoteContracts: true,

  /* LATEST MIGRATION TO e11 311 */
  contracts: {
    ExperimentalToken:      contracts.ExperimentalToken,
    AssetsRequirements:     contracts.AssetsRequirements,
    BuildingsData:          contracts.BuildingsData,
    BuildingsQueue:         contracts.BuildingsQueue,
    UserBuildings:          contracts.UserBuildings,
    UserResources:          contracts.UserResources,
    UserVault:              contracts.UserVault,
    UserVillage:            contracts.UserVillage,
  },
};
