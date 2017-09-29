var BuildingsData = artifacts.require('./BuildingsData.sol');

module.exports = function(deployer) {
  deployer.deploy(BuildingsData);
};
