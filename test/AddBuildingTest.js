var BuildingsData = artifacts.require('BuildingsData');
var buildingsMock = require('../mocks/buildings');

contract('AddBuilding', (accounts) => {
  let buildingsData;
  acc_zero = accounts[0];
  acc_one = accounts[1];
  let transactions = [];

  it('Set Deployed Contracts', () => {
    return BuildingsData.deployed().then((instance) => {
      buildingsData = instance;
    })
  })

  it('Create Buildings', () => {
    return buildingsData.addBuilding(...buildingsMock.initialBuildings[0]
    ).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[1])
    }).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[2])
    })
  })

  it('Add New Building', () => {
    return buildingsData.addBuilding(
      99, 'Cannon', 1500, 50, 0, 3000, 4000, 0, 0
  ).then((result) => {
      transactions.push({test: 'Add New Building', function: 'addBuilding', gasUsed: result.receipt.gasUsed})
      let logEvent = result.logs[0].event;
      let logArgs = result.logs[0].args;
      assert.equal(logEvent, 'AddBuilding');
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 1500), 'health';
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Add Building that Already Exists', () => {
    let expectedError = true;
    return buildingsData.addBuilding(
      0, 'City Center', 1500, 50, 0, 3000, 4000, 0, 0
    ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with empty name', () => {
    let expectedError = true;
    return buildingsData.addBuilding(
      88, '', 1500, 50, 0, 3000, 4000, 0, 0
    ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with negative Health', () => {
    let expectedError = true;
    return buildingsData.addBuilding(
      44, 'Wall', -20, 50, 0, 3000, 4000, 0, 0
    ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with negative Health and empty name', () => {
    let expectedError = true;
    return buildingsData.addBuilding(
      2, '', -20, 50, 0, 3000, 4000, 0, 0
    ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Gas cost', () => {
    let expectedError = true;
    return buildingsData.addBuilding(
      5, 'Cannon', 1500, 50, 0, 3000, 4000, 0, 0
  ).then((data) => {
      web3.eth.getTransactionReceipt(
        data.tx, (err, data) => {
          transactions.push({test: 'Gas cost',function: 'getTransactionReceipt', gasUsed: data.gasUsed});
          return true;
        });
    })
  });

});
