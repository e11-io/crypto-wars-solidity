const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const PointsSystem = artifacts.require('PointsSystem');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UnitsData = artifacts.require('UnitsData');
const UnitsQueue = artifacts.require('UnitsQueue');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserUnits = artifacts.require('UserUnits');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('../helpers/assertThrow');
const { evmMine } = require('../helpers/evmMine');
const { assertInvalidOpcode } = require('../helpers/assertThrow');
const { initializeContracts } = require('../helpers/initializeContracts');
const { isVersioned } = require('../helpers/isVersioned');
const { setContractsTest } = require('../helpers/setContractsTest');

const buildingsMock = require('../../data/test/buildings');
const unitsMock = require('../../data/test/units');
const stat = unitsMock.stats;

const cityCenter = buildingsMock.initialBuildings.find(b => b.name == 'city_center_1');
const goldStorage = buildingsMock.initialBuildings.find(b => b.name == 'gold_storage_1');
const crystalStorage = buildingsMock.initialBuildings.find(b => b.name == 'crystal_storage_1');
const barracks = buildingsMock.initialBuildings.find(b => b.name == 'barracks_1');

const tiny_warrior = unitsMock.initialUnits.find(unit => unit.name == 'tiny_warrior');
const archer = unitsMock.initialUnits.find(unit => unit.name == 'archer');
const guardian = unitsMock.initialUnits.find(unit => unit.name == 'guardian');

contract('User Units Test', (accounts) => {
  let assetsRequirements,
      buildingsQueue,
      buildingsData,
      pointsSystem,
      experimentalToken,
      userResources,
      userUnits,
      userVillage,
      userVault,
      unitsData,
      unitsQueue;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  const unitsIds = [archer.id, guardian.id];
  const archersAmount = 10;
  const guardiansAmount = 20;

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
    pointsSystem = await PointsSystem.new();

    await initializeContracts({
      assetsRequirements,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      unitsData,
      unitsQueue,
      userBuildings,
      userResources,
      userUnits,
      userVault,
      userVillage,
    });

    for (var i = 0; i < unitsMock.initialUnits.length; i++) {
      await unitsData.addUnit(unitsMock.initialUnits[i].id,
        unitsMock.initialUnits[i].name,
        unitsMock.initialUnits[i].stats);
    }

  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(userUnits, UserUnits));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(userUnits));
  })

  it('Add units to user', async () => {
    await userUnits.addUserUnits(Alice, unitsIds, [archersAmount, guardiansAmount]);

    let userArcherAmount = await userUnits.getUserUnitQuantity.call(Alice, archer.id);
    let userGuardianAmount = await userUnits.getUserUnitQuantity.call(Alice, guardian.id);

    assert.equal(userArcherAmount.toNumber(), archersAmount);
    assert.equal(userGuardianAmount.toNumber(), guardiansAmount);
  })

  it('Add unit to user fails', async () => {
    // Attempt to call function from user Bob.
    await assertRevert(async () => {
      await userUnits.addUserUnits(Alice, unitsIds, [archersAmount, guardiansAmount], {from: Bob});
    })

    // Passing different size arrays of ids and units amount.
    await assertRevert(async () => {
      await userUnits.addUserUnits(Alice, unitsIds, [archersAmount]);
    })

    // Passing nonexistent id of unit.
    await assertRevert(async () => {
      await userUnits.addUserUnits(Alice, [12356], [10]);
    })
  })

  context('User with units period', async () => {
    beforeEach(async () => {
      await userUnits.addUserUnits(Alice, unitsIds, [archersAmount, guardiansAmount]);
    })

    it('Get user quantities', async () => {
      let [userUnitsIds, userUnitsAndQuantities] = await userUnits.getUserUnitsAndQuantities(Alice);
      userUnitsIds = userUnitsIds.map(bigNumber => bigNumber.toNumber());
      userUnitsAndQuantities = userUnitsAndQuantities.map(bigNumber => bigNumber.toNumber());
      expect(userUnitsIds).to.eql(unitsIds);
      expect(userUnitsAndQuantities).to.eql([archersAmount, guardiansAmount]);
    })

    it('Remove units from user', async () => {

      await userUnits.removeUserUnits(Alice, unitsIds, [archersAmount - 5, guardiansAmount]);

      const userArcherAmount = await userUnits.getUserUnitQuantity.call(Alice, archer.id);
      const userGuardianAmount = await userUnits.getUserUnitQuantity.call(Alice, guardian.id);

      assert.equal(userArcherAmount.toNumber(), archersAmount - 5);
      assert.equal(userGuardianAmount.toNumber(), 0);
    })

    it('Subtracts points when removing units from user', async () => {
      const amountOfUnits = [1, 2];
      const pointsToSub = (archer.stats[stat.price] * amountOfUnits[0])  + (guardian.stats[stat.price] * amountOfUnits[1]);

      // We add some points so its different from zero
      await pointsSystem.addPointsToUser(Alice, 10000);
      const initialPoints = await pointsSystem.usersPoints(Alice);
      const initialPointsSubtracted = initialPoints.sub(pointsToSub);
      const txData = await userUnits.removeUserUnits(Alice, unitsIds, amountOfUnits);

      const finalPoints = await pointsSystem.usersPoints(Alice);
      expect(finalPoints.eq(initialPointsSubtracted), 'Removing units does not subtract points correctly').to.be.true;
    });

    it('Remove units from user fails', async () => {

      await assertRevert(async () => {
        await userUnits.removeUserUnits(Alice, unitsIds, [archersAmount - 5, guardiansAmount], {from: Bob});
      })

      // Passing different size arrays of ids and units amount.
      await assertRevert(async () => {
        await userUnits.removeUserUnits(Alice, unitsIds, [archersAmount]);
      })

      // Passing nonexistent id of unit.
      await assertRevert(async () => {
        await userUnits.removeUserUnits(Alice, [12356], [10]);
      })

      // Trying to removing units that the user doesnt have.
      await assertInvalidOpcode(async () => {
        await userUnits.removeUserUnits(Alice, [tiny_warrior.id], [10]);
      })

      // Trying to remove more units that the user owns.
      await assertInvalidOpcode(async () => {
        await userUnits.removeUserUnits(Alice, unitsIds, [archersAmount + 10, guardiansAmount + 10]);
      })
    })

    it('Get battle stats', async () => {
      const archerRates = await unitsData.getBattleRates.call(archer.id);
      const guardianRates = await unitsData.getBattleRates.call(guardian.id);
      const [healthRate, defenseRate, attackRate] = await userUnits.getBattleStats.call(Alice);
      const totalHealthRate = (archerRates[stat.health].toNumber() * archersAmount) +  (guardianRates[stat.health].toNumber() * guardiansAmount);
      const totalDefenseRate = (archerRates[stat.defense].toNumber() * archersAmount) +  (guardianRates[stat.defense].toNumber() * guardiansAmount);
      const totalAttackRate = (archerRates[stat.attack].toNumber() * archersAmount) +  (guardianRates[stat.attack].toNumber() * guardiansAmount);

      assert.equal(healthRate.toNumber(), totalHealthRate);
      assert.equal(defenseRate.toNumber(), totalDefenseRate);
      assert.equal(attackRate.toNumber(), totalAttackRate);
    })

    it('Get stats from units', async () => {
      let archerRates = await unitsData.getBattleRates.call(archer.id);
      let guardianRates = await unitsData.getBattleRates.call(guardian.id);
      let totalHealthRate = (archerRates[stat.health].toNumber() * archersAmount) +  (guardianRates[stat.health].toNumber() * guardiansAmount);
      let totalDefenseRate = (archerRates[stat.defense].toNumber() * archersAmount) +  (guardianRates[stat.defense].toNumber() * guardiansAmount);
      let totalAttackRate = (archerRates[stat.attack].toNumber() * archersAmount) +  (guardianRates[stat.attack].toNumber() * guardiansAmount);
      let [healthRate, defenseRate, attackRate] = await userUnits.getBattleStatsFromUnits([archer.id, guardian.id], [archersAmount, guardiansAmount]);
      assert.equal(healthRate.toNumber(), totalHealthRate);
      assert.equal(defenseRate.toNumber(), totalDefenseRate);
      assert.equal(attackRate.toNumber(), totalAttackRate);

      let newArchersAmount = archersAmount + 8;
      let newGuardiansAmount = guardiansAmount + 320;
      totalHealthRate = (archerRates[stat.health].toNumber() * newArchersAmount) +  (guardianRates[stat.health].toNumber() * newGuardiansAmount);
      totalDefenseRate = (archerRates[stat.defense].toNumber() * newArchersAmount) +  (guardianRates[stat.defense].toNumber() * newGuardiansAmount);
      totalAttackRate = (archerRates[stat.attack].toNumber() * newArchersAmount) +  (guardianRates[stat.attack].toNumber() * newGuardiansAmount);
      [healthRate, defenseRate, attackRate] = await userUnits.getBattleStatsFromUnits([archer.id, guardian.id], [newArchersAmount, newGuardiansAmount]);
      assert.equal(healthRate.toNumber(), totalHealthRate);
      assert.equal(defenseRate.toNumber(), totalDefenseRate);
      assert.equal(attackRate.toNumber(), totalAttackRate);
    });

    it('Get user units ids', async () => {
      let userUnitsIds = await userUnits.getUserUnitsIds.call(Alice);

      assert.equal(unitsIds.toString(), userUnitsIds.toString());
    })

    // it('Transfer units', async () => {
    //
    //   await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount, guardiansAmount]);
    //
    //   const aliceArcherAmount = await userUnits.getUserUnitQuantity.call(Alice, archer.id);
    //   const aliceGuardianAmount = await userUnits.getUserUnitQuantity.call(Alice, guardian.id);
    //
    //   const bobArcherAmount = await userUnits.getUserUnitQuantity.call(Bob, archer.id);
    //   const bobGuardianAmount = await userUnits.getUserUnitQuantity.call(Bob, guardian.id);
    //
    //   assert.equal(aliceArcherAmount.toNumber(), 0);
    //   assert.equal(aliceGuardianAmount.toNumber(), 0);
    //   assert.equal(bobArcherAmount.toNumber(), archersAmount);
    //   assert.equal(bobGuardianAmount.toNumber(), guardiansAmount);
    // })
    //
    // it('Transfer units fails', async () => {
    //
    //   // Passing different size arrays of ids and units amount.
    //   await assertRevert(async () => {
    //     await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount]);
    //   })
    //
    //   // Passing nonexistent id of unit.
    //   await assertRevert(async () => {
    //     await userUnits.transferUserUnits(Bob, [12356], [50]);
    //   })
    //
    //   // Transfer more units than the user owns.
    //   await assertInvalidOpcode(async () => {
    //     await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount + 100, guardiansAmount]);
    //   })
    // })

    context('With village & reosurces', async () => {
      beforeEach(async () => {
        const resources = {
          gold: 6500,
          crystal: 6500,
          quantum: 0
        }
        await buildingsData.addBuilding(cityCenter.id, cityCenter.name, cityCenter.stats);
        await buildingsData.addBuilding(goldStorage.id, goldStorage.name, goldStorage.stats);
        await buildingsData.addBuilding(crystalStorage.id, crystalStorage.name, crystalStorage.stats);
        await buildingsData.addBuilding(barracks.id, barracks.name, barracks.stats);

        await userVillage.setInitialBuildings([cityCenter.id, goldStorage.id, crystalStorage.id, barracks.id]);
        await experimentalToken.approve(userVault.address, 1 * ether);
        await userVillage.create('My new village!','Cool player');

        await userResources.calculateUserResourcesCapacity.call(Alice);
        await userResources.giveResourcesToUser(Alice, resources.gold, resources.crystal, resources.quantum);
      });

      it('Get total user unit quantity', async () => {
        const archersToAdd = 10;

        await unitsQueue.addUnitsToQueue(archer.id, archersToAdd);

        const archerBatchBlocks = archer.stats[stat.blocks] * archersToAdd;
        evmMine(archerBatchBlocks / 2);

        let totalArchers = await userUnits.getTotalUserUnitQuantity(Alice, archer.id);

        assert.equal(totalArchers.toNumber(), archersAmount + (archersToAdd / 2));

        evmMine(archerBatchBlocks / 2);

        totalArchers = await userUnits.getTotalUserUnitQuantity(Alice, archer.id);

        assert.equal(totalArchers.toNumber(), archersAmount + archersToAdd);
      });

      it('Get total user quantities', async () => {
        const archersToAdd = 10;

        await unitsQueue.addUnitsToQueue(archer.id, archersToAdd);

        const archerBatchBlocks = archer.stats[stat.blocks] * archersToAdd;
        evmMine(archerBatchBlocks + 1);

        let [userUnitsIds, userUnitsAndQuantities] = await userUnits.getTotalUserUnitsAndQuantities(Alice);
        userUnitsAndQuantities = userUnitsAndQuantities.filter(bigNumber => bigNumber.toNumber() !== 0);
        userUnitsAndQuantities = userUnitsAndQuantities.map(bigNumber => bigNumber.toNumber());

        expect(userUnitsAndQuantities).to.eql([archersAmount + archersToAdd, guardiansAmount]);
      });

      it('Get total battle stats', async () => {
        const archersToAdd = 10;
        await unitsQueue.addUnitsToQueue(archer.id, archersToAdd);
        const archerBatchBlocks = archer.stats[stat.blocks] * archersToAdd;
        evmMine(archerBatchBlocks + 1);

        const archerRates = await unitsData.getBattleRates.call(archer.id);
        const guardianRates = await unitsData.getBattleRates.call(guardian.id);
        const [healthRate, defenseRate, attackRate] = await userUnits.getTotalBattleStats.call(Alice);
        const totalHealthRate = (archerRates[stat.health].toNumber() * (archersAmount + archersToAdd)) +  (guardianRates[stat.health].toNumber() * guardiansAmount);
        const totalDefenseRate = (archerRates[stat.defense].toNumber() * (archersAmount + archersToAdd)) +  (guardianRates[stat.defense].toNumber() * guardiansAmount);
        const totalAttackRate = (archerRates[stat.attack].toNumber() * (archersAmount + archersToAdd)) +  (guardianRates[stat.attack].toNumber() * guardiansAmount);

        assert.equal(healthRate.toNumber(), totalHealthRate);
        assert.equal(defenseRate.toNumber(), totalDefenseRate);
        assert.equal(attackRate.toNumber(), totalAttackRate);
      });
    });
  });
});
