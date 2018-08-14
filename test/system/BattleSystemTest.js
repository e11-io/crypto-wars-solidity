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
const { battleAlgorithm, calculateFinalUnitsQuantities } = require('../helpers/battleAlgorithm');
const { assertRevert } = require('../helpers/assertThrow');
const { evmMine } = require('../helpers/evmMine');
const { getParams, setUserResources, setUserUnits } = require('../helpers/getParams');
const { initializeContracts } = require('../helpers/initializeContracts');
const { isVersioned } = require('../helpers/isVersioned');
const { setContractsTest } = require('../helpers/setContractsTest');

// Data
const battlesMock = require('../../data/test/battle');
const buildingsMock = require('../../data/test/buildings');
const pointsMock = require('../../data/test/points');
const unitsMock = require('../../data/test/units');

// Stats
const {
  attackCooldown,
  rewardDefenderModifier,
  rewardAttackerModifier,
  revengeTimeThreshold,
} = battlesMock.properties;
const stat = buildingsMock.stats;
const {
  lowerPointsThreshold,
  upperPointsThreshold,
} = pointsMock.properties;
const unitStat = unitsMock.stats;

// Units
const tiny_warrior = unitsMock.initialUnits.find(unit => unit.name == 'tiny_warrior');
const archer = unitsMock.initialUnits.find(unit => unit.name == 'archer');
const guardian = unitsMock.initialUnits.find(unit => unit.name == 'guardian');
const reptilian = unitsMock.initialUnits.find(unit => unit.name == 'reptilian');
const knight = unitsMock.initialUnits.find(unit => unit.name == 'knight');
const protector = unitsMock.initialUnits.find(unit => unit.name == 'protector');

// Buildings
const cityCenter_1 = buildingsMock.initialBuildings.find(b => b.name == 'city_center_1');
const cityCenter_2 = buildingsMock.initialBuildings.find(b => b.name == 'city_center_2');
const cityCenter_3 = buildingsMock.initialBuildings.find(b => b.name == 'city_center_3');
const goldMine = buildingsMock.initialBuildings.find(b => b.name == 'gold_mine_1');
const crystalMine = buildingsMock.initialBuildings.find(b => b.name == 'crystal_mine_1');
const portal = buildingsMock.initialBuildings.find(b => b.name == 'portal_1');
const goldStorage = buildingsMock.initialBuildings.find(b => b.name == 'gold_storage_1');

contract('Battle System Test', accounts => {
  let assetsRequirements,
      battleSystem,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      userBuildings,
      userUnits,
      userVault,
      userVillage,
      userResources,
      unitsData,
      unitsQueue;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const Carol = accounts[2];
  const David = accounts[3];
  const ether = Math.pow(10, 18);

  beforeEach(async () => {
    assetsRequirements = await AssetsRequirements.new();
    battleSystem = await BattleSystem.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    pointsSystem = await PointsSystem.new();
    experimentalToken = await ExperimentalToken.new();
    userBuildings= await UserBuildings.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();
    userUnits = await UserUnits.new();
    unitsData = await UnitsData.new();
    unitsQueue = await UnitsQueue.new();

    await initializeContracts({
      assetsRequirements,
      battleSystem,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      userBuildings,
      userResources,
      userVault,
      userVillage,
      userUnits,
      unitsData,
      unitsQueue,
    });

    await setUserResources(userResources);
    await setUserUnits(userUnits);

    await buildingsData.addBuilding(cityCenter_1.id,
      cityCenter_1.name,
      cityCenter_1.stats);
    await buildingsData.addBuilding(cityCenter_2.id,
      cityCenter_2.name,
      cityCenter_2.stats);
    await buildingsData.addBuilding(cityCenter_3.id,
      cityCenter_3.name,
      cityCenter_3.stats);
    await buildingsData.addBuilding(goldMine.id,
      goldMine.name,
      goldMine.stats);
    await buildingsData.addBuilding(crystalMine.id,
      crystalMine.name,
      crystalMine.stats);

    await userVillage.setInitialBuildings([
      cityCenter_1.id,
    ]);

    for (var i = 0; i < unitsMock.initialUnits.length; i++) {
      await unitsData.addUnit(unitsMock.initialUnits[i].id,
        unitsMock.initialUnits[i].name,
        unitsMock.initialUnits[i].stats);
    }

    await pointsSystem.setPointsThreshold(lowerPointsThreshold, upperPointsThreshold);

    await battleSystem.setAttackCooldown(attackCooldown);
    await battleSystem.setRewardDefenderModifier(rewardDefenderModifier);
    await battleSystem.setRewardAttackerModifier(rewardAttackerModifier);
    await battleSystem.setRevengeTimeThreshold(revengeTimeThreshold);

    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.create('First village', 'Cool Alice', { from: Alice });

    await experimentalToken.transfer(Bob, 5 * ether);
    await experimentalToken.approve(userVault.address, 1 * ether, { from: Bob });
    await userVillage.create('Second village', 'Cool Bob', { from: Bob });

    await experimentalToken.transfer(Carol, 5 * ether);
    await experimentalToken.approve(userVault.address, 1 * ether, { from: Carol });
    await userVillage.create('Second village', 'Cool Carol', { from: Carol });

    // We are user Alice here, but every user its gonna have the same capacities at this point.
    const [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice)
    const starterGold = goldCapacity.toNumber() / 2;
    const starterCrytal = crystalCapacity.toNumber() / 2;

    await userResources.giveResourcesToUser(Alice, starterGold, starterCrytal, 0);
    await userResources.giveResourcesToUser(Bob, starterGold, starterCrytal, 0);
    await userResources.giveResourcesToUser(Carol, starterGold, starterCrytal, 0);

    // Must have at least some points to attack or be attacked
    await pointsSystem.addPointsToUser(Alice, 1);
    await pointsSystem.addPointsToUser(Bob, 1);
  });

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(battleSystem, BattleSystem));
  });

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(battleSystem));
  });

  it('Sets properties correctly', async () => {
    assert.equal(attackCooldown, await battleSystem.getAttackCooldown());
    assert.equal(rewardAttackerModifier, await battleSystem.getRewardAttackerModifier());
    assert.equal(rewardDefenderModifier, await battleSystem.getRewardDefenderModifier());
  });

  it('Sends an attack', async () => {
    evmMine(attackCooldown); // for attack cooldown
    await userUnits.addUserUnits(Alice, [archer.id], [1]);
    const txData = await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
  });

  it('Cant attack if its not sending units', async () => {
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [], [], { from: Alice });
    });
  });

  it('Cant attack if attacker does not have those units', async () => {
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [5, 10]);
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id, guardian.id], [6, 10], { from: Alice });
    });
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id, guardian.id], [5, 120], { from: Alice });
    });
  });

  it('Cant attack if attacker has more points than defender', async () => {
    await pointsSystem.addPointsToUser(Alice, 10000);
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id, guardian.id], [5, 10], { from: Alice });
    });
  });

  it('Cant attack while attacker on cooldown', async () => {
    await userUnits.addUserUnits(Alice, [archer.id], [1]);
    await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    });
    evmMine(attackCooldown + 1);
    await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
  });

  it('Try attacking from a user without village', async () => {
    await userUnits.addUserUnits(David, [archer.id], [1]);
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id], [1], { from: David });
    });

    await experimentalToken.transfer(David, 5 * ether);
    await experimentalToken.approve(userVault.address, 1 * ether, { from: David });
    await userVillage.create('David village', 'Cool David', { from: David });
    await pointsSystem.addPointsToUser(David, 1);
    await battleSystem.attack(Bob, [archer.id], [1], { from: David });
  });

  it('Try attacking a user without village', async () => {
    await pointsSystem.addPointsToUser(David, await pointsSystem.usersPoints(Alice), { from: Alice });
    await userUnits.addUserUnits(Alice, [archer.id], [1]);
    await assertRevert(async () => {
      await battleSystem.attack(David, [archer.id], [1], { from: Alice });
    });

    await experimentalToken.transfer(David, 5 * ether);
    await experimentalToken.approve(userVault.address, 1 * ether, { from: David });
    await userVillage.create('David village', 'Cool David', { from: David });
    await battleSystem.attack(David, [archer.id], [1], { from: Alice });
  });

  it('Try to attack address 0', async () => {
    const zeroAddress = '0x0000000000000000000000000000000000000000';
    await userUnits.addUserUnits(Alice, [archer.id], [1]);
    await assertRevert(async () => {
      await battleSystem.attack(zeroAddress, [archer.id], [1], { from: Alice });
    });
  });

  it('Try to make an attack with zero units, or inconsistent data', async () => {
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [], [], { from: Alice });
    });
    await userUnits.addUserUnits(Alice, [archer.id], [1]);
    await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id], [], { from: Alice });
    });
  });

  it('Attacker can\'t take revenge on it self', async () => {
    const canAttackByRevenge = await battleSystem.canAttackByRevenge(Alice, Alice);
    expect(canAttackByRevenge).to.be.false;
  });

  it('Attacker can take a revenge attack if on revenge time threshold', async () => {
    const archerAmount = 5;
    const guardianAmount = 10;
    const bobPoints = await pointsSystem.usersPoints(Bob);
    const inRangeDiff = ((lowerPointsThreshold + 1) * bobPoints) / 100;
    const alicePoints = bobPoints.add(inRangeDiff);
    await pointsSystem.addPointsToUser(Alice, alicePoints, { from: Alice });
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await userUnits.addUserUnits(Bob, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    // Bob has lower elo.
    await battleSystem.attack(Alice, [archer.id], [1], { from: Bob });
    // Alice takes revenge
    await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
  });

  it('Attacker can take only one revenge attack', async () => {
    const archerAmount = 5;
    const guardianAmount = 10;
    const bobPoints = await pointsSystem.usersPoints(Bob);
    const inRangeDiff = ((lowerPointsThreshold + 1) * bobPoints) / 100;
    const alicePoints = bobPoints.add(inRangeDiff);
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await userUnits.addUserUnits(Bob, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    // Bob has lower elo
    await battleSystem.attack(Alice, [archer.id], [1], { from: Bob });
    // Alice takes revenge
    await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    // Alice tries to take double revenge
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    });
  });

  it('Attacker cant take a revenge attack if not on threshold', async () => {
    const archerAmount = 5;
    const guardianAmount = 10;
    const bobPoints = await pointsSystem.usersPoints(Bob);
    const inRangeDiff = ((lowerPointsThreshold + 1) * bobPoints) / 100;
    const alicePoints = bobPoints.add(inRangeDiff);
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await userUnits.addUserUnits(Bob, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    // Bob has lower elo
    await battleSystem.attack(Alice, [archer.id], [1], { from: Bob });
    // Timeout of revenge threshold
    evmMine(revengeTimeThreshold + 1);
    // ALice tries to take revenge
    await assertRevert(async () => {
      await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    });
  });

  it('Cant attack while defender its attacking', async () => {
    // await userUnits.addUserUnits(Alice, [archer.id], [1]);
    // await userUnits.addUserUnits(Carol, [archer.id], [1]);
    //
    // // TODO: find a way to make these two operation in same block.
    // await battleSystem.attack(Bob, [archer.id], [1], { from: Alice });
    // await battleSystem.attack(Alice, [archer.id], [1], { from: Carol });
  });

  it('Attack using city center upgrade that is ready in buildings queue for attacker and defender', async () => {
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [5, 10]);
    await buildingsQueue.upgradeBuilding(cityCenter_1.id, cityCenter_2.id, 0);
    await buildingsQueue.upgradeBuilding(cityCenter_1.id, cityCenter_2.id, 0, {from: Bob});

    evmMine(cityCenter_2.stats[stat.blocks] + 1);

    await buildingsQueue.upgradeBuilding(cityCenter_2.id, cityCenter_3.id, 0);
    await buildingsQueue.upgradeBuilding(cityCenter_2.id, cityCenter_3.id, 0, {from: Bob});

    evmMine(cityCenter_3.stats[stat.blocks] + 1);

    await battleSystem.attack(Bob, [archer.id, guardian.id], [5, 10], { from: Alice });
  });

  it('Attack using units that are ready in queue for attacker', async () => {
    const archerAmount = 5;
    const guardianAmount = 10;
    const amount = 3;
    const [aliceGoldCapacity, aliceCrystalCapacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

    await userResources.giveResourcesToUser(Alice, aliceGoldCapacity, aliceCrystalCapacity, 0);
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await unitsQueue.addUnitsToQueue(archer.id, amount);

    // addUnitsToQueue adds points to Alice, so we gotta make them equal
    // for the test
    await pointsSystem.addPointsToUser(Bob, await pointsSystem.usersPoints(Alice));

    const blocksToMine = (amount - 1) * archer.stats[unitStat.blocks];
    evmMine(blocksToMine);

    await assertRevert(async () => {
      // theres one unit not finished at this point.
      await battleSystem.attack(Bob, [archer.id, guardian.id], [archerAmount + amount, guardianAmount]);
    })

    evmMine(archer.stats[unitStat.blocks]);

    await battleSystem.attack(Bob, [archer.id, guardian.id], [archerAmount + amount, guardianAmount]);
  });

  it('Attack using units that are ready in queue for defender', async () => {
    const archerAmount = 5;
    const guardianAmount = 10;
    const amount = 3;
    const initialBobPoints = await pointsSystem.usersPoints(Bob);
    const [bobGoldCapacity, bobCrystalCapacity,] = await userResources.calculateUserResourcesCapacity.call(Bob);
    await userResources.giveResourcesToUser(Bob, bobGoldCapacity, bobCrystalCapacity, 0);
    await userUnits.addUserUnits(Alice, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await userUnits.addUserUnits(Bob, [archer.id, guardian.id], [archerAmount, guardianAmount]);
    await unitsQueue.addUnitsToQueue(archer.id, amount, {from: Bob});

    const blocksToMine = amount * archer.stats[unitStat.blocks];
    evmMine(blocksToMine);

    const bobPoints = await pointsSystem.usersPoints(Bob);
    await pointsSystem.addPointsToUser(Alice, bobPoints.sub(initialBobPoints));
    await battleSystem.attack(Bob, [archer.id, guardian.id], [archerAmount, guardianAmount]);
  });

  // This should be in UserVillageTest, but here all the contracts are initiated
  // and wired up.
  it('[UserVillage] Gets all user information', async () => {
    const bobUnits = [archer, guardian];
    const bobUnitsIds = bobUnits.map(unit => unit.id);
    const bobUnitsQuantities = [5, 10];
    const bobBattleStats = [0, 0, 0];
    for (let i = 0; i < bobUnits.length; i ++) {
      bobBattleStats[0] += bobUnits[i].stats[unitStat.health] * bobUnitsQuantities[i];
      bobBattleStats[1] += bobUnits[i].stats[unitStat.defense] * bobUnitsQuantities[i];
      bobBattleStats[2] += bobUnits[i].stats[unitStat.attack] * bobUnitsQuantities[i];
    }
    const [bobGoldCapacity, bobCrystalCapacity,] = await userResources.calculateUserResourcesCapacity(Bob);
    await userResources.giveResourcesToUser(Bob, bobGoldCapacity, bobCrystalCapacity, 0);
    await userUnits.addUserUnits(Bob, bobUnitsIds, bobUnitsQuantities);
    let [
      username,
      villageName,
      unitsIds,
      unitsQuantities,
      battleStats,
      resources,
      canAttack,
      canTakeRevenge,
    ] = await userVillage.getUserInfo(Bob, { from: Alice });
    unitsIds = unitsIds.map(bn => bn.toNumber());
    unitsQuantities = unitsQuantities.map(bn => bn.toNumber());
    unitsIds = unitsIds.filter((id, i) => unitsQuantities[i] > 0);
    unitsQuantities = unitsQuantities.filter(quantity => quantity > 0);
    battleStats = battleStats.map(bn => bn.toNumber());
    resources = resources.map(bn => bn.toNumber());
    assert.equal(username, 'Cool Bob');
    assert.equal(villageName, 'Second village');
    assert.equal(bobUnitsIds.toString(), unitsIds.toString());
    assert.equal(bobUnitsQuantities.toString(), unitsQuantities.toString());
    assert.equal(bobBattleStats.toString(), battleStats.toString());
    assert.equal(resources.toString(), [bobGoldCapacity, bobCrystalCapacity, 0].toString());
    assert.equal(canAttack, true);
    assert.equal(canTakeRevenge, false);
  });

  context('Defender has defenses', async () => {
    it('Rewards the defender with gold and crystal', async () => {
      const archerAmount = 5;
      const guardianAmount = 10;
      const res = battleAlgorithm([archer.id, guardian.id],
                                  [archerAmount, guardianAmount],
                                  [archer.id, guardian.id],
                                  [archerAmount, guardianAmount],
                                  { gold: 430, crystal: 900 }
                                );
    });

    it('Survives some attackers and some defenders', async () => {
      const attackerInitialUnitsIds = [knight.id, protector.id];
      const attackerInitialAmounts = [11, 10];
      const defenderInitialUnitsIds = [knight.id, protector.id];
      const defenderInitialAmounts = [11, 10];

      const attackerIdsForAttack = attackerInitialUnitsIds;
      const attackerAmountsForAttack = attackerInitialAmounts;

      await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
      await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

      let initialParams = await getParams(Alice, Bob);

      await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

      let finalParams = await getParams(Alice, Bob);

      const res = battleAlgorithm(attackerIdsForAttack,
                                  attackerAmountsForAttack,
                                  defenderInitialUnitsIds,
                                  defenderInitialAmounts,
                                  {gold: initialParams.bob_gold, crystal: initialParams.bob_crystal}
                                );

      aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                     initialParams.alice_units_quanities,
                                                                     attackerIdsForAttack,
                                                                     res.attackerDeadQuantities);

      bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                   initialParams.bob_units_quanities,
                                                                   defenderInitialUnitsIds,
                                                                   res.defenderDeadQuantities);

      assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
      assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

      assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
      assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

      assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
      assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
    });

    it('Attacker kills all defenses without loses', async () => {
      const attackerInitialUnitsIds = [archer.id, guardian.id, knight.id, protector.id];
      const attackerInitialAmounts = [10, 10, 11, 10];
      const defenderInitialUnitsIds = [knight.id, protector.id];
      const defenderInitialAmounts = [5, 5];

      const attackerIdsForAttack = attackerInitialUnitsIds;
      const attackerAmountsForAttack = attackerInitialAmounts;

      await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
      await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

      let initialParams = await getParams(Alice, Bob);

      await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

      let finalParams = await getParams(Alice, Bob);

      const res = battleAlgorithm(attackerIdsForAttack,
                                  attackerAmountsForAttack,
                                  defenderInitialUnitsIds,
                                  defenderInitialAmounts,
                                  {gold: initialParams.bob_gold, crystal: initialParams.bob_crystal}
                                );

      aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                     initialParams.alice_units_quanities,
                                                                     attackerIdsForAttack,
                                                                     res.attackerDeadQuantities);

      bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                   initialParams.bob_units_quanities,
                                                                   defenderInitialUnitsIds,
                                                                   res.defenderDeadQuantities);

      assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
      assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

      assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
      assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

      assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
      assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
    });

    it('Attacker Kills all defenses with some loses', async () => {
      const attackerInitialUnitsIds = [knight.id, protector.id];
      const attackerInitialAmounts = [20, 5];
      const defenderInitialUnitsIds = [knight.id, protector.id];
      const defenderInitialAmounts = [16, 2];

      const attackerIdsForAttack = attackerInitialUnitsIds;
      const attackerAmountsForAttack = attackerInitialAmounts;

      await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
      await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

      let initialParams = await getParams(Alice, Bob);

      await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

      let finalParams = await getParams(Alice, Bob);

      const res = battleAlgorithm(attackerIdsForAttack,
                                  attackerAmountsForAttack,
                                  defenderInitialUnitsIds,
                                  defenderInitialAmounts,
                                  {gold: initialParams.bob_gold, crystal: initialParams.bob_crystal}
                                );

      aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                     initialParams.alice_units_quanities,
                                                                     attackerIdsForAttack,
                                                                     res.attackerDeadQuantities);

      bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                   initialParams.bob_units_quanities,
                                                                   defenderInitialUnitsIds,
                                                                   res.defenderDeadQuantities);

      assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
      assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

      assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
      assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

      assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
      assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
    });

    it('Attacker kills all defenses without loses', async () => {
      const attackerInitialUnitsIds = [knight.id, protector.id];
      const attackerInitialAmounts = [20, 5];
      const defenderInitialUnitsIds = [knight.id, protector.id];
      const defenderInitialAmounts = [10, 2];

      const attackerIdsForAttack = attackerInitialUnitsIds;
      const attackerAmountsForAttack = attackerInitialAmounts;

      await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
      await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

      let initialParams = await getParams(Alice, Bob);

      await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

      let finalParams = await getParams(Alice, Bob);

      const res = battleAlgorithm(attackerIdsForAttack,
                                  attackerAmountsForAttack,
                                  defenderInitialUnitsIds,
                                  defenderInitialAmounts,
                                  {gold: initialParams.bob_gold, crystal: initialParams.bob_crystal}
                                );

      aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                     initialParams.alice_units_quanities,
                                                                     attackerIdsForAttack,
                                                                     res.attackerDeadQuantities);

      bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                   initialParams.bob_units_quanities,
                                                                   defenderInitialUnitsIds,
                                                                   res.defenderDeadQuantities);

      assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
      assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

      assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
      assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

      assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
      assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
    });

    it('Attacker steals everything total possible amount', async () => {
      const attackerInitialUnitsIds = [knight.id, protector.id];
      const attackerInitialAmounts = [30, 30];
      const defenderInitialUnitsIds = [protector.id];
      const defenderInitialAmounts = [1];

      const attackerIdsForAttack = attackerInitialUnitsIds;
      const attackerAmountsForAttack = attackerInitialAmounts;

      await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
      await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

      let initialParams = await getParams(Alice, Bob);

      await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

      let finalParams = await getParams(Alice, Bob);

      const res = battleAlgorithm(attackerIdsForAttack,
                                  attackerAmountsForAttack,
                                  defenderInitialUnitsIds,
                                  defenderInitialAmounts,
                                  { gold: initialParams.bob_gold,
                                    crystal: initialParams.bob_crystal
                                  }
                                );

      aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                     initialParams.alice_units_quanities,
                                                                     attackerIdsForAttack,
                                                                     res.attackerDeadQuantities);

      bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                   initialParams.bob_units_quanities,
                                                                   defenderInitialUnitsIds,
                                                                   res.defenderDeadQuantities);

      assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
      assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

      assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
      assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

      assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
      assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
    });

    context('Defender doesnt have resources', async () => {
      beforeEach(async () => {
        const [bob_gold, bob_crystal] = await userResources.getUserResources.call(Bob);
        await userResources.takeResourcesFromUser(Bob, bob_gold, bob_crystal, 0);
      })

      it('Doesnt take any bounty', async() => {
        const attackerInitialUnitsIds = [reptilian.id, knight.id, protector.id];
        const attackerInitialAmounts = [1, 30, 30];
        const defenderInitialUnitsIds = [reptilian.id, guardian.id];
        const defenderInitialAmounts = [1, 1];

        const attackerIdsForAttack = attackerInitialUnitsIds;
        const attackerAmountsForAttack = attackerInitialAmounts;

        await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
        await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

        let initialParams = await getParams(Alice, Bob);

        await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

        let finalParams = await getParams(Alice, Bob);

        const res = battleAlgorithm(attackerIdsForAttack,
                                    attackerAmountsForAttack,
                                    defenderInitialUnitsIds,
                                    defenderInitialAmounts,
                                    {gold: initialParams.bob_gold, crystal: initialParams.bob_crystal}
                                  );

        aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                       initialParams.alice_units_quanities,
                                                                       attackerIdsForAttack,
                                                                       res.attackerDeadQuantities);

        bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                     initialParams.bob_units_quanities,
                                                                     defenderInitialUnitsIds,
                                                                     res.defenderDeadQuantities);

        assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
        assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

        assert.equal(finalParams.alice_gold, initialParams.alice_gold);
        assert.equal(finalParams.alice_crystal, initialParams.alice_crystal);

        assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
        assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

        assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
        assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
      });

      it('Only takes bounty counting buildings queue', async() => {
        const bob_goldRate = goldMine.stats[stat.goldRate];
        await userResources.giveResourcesToUser(Bob, goldMine.stats[stat.price], 0, 0);
        await buildingsQueue.addNewBuildingToQueue(goldMine.id, {from: Bob});

        evmMine(goldMine.stats[stat.blocks]);

        const amount = 10;
        const attackerInitialUnitsIds = [knight.id, protector.id];
        const attackerInitialAmounts = [amount * 3, amount * 3];
        const defenderInitialUnitsIds = [protector.id];
        const defenderInitialAmounts = [1];

        const attackerIdsForAttack = attackerInitialUnitsIds;
        const attackerAmountsForAttack = attackerInitialAmounts;

        await userUnits.addUserUnits(Alice, attackerInitialUnitsIds, attackerInitialAmounts);
        await userUnits.addUserUnits(Bob, defenderInitialUnitsIds, defenderInitialAmounts);

        await userResources.payoutResources(Bob);

        let initialParams = await getParams(Alice, Bob);

        await pointsSystem.addPointsToUser(Alice, await pointsSystem.usersPoints(Bob));

        await battleSystem.attack(Bob, attackerIdsForAttack, attackerAmountsForAttack);

        let finalParams = await getParams(Alice, Bob);

        // NOTE: We sum two goldRate because when we do payout before attack,
        // the attack goes on the next block so we have one more block
        // that generates resources. Plus the block to make the points the same
        // line 661
        initialParams.bob_gold += (bob_goldRate * 2);

        const res = battleAlgorithm(attackerIdsForAttack,
                                    attackerAmountsForAttack,
                                    defenderInitialUnitsIds,
                                    defenderInitialAmounts,
                                    { gold: initialParams.bob_gold,
                                      crystal: initialParams.bob_crystal
                                    }
                                  );

        aliceCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.alice_units_ids,
                                                                       initialParams.alice_units_quanities,
                                                                       attackerIdsForAttack,
                                                                       res.attackerDeadQuantities);

        bobCalculatedFinalQuantities = calculateFinalUnitsQuantities(initialParams.bob_units_ids,
                                                                     initialParams.bob_units_quanities,
                                                                     defenderInitialUnitsIds,
                                                                     res.defenderDeadQuantities);

        assert.equal(finalParams.alice_units_quanities.toString(), aliceCalculatedFinalQuantities.toString());
        assert.equal(finalParams.bob_units_quanities.toString(), bobCalculatedFinalQuantities.toString());

        assert.equal(finalParams.alice_gold, initialParams.alice_gold + res.attackerRewards[0]);
        assert.equal(finalParams.alice_crystal, initialParams.alice_crystal + res.attackerRewards[1]);

        assert.equal(finalParams.bob_gold, initialParams.bob_gold + res.defenderRewards[0] - res.attackerRewards[0]);
        assert.equal(finalParams.bob_crystal, initialParams.bob_crystal + res.defenderRewards[1] - res.attackerRewards[1]);
      });
    });
  });
});
