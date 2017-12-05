const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const UserResources = artifacts.require('UserResources');
const UserBuildings = artifacts.require('UserBuildings');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');

var buildingsMock = require('../mocks/buildings');
var resourcesMock = require('../mocks/resources');
const { assertRevert } = require('./helpers/assertThrow');

const stat = buildingsMock.stats;

contract('User Resources Test', (accounts) => {
  let experimentalToken, userVault, userVillage, userResources, userBuildings, buildingsData, buildingsQueue = {};

  const Alice = accounts[0];
  const Bob = accounts[1];
  const Carol = accounts[2];
  const David = accounts[3];
  const ether = Math.pow(10, 18);
  const goldAmount = 2000;
  const crystalAmount = 3000;
  const quantumAmount = 500;

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
    await buildingsQueue.setUserResources(userResources.address);
    await buildingsQueue.setUserBuildings(userBuildings.address);
    await userResources.setUserVillage(userVillage.address);
    await userResources.setUserBuildings(userBuildings.address);
    await userBuildings.setUserVillage(userVillage.address);
    await userBuildings.setUserResources(userResources.address);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[0].id,
      buildingsMock.initialBuildings[0].name,
      buildingsMock.initialBuildings[0].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[1].id,
      buildingsMock.initialBuildings[1].name,
      buildingsMock.initialBuildings[1].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[2].id,
      buildingsMock.initialBuildings[2].name,
      buildingsMock.initialBuildings[2].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[7].id,
      buildingsMock.initialBuildings[7].name,
      buildingsMock.initialBuildings[7].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[8].id,
      buildingsMock.initialBuildings[8].name,
      buildingsMock.initialBuildings[8].stats);
    await experimentalToken.approve(userVault.address, 1 * ether); // needed to create village
  })

  it('Init User Resources from not User Village Contract', async () => {
    return assertRevert(async () => {
      await userResources.initUserResources(Bob)
    })
  })

  it('Set BuildingsQueue as Alice', async () => {
    await userResources.setBuildingsQueue(Alice);
    await userResources.giveResourcesToUser(
      Alice, goldAmount, crystalAmount, quantumAmount
    );

    const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

    assert.equal(gold.toNumber(), goldAmount);
  })

  it('Set user village address as Alice', async () => {
    await userResources.setUserVillage(Alice);
    await userResources.initUserResources(Bob);

    const [gold, crystal, quantum] = await userResources.getUserResources.call(Bob);

    assert.equal(gold.toNumber(), 0);
  })

  context('Resources initialized period', async () => {
    beforeEach(async () => {
      await userResources.setInitialResources(...resourcesMock.initialResources);
    })

    it('Give Resources to User', async () => {
      await userResources.giveResourcesToUser(
        Alice, goldAmount, crystalAmount, quantumAmount
      );

      const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

      assert.equal(gold.toNumber(), goldAmount);
      assert.equal(crystal.toNumber(), crystalAmount);
      assert.equal(quantum.toNumber(), quantumAmount);
    })

    it('Check if resources are given correctly when user creation', async () => {
      await userVillage.create('My new village!', 'Cool player');

      const [gold, crystal, quantumDust] = await userResources.getUserResources.call(Alice);

      assert.equal(gold.toNumber(), resourcesMock.initialResources[0], 'Initial gold amount is incorrect')
      assert.equal(crystal.toNumber(), resourcesMock.initialResources[1], 'Initial crystal amount is incorrect')
      assert.equal(quantumDust.toNumber(), resourcesMock.initialResources[2], 'Initial quantum amount is incorrect')
    })

    it('Set initial resources amount not from owner', async () => {
      return assertRevert(async () => {
        await userResources.setInitialResources(...resourcesMock.initialResources, {from: Bob});
      })
    })

    context('BuildingsQueue as Alice period', async () => {
      beforeEach(async () => {
        await userResources.setBuildingsQueue(Alice);
      })

      it('Consume gold without enough resources', async () => {
        return assertRevert(async () => {
          await userResources.consumeGold(Alice, 300);
        })
      })

      it('Consume crystal without enough resources', async () => {
        return assertRevert(async () => {
          await userResources.consumeCrystal(Alice, 300);
        })
      })

      it('Consume quantum without enough resources', async () => {
        return assertRevert(async () => {
          await userResources.consumeQuantumDust(Alice, 300);
        })
      })

      context('User with resources period', async () => {
        beforeEach(async () => {
          await userResources.giveResourcesToUser(
            Alice, goldAmount, crystalAmount, quantumAmount
          );
        })

        it('Test consume quantum with enough resources', async () => {
          await userResources.consumeQuantumDust(Alice, 300);
          const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
          assert.equal(quantum.toNumber(), quantumAmount - 300);
        })

        context('Alice set as User village. Payout Block initialized. Gold mine added to user', async () => {
          beforeEach(async () => {
            await userResources.setUserVillage(Alice);
            await userResources.setBuildingsQueue(buildingsQueue.address);
            await userResources.initPayoutBlock(Alice);
            await userBuildings.setUserVillage(Alice);

          })

          it('Payout gold resources to user', async () => {
            let goldMine = buildingsMock.initialBuildings[1];
            await userBuildings.addInitialBuildings(Alice, [goldMine.id]);

            let payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

            let goldFactory = buildingsMock.initialBuildings[7];
            await buildingsQueue.addNewBuildingToQueue(goldFactory.id);
            let resourcediff = goldMine.stats[stat.goldRate] * (web3.eth.blockNumber - payoutBlock);
            resourcediff -= goldFactory.stats[stat.price];

            for (var i = 0; i < goldFactory.stats[stat.blocks] + 1; i++) {
              await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
            }

            let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
            let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

            payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

            await userResources.payoutResources(Alice);

            const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

            let payoutDiff = (await web3.eth.blockNumber) - payoutBlock;
            let extraQueueGold = goldFactory.stats[stat.goldRate];

            assert.equal(
              gold.toNumber(),
              goldAmount +
              (payoutDiff * goldRate.toNumber()) +
              queueGold.toNumber() + resourcediff + extraQueueGold
            );
          })

          it('Payout crystal resources to user', async () => {
            let crystalMine = buildingsMock.initialBuildings[2];
            await userBuildings.addInitialBuildings(Alice, [crystalMine.id]);

            let payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

            let crystalFactory = buildingsMock.initialBuildings[8];
            await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);
            let resourcediff = crystalMine.stats[stat.crystalRate] * (web3.eth.blockNumber - payoutBlock);
            resourcediff -= crystalFactory.stats[stat.price];

            for (var i = 0; i < crystalFactory.stats[stat.blocks] + 1; i++) {
              await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
            }

            let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
            let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

            payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

            await userResources.payoutResources(Alice);

            const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

            let payoutDiff = (await web3.eth.blockNumber) - payoutBlock;
            let extraQueueCrystal = crystalFactory.stats[stat.crystalRate];

            assert.equal(
              crystal.toNumber(),
              crystalAmount +
              (payoutDiff * crystalRate.toNumber()) +
              queueCrystal.toNumber() + resourcediff + extraQueueCrystal
            );
          })

          it('Check queue finished building payouts', async () => {
            let crystalFactory = buildingsMock.initialBuildings[8];
            await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);

            for (var i = 0; i < crystalFactory.stats[stat.blocks]; i++) {
              await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
            }
            let blocksToSkip = 0;
            await userResources.payoutResources(Alice);
            blocksToSkip++;

            for (var i = 0; i < 5; i++) {
              await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
              blocksToSkip++;
            }

            await userResources.payoutResources(Alice);
            blocksToSkip++;

            let [finalGold, finalCrystal, finalQuantum] = await userResources.getUserResources.call(Alice);

            let amount = crystalFactory.stats[stat.crystalRate] * blocksToSkip;
            assert.equal(finalCrystal.toNumber(), crystalAmount + amount - crystalFactory.stats[stat.price]);
          })
        })
      })

    })
  })
});
