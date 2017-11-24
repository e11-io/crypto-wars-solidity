const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const BuildingsData = artifacts.require('BuildingsData');
const UserResources = artifacts.require('UserResources');
const UserBuildings = artifacts.require('UserBuildings');
const UserVillage = artifacts.require('UserVillage');

var buildingsMock = require('../mocks/buildings');
const { assertRevert } = require('./helpers/assertThrow');

const stat = buildingsMock.stats;

contract('Buildings Queue Test', (accounts) => {
  let buildingsQueue, buildingsData, userResources, userVillage, userVault, experimentalToken = {};

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  beforeEach(async () => {
    experimentalToken = await ExperimentalToken.new();
    userVault = await UserVault.new(experimentalToken.address);
    userResources = await UserResources.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    userBuildings = await UserBuildings.new(buildingsData.address);
    userVillage = await UserVillage.new(userVault.address,
                                        userResources.address,
                                        userBuildings.address);

    await buildingsQueue.setBuildingsData(buildingsData.address);
    await userResources.setUserVillage(userVillage.address);
    await userBuildings.setUserVillage(userVillage.address);
    await buildingsQueue.setUserResources(userResources.address);
    await buildingsQueue.setUserBuildings(userBuildings.address);
    await userResources.setBuildingsQueue(buildingsQueue.address);
    await userResources.setUserBuildings(userBuildings.address);
    await userBuildings.setUserResources(userResources.address);
    await userBuildings.setBuildingsQueue(buildingsQueue.address);
    // await userBuildings.setBuildingsData(buildingsData.address);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[0].id,
      buildingsMock.initialBuildings[0].name,
      buildingsMock.initialBuildings[0].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[1].id,
      buildingsMock.initialBuildings[1].name,
      buildingsMock.initialBuildings[1].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[2].id,
      buildingsMock.initialBuildings[2].name,
      buildingsMock.initialBuildings[2].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[3].id,
      buildingsMock.initialBuildings[3].name,
      buildingsMock.initialBuildings[3].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[4].id,
      buildingsMock.initialBuildings[4].name,
      buildingsMock.initialBuildings[4].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[5].id,
      buildingsMock.initialBuildings[5].name,
      buildingsMock.initialBuildings[5].stats);
  })

  it('Add building to queue with no resources', async () => {
    return assertRevert(async () => {
      await buildingsQueue.addNewBuildingToQueue(2);
    })
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

    it('Add gold mine to queue', async () => {
      await buildingsQueue.addNewBuildingToQueue(2);

      const [id, startBlock, endBlock, queueId] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), 2);
    })

    it('Add crystal mine to queue', async () => {
      await buildingsQueue.addNewBuildingToQueue(3);

      const [id, startBlock, endBlock, queueId] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), 3);
    })

    it('Upgrade gold mine from user buildings', async () => {
      let building = buildingsMock.initialBuildings[1];

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == building.id) {
          index = i;
        }
      });

      await buildingsQueue.upgradeBuilding(building.id, building.stats[stat.nextLevelId], index);

      const [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(false, isActive);
    })

    it('Try to upgrade gold mine passing wrong upgrade ID', async () => {
      let building = buildingsMock.initialBuildings[2];
      return assertRevert(async () => {
        await buildingsQueue.upgradeBuilding(building.id, building.stats[stat.nextLevelId] + 420, 0); // Add to wrong upgrade id
      })
    })

    it('Add non-existing building to queue', async () => {
      return assertRevert(async () => {
        await buildingsQueue.addNewBuildingToQueue(678);
      })
    })

    it('Remove building that is not in queue', async () => {
      await buildingsQueue.removeBuilding(2, 1);

      const [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, 1);

      assert.equal(isActive, false);
    })


    context('Buildings added to construction queue period', async () => {
      beforeEach(async () => {
        await buildingsQueue.addNewBuildingToQueue(1);
        await buildingsQueue.addNewBuildingToQueue(2);
        await buildingsQueue.addNewBuildingToQueue(3);
      })

      it('Check user buildings queue', async () => {
        let expectedBuildings = '1,2,3';
        const buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildings.toString(), expectedBuildings);
      })

      it('Make first two buildings be ready and removed from BuildingsQueue and transferred to UserBuildings', async () => {
        let [building_one_id, building_one_endBlock] = await buildingsQueue.getBuildingIdAndEndBlock.call(Alice, 0);
        let [building_two_id, building_two_endBlock] = await buildingsQueue.getBuildingIdAndEndBlock.call(Alice, 1);
        let blocksToSkip = 0;

        if ((await web3.eth.blockNumber) < building_two_endBlock) {
          blocksToSkip = Math.abs((await web3.eth.blockNumber) - building_two_endBlock.toNumber());
        }

        for (var i = 0; i < blocksToSkip; i++) {
          await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
        }

        await buildingsQueue.updateQueue(Alice);

        const buildingsInQueue = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildingsInQueue.toString(), '3');
      })

      it('UpdateQueue of non existent user', async () => {
        return assertRevert(async () => {
          const finishedBuildings = await buildingsQueue.updateQueue.call(Bob);
        })
      })

      it('Get Last User Building when no buildings in queue', async () => {
        return assertRevert(async () => {
          const lastBuilding = await buildingsQueue.getLastUserBuilding.call(Bob);
        })
      })

      it('Cancel new building in queue', async () => {
        const [id, queueId] = await buildingsQueue.getBuildingIndex.call(Alice, 1);

        // await buildingsQueue.cancelNewBuilding(Alice, id, queueId);
        await buildingsQueue.removeBuilding(id, queueId);

        const buildings = await buildingsQueue.getBuildingsInQueue.call(Alice);

        assert.equal(buildings, '1,3', 'The second initial building should be removed from queue, but is not');
      })

      it('Return resources to user when building canceled', async () => {
        const [id, index] = await buildingsQueue.getBuildingIndex.call(Alice, 1);
        const [initialUserGold, initialUserCrystal, initialUserQuantum] = await userResources.getUserResources.call(Alice);

        const previousPayoutBlock = await userResources.getUserPayoutBlock.call(Alice);
        // await buildingsQueue.cancelNewBuilding(Alice, id, index);
        await buildingsQueue.removeBuilding(id, index);

        let blocksDiff = web3.eth.blockNumber - previousPayoutBlock.toNumber();
        let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
        let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);
        let generatedGold =  goldRate.toNumber() * blocksDiff + queueGold.toNumber();

        const [finalUserGold, finalUserCrystal, finalUserQuantum] = await userResources.getUserResources.call(Alice);
        const [price, resourceType, blocksToBuild] = await buildingsData.getBuildingData.call(id);

        let total = initialUserGold.toNumber() + price.toNumber()*60/100 + generatedGold;
        assert.equal(finalUserGold.toNumber(), total);
      })

      it('Remove building in queue', async () => {
        const txData = await buildingsQueue.addNewBuildingToQueue(3);
        const data = txData.logs[0].args;

        await buildingsQueue.removeBuilding(data._id.toNumber(), data._index.toNumber());

        const [ids, indexes] =  await buildingsQueue.getBuildingsIdAndIndex.call(Alice);
        const [id, isActive] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, data._index.toNumber());

        // the ids of the buildings added in the beforeEach.
        assert.equal(ids.toString(), '1,2,3');
        assert.equal(isActive, false);
      })

      it('Check updateQueueBlocks before removed building starts', async () => {
        await buildingsQueue.addNewBuildingToQueue(2);
        await buildingsQueue.addNewBuildingToQueue(2);

        const [initialIds, initialStartBlocks, initialEndBlocks] = await buildingsQueue.getIdAndBlocks.call(Alice);

        await buildingsQueue.removeBuilding(3, 5);

        const [finalIds, finalStartBlocks, finalEndBlocks] = await buildingsQueue.getIdAndBlocks.call(Alice);

        const blocksA = initialEndBlocks[3].toNumber() - initialStartBlocks[3].toNumber();
        assert.equal(finalIds[2].toNumber(), initialIds[3].toNumber());
        assert.equal(finalStartBlocks[2].toNumber(), initialStartBlocks[2].toNumber());
        assert.equal(finalEndBlocks[2].toNumber(), finalStartBlocks[2].toNumber() + blocksA);
      })

      it('Check updateQueueBlocks after removed building starts', async () => {
        await buildingsQueue.addNewBuildingToQueue(2);
        await buildingsQueue.addNewBuildingToQueue(2);

        const [initialIds, initialStartBlocks, initialEndBlocks] = await buildingsQueue.getIdAndBlocks.call(Alice);

        await buildingsQueue.removeBuilding(2, 4);

        const [finalIds, finalStartBlocks, finalEndBlocks] = await buildingsQueue.getIdAndBlocks.call(Alice);

        const blocksA = initialEndBlocks[2].toNumber() - initialStartBlocks[2].toNumber();
        assert.equal(finalIds[1].toNumber(), initialIds[2].toNumber());
        assert.equal(finalStartBlocks[1].toNumber(), web3.eth.blockNumber);
        assert.equal(finalEndBlocks[1].toNumber(), finalStartBlocks[1].toNumber() + blocksA);
      })

      it('Remove building passing wrong index', async () => {
        return assertRevert(async () => {
          await buildingsQueue.removeBuilding(2, 5);
        })
      })

      it('Remove building passing non-exitent id', async () => {
        return assertRevert(async () => {
          await buildingsQueue.removeBuilding(854, 5);
        })
      })


    })
  })
});
