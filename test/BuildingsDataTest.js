var BuildingsData = artifacts.require('BuildingsData');

contract('BuildingsData', function(accounts) {
  let buildingsData;
  acc_zero = accounts[0];
  acc_one = accounts[1];

  it('Set Deployed Contracts', function() {
    return BuildingsData.deployed().then(function(instance) {
      buildingsData = instance;
    })
  });

  it('Update Building Name', function() {
    return buildingsData.addBuilding(
      0, 'City Center', 1500, 50, 0, 3000, 4000, 0, 0
  ).then(function(result) {
      return buildingsData.updateBuilding(0, 'Cannon', -1, -1, -1, -1, -1, -1, -1);
    }).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 1500, 'health');
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Health', function() {
    return buildingsData.updateBuilding(
      0, '', 6000, -1, -1, -1, -1, -1, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Defense', function() {
    return buildingsData.updateBuilding(
      0, '', -1, 100, -1, -1, -1, -1, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Attack', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, 30, -1, -1, -1, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building goldCapacity', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, 10000, -1, -1, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building crystalEnergyCapacity', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, 8000, -1, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building Price', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, 20, -1
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 20, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Update Building resource', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, -1, 300
  ).then(function(result) {
      let logArgs = result.logs[0].args;
      assert.equal(logArgs.name, 'Cannon');
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), 100, 'defense');
      assert.equal(logArgs.attack.toNumber(), 30, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 10000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 8000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 20, 'price');
      assert.equal(logArgs.resource.toNumber(), 300, 'resource');
    })
  });

  it('Update Building resource From NotOwner', function() {
    return buildingsData.updateBuilding(
      0, '', -1, -1, -1, -1, -1, -1, 300, {from: acc_one}
  ).then(function(result) {
      assert(false);
    }).catch(function(error) {
      assert(true, 'Error expected');
    })
  });

  it('Updating Building That Doesnt Exist', function() {
    let expectedError = true;
    return buildingsData.updateBuilding(
      3, '', -1, -1, -1, -1, -1, -1, 300, {from: acc_one}
  ).then(function(result) {
      assert(false, 'Test should fail');
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

});
