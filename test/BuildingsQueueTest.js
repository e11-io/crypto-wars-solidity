const BuildingsQueue = artifacts.require('BuildingsQueue');
const BuildingsData = artifacts.require('BuildingsData');
const UserResources = artifacts.require('UserResources');
const UserBuildings = artifacts.require('UserBuildings');

var buildingsMock = require('../mocks/buildings');
const { assertInvalidOpcode } = require('./helpers/assertThrow');

contract('Buildings Queue Test', (accounts) => {
  let buildingsQueue, buildingsData, userResources = {};
  const Alice = accounts[0];
  const Bob = accounts[1];

  beforeEach(async () => {
    userResources = await UserResources.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    userBuildings = await UserBuildings.new(buildingsData.address);

    await buildingsQueue.setBuildingsData(buildingsData.address);
    await buildingsQueue.setUserResources(userResources.address);
    await buildingsQueue.setUserBuildings(userBuildings.address);
    await userResources.setBuildingsQueue(buildingsQueue.address);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[1]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[2]);
  })

  it('Add building to queue with no resources', async () => {
    return assertInvalidOpcode(async () => {
      await buildingsQueue.addNewBuildingToQueue(2, 10);
    })
  })

  context('User with resources period', async () => {
    beforeEach(async () => {
      await userResources.giveResourcesToUser(Alice, 3000, 3000, 200);

      const [gold, crystal, quantumDust] = await userResources.getUserResources.call(Alice);

      assert.equal(3000, gold.toNumber(), 'gold');
      assert.equal(3000, crystal.toNumber(), 'crystal');
      assert.equal(200, quantumDust.toNumber(), 'quantumDust');
    })

    it('Add gold mine to queue', async () => {
      await buildingsQueue.addNewBuildingToQueue(2, 10);

      const [id, skin, startBlock, endBlock] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), 2);
      assert.equal(skin.toNumber(), 10);
    })

    it('Add crystal mine to queue', async () => {
      await buildingsQueue.addNewBuildingToQueue(3, 10);

      const [id, skin, startBlock, endBlock] = await buildingsQueue.getLastUserBuilding.call(Alice);

      assert.equal(id.toNumber(), 3);
      assert.equal(skin.toNumber(), 10);
    })



    it('Add non-existing building to queue', async () => {
      return assertInvalidOpcode(async () => {
        await buildingsQueue.addNewBuildingToQueue(678, 10);
      })
    })

    context('Buildings added to construction queue period', async () => {
      beforeEach(async () => {
        await buildingsQueue.addNewBuildingToQueue(1, 10);
        await buildingsQueue.addNewBuildingToQueue(2, 10);
        await buildingsQueue.addNewBuildingToQueue(3, 10);
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
        return assertInvalidOpcode(async () => {
          const finishedBuildings = await buildingsQueue.updateQueue.call(Bob);
        })
      })

      it('Get Last User Building when no buildings in queue', async () => {
        return assertInvalidOpcode(async () => {
          const lastBuilding = await buildingsQueue.getLastUserBuilding.call(Bob);
        })
      })
    })
  })
});
