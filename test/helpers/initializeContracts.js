module.exports = {
  initializeContracts: async (contracts, fast = false) => {
    for (let instanceName in contracts) {
      if (contracts.hasOwnProperty(instanceName)) {
        let instance = contracts[instanceName];
        for (let contractName in contracts) {
          if (contracts.hasOwnProperty(contractName)) {
            // Capitalize the contract name
            let capitalizedName = contractName.charAt(0).toUpperCase() + contractName.slice(1);
            if(instance[`set${capitalizedName}`]) {
              fast? instance[`set${capitalizedName}`](contracts[contractName].address):
              await instance[`set${capitalizedName}`](contracts[contractName].address);
            }
          }
        }
      }
    }

    return true;
  }
};
