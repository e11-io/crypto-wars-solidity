const AssetsRequirements = artifacts.require('AssetsRequirements');
const BattleSystem = artifacts.require('BattleSystem');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const PointsSystem = artifacts.require('PointsSystem');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const UserUnits = artifacts.require('UserUnits');
const UnitsData = artifacts.require('UnitsData');
const UnitsQueue = artifacts.require('UnitsQueue');

// Helpers
const { assertRevert } = require('../helpers/assertThrow');
const { evmMine } = require('../helpers/evmMine');
const { initializeContracts } = require('../helpers/initializeContracts');
const { isVersioned } = require('../helpers/isVersioned');
const { setContractsTest } = require('../helpers/setContractsTest');

// Data
const pointsMock = require('../../data/test/points');

// Stats
const {
  lowerPointsThreshold,
  upperPointsThreshold
} = pointsMock.properties;

const {
  pointsToAdd,
  pointsToSubtract
} = pointsMock;

contract('Points System Test', accounts => {
  let battleSystem,
      buildingsQueue,
      pointsSystem,
      userResources,
      userUnits;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const Carol = accounts[2];
  const David = accounts[3];
  const ether = Math.pow(10, 18);

  beforeEach(async () => {
    battleSystem = await BattleSystem.new();
    buildingsQueue = await BuildingsQueue.new();
    pointsSystem = await PointsSystem.new();
    userResources = await UserResources.new();
    userUnits = await UserUnits.new();

    await initializeContracts({
      battleSystem,
      buildingsQueue,
      pointsSystem,
      userResources,
      userUnits,
    });

    await pointsSystem.setPointsThreshold(lowerPointsThreshold, upperPointsThreshold);

  });

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(pointsSystem, PointsSystem));
  });

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(pointsSystem));
  });

  it('Sets properties correctly', async () => {
    let pointsThreshold = await pointsSystem.getPointsThreshold();
    assert.equal(lowerPointsThreshold, pointsThreshold[0].toNumber());
    assert.equal(upperPointsThreshold, pointsThreshold[1].toNumber());
  });

  it('Starts with zero points', async () => {
    const points = await pointsSystem.usersPoints(Alice);
    assert.equal(points, 0);
  });

  it('Handles correctly zero points in both users', async () => {
    const areInRange = await pointsSystem.areInPointsRange(Alice, Bob);
    assert.equal(areInRange, false);
  });

  it('Adds points', async () => {
    const initialPoints = await pointsSystem.usersPoints(Bob);
    const initalAndAddedPoints = initialPoints.add(pointsToAdd);

    const txData = await pointsSystem.addPointsToUser(Bob, pointsToAdd, { from: Alice });

    const finalPoints = await pointsSystem.usersPoints(Bob);

    // Testing event
    expect(txData.logs[0].args.user).to.be.equal(Bob, 'Event not emitting user correctly');
    expect(txData.logs[0].args.finalPoints.eq(initalAndAddedPoints), 'Event not emitting finalPoints correctly').to.be.true;

    // Testing internal data
    expect(finalPoints.eq(initalAndAddedPoints), 'Points where not added').to.be.true;
  });

  it('Rejects adding points without ownership', async () => {
    await assertRevert(async () => {
      await pointsSystem.addPointsToUser(Bob, pointsToAdd, { from: Bob });
    });
  });

  context('User with points', async () => {

    beforeEach(async () => {
      await pointsSystem.addPointsToUser(Bob, pointsToAdd, { from: Alice });
    });

    it('Handles correctly zero points for just one user', async () => {
      const areInRange = await pointsSystem.areInPointsRange(Alice, Bob);
      assert.equal(areInRange, false);
    });

    it('Subtracts Points', async () => {
      const initialPoints = await pointsSystem.usersPoints(Bob);
      const initialAndSubtractedPoints = initialPoints.sub(pointsToSubtract);
      const txData = await pointsSystem.subPointsToUser(Bob, pointsToSubtract, { from: Alice });
      const finalPoints = await pointsSystem.usersPoints(Bob);

      // Testing event
      expect(txData.logs[0].args.user).to.be.equal(Bob, 'Event not emitting user correctly');
      expect(txData.logs[0].args.finalPoints.eq(initialAndSubtractedPoints), 'Event not emitting finalPoints correctly').to.be.true;

      // Testing internal data
      expect(finalPoints.eq(initialAndSubtractedPoints), 'Points where not subtracted').to.be.true;
    });

    it('Rejects subtracting points without ownership', async () => {
      await assertRevert(async () => {
        await pointsSystem.subPointsToUser(Bob, pointsToSubtract, { from: Bob });
      });
    });

    it('Subtracting more points than actual points from user', async () => {
      const pointsToSubtract = pointsToAdd * 2;
      await pointsSystem.subPointsToUser(Bob, pointsToSubtract, { from: Alice });
      const finalPoints = await pointsSystem.usersPoints(Bob);

      // Testing internal data
      expect(finalPoints.eq(0), 'Points where not subtracted correctly').to.be.true;
    });

    it('Users have same points', async () => {
      const bobPoints = await pointsSystem.usersPoints(Bob);
      await pointsSystem.addPointsToUser(Alice, bobPoints, { from: Alice });
      const inPointsRange = await pointsSystem.areInPointsRange(Bob, Alice, { from: Carol });
      const canAttack = await pointsSystem.canAttack(Bob, Alice, { from: Carol });
      expect(inPointsRange, 'Users are not correctly in range').to.be.true;
      expect(canAttack, 'Bob should be able to attack').to.be.true;
    });

    it('Users are in lower points range', async () => {
      const bobPoints = await pointsSystem.usersPoints(Bob);
      const inRangeDiff = ((lowerPointsThreshold - 1) * bobPoints) / 100;
      const alicePoints = bobPoints.sub(inRangeDiff);
      await pointsSystem.addPointsToUser(Alice, alicePoints, { from: Alice });
      const inPointsRange = await pointsSystem.areInPointsRange(Bob, Alice, { from: Carol });
      const canAttack = await pointsSystem.canAttack(Bob, Alice, { from: Carol });
      expect(inPointsRange, 'Users are not correctly in range').to.be.true;
      expect(canAttack, 'Bob should be able to attack').to.be.true;
    });

    it('Users are not in lower points range', async () => {
      const bobPoints = await pointsSystem.usersPoints(Bob);
      const inRangeDiff = ((lowerPointsThreshold + 1) * bobPoints) / 100;
      const alicePoints = bobPoints.sub(inRangeDiff);
      await pointsSystem.addPointsToUser(Alice, alicePoints, { from: Alice });
      const inPointsRange = await pointsSystem.areInPointsRange(Bob, Alice, { from: Carol });
      const canAttack = await pointsSystem.canAttack(Bob, Alice, { from: Carol });
      expect(inPointsRange, 'Users are not correctly out of range').to.be.false;
      expect(canAttack, 'Bob should not be able to attack').to.be.false;
    });

    it('Users are in upper points range', async () => {
      const bobPoints = await pointsSystem.usersPoints(Bob);
      const inRangeDiff = ((upperPointsThreshold - 1) * bobPoints) / 100;
      const alicePoints = bobPoints.add(inRangeDiff);
      await pointsSystem.addPointsToUser(Alice, alicePoints, { from: Alice });
      const inPointsRange = await pointsSystem.areInPointsRange(Bob, Alice, { from: Carol });
      const canAttack = await pointsSystem.canAttack(Bob, Alice, { from: Carol });
      expect(inPointsRange, 'Users are not correctly in range').to.be.true;
      expect(canAttack, 'Bob should be able to attack').to.be.true;
    });

    it('Users are not in upper points range', async () => {
      const bobPoints = await pointsSystem.usersPoints(Bob);
      const inRangeDiff = ((upperPointsThreshold + 1) * bobPoints) / 100;
      const alicePoints = bobPoints.add(inRangeDiff);
      await pointsSystem.addPointsToUser(Alice, alicePoints, { from: Alice });
      const inPointsRange = await pointsSystem.areInPointsRange(Bob, Alice, { from: Carol });
      const canAttack = await pointsSystem.canAttack(Bob, Alice, { from: Carol });
      expect(inPointsRange, 'Users are not correctly out of range').to.be.false;
      expect(canAttack, 'Bob should not be able to attack').to.be.false;
    });

    it('areInPointsRange should return false if attacker and defender are the same', async () => {
      const areInPointsRange = await pointsSystem.areInPointsRange(Alice, Alice);
      const canAttack = await pointsSystem.canAttack(Alice, Alice, { from: Carol });
      expect(areInPointsRange).to.be.false;
      expect(canAttack).to.be.false;
    });

  });
});
