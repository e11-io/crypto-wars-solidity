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
const { evmMine } = require('./helpers/evmMine');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const buildingsMock = require('../mocks/buildings-test');

const unitsMock = require('../mocks/units-test');
const stat = unitsMock.stats;

const barracks = buildingsMock.initialBuildings.find(b => b.name == 'barracks_1');
const barracksLvl2 = buildingsMock.initialBuildings.find(b => b.name == 'barracks_2');
const barracksLvl3 = buildingsMock.initialBuildings.find(b => b.name == 'barracks_3');

const tiny_warrior = unitsMock.initialUnits.find(unit => unit.name == 'tiny_warrior');
const archer = unitsMock.initialUnits.find(unit => unit.name == 'archer');
const guardian = unitsMock.initialUnits.find(unit => unit.name == 'guardian');
const reptilian = unitsMock.initialUnits.find(unit => unit.name == 'reptilian');
const kitty = unitsMock.initialUnits.find(unit => unit.name == 'kitty');

contract('Units Queue Test', (accounts) => {
  let assetsRequirements, buildingsQueue, buildingsData, userResources, userVillage;
  let userVault, experimentalToken, unitsData, unitsQueue, userUnits;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  const unitsIds = [archer.id, guardian.id];
  const archersAmount = 10;
  const guardiansAmount = 5;
  const reptiliansAmount = 8;
  const kittysAmount = 5;

  const starter_gold = 8000;
  const starter_crystal = 5000;
  const starter_quantum = 200;

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

    await buildingsData.addBuilding(barracks.id, barracks.name, barracks.stats);
    await buildingsData.addBuilding(barracksLvl2.id, barracksLvl2.name, barracksLvl2.stats);
    await buildingsData.addBuilding(barracksLvl3.id, barracksLvl3.name, barracksLvl3.stats);

    for (var i = 0; i < unitsMock.initialUnits.length; i++) {
      await unitsData.addUnit(unitsMock.initialUnits[i].id,
        unitsMock.initialUnits[i].name,
        unitsMock.initialUnits[i].stats);
    }

    await userResources.giveResourcesToUser(Alice, starter_gold, starter_crystal, starter_quantum);

  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(unitsQueue, UnitsQueue));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(unitsQueue));
  })

  it('Add unit to queue', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let unitsInQueue = await unitsQueue.getUnitsInQueue.call(Alice);

    assert.equal(unitsInQueue.toString(), [archer.id].toString());
  })

  it('Add unit to queue fails', async () => {
    // Add nonexistent unit.
    await assertRevert(async () => {
      await unitsQueue.addUnitsToQueue(123456, 10);
    })

    // Add units without enough enough gold.
    await userResources.consumeGold(Alice, starter_gold);

    await assertRevert(async () => {
      await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    })

    // Add units without enough enough crystal.
    await userResources.consumeCrystal(Alice, starter_crystal);

    await assertRevert(async () => {
      await unitsQueue.addUnitsToQueue(reptilian.id, reptiliansAmount);
    })

    // Add units without enough enough quantum.
    await userResources.consumeQuantumDust(Alice, starter_quantum);

    await assertRevert(async () => {
      await unitsQueue.addUnitsToQueue(kitty.id, kittysAmount);
    })


  })

  it('Add unit without necessary requirements', async () => {
    await assetsRequirements.setAssetRequirements(archer.id, archer.requirements);

    await assertRevert(async () => {
      await  unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    })
  })

  it('Check end blocks', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let [id, , endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let estimatedEndblock = ((await web3.eth.blockNumber) + (archersAmount * archer.stats[stat.blocks]));

    assert.equal(id.toNumber(), archer.id);
    assert.equal(endBlock.toNumber(), estimatedEndblock);
  })

  it('Check start and end block adding two unit batches to queue', async () => {

    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    let archersStartBlock = await web3.eth.blockNumber;

    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let [unitsIds, unitsQuiantities, unitsStartBlocks, unitsEndBlocks] = await unitsQueue.getUnits.call(Alice);
    unitsIds = unitsIds.map(id => id.toNumber());
    unitsQuiantities = unitsQuiantities.map(quantity => quantity.toNumber());
    unitsStartBlocks = unitsStartBlocks.map(block => block.toNumber());
    unitsEndBlocks = unitsEndBlocks.map(block => block.toNumber());

    let archersBlocks = archersAmount * archer.stats[stat.blocks];
    assert.equal(unitsIds[0], archer.id);
    assert.equal(unitsQuiantities[0], archersAmount);
    assert.equal(unitsStartBlocks[0], archersStartBlock);
    assert.equal(unitsEndBlocks[0], archersStartBlock + archersBlocks);

    let guardiansBlocks = guardiansAmount * guardian.stats[stat.blocks];
    let guardiansStartBlock = archersStartBlock + guardiansBlocks;
    assert.equal(unitsIds[1], guardian.id);
    assert.equal(unitsQuiantities[1], guardiansAmount);
    assert.equal(unitsStartBlocks[1], guardiansStartBlock);
    assert.equal(unitsEndBlocks[1], guardiansStartBlock + guardiansBlocks);

  })

  it('Update queue with one unit in queue', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let archersBlocks = archer.stats[stat.blocks] * archersAmount;
    evmMine(archersBlocks);

    let initial_user_units = await userUnits.getUserUnitsIds.call(Alice);
    let initial_units_queue = await unitsQueue.getUnitsInQueue.call(Alice);

    await unitsQueue.updateQueue(Alice);

    let final_user_units = await userUnits.getUserUnitsIds.call(Alice);
    let final_units_queue = await unitsQueue.getUnitsInQueue.call(Alice);

    assert.equal(initial_user_units.toString(), '');
    assert.equal(initial_units_queue.toString(), [archer.id].toString());
    assert.equal(final_user_units.toString(), [archer.id].toString());
    assert.equal(final_units_queue.toString(), '');

  })

  it('Update queue with multiple units in queue when only first batch is ready', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let archersBlocks = archer.stats[stat.blocks] * archersAmount;
    evmMine(archersBlocks);

    let initial_user_units = await userUnits.getUserUnitsIds.call(Alice);
    let initial_units_queue = await unitsQueue.getUnitsInQueue.call(Alice);
    let initial_archer_quantity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    await unitsQueue.updateQueue(Alice);

    let final_user_units = await userUnits.getUserUnitsIds.call(Alice);
    let final_units_queue = await unitsQueue.getUnitsInQueue.call(Alice);
    let final_archer_quantity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    assert.equal(initial_archer_quantity.toNumber(), 0);
    assert.equal(final_archer_quantity.toNumber(), archersAmount);
    assert.equal(initial_user_units.toString(), '');
    assert.equal(initial_units_queue.toString(), unitsIds.toString());
    assert.equal(final_user_units.toString(), unitsIds[0].toString());
    assert.equal(final_units_queue.toString(), unitsIds.splice(1).toString());
  })

  it('Check if adding units of same type works fine', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let archersBlocks = archer.stats[stat.blocks] * archersAmount;
    evmMine(archersBlocks);

    await unitsQueue.updateQueue(Alice);

    let initial_archer_quantity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    evmMine(archersBlocks);

    await unitsQueue.updateQueue(Alice);

    let final_archer_quantity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    assert.equal(initial_archer_quantity.toNumber(), archersAmount);
    assert.equal(final_archer_quantity.toNumber(), initial_archer_quantity.toNumber() + archersAmount);
  })

  it('Add unit that consumes crystal', async () => {
    let [initial_gold, initial_crystal, initial_quantum] = await userResources.getUserResources.call(Alice);

    await unitsQueue.addUnitsToQueue(reptilian.id, reptiliansAmount);

    let reptilianBatchPrice = reptilian.stats[stat.price] * reptiliansAmount;

    let [final_gold, final_crystal, final_quantum] = await userResources.getUserResources.call(Alice);

    switch (reptilian.stats[stat.resource]) {
      case 0:
        assert.equal(final_gold.toNumber(), initial_gold.toNumber() - reptilianBatchPrice);
        break;

      case 1:
        assert.equal(final_crystal.toNumber(), initial_crystal.toNumber() - reptilianBatchPrice);
        break;

      case 2:
        assert.equal(final_quantum.toNumber(), initial_quantum.toNumber() - reptilianBatchPrice);
        break;
    }
  })

  it('Add unit that consumes gold', async () => {
    let [initial_gold, initial_crystal, initial_quantum] = await userResources.getUserResources.call(Alice);

    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let archerBatchPrice = archer.stats[stat.price] * archersAmount;

    let [final_gold, final_crystal, final_quantum] = await userResources.getUserResources.call(Alice);

    switch (archer.stats[stat.resource]) {
      case 0:
        assert.equal(final_gold.toNumber(), initial_gold.toNumber() - archerBatchPrice);
        break;

      case 1:
        assert.equal(final_crystal.toNumber(), initial_crystal.toNumber() - archerBatchPrice);
        break;

      case 2:
        assert.equal(final_quantum.toNumber(), initial_quantum.toNumber() - archerBatchPrice);
        break;
    }
  })

  it('Add unit that consumes gold', async () => {
    let [initial_gold, initial_crystal, initial_quantum] = await userResources.getUserResources.call(Alice);

    await unitsQueue.addUnitsToQueue(kitty.id, kittysAmount);

    let kittyBatchPrice = kitty.stats[stat.price] * kittysAmount;

    let [final_gold, final_crystal, final_quantum] = await userResources.getUserResources.call(Alice);

    switch (kitty.stats[stat.resource]) {
      case 0:
        assert.equal(final_gold.toNumber(), initial_gold.toNumber() - kittyBatchPrice);
        break;

      case 1:
        assert.equal(final_crystal.toNumber(), initial_crystal.toNumber() - kittyBatchPrice);
        break;

      case 2:
        assert.equal(final_quantum.toNumber(), initial_quantum.toNumber() - kittyBatchPrice);
        break;
    }
  })

  it('Get battle stats of queue when batch is finished', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let test = await unitsQueue.getUserUnitsQueueLength.call(Alice);

    let archerBatchBlocks = archer.stats[stat.blocks] * archersAmount;
    evmMine(archerBatchBlocks + 1);

    let [id, , endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let [queueHealth, queueDefense, queueAttack] = await unitsQueue.getBattleStats.call(Alice);

    let archerBatchHealth = archer.stats[stat.health] * archersAmount;
    let archerBatchDefense = archer.stats[stat.defense] * archersAmount;
    let archerBatchAttack = archer.stats[stat.attack] * archersAmount;

    assert.equal(queueHealth.toNumber(), archerBatchHealth);
    assert.equal(queueDefense.toNumber(), archerBatchDefense);
    assert.equal(queueAttack.toNumber(), archerBatchAttack);
  })

  it('Get battle stats of queue while producing batch', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let test = await unitsQueue.getUserUnitsQueueLength.call(Alice);

    let archerBatchBlocks = archer.stats[stat.blocks] * archersAmount;
    let blocksToMine = archerBatchBlocks - 3;
    evmMine(blocksToMine);

    let [id, , endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let [queueHealth, queueDefense, queueAttack] = await unitsQueue.getBattleStats.call(Alice);

    let archerBatchHealth = archer.stats[stat.health] * Math.floor(blocksToMine / archer.stats[stat.blocks]);
    let archerBatchDefense = archer.stats[stat.defense] * Math.floor(blocksToMine / archer.stats[stat.blocks]);
    let archerBatchAttack = archer.stats[stat.attack] * Math.floor(blocksToMine / archer.stats[stat.blocks]);

    assert.equal(queueHealth.toNumber(), archerBatchHealth);
    assert.equal(queueDefense.toNumber(), archerBatchDefense);
    assert.equal(queueAttack.toNumber(), archerBatchAttack);
  })

  it('Update queue while batch is not finished', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    let [, initial_startBlock, initial_endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let archersToBeReady = 4;
    evmMine(archer.stats[stat.blocks] * archersToBeReady);

    await unitsQueue.updateQueue(Alice);

    let [, final_startBlock, final_endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);
    let userArcherQuanity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    assert.equal(userArcherQuanity.toNumber(), archersToBeReady);
    assert.equal(final_startBlock.toNumber(), (initial_startBlock.toNumber() + archer.stats[stat.blocks] * archersToBeReady));
  })

  it('Get units queue length', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let length = await unitsQueue.getUnitsQueueLength.call(Alice);

    assert.equal(length.toNumber(), 2);
  })

  it('Update queue when queue is empty', async () => {
    await unitsQueue.updateQueue(Alice);
  })

  it('Update queue when theres one batch in queue but didnt produce units yet', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    let [, initial_startBlock, initial_endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    await unitsQueue.updateQueue(Alice);

    let [, final_startBlock, final_endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);
    let userArcherQuanity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    assert.equal(userArcherQuanity.toNumber(), 0);
    assert.equal(final_startBlock.toNumber(), initial_startBlock.toNumber());
  })

  it('Update queue in last block of the producing batch', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    let [, initial_startBlock, initial_endBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let archersToBeReady = archersAmount;
    evmMine(archer.stats[stat.blocks] * archersToBeReady - 1);

    await unitsQueue.updateQueue(Alice);
    await unitsQueue.updateQueue(Alice);

    let userArcherQuanity = await userUnits.getUserUnitQuantity.call(Alice, archer.id);

    assert.equal(userArcherQuanity.toNumber(), archersToBeReady);
  })

  it('Add unit to queue in the middle of a batch in progress', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let [, archersStartBlock, archersEndBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let [, guardiansStartBlock, guardiansEndBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 1);

    assert.equal(guardiansStartBlock.toNumber(), archersEndBlock.toNumber());

  })

  it('Add unit to queue after last batch is finished', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let [, archersStartBlock, archersEndBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 0);

    let blocksToMine = (archersAmount * archer.stats[stat.blocks]) + 3;
    evmMine(blocksToMine);


    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let [, guardiansStartBlock, guardiansEndBlock] = await unitsQueue.getUnitIdAndBlocks.call(Alice, 1);

    // The + 1 is because wieh adding the guardians to the queue, theres one more block that is mined.
    assert.equal(guardiansStartBlock.toNumber(), archersStartBlock.toNumber() + blocksToMine + 1);
  })

  it('Get battle stats when to units are in queue and second didn produce yet', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);
    await unitsQueue.addUnitsToQueue(guardian.id, guardiansAmount);

    let [queueHealth, queueDefense, queueAttack] = await unitsQueue.getBattleStats.call(Alice);

    assert.equal(queueHealth.toNumber(), 0);
    assert.equal(queueDefense.toNumber(), 0);
    assert.equal(queueAttack.toNumber(), 0);
  })

  it('Passing address 0 to update queue', async () => {
    await assertRevert(async () => {
      await unitsQueue.updateQueue(0);
    })
  })

  it('Passing address 0 to get units in queue function', async () => {
    await assertRevert(async () => {
      await unitsQueue.getUnitsInQueue.call(0);
    })
  })

  it('Passing address 0 to get Units  function', async () => {
    await assertRevert(async () => {
      await unitsQueue.getUnits.call(0);
    })
  })

  it('Get battle stats when theres no units ready', async () => {
    await unitsQueue.addUnitsToQueue(archer.id, archersAmount);

    let [queueHealth, queueDefense, queueAttack] = await unitsQueue.getBattleStats.call(Alice);

    assert.equal(queueHealth.toNumber(), 0);
    assert.equal(queueDefense.toNumber(), 0);
    assert.equal(queueAttack.toNumber(), 0);
  })

  it('Try to add 0 units to queue', async () => {
    await assertRevert(async () => {
      await unitsQueue.addUnitsToQueue(archer.id, 0);
    })
  })

});
