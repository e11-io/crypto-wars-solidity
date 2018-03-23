const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('./helpers/assertThrow');
const { evmMine } = require('./helpers/evmMine');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const buildingsMock = require('../mocks/buildings-test');
const stat = buildingsMock.stats;

contract('Buildings Queue Test', (accounts) => {
  let assetsRequirements, buildingsQueue, buildingsData, userResources, userVillage, userVault, experimentalToken;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);
  const initialUserBuildings = [
    buildingsMock.initialBuildings[0].id,
    buildingsMock.initialBuildings[1].id,
    buildingsMock.initialBuildings[2].id,
  ];

  beforeEach(async () => {
    assetsRequirements = await AssetsRequirements.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    experimentalToken = await ExperimentalToken.new();
    userBuildings = await UserBuildings.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();

    await initializeContracts({
      assetsRequirements,
      buildingsData,
      buildingsQueue,
      experimentalToken,
      userBuildings,
      userResources,
      userVault,
      userVillage,
    });

    for (var i = 0; i < buildingsMock.initialBuildings.length; i++) {
      await buildingsData.addBuilding(buildingsMock.initialBuildings[i].id,
        buildingsMock.initialBuildings[i].name,
        buildingsMock.initialBuildings[i].stats);
    }

    await userVillage.setInitialBuildings(initialUserBuildings);
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(buildingsQueue, BuildingsQueue));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(buildingsQueue));
  })

  it('Add building to queue with no resources', async () => {
    return assertRevert(async () => {
      await buildingsQueue.addNewBuildingToQueue(2);
    })
  })

  it('Add free building to queue', async () => {
    let cityCenter = buildingsMock.initialBuildings[0];

    const initialBuildings = await userBuildings.getUserBuildings.call(Alice);
    assert.equal(initialBuildings.toString(), '');

    await buildingsQueue.addNewBuildingToQueue(cityCenter.id);

    const finalBuildings = await userBuildings.getUserBuildings.call(Alice);
    assert.equal(finalBuildings.toString(), cityCenter.id.toString());
  })

  it('Check gold consume when upgrading building', async () => {
    await userVillage.setInitialBuildings([])
    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.create('My new village!','Cool player');
    await userResources.giveResourcesToUser(Alice, 500, 500, 200);

    let goldMine = buildingsMock.initialBuildings[1];
    let goldMineLvl2 = buildingsMock.initialBuildings[4];

    let [initial_gold,,] = await userResources.getUserResources.call(Alice);

    await buildingsQueue.addNewBuildingToQueue(goldMine.id);

    evmMine(goldMine.stats[stat.blocks]);

    await buildingsQueue.upgradeBuilding(goldMine.id, goldMineLvl2.id, 0);

    let [final_gold,,] = await userResources.getUserResources.call(Alice);

    // just one block is added after gold mine is ready to produce
    let total = initial_gold.toNumber() + (goldMine.stats[stat.goldRate] * 1) - goldMine.stats[stat.price] - goldMineLvl2.stats[stat.price];

    assert.equal(final_gold.toNumber(),  + total );
  })

  context('User with resources and village period', async () => {
    beforeEach(async () => {
      await experimentalToken.approve(userVault.address, 1 * ether);
      await userVillage.create('My new village!','Cool player');
      await userResources.giveResourcesToUser(Alice, 3000, 3000, 200);

      const [gold, crystal, quantumDust] = await userResources.getUserResources.call(Alice);

      assert.equal(3000, gold.toNumber(), 'gold');
      assert.equal(3000, crystal.toNumber(), 'crystal');
      assert.equal(200, quantumDust.toNumber(), 'quantumDust');
    })

    it('Add gold factory to queue', async () => {
      let goldFactory = buildingsMock.initialBuildings[7];

      await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

      const [id, startBlock, endBlock, queueId] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), goldFactory.id);
    })

    it('Add crystal factory to queue', async () => {
      let crystalFactory = buildingsMock.initialBuildings[8];
      await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);

      const [id, startBlock, endBlock, queueId] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), crystalFactory.id);
    })

    it('Add two buildings to queue and check queue length', async () => {
      let goldFactory = buildingsMock.initialBuildings[7];
      let crystalFactory = buildingsMock.initialBuildings[8];

      await buildingsQueue.addNewBuildingToQueue(goldFactory.id);
      await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);

      const buildingsInQueueAmount = await buildingsQueue.getBuildingsQueueLength.call(Alice);

      assert.equal(buildingsInQueueAmount.toNumber(), 2);
    })

    it('Add portal to queue (consume quantum)', async () => {
      const portal = buildingsMock.initialBuildings[6];
      await buildingsQueue.addNewBuildingToQueue(portal.id);

      const [id, startBlock, endBlock, queueId] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), portal.id);
    })

    it('Upgrade gold mine from user buildings', async () => {
      let goldMine = buildingsMock.initialBuildings[1];

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == goldMine.id) {
          index = i;
        }
      });

      await buildingsQueue.upgradeBuilding(goldMine.id, 2002, index);

      const [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(false, isActive);
    })

    it('Upgrade gold factory from buildings queue', async () => {
      let building = buildingsMock.initialBuildings[7];

      const initialBuildings = await userBuildings.getUserBuildings.call(Alice);

      await buildingsQueue.addNewBuildingToQueue(building.id);

      const buildings = await userBuildings.getUserBuildings.call(Alice);

      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == building.id) {
          index = i;
        }
      });

      evmMine(building.stats[stat.blocks]);

      let nextLevelId = 1000 + building.id;

      await buildingsQueue.upgradeBuilding(building.id, nextLevelId, index);

      evmMine(building.stats[stat.blocks]);

      let [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(false, isActive);

      const buildingsInQueue =  await buildingsQueue.getBuildingsInQueue.call(Alice);

      assert.equal(buildingsInQueue.toString(), nextLevelId.toString());

      await buildingsQueue.updateQueue(Alice);

      const finalBuildings = await userBuildings.getUserBuildings.call(Alice);
      const expectedBuildings = [initialBuildings.toString(), nextLevelId.toString()].join();
      const [lastBuildingId, lastBuildingStatus] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(lastBuildingId.toNumber(), nextLevelId);
      assert.equal(lastBuildingStatus, true);
      assert.equal(finalBuildings.toString(), expectedBuildings);
    })

    it('Try to upgrade gold mine passing wrong upgrade ID', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let crystalMine = buildingsMock.initialBuildings[2];
      return assertRevert(async () => {
        await buildingsQueue.upgradeBuilding(goldMine.id, crystalMine.id, 0); // Add to wrong upgrade id
      })
    })

    it('Try to pass non existent building id to upgrade building', async () => {
      return assertRevert(async () => {
        await buildingsQueue.upgradeBuilding(865, 2002, 0); // Add to wrong upgrade id
      })
    })

    it('Try to pass non existent idOfUpgrade to upgrade building', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      return assertRevert(async () => {
        await buildingsQueue.upgradeBuilding(goldMine.id, 2002 + 420, 0); // Add to wrong upgrade id
      })
    })

    it('Add non-existing building to queue', async () => {
      return assertRevert(async () => {
        await buildingsQueue.addNewBuildingToQueue(678);
      })
    })

    it('Try to create another gold mine (same building type)', async () => {
      return assertRevert(async () => {
        await buildingsQueue.addNewBuildingToQueue(1002);
      })
    })

    it('Try to create a gold factory when theres already one in buildings queue (same building type)', async () => {
      let goldFactory = buildingsMock.initialBuildings[7];
      await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

      return assertRevert(async () => {
        await buildingsQueue.addNewBuildingToQueue(goldFactory.id);
      })
    })

    it('Pass address 0 to update queue', async () => {
      return assertRevert(async () => {
        await buildingsQueue.updateQueue(0);
      })
    })

    it('Update queue when none building is ready', async () => {
      let goldFactory = buildingsMock.initialBuildings[7];

      await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

      const txData = await buildingsQueue.updateQueue(Alice);

      assert.equal(txData.logs[0].args._ids.toString(), '');
    })

    it('Add new building to queue after las building in queue finished', async () => {
      let goldFactory = buildingsMock.initialBuildings[7];
      let crystalFactory = buildingsMock.initialBuildings[8];

      await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

      evmMine(goldFactory.stats[stat.blocks] + 2);

      await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);
      let blockNumber = web3.eth.blockNumber;

      const [id, startBlock, endBlock] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), crystalFactory.id);
      assert.equal(startBlock.toNumber(), blockNumber);
      assert.equal(endBlock.toNumber(), crystalFactory.stats[stat.blocks] + blockNumber);
    })

    it('Cancel new construction before finished', async () => {
      // TODO: make index responsive
      let goldStorage = buildingsMock.initialBuildings[11];

      await buildingsQueue.addNewBuildingToQueue(goldStorage.id);

      let initialBuildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

      let [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 3);

      assert.equal(goldStorage.id, id.toNumber());
      assert.equal(false, isActive);

      await buildingsQueue.cancelBuilding(goldStorage.id, 3);

      [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 3);

      assert.equal(goldStorage.id, id.toNumber());
      assert.equal(false, isActive);

      let finalBuildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

      initialBuildings = initialBuildings.splice(0, initialBuildings.length - 1);
      assert.equal(initialBuildings.toString(), finalBuildings.toString());
    })

    it('Cancel new construction after finished', async () => {
      // TODO: make index responsive
      let goldStorage = buildingsMock.initialBuildings[11];

      await buildingsQueue.addNewBuildingToQueue(goldStorage.id);

      let initial_buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

      let [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 3);
      assert.equal(goldStorage.id, id.toNumber());
      assert.equal(false, isActive);

      evmMine(goldStorage.stats[stat.blocks] + 1);

      assertRevert(async () => {
          await buildingsQueue.cancelBuilding(goldStorage.id, 3);
      })

      let final_buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);
      assert.equal(initial_buildings.toString(), final_buildings.toString());
    })

    it('Cancel upgrade before finished', async () => {
      // TODO: make index responsive
      let goldMineLvl2 = buildingsMock.initialBuildings[4];

      let [initial_id, initial_status] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);
      assert.equal(initial_id.toNumber(), goldMineLvl2.id -1000)
      assert.equal(initial_status, true);

      await buildingsQueue.upgradeBuilding(1002, goldMineLvl2.id, 1);

      let [mid_id, mid_status] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);
      assert.equal(mid_id.toNumber(), goldMineLvl2.id -1000)
      assert.equal(mid_status, false);

      evmMine();

      await buildingsQueue.cancelBuilding(goldMineLvl2.id, 1);

      let [final_id, final_status] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);
      assert.equal(final_id.toNumber(), goldMineLvl2.id -1000)
      assert.equal(final_status, true);
    })

    it('Cancel upgrade after finished', async () => {
      // TODO: make index responsive
      let goldMineLvl2 = buildingsMock.initialBuildings[4];

      let [initial_id, initial_status] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);
      assert.equal(initial_id.toNumber(), goldMineLvl2.id -1000)
      assert.equal(initial_status, true);

      await buildingsQueue.upgradeBuilding(1002, goldMineLvl2.id, 1);

      let initial_buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

      let [mid_id, mid_status] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);
      assert.equal(mid_id.toNumber(), goldMineLvl2.id -1000)
      assert.equal(mid_status, false);

      evmMine(goldMineLvl2.stats[stat.blocks]);

      assertRevert(async () => {
        await buildingsQueue.cancelBuilding(goldMineLvl2.id, 1);
      })

      let final_buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);
      assert.equal(initial_buildings.toString(), final_buildings.toString());
    })

    it('Create deleted construction', async () => {
      // TODO: make index responsive
      let goldStorage = buildingsMock.initialBuildings[11];

      await buildingsQueue.addNewBuildingToQueue(goldStorage.id);

      let initialBuildings = await buildingsQueue.getBuildingsInQueue.call(Alice);
      let initial_user_buildings = await userBuildings.getUserBuildings.call(Alice);


      let [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 3);
      assert.equal(goldStorage.id, id.toNumber());
      assert.equal(false, isActive);

      await buildingsQueue.cancelBuilding(goldStorage.id, 3);

      [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 3);

      assert.equal(goldStorage.id, id.toNumber());
      assert.equal(false, isActive);

      let finalBuildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

      initialBuildings = initialBuildings.splice(0, initialBuildings.length - 1);
      assert.equal(initialBuildings.toString(), finalBuildings.toString());

      await buildingsQueue.addNewBuildingToQueue(goldStorage.id);

      let final_user_buildings = await userBuildings.getUserBuildings.call(Alice);

      assert.equal(initial_user_buildings.toString(), final_user_buildings.toString());
    })

    it('Trying to upgrade building that is in progress', async () => {
      await buildingsQueue.addNewBuildingToQueue(1005);

      let initial_buildings_queue = await buildingsQueue.getBuildingsInQueue.call(Alice);

      return assertRevert(async () => {
      await buildingsQueue.upgradeBuilding(1005, 2005, 3);
      })
    })

    it('Gold capacity upgrading gold mine', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let goldMineLvl2 = buildingsMock.initialBuildings[4];

      let buildings = await userBuildings.getUserBuildings.call(Alice);
      let buildingsInQueue =  await buildingsQueue.getBuildingsInQueue.call(Alice);

      let [init_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      await buildingsQueue.upgradeBuilding(goldMine.id, goldMineLvl2.id, 1);

      evmMine(goldMineLvl2.stats[stat.blocks] + 1);

      let [final_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      let goldCapacityDif = goldMineLvl2.stats[stat.goldCapacity] - goldMine.stats[stat.goldCapacity]
      assert.equal(final_gold_capacity.toNumber(), init_gold_capacity.toNumber() + goldCapacityDif);
    })

    it('Gold capacity canceling gold mine upgrade', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let goldMineLvl2 = buildingsMock.initialBuildings[4];

      let [init_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      await buildingsQueue.upgradeBuilding(goldMine.id, goldMineLvl2.id, 1);

      await buildingsQueue.cancelBuilding(goldMineLvl2.id, 1);

      let [final_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      assert.equal(final_gold_capacity.toNumber(), init_gold_capacity.toNumber());
    })

    it('Gold capacity should not change while building is being upgraded', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let goldMineLvl2 = buildingsMock.initialBuildings[4];

      let [init_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      await buildingsQueue.upgradeBuilding(goldMine.id, goldMineLvl2.id, 1);

      let [final_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      assert.equal(final_gold_capacity.toNumber(), init_gold_capacity.toNumber());
    })

    it('Check gold capacity canceling new building', async () => {
      let goldStorage = buildingsMock.initialBuildings[11];

      let [init_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      await buildingsQueue.addNewBuildingToQueue(goldStorage.id);

      evmMine(2);

      let [mid_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      await buildingsQueue.cancelBuilding(goldStorage.id, 3);

      let [final_gold_capacity,] = await userResources.calculateUserResourcesCapacity.call(Alice);

      assert.equal(init_gold_capacity.toNumber(), mid_gold_capacity.toNumber());
      assert.equal(init_gold_capacity.toNumber(), final_gold_capacity.toNumber());
      })

    it('Upgrade building with requirement city center lvl 2 when city center lvl 3 is in queue', async () => {
      let cityCenter = buildingsMock.initialBuildings[0];
      let cityCenterLvl2 = buildingsMock.initialBuildings[3];
      let cityCenterLvl3 = buildingsMock.initialBuildings[14];

      let crystalMine = buildingsMock.initialBuildings[2];
      let crystalMineLvl2 = buildingsMock.initialBuildings[5];

      await buildingsQueue.upgradeBuilding(cityCenter.id, cityCenterLvl2.id, 0);
      await assetsRequirements.setAssetRequirements(crystalMineLvl2.id, [cityCenterLvl2.id]);

      await buildingsQueue.upgradeBuilding(cityCenterLvl2.id, cityCenterLvl3.id, 0);

      await buildingsQueue.upgradeBuilding(crystalMine.id, crystalMineLvl2.id, 2);
    })

    context('Set buildings requirements period', async () => {
      beforeEach(async () => {
        let goldFactory = buildingsMock.initialBuildings[7];
        let cityCenterLvl2 = buildingsMock.initialBuildings[3];
        let goldStorage = buildingsMock.initialBuildings[11];
        await assetsRequirements.setAssetRequirements(goldFactory.id, goldFactory.requirements);
        await assetsRequirements.setAssetRequirements(cityCenterLvl2.id, cityCenterLvl2.requirements);
        await assetsRequirements.setAssetRequirements(goldStorage.id, goldStorage.requirements);
      })

      it('Create gold factory with requirements', async () => {
        let goldFactory = buildingsMock.initialBuildings[7];
        let req = await assetsRequirements.getRequirements(goldFactory.id);

        assert.equal(req.toString(), goldFactory.requirements.toString());

        await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

        let buildingsInQueue = await buildingsQueue.getBuildingsInQueue(Alice);

        assert.equal(buildingsInQueue.toString(), [goldFactory.id].toString());
      })

      it('Upgrading building with requirements', async () => {
        let goldMineLvl2 = buildingsMock.initialBuildings[4];
        let crystalMineLvl2 = buildingsMock.initialBuildings[5];
        let cityCenterLvl2 = buildingsMock.initialBuildings[3];

        let req = await assetsRequirements.getRequirements(cityCenterLvl2.id);

        await buildingsQueue.upgradeBuilding(goldMineLvl2.id - 1000, goldMineLvl2.id, 1);
        await buildingsQueue.upgradeBuilding(crystalMineLvl2.id - 1000, crystalMineLvl2.id, 2);
        let blocksAmount = goldMineLvl2.stats[stat.blocks] + crystalMineLvl2.stats[stat.blocks] + 1;

        for (var i = 0; i < blocksAmount; i++) {
          await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
        }

        await buildingsQueue.upgradeBuilding(cityCenterLvl2.id -1000, cityCenterLvl2.id, 0);

      })

      it('Trying to create new building without needed requirements', async () => {
        let goldStorage = buildingsMock.initialBuildings[11];

        return assertRevert(async () => {
            await buildingsQueue.addNewBuildingToQueue(goldStorage.id);
        })
      })

      it('Trying to upgrade building without needed requirements', async () => {
        let cityCenter = buildingsMock.initialBuildings[0];
        let cityCenterLvl2 = buildingsMock.initialBuildings[3];

        return assertRevert(async () => {
          await buildingsQueue.upgradeBuilding(cityCenter.id, cityCenterLvl2.id, 0);
        })
      })
    })

    context('Buildings added to construction queue period', async () => {
      beforeEach(async () => {
        await buildingsQueue.addNewBuildingToQueue(1005);
        await buildingsQueue.addNewBuildingToQueue(1006);
      })

      it('Check user buildings queue', async () => {
        let expectedBuildings = '1005,1006';
        const buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildings.toString(), expectedBuildings);
      })

      it('Make first building be ready and removed from BuildingsQueue and transferred to UserBuildings', async () => {
        let [building_one_id, building_one_endBlock] = await buildingsQueue.getBuildingIdAndEndBlock.call(Alice, 0);
        let blocksToSkip = 0;

        if ((await web3.eth.blockNumber) < building_one_endBlock) {
          blocksToSkip = Math.abs((await web3.eth.blockNumber) - building_one_endBlock.toNumber());
        }

        evmMine(blocksToSkip);

        await buildingsQueue.updateQueue(Alice);

        const buildingsInQueue = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildingsInQueue.toString(), '1006');
      })

      it('UpdateQueue of non existent user', async () => {
        return assertRevert(async () => {
          await buildingsQueue.updateQueue(Bob);
        })
      })

      it('Get Last User Building when no buildings in queue', async () => {
        return assertRevert(async () => {
          const lastBuilding = await buildingsQueue.getLastUserBuilding.call(Bob);
        })
      })

      it('Cancel new building in queue', async () => {
        const [id, index] = await buildingsQueue.getBuildingIndex.call(Alice, 1);

        await buildingsQueue.cancelBuilding(id, index);

        const buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildings.toString(), '1005', 'The second initial building should be removed from queue, but is not');
      })

      it('Return gold resources to user when building canceled', async () => {
        const [id, index] = await buildingsQueue.getBuildingIndex.call(Alice, 0);
        const [initialUserGold, initialUserCrystal, initialUserQuantum] = await userResources.getUserResources.call(Alice);

        const previousPayoutBlock = await userResources.getUserPayoutBlock.call(Alice);

        let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
        let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

        await buildingsQueue.cancelBuilding(id, index);

        let blocksDiff = web3.eth.blockNumber - previousPayoutBlock.toNumber();
        let generatedGold =  goldRate.toNumber() * blocksDiff + queueGold.toNumber();

        const [finalUserGold, finalUserCrystal, finalUserQuantum] = await userResources.getUserResources.call(Alice);
        const [price, resourceType, blocksToBuild] = await buildingsData.getBuildingData.call(id);
        assert.equal(0, resourceType.toNumber());

        let total = initialUserGold.toNumber() + generatedGold;
        assert.equal(finalUserGold.toNumber(), total);
      })

      it('Return crystal resources to user when building canceled', async () => {
        const [id, index] = await buildingsQueue.getBuildingIndex.call(Alice, 1);
        const [initialUserGold, initialUserCrystal, initialUserQuantum] = await userResources.getUserResources.call(Alice);

        const previousPayoutBlock = await userResources.getUserPayoutBlock.call(Alice);

        let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
        let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

        await buildingsQueue.cancelBuilding(id, index);

        let blocksDiff = web3.eth.blockNumber - previousPayoutBlock.toNumber();
        let generatedCrystal =  crystalRate.toNumber() * blocksDiff + queueCrystal.toNumber();

        const [finalUserGold, finalUserCrystal, finalUserQuantum] = await userResources.getUserResources.call(Alice);
        const [price, resourceType, blocksToBuild] = await buildingsData.getBuildingData.call(id);
        assert.equal(1, resourceType.toNumber());

        let total = initialUserCrystal.toNumber() + generatedCrystal;
        assert.equal(finalUserCrystal.toNumber(), total);
      })

      it('Check updateQueueBlocks before removed building starts', async () => {
        let crystalFactory = buildingsMock.initialBuildings[8];
        let goldStorage = buildingsMock.initialBuildings[11];
        let crystalStorage = buildingsMock.initialBuildings[12];

        await buildingsQueue.addNewBuildingToQueue(goldStorage.id);
        await buildingsQueue.addNewBuildingToQueue(crystalStorage.id);

        const buildings = await userBuildings.getUserBuildings.call(Alice);

        let index = -1;
        buildings.forEach((id, i) => {
          if (id.toNumber() == crystalFactory.id) {
            index = i;
          }
        });

        let [exists, indexInQueue] = await buildingsQueue.findBuildingInQueue.call(Alice, crystalFactory.id, index);

        const [initialIds, initialStartBlocks, initialEndBlocks] = await buildingsQueue.getBuildings.call(Alice);

        await buildingsQueue.cancelBuilding(crystalFactory.id, index);

        const [finalIds, finalStartBlocks, finalEndBlocks] = await buildingsQueue.getBuildings.call(Alice);

        indexInQueue = indexInQueue.toNumber();
        const blocksA = initialEndBlocks[initialEndBlocks.length - 1].toNumber() - initialStartBlocks[initialStartBlocks.length - 1].toNumber();
        assert.equal(finalIds[finalIds.length - 1].toNumber(), initialIds[finalIds.length].toNumber());
        assert.equal(finalStartBlocks[indexInQueue].toNumber(), initialStartBlocks[indexInQueue].toNumber());
        assert.equal(finalEndBlocks[finalEndBlocks.length - 1].toNumber(), finalStartBlocks[finalStartBlocks.length - 1].toNumber() + blocksA);
      })

      it('Check updateQueueBlocks after removed building starts', async () => {
        let goldFactory = buildingsMock.initialBuildings[7];
        let goldStorage = buildingsMock.initialBuildings[11];
        let crystalStorage = buildingsMock.initialBuildings[12];

        await buildingsQueue.addNewBuildingToQueue(goldStorage.id);
        await buildingsQueue.addNewBuildingToQueue(crystalStorage.id);

        const buildings = await userBuildings.getUserBuildings.call(Alice);

        let index = -1;
        buildings.forEach((id, i) => {
          if (id.toNumber() == goldFactory.id) {
            index = i;
          }
        });

        let [exists, indexInQueue] = await buildingsQueue.findBuildingInQueue.call(Alice, goldFactory.id, index);

        const [initialIds, initialStartBlocks, initialEndBlocks] = await buildingsQueue.getBuildings.call(Alice);

        await buildingsQueue.cancelBuilding(goldFactory.id, index);

        const [finalIds, finalStartBlocks, finalEndBlocks] = await buildingsQueue.getBuildings.call(Alice);

        indexInQueue = indexInQueue.toNumber();
        const blocksA = initialEndBlocks[indexInQueue + 1].toNumber() - initialStartBlocks[indexInQueue + 1].toNumber();
        assert.equal(finalIds[indexInQueue].toNumber(), initialIds[indexInQueue + 1].toNumber());
        assert.equal(finalStartBlocks[indexInQueue].toNumber(), web3.eth.blockNumber);
        assert.equal(finalEndBlocks[indexInQueue].toNumber(), finalStartBlocks[indexInQueue].toNumber() + blocksA);
      })

      it('Try to get last user building passing 0 as address', async () => {
        return assertRevert(async () => {
          const [id, startBlock, endBlock] = await buildingsQueue.getLastUserBuilding.call(0);
        })
      })

      it('Try to get all buildings in queue passing 0 as address', async () => {
        return assertRevert(async () => {
          const ids = await buildingsQueue.getBuildingsInQueue.call(0);
        })
      })

      it('Try to get all ids and blocks in queue passing 0 as address', async () => {
        return assertRevert(async () => {
          const [ids, startBlocks, endBlocks] = await buildingsQueue.getBuildings.call(0);
        })
      })

      it('Try to get building index passing 0 as address', async () => {
        return assertRevert(async () => {
          const [id, index] = await buildingsQueue.getBuildingIndex.call(0, 1);
        })
      })

      it('Try to pass an index higher or equal to user building length', async () => {
        return assertRevert(async () => {
          const [id, endBlock] = await buildingsQueue.getBuildingIdAndEndBlock.call(Alice, 85);
        })
      })

      it('Try to pass an index higher or equal to user building length to getBuildingIndex', async () => {
        return assertRevert(async () => {
          const [id, index] = await buildingsQueue.getBuildingIndex.call(Alice, 85);
        })
      })

      it('Try to add a building with resources type 8 to queue', async () => {
        let experiment = buildingsMock.initialBuildings[13];
        return assertRevert(async () => {
          await buildingsQueue.addNewBuildingToQueue(experiment.id);
        })
      })

    })
  })
});
