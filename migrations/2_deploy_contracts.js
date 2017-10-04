var ExperimentalToken = artifacts.require('e11-contracts/contracts/ExperimentalToken.sol');
var SimpleToken = artifacts.require('zeppelin-solidity/contracts/examples/SimpleToken.sol');
var UserVault = artifacts.require('./UserVault.sol');
var UserVillage = artifacts.require('./UserVillage.sol');
var UserResources = artifacts.require('./UserResources.sol');
var BuildingsData = artifacts.require('./BuildingsData.sol');
var UserBuildings = artifacts.require('./UserBuildings.sol');


module.exports = function(deployer) {
  deployer.deploy(ExperimentalToken).then(function() {
    return deployer.deploy(SimpleToken).then(function() {
      return deployer.deploy(UserVault, ExperimentalToken.address).then(function() {
        return deployer.deploy(UserResources).then(function() {
          return deployer.deploy(BuildingsData).then(function() {
            return deployer.deploy(UserBuildings, BuildingsData.address).then(function() {
              return deployer.deploy(UserVillage,
                                   UserVault.address,
                                   UserResources.address,
                                   UserBuildings.address)
              .then(function() {
              })
            })
          })
        })
      })
    })
  });
};
