var UserBuildings = artifacts.require('./UserBuildings.sol');

module.exports = function(deployer) {
  deployer.deploy(UserBuildings);
};
