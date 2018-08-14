const { assertRevert } = require('./assertThrow');
const ExperimentalToken = artifacts.require('ExperimentalToken');

module.exports = {
  isVersioned: async (instance, contract) => {
    // Get contract name
    let contractName = contract._json.contractName;
    if (!contractName) return;

    // Checks if contract has is'ContractName' identifier function.
    let isContract = await instance[`is${contractName}`]();
    if (!isContract) return;

    // Checks if contract's version is 0
    let version = await instance.version();
    if (version != 0) return;

    // Checks if contract is upgradeable
    let newInstance = await contract.new();
    await newInstance[`set${contractName}Version`](instance.address, 1);

    // Check if contract is not upgradeable to another contract type
    let basicToken = await ExperimentalToken.new();
    await assertRevert(async () => {
      await instance[`set${contractName}Version`](basicToken.address, 1);
    });

    // Checks if contract fails when upgraded from equal or higher version
    await assertRevert(async () => {
      await instance[`set${contractName}Version`](newInstance.address, 1);
    });

    return true;
  }
};
