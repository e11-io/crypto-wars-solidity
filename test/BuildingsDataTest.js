var BuildingsData = artifacts.require('BuildingsData');
var buildingsMock = require('../mocks/buildings');

contract('BuildingsData', (accounts) => {
  let buildingsData;
  acc_zero = accounts[0];
  acc_one = accounts[1];

  it('Set Deployed Contracts', () => {
    return BuildingsData.deployed().then((instance) => {
      buildingsData = instance;
    })
  });

  it('Create Buildings', () => {
    return buildingsData.addBuilding(...buildingsMock.initialBuildings[0]
    ).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[1])
    }).then(() => {
      return buildingsData.addBuilding(...buildingsMock.initialBuildings[2])
    })
  })

  it('Update Building Name', () => {
    return buildingsData.updateBuilding(
      0, 'Castle', -1, -1, -1, -1, -1, -1, -1
    ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 1500, 'health');
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Health', () => {
    return buildingsData.updateBuilding(
      0, '', 6000, -1, -1, -1, -1, -1, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Defense', () => {
    return buildingsData.updateBuilding(
      0, '', -1, 100, -1, -1, -1, -1, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Attack', () => {
    return buildingsData.updateBuilding(
      0, '', -1, -1, 30, -1, -1, -1, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building goldCapacity', () => {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, 10000, -1, -1, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building crystalEnergyCapacity', () => {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, 8000, -1, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Price', () => {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, 20, -1
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 20, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building resource', () => {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, -1, 300
  ).then((result) => {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 20, 'price');
      assert.equal(logArgs.resource.toNumber(), 300, 'resource');
    })
  });

  it('Update Building resource From NotOwner', () => {
    let expectedError = true;
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, -1, 300, {from: acc_one}
  ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Updating Building That Doesnt Exist', () => {
    let expectedError = true;
    return buildingsData.updateBuilding(
      3, '', -1, -1, -1, -1, -1, -1, 300, {from: acc_one}
  ).then((result) => {
      expectedError = false;
      assert(false, 'Test should fail');
    }).catch((error) => {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

});
