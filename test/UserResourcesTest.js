const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const UserResources = artifacts.require('UserResources');
const UserBuildings = artifacts.require('UserBuildings');
const BuildingsData = artifacts.require('BuildingsData');

var buildingsMock = require('../mocks/buildings');
var resourcesMock = require('../mocks/resources');
const { assertInvalidOpcode } = require('./helpers/assertThrow');

contract('User Resources Test', (accounts) => {
  let experimentalToken, userVault, userVillage, userResources, userBuilding, buildingsData = {};

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
    userBuildings= await UserBuildings.new(buildingsData.address);
    userVillage = await UserVillage.new(userVault.address,
                                        userResources.address,
                                        userBuildings.address);

    await userResources.setUserVillageAddress(userVillage.address);
    await userBuildings.setUserVillage(userVillage.address);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[0]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[1]);
    await buildingsData.addBuilding(...buildingsMock.initialBuildings[2]);
    await experimentalToken.approve(userVault.address, 1 * ether); // needed to create village
  })

  it('Init User Resources from not User Village Contract', async () => {
    return assertInvalidOpcode(async () => {
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

  it('Set UserVillageAddress as Alice', async () => {
    await userResources.setUserVillageAddress(Alice);
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
      return assertInvalidOpcode(async () => {
        await userResources.setInitialResources(...resourcesMock.initialResources, {from: Bob});
      })
    })

    context('BuildingsQueue as Alice period', async () => {
      beforeEach(async () => {
        await userResources.setBuildingsQueue(Alice);
      })

      it('Consume gold without enough resources', async () => {
        return assertInvalidOpcode(async () => {
          await userResources.consumeGold(Alice, 300);
        })
      })

      it('Consume crystal without enough resources', async () => {
        return assertInvalidOpcode(async () => {
          await userResources.consumeCrystal(Alice, 300);
        })
      })

      it('Consume quantum without enough resources', async () => {
        return assertInvalidOpcode(async () => {
          await userResources.consumeQuantumDust(Alice, 300);
        })
      })

      context('User with resources period', async () => {
        beforeEach(async () => {
          await userResources.giveResourcesToUser(
            Alice, goldAmount, crystalAmount, quantumAmount
          );
        })

        it('Test consume gold with enough resources', async () => {
          await userResources.consumeGold(Alice, 300);
          const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
          assert.equal(gold.toNumber(), goldAmount - 300);
        })

        it('Test consume crystal with enough resources', async () => {
          await userResources.consumeCrystal(Alice, 300);
          const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
          assert.equal(crystal.toNumber(), crystalAmount - 300);
        })

        it('Test consume quantum with enough resources', async () => {
          await userResources.consumeQuantumDust(Alice, 300);
          const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
          assert.equal(quantum.toNumber(), quantumAmount - 300);
        })
      })

    })
  })
});
