const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UnitsData = artifacts.require('UnitsData');
const UnitsQueue = artifacts.require('UnitsQueue');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserUnits = artifacts.require('UserUnits');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('./helpers/assertThrow');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const unitsMock = require('../mocks/units-test');
const stat = unitsMock.stats;

const tiny_warrior = unitsMock.initialUnits.find(unit => unit.name == 'tiny_warrior');
const archer = unitsMock.initialUnits.find(unit => unit.name == 'archer');
const guardian = unitsMock.initialUnits.find(unit => unit.name == 'guardian');

contract('Units Data Test', (accounts) => {
  let assetsRequirements, buildingsQueue, buildingsData, userResources, userVillage, userVault, experimentalToken
      UnitsData, UnitsQueue, UserUnits;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  beforeEach(async () => {
    assetsRequirements = await AssetsRequirements.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    experimentalToken = await ExperimentalToken.new();
    unitsData = await UnitsData.new();
    unitsQueue = await UnitsQueue.new();
    userBuildings = await UserBuildings.new();
    userResources = await UserResources.new();
    userUnits = await UserUnits.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();

    await initializeContracts({
      assetsRequirements,
      buildingsData,
      buildingsQueue,
      experimentalToken,
      unitsData,
      unitsQueue,
      userBuildings,
      userResources,
      userUnits,
      userVault,
      userVillage,
    });

  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(unitsData, UnitsData));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(unitsData));
  })

  it('Add unit', async () => {
    await unitsData.addUnit(archer.id, archer.name, archer.stats);

    let unit = await unitsData.units.call(archer.id);

    assert.equal(unit[0], archer.name);
    assert.equal(unit[1].toNumber(), archer.stats[stat.health]);
    assert.equal(unit[2].toNumber(), archer.stats[stat.defense]);
    assert.equal(unit[3].toNumber(), archer.stats[stat.attack]);
    assert.equal(unit[4].toNumber(), archer.stats[stat.price]);
    assert.equal(unit[5].toNumber(), archer.stats[stat.resource]);
    assert.equal(unit[6].toNumber(), archer.stats[stat.blocks]);
  })

  it('Try to add units with empty name', async () => {
    await assertRevert(async () => {
      await unitsData.addUnit(archer.id, '', archer.stats);
    })
  })

  it('Try to add units with stats equal 0', async () => {
    for (var i = 0; i < archer.stats.length; i++) {
      let newStats = archer.stats.concat([]);

      newStats[i] = -1;

      await assertRevert(async () => {
        await unitsData.addUnit(archer.id, archer.name, newStats);
      })
    }
  })

  context('Archer unit created period', async () => {
    beforeEach(async () => {
      await unitsData.addUnit(archer.id, archer.name, archer.stats);
    })

    it('Add unit that already exists', async () => {
      await assertRevert(async () => {
        await unitsData.addUnit(archer.id, archer.name, archer.stats);
      })
    })

    it('Update the name of unit', async () => {
      let newUnitName = 'Range';

      await unitsData.updateUnit(archer.id, newUnitName, archer.stats);

      let unit = await unitsData.units.call(archer.id);

      assert.equal(unit[0], newUnitName);
      assert.equal(unit[1].toNumber(), archer.stats[stat.health]);
      assert.equal(unit[2].toNumber(), archer.stats[stat.defense]);
      assert.equal(unit[3].toNumber(), archer.stats[stat.attack]);
      assert.equal(unit[4].toNumber(), archer.stats[stat.price]);
      assert.equal(unit[5].toNumber(), archer.stats[stat.resource]);
      assert.equal(unit[6].toNumber(), archer.stats[stat.blocks]);
    })

    it('Update all stats of unit', async () => {
      let amount = 50;
      let newStats = archer.stats.map(stat => stat + amount);

      await unitsData.updateUnit(archer.id, archer.name, newStats);

      let unit = await unitsData.units.call(archer.id);

      assert.equal(unit[0], archer.name);
      assert.equal(unit[1].toNumber(), archer.stats[stat.health] + amount);
      assert.equal(unit[2].toNumber(), archer.stats[stat.defense] + amount);
      assert.equal(unit[3].toNumber(), archer.stats[stat.attack] + amount);
      assert.equal(unit[4].toNumber(), archer.stats[stat.price] + amount);
      assert.equal(unit[5].toNumber(), archer.stats[stat.resource] + amount);
      assert.equal(unit[6].toNumber(), archer.stats[stat.blocks] + amount);
    })

    it('Try to upgrade nonexistent unit', async () => {
      await assertRevert(async () => {
        await unitsData.updateUnit(123567, 'test', archer.stats);
      })
    })

    it('Check unit exists', async () => {
      let unitExists = await unitsData.checkUnitExist.call(archer.id);

      assert.equal(unitExists, true);
    })

    it('Check if nonexistent unit exists', async () => {
      let unitExists = await unitsData.checkUnitExist.call(123567);
      assert.equal(unitExists, false);
    })

    it('Get unit data', async () => {
      let [price, resource, blocks] = await unitsData.getUnitData.call(archer.id);

      assert.equal(price.toNumber(), archer.stats[stat.price]);
      assert.equal(resource.toNumber(), archer.stats[stat.resource]);
      assert.equal(blocks.toNumber(), archer.stats[stat.blocks]);
    })

    it('Get unit data of nonexistent unit', async () => {
      await assertRevert(async () => {
        let [price, resource, blocks] = await unitsData.getUnitData.call(12356);
      })
    })

    it('Get battle rates', async () => {
      let [health, defense, attack] = await unitsData.getBattleRates.call(archer.id);

      assert.equal(health.toNumber(), archer.stats[stat.health]);
      assert.equal(defense.toNumber(), archer.stats[stat.defense]);
      assert.equal(attack.toNumber(), archer.stats[stat.attack]);
    })

    it('Get battle rates of nonexistent unit', async () => {
      await assertRevert(async () => {
        let [health, defense, attack] = await unitsData.getBattleRates.call(123456);
      })
    })

  })


});
