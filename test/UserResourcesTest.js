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
            let ids = [2];
            await userBuildings.addInitialBuildings(Alice, ids);
          })

          it('Payout resources to user', async () => {
            let payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

            await userResources.payoutResources(Alice);

            let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
            let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

            const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

            let payoutDiff = (await web3.eth.blockNumber) - payoutBlock;

            assert.equal(gold.toNumber(), goldAmount + (payoutDiff * goldRate.toNumber()) + queueGold.toNumber());
            assert.equal(crystal.toNumber(), crystalAmount + (payoutDiff * crystalRate.toNumber()) + queueCrystal.toNumber());
          })
        })
      })

    })
  })
});
