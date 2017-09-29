var BuildingsData = artifacts.require('BuildingsData');

contract('AddBuilding', function(accounts) {
  let buildingsData;
  acc_zero = accounts[0];
  acc_one = accounts[1];
  let transactions = [];

  it('Set Deployed Contracts', function() {
    return BuildingsData.deployed().then(function(instance) {
      buildingsData = instance;
    })
  })

  it('Add New Building', function() {
    return buildingsData.addBuilding(
      0, 'City Center', 1500, 50, 0, 3000, 4000, 0, 0, {gas: 150000}
  ).then(function(result) {
      transactions.push({test: 'Add New Building', function: 'addBuilding', gasUsed: result.receipt.gasUsed})
      let logEvent = result.logs[0].event;
      let logArgs = result.logs[0].args;
      assert.equal(logEvent, 'AddBuilding');
      assert.equal(logArgs.name, 'City Center');
      assert.equal(logArgs.health.toNumber(), 1500), 'health';
      assert.equal(logArgs.defense.toNumber(), 50, 'defense');
      assert.equal(logArgs.attack.toNumber(), 0, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 3000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 4000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 0, 'price');
      assert.equal(logArgs.resource.toNumber(), 0, 'resource');
    })
  });

  it('Add Building that Already Exists', function() {
    let expectedError = true;
    return buildingsData.addBuilding(
      0, 'City Center', 1500, 50, 0, 3000, 4000, 0, 0, {gas: 1}
    ).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with empty name', function() {
    let expectedError = true;
    return buildingsData.addBuilding(
      0, '', 1500, 50, 0, 3000, 4000, 0, 0
    ).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with negative Health', function() {
    let expectedError = true;
    return buildingsData.addBuilding(
      1, 'Gold Mine', -20, 50, 0, 3000, 4000, 0, 0
    ).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Add Building with negative Health and empty name', function() {
    let expectedError = true;
    return buildingsData.addBuilding(
      2, '', -20, 50, 0, 3000, 4000, 0, 0
    ).then(function(result) {
      expectedError = false;
    }).catch(function(error) {
      if(!expectedError){
        assert(false, error.toString());
      }
    })
  });

  it('Gas cost', function() {
    let expectedError = true;
    return buildingsData.addBuilding(
      5, 'Cannon', 1500, 50, 0, 3000, 4000, 0, 0
  ).then(function(data) {
      web3.eth.getTransactionReceipt(
        data.tx, (err, data) => {
          transactions.push({test: 'Gas cost',function: 'getTransactionReceipt', gasUsed: data.gasUsed});
          return true;
        });
    })
  });

});
