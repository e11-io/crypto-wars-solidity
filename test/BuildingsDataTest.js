const BuildingsData = artifacts.require('BuildingsData');

var buildingsMock = require('../mocks/buildings');
const { assertRevert } = require('./helpers/assertThrow');

const stat = buildingsMock.stats;

contract('Buildings Data Test', accounts => {
  let buildingsData = {};
  const Alice = accounts[0];
  const Bob = accounts[1];

  beforeEach(async () => {
    buildingsData = await BuildingsData.new();
  })

  it('Building creation', async () => {
    let building = buildingsMock.initialBuildings[0];
    await buildingsData.addBuilding(building.id, building.name, building.stats);

    const [price, resource, blocks] = await buildingsData.getBuildingData.call(1);

    assert.equal(building.stats[stat.price], price.toNumber());
    assert.equal(building.stats[stat.resource], resource.toNumber());
    assert.equal(building.stats[stat.blocks], blocks.toNumber());
  })

  it('Add building with empty name', async () => {
    return assertRevert(async () => {
      await buildingsData.addBuilding(88, '', [1500, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative Health', async () => {
    return assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [-20, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative Health and empty name', async () => {
    return assertRevert(async () => {
      await buildingsData.addBuilding(2, '', [-20, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  context('Existing buildings period', async() => {
    beforeEach(async () => {
      await buildingsData.addBuilding(buildingsMock.initialBuildings[0].id,
        buildingsMock.initialBuildings[0].name,
        buildingsMock.initialBuildings[0].stats);
      await buildingsData.addBuilding(buildingsMock.initialBuildings[1].id,
        buildingsMock.initialBuildings[1].name,
        buildingsMock.initialBuildings[1].stats);
      await buildingsData.addBuilding(buildingsMock.initialBuildings[2].id,
        buildingsMock.initialBuildings[2].name,
        buildingsMock.initialBuildings[2].stats);
    })

    it('Update building name', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, 'Castle', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], 'Castle');
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building health', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [6000, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), 6000, 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building defense', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, 6000, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), 6000, 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building attack', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, 6000, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), 6000, 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building gold capacity', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, 6000, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), 6000, 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building crystal energy capacity', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, 6000, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), 6000, 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building gold rate', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, 6000, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), 6000, 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building crystal rate', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), 6000, 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building price', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), 6000, 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building resources', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), 6000, 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building blocks', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, 6000, -1, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), 6000, 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building previous level id', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6000, -1]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), 6000, 'previousLevelId');
      assert.equal(data[12].toNumber(), building.stats[stat.typeId], 'typeId');
    })

    it('Update building type id', async () => {
      let building = buildingsMock.initialBuildings[0];

      await buildingsData.updateBuilding(
        building.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6000]
      )

      const data = await buildingsData.buildings.call(building.id);

      assert.equal(data[0], building.name);
      assert.equal(data[1].toNumber(), building.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), building.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), building.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), building.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), building.stats[stat.crystalEnergyCapacity], 'crystalEnergyCapacity');
      assert.equal(data[6].toNumber(), building.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), building.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), building.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), building.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), building.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), building.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), 6000, 'typeId');
    })

    it('Get buildings ids lenght', async () => {
      const buildingsAmount = await buildingsData.getBuildingIdsLength.call();
    })

    it('Update building from not owner', async () => {
      return assertRevert(async () => {
        await buildingsData.updateBuilding(
          1, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1], { from: Bob }
        )
      })
    })

    it('Update non-existing building', async () => {
      return assertRevert(async () => {
        await buildingsData.updateBuilding(
          9999, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1]
        )
      })
    })

    it('Add Building that Already Exists', async () => {
      building = buildingsMock.initialBuildings[0];
      return assertRevert(async () => {
        await buildingsData.addBuilding(building.id, building.name, building.stats);
      })
    })

  })

})
