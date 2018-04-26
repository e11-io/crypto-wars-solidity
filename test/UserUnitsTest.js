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
const { assertInvalidOpcode } = require('./helpers/assertThrow');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const unitsMock = require('../mocks/units-test');
const stat = unitsMock.stats;

const tiny_warrior = unitsMock.initialUnits.find(unit => unit.name == 'tiny_warrior');
const archer = unitsMock.initialUnits.find(unit => unit.name == 'archer');
const guardian = unitsMock.initialUnits.find(unit => unit.name == 'guardian');

contract('User Units Test', (accounts) => {
  let assetsRequirements, buildingsQueue, buildingsData, userResources, userVillage, userVault, experimentalToken
      UnitsData, UnitsQueue, UserUnits;

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

    it('Remove units from user', async () => {

      await userUnits.removeUserUnits(Alice, unitsIds, [archersAmount - 5, guardiansAmount]);

      let userArcherAmount = await userUnits.getUserUnitQuantity.call(Alice, archer.id);
      let userGuardianAmount = await userUnits.getUserUnitQuantity.call(Alice, guardian.id);

      assert.equal(userArcherAmount.toNumber(), archersAmount - 5);
      assert.equal(userGuardianAmount.toNumber(), 0);
    })

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

      let archerRates = await unitsData.getBattleRates.call(archer.id);
      let guardianRates = await unitsData.getBattleRates.call(guardian.id);
      let [healthRate, defenseRate, attackRate] = await userUnits.getBattleStats.call(Alice);
      let totalHealthRate = (archerRates[0].toNumber() * archersAmount) +  (guardianRates[0].toNumber() * guardiansAmount);
      let totalDefenseRate = (archerRates[1].toNumber() * archersAmount) +  (guardianRates[1].toNumber() * guardiansAmount);
      let totalAttackRate = (archerRates[2].toNumber() * archersAmount) +  (guardianRates[2].toNumber() * guardiansAmount);

      assert.equal(healthRate.toNumber(), totalHealthRate);
      assert.equal(defenseRate.toNumber(), totalDefenseRate);
      assert.equal(attackRate.toNumber(), totalAttackRate);
    })

    it('Get user units ids', async () => {
      let userUnitsIds = await userUnits.getUserUnitsIds.call(Alice);

      assert.equal(unitsIds.toString(), userUnitsIds.toString());
    })

    it('Transfer units', async () => {

      await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount, guardiansAmount]);

      let aliceArcherAmount = await userUnits.getUserUnitQuantity.call(Alice, archer.id);
      let aliceGuardianAmount = await userUnits.getUserUnitQuantity.call(Alice, guardian.id);

      let bobArcherAmount = await userUnits.getUserUnitQuantity.call(Bob, archer.id);
      let bobGuardianAmount = await userUnits.getUserUnitQuantity.call(Bob, guardian.id);

      assert.equal(aliceArcherAmount.toNumber(), 0);
      assert.equal(aliceGuardianAmount.toNumber(), 0);
      assert.equal(bobArcherAmount.toNumber(), archersAmount);
      assert.equal(bobGuardianAmount.toNumber(), guardiansAmount);
    })

    it('Transfer units fails', async () => {

      // Passing different size arrays of ids and units amount.
      await assertRevert(async () => {
        await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount]);
      })

      // Passing nonexistent id of unit.
      await assertRevert(async () => {
        await userUnits.transferUserUnits(Bob, [12356], [50]);
      })

      // Transfer more units than the user owns.
      await assertInvalidOpcode(async () => {
        await userUnits.transferUserUnits(Bob, unitsIds, [archersAmount + 100, guardiansAmount]);
      })
    })

  })


});
