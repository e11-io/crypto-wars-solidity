module.exports = {
  initializeContracts: async (contracts) => {
    for (let instanceName in contracts) {
      if (contracts.hasOwnProperty(instanceName)) {
        let instance = contracts[instanceName];
        for (let contractName in contracts) {
          if (contracts.hasOwnProperty(contractName)) {
            // Capitalize the contract name
            let capitalizedName = contractName.charAt(0).toUpperCase() + contractName.slice(1);
            if(instance[`set${capitalizedName}`]) {
              await instance[`set${capitalizedName}`](contracts[contractName].address);
            }
          }
        }
      }
    }

    return true;
  }
};
