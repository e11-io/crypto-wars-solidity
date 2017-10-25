const BuildingsData = artifacts.require('BuildingsData');

var buildingsMock = require('../mocks/buildings');
const { assertInvalidOpcode } = require('./helpers/assertThrow');

contract('Buildings Data Test', accounts => {
  let buildingsData = {};
  const Alice = accounts[0];
  const Bob = accounts[1];

  beforeEach(async () => {
    buildingsData = await BuildingsData.new();
  })

  it('Building creation', async () => {
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);

    const [price, resource, blocks] = await buildingsData.getBuildingData.call(1);

    assert.equal(buildingsMock.initialBuildings[0][7], price.toNumber());
    assert.equal(buildingsMock.initialBuildings[0][8], resource.toNumber());
    assert.equal(buildingsMock.initialBuildings[0][9], blocks.toNumber());
  })

  it('Add building with empty name', async () => {
    return assertInvalidOpcode(async () => {
      await buildingsData.addBuilding(88, '', 1500, 50, 0, 3000, 4000, 0, 0, 2);
    })
  })

  it('Add Building with negative Health', async () => {
    return assertInvalidOpcode(async () => {
      await buildingsData.addBuilding(44, 'Wall', -20, 50, 0, 3000, 4000, 0, 0, 2);
    })
  })

  it('Add Building with negative Health and empty name', async () => {
    return assertInvalidOpcode(async () => {
      await buildingsData.addBuilding(2, '', -20, 50, 0, 3000, 4000, 0, 0, 2);
    })
  })

  context('Existing buildings period', async() => {
    beforeEach(async () => {
      await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);
      await buildingsData.addBuilding(...buildingsMock.initialBuildings[1]);
      await buildingsData.addBuilding(...buildingsMock.initialBuildings[2]);
    })

    it('Update building name', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        building[0], 'Castle', -1, -1, -1, -1, -1, -1, -1, -1
      )
      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, 'Castle');
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building health', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        building[0], '', 6000, -1, -1, -1, -1, -1, -1, -1
      )
      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), 6000, 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building defense', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, 6000, -1, -1, -1, -1, -1, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), 6000, 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building attack', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, 6000, -1, -1, -1, -1, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), 6000, 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building gold capacity', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, -1, 6000, -1, -1, -1, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), 6000, 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building crystal energy', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, -1, -1, 6000, -1, -1, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), 6000, 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building price', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, -1, -1, -1, 6000, -1, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), 6000, 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building resources', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, -1, -1, -1, -1, 6000, -1
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), 6000, 'resource');
      assert.equal(logArgs.blocks.toNumber(), building[9], 'blocks');
    })

    it('Update building blocks', async () => {
      let building = buildingsMock.initialBuildings[0];

      const txData = await buildingsData.updateBuilding(
        1, '', -1, -1, -1, -1, -1, -1, -1, 6000
      )

      let logArgs = txData.logs[0].args;

      assert.equal(logArgs.name, building[1]);
      assert.equal(logArgs.health.toNumber(), building[2], 'health');
      assert.equal(logArgs.defense.toNumber(), building[3], 'defense');
      assert.equal(logArgs.attack.toNumber(), building[4], 'attack');
      assert.equal(logArgs.goldCapacity.toNumber(), building[5], 'goldCapacity');
      assert.equal(logArgs.crystalEnergyCapacity.toNumber(), building[6], 'crystalEnergyCapacity');
      assert.equal(logArgs.price.toNumber(), building[7], 'price');
      assert.equal(logArgs.resource.toNumber(), building[8], 'resource');
      assert.equal(logArgs.blocks.toNumber(), 6000, 'blocks');
    })

    it('Update building from not owner', async () => {
      return assertInvalidOpcode(async () => {
        await buildingsData.updateBuilding(
          1, '', -1, -1, -1, -1, -1, -1, -1, 6000, {from: Bob}
        )
      })
    })

    it('Update non-existing building', async () => {
      return assertInvalidOpcode(async () => {
        await buildingsData.updateBuilding(
          9999, '', -1, -1, -1, -1, -1, -1, -1, 6000
        )
      })
    })

    it('Add Building that Already Exists', async () => {
      return assertInvalidOpcode(async () => {
        await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);
      })
    })

  })

})
