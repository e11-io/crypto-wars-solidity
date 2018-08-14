const BuildingsData = artifacts.require('BuildingsData');

const { assertRevert } = require('../../helpers/assertThrow');
const { isVersioned } = require('../../helpers/isVersioned');
const { setContractsTest } = require('../../helpers/setContractsTest');

const buildingsMock = require('../../../data/test/buildings');
const stat = buildingsMock.stats;

const cityCenter = buildingsMock.initialBuildings.find(b => b.name == 'city_center_1');
const cityCenter_2 = buildingsMock.initialBuildings.find(b => b.name == 'city_center_2');
const goldMine = buildingsMock.initialBuildings.find(b => b.name == 'gold_mine_1');
const crystalMine = buildingsMock.initialBuildings.find(b => b.name == 'crystal_mine_1');


contract('Buildings Data Test', accounts => {
  let buildingsData;

  const Alice = accounts[0];
  const Bob = accounts[1];

  beforeEach(async () => {
    buildingsData = await BuildingsData.new();
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(buildingsData, BuildingsData));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(buildingsData));
  })

  it('Building creation', async () => {
    await buildingsData.addBuilding(cityCenter.id, cityCenter.name, cityCenter.stats);

    const [price, resource, blocks] = await buildingsData.getBuildingData.call(1001);

    assert.equal(cityCenter.stats[stat.price], price.toNumber());
    assert.equal(cityCenter.stats[stat.resource], resource.toNumber());
    assert.equal(cityCenter.stats[stat.blocks], blocks.toNumber());
  })

  it('Add building with empty name', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(88, '', [1500, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative health', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [-20, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative defense', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, -50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative attack', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, -5, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative gold capacity', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, -3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative crystal capacity', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, -4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative gold rate', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, -5, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative crystal rate', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, -5, 2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative price', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, 5, -2, 0, 0, 0, 0]);
    })
  })

  it('Add Building with negative resource', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, 5, 2, -5, 0, 0, 0]);
    })
  })

  it('Add Building with negative blocks', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, 5, 2, 5, -5, 0, 0]);
    })
  })

  it('Add Building with negative previos level id', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, 5, 2, 5, 5, -5, 0]);
    })
  })

  it('Add Building with negative type id', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(44, 'Wall', [20, 50, 5, 3000, 4000, 5, 5, 2, 5, 5, 5, -5]);
    })
  })

  it('Add Building with negative Health and empty name', async () => {
    await assertRevert(async () => {
      await buildingsData.addBuilding(2, '', [-20, 50, 0, 3000, 4000, 0, 0, 2, 0, 0, 0, 0]);
    })
  })

  it('Get non existan building data', async () => {
    const [price, resources, blocks] = await buildingsData.getBuildingData.call(865);
    assert.equal(price.toNumber(), 0);
    assert.equal(resources.toNumber(), 0);
    assert.equal(blocks.toNumber(), 0);
  })

  it('Get gold and crystal rates of non existan building', async () => {
    const [goldRate, crystalRate] = await buildingsData.getGoldAndCrystalRates.call(865);
    assert.equal(goldRate.toNumber(), 0);
    assert.equal(crystalRate.toNumber(), 0);
  })

  context('Existing buildings period', async() => {
    beforeEach(async () => {
      await buildingsData.addBuilding(cityCenter.id,
        cityCenter.name,
        cityCenter.stats);
      await buildingsData.addBuilding(goldMine.id,
        goldMine.name,
        goldMine.stats);
      await buildingsData.addBuilding(crystalMine.id,
        crystalMine.name,
        crystalMine.stats);
    });

    it('Checks id of upgrade', async () => {
      await buildingsData.addBuilding(cityCenter_2.id,
        cityCenter_2.name,
        cityCenter_2.stats);
      let checkUpgrade = await buildingsData.checkUpgrade(cityCenter.id, cityCenter_2.id);
      assert.equal(checkUpgrade, true);
      checkUpgrade = await buildingsData.checkUpgrade(crystalMine.id, cityCenter_2.id);
      assert.equal(checkUpgrade, false);
    });

    it('Update building name', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, 'Castle', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], 'Castle');
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building health', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [6000, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), 6000, 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building defense', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, 6000, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), 6000, 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building attack', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, 6000, -1, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), 6000, 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building gold capacity', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, 6000, -1, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), 6000, 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building crystal energy capacity', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, 6000, -1, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), 6000, 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building gold rate', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, 6000, -1, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), 6000, 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building crystal rate', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), 6000, 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building price', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), 6000, 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building resources', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), 6000, 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building blocks', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, 6000, -1, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), 6000, 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building previous level id', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6000, -1]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), 6000, 'previousLevelId');
      assert.equal(data[12].toNumber(), cityCenter.stats[stat.typeId], 'typeId');
    })

    it('Update building type id', async () => {
      await buildingsData.updateBuilding(
        cityCenter.id, '', [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 6000]
      )

      const data = await buildingsData.buildings.call(cityCenter.id);

      assert.equal(data[0], cityCenter.name);
      assert.equal(data[1].toNumber(), cityCenter.stats[stat.health], 'health');
      assert.equal(data[2].toNumber(), cityCenter.stats[stat.defense], 'defense');
      assert.equal(data[3].toNumber(), cityCenter.stats[stat.attack], 'attack');
      assert.equal(data[4].toNumber(), cityCenter.stats[stat.goldCapacity], 'goldCapacity');
      assert.equal(data[5].toNumber(), cityCenter.stats[stat.crystalCapacity], 'crystalCapacity');
      assert.equal(data[6].toNumber(), cityCenter.stats[stat.goldRate], 'goldRate');
      assert.equal(data[7].toNumber(), cityCenter.stats[stat.crystalRate], 'crystalRate');
      assert.equal(data[8].toNumber(), cityCenter.stats[stat.price], 'price');
      assert.equal(data[9].toNumber(), cityCenter.stats[stat.resource], 'resource');
      assert.equal(data[10].toNumber(), cityCenter.stats[stat.blocks], 'blocks');
      assert.equal(data[11].toNumber(), cityCenter.stats[stat.previousLevelId], 'previousLevelId');
      assert.equal(data[12].toNumber(), 6000, 'typeId');
    })

    it('Get all buildings information', async () => {
      let allBuildingsA = await buildingsData.getAllBuildingsA();
      allBuildingsA = allBuildingsA.map(array => array.map(bn => (bn.toNumber) ? bn.toNumber() : web3.toAscii(bn).replace(/\0/g, '')));
      let allBuildingsB = await buildingsData.getAllBuildingsB();
      allBuildingsB = allBuildingsB.map(array => array.map(bn => bn.toNumber()));
      const allData = [...allBuildingsA, ...allBuildingsB];
      const buildings = [cityCenter, goldMine, crystalMine];
      for (let i = 0; i < buildings.length; i ++) {
        for (let y = 0; y < allData.length; y ++) {
          if (y === 0) {
            assert.equal(buildings[i].name, allData[y][i]);
          } else if (y === 1) {
            assert.equal(buildings[i].id, allData[y][i]);
          } else {
            assert.equal(buildings[i].stats[y - 2], allData[y][i]);
          }
        }
      }
    });

    it('Get buildings ids lenght', async () => {
      const buildingsAmount = await buildingsData.getBuildingIdsLength.call();
    })

    it('Update building from not owner', async () => {
      await assertRevert(async () => {
        await buildingsData.updateBuilding(
          1, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1], { from: Bob }
        )
      })
    })

    it('Update non-existing building', async () => {
      await assertRevert(async () => {
        await buildingsData.updateBuilding(
          9999, '', [-1, -1, -1, -1, -1, -1, -1, 6000, -1, -1, -1, -1]
        )
      })
    })

    it('Add Building that Already Exists', async () => {
      await assertRevert(async () => {
        await buildingsData.addBuilding(cityCenter.id, cityCenter.name, cityCenter.stats);
      })
    })

  })

})
