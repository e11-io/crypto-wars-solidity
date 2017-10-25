var ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');
var SimpleToken = artifacts.require('zeppelin-solidity/contracts/examples/SimpleToken.sol');
var UserVault = artifacts.require('./UserVault.sol');
var UserVillage = artifacts.require('./UserVillage.sol');
var UserResources = artifacts.require('./UserResources.sol');
var BuildingsData = artifacts.require('./BuildingsData.sol');
var UserBuildings = artifacts.require('./UserBuildings.sol');
var BuildingsQueue = artifacts.require('./BuildingsQueue.sol');


module.exports = function(deployer) {
  deployer.deploy(ExperimentalToken).then(() => {
    return deployer.deploy(SimpleToken).then(() => {
      return deployer.deploy(UserVault, ExperimentalToken.address).then(() => {
        return deployer.deploy(UserResources).then(() => {
          return deployer.deploy(BuildingsData).then(() => {
            return deployer.deploy(UserBuildings, BuildingsData.address).then(() => {
              return deployer.deploy(UserVillage,
                                   UserVault.address,
                                   UserResources.address,
                                   UserBuildings.address)
              .then(() => {
                return deployer.deploy(BuildingsQueue).then(() => {

                })
              })
            })
          })
        })
      })
    })
  });
};
