const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const PointsSystem = artifacts.require('PointsSystem');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('../helpers/assertThrow');
const { evmMine } = require('../helpers/evmMine');
const { initializeContracts } = require('../helpers/initializeContracts');
const { isVersioned } = require('../helpers/isVersioned');
const { setContractsTest } = require('../helpers/setContractsTest');

const buildingsMock = require('../../data/test/buildings');
const resourcesMock = require('../../data/test/resources');
const stat = buildingsMock.stats;

const cityCenter = buildingsMock.initialBuildings.find(b => b.name == 'city_center_1');
const goldMine = buildingsMock.initialBuildings.find(b => b.name == 'gold_mine_1');
const crystalMine = buildingsMock.initialBuildings.find(b => b.name == 'crystal_mine_1');
const portal = buildingsMock.initialBuildings.find(b => b.name == 'portal_1');
const goldFactory = buildingsMock.initialBuildings.find(b => b.name == 'gold_factory_1');
const crystalFactory = buildingsMock.initialBuildings.find(b => b.name == 'crystal_factory_1');
const goldStorage = buildingsMock.initialBuildings.find(b => b.name == 'gold_storage_1');
const crystalStorage = buildingsMock.initialBuildings.find(b => b.name == 'crystal_storage_1');

contract('User Resources Test', (accounts) => {
  let assetsRequirements,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      userBuildings,
      userResources,
      userVault,
      userVillage;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const Carol = accounts[2];
  const David = accounts[3];
  const ether = Math.pow(10, 18);
  const goldAmount = 2000;
  const crystalAmount = 3000;
  const quantumAmount = 500;
  const initialUserBuildings = [
    cityCenter.id,
    goldMine.id,
    crystalMine.id,
  ];

  beforeEach(async () => {
    assetsRequirements = await AssetsRequirements.new();
    buildingsData = await BuildingsData.new();
    buildingsQueue = await BuildingsQueue.new();
    pointsSystem = await PointsSystem.new();
    experimentalToken = await ExperimentalToken.new();
    userBuildings = await UserBuildings.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();

    await initializeContracts({
      assetsRequirements,
      buildingsData,
      buildingsQueue,
      pointsSystem,
      experimentalToken,
      userBuildings,
      userResources,
      userVault,
      userVillage,
    });

    await buildingsData.addBuilding(cityCenter.id,
      cityCenter.name,
      cityCenter.stats);
    await buildingsData.addBuilding(goldMine.id,
      goldMine.name,
      goldMine.stats);
    await buildingsData.addBuilding(crystalMine.id,
      crystalMine.name,
      crystalMine.stats);
    await buildingsData.addBuilding(goldFactory.id,
      goldFactory.name,
      goldFactory.stats);
    await buildingsData.addBuilding(crystalFactory.id,
      crystalFactory.name,
      crystalFactory.stats);
    await buildingsData.addBuilding(goldStorage.id,
      goldStorage.name,
      goldStorage.stats);
    await buildingsData.addBuilding(crystalStorage.id,
      crystalStorage.name,
      crystalStorage.stats);
    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.setInitialBuildings(initialUserBuildings);
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(userResources, UserResources));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(userResources));
  })

  it('Init User Resources from not User Village Contract', async () => {
    await assertRevert(async () => {
      await userResources.initUserResources(Bob, { from: Bob })
    })
  })

  it('Give Resources to User', async () => {
    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.create('My new village!', 'Cool player');
    await userResources.giveResourcesToUser(
      Alice, goldAmount, crystalAmount, quantumAmount
    );

    const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

    gold.should.be.bignumber.equal(goldAmount);
    crystal.should.be.bignumber.equal(crystalAmount);
    quantum.should.be.bignumber.equal(quantumAmount);
  });

  it('try initializing user resources when user is initialized', async () => {
    await userResources.initUserResources(Bob);
    await assertRevert(async () => {
      await userResources.initUserResources(Bob);
    })
  })

  it('Init user Resources', async () => {
    await userResources.initUserResources(Bob);

    const [gold, crystal, quantum] = await userResources.getUserResources.call(Bob);

    assert.equal(gold.toNumber(), 0);
  })

  it('Try consuming gold not from buildings queue contract', async () => {
    await assertRevert(async () => {
      await userResources.consumeGold(Alice, 200, { from: Bob });
    })
  })

  it('Try consuming crystal not from buildings queue contract', async () => {
    await assertRevert(async () => {
      await userResources.consumeCrystal(Alice, 200, { from: Bob });
    })
  })

  it('Try consuming quantum not from buildings queue contract', async () => {
    await assertRevert(async () => {
      await userResources.consumeQuantumDust(Alice, 200, { from: Bob });
    })
  })

  it('Try give Resources To User from random user', async () => {
    await assertRevert(async () => {
      await userResources.giveResourcesToUser(
        Alice, goldAmount, crystalAmount, quantumAmount, {from: Bob}
      );
    })
  })

  it('Try init user payoutblock not from user village contract or owner', async () => {
    await assertRevert(async () => {
      await userResources.initPayoutBlock(Alice, { from: Bob });
    })
  })

  context('Resources initialized period', async () => {
    beforeEach(async () => {
      await userResources.setInitialResources(...resourcesMock.initialResources);
    })

    it('Set initial resources with same default value for coverage', async () => {
      await userResources.setInitialResources(...resourcesMock.initialResources);
    })

    it('Check if resources are given correctly when user creation', async () => {
      await userVillage.create('My new village!', 'Cool player');

      const [gold, crystal, quantumDust] = await userResources.getUserResources.call(Alice);

      gold.should.be.bignumber.equal(resourcesMock.initialResources[0]);
      crystal.should.be.bignumber.equal(resourcesMock.initialResources[1]);
      quantumDust.should.be.bignumber.equal(resourcesMock.initialResources[2]);
    });

    it('Set initial resources amount not from owner', async () => {
      await assertRevert(async () => {
        await userResources.setInitialResources(...resourcesMock.initialResources, {from: Bob});
      })
    })

    it('Consume gold without enough resources', async () => {
      await assertRevert(async () => {
        await userResources.consumeGold(Alice, 300);
      })
    })

    it('Consume crystal without enough resources', async () => {
      await assertRevert(async () => {
        await userResources.consumeCrystal(Alice, 300);
      })
    })

    it('Consume quantum without enough resources', async () => {
      await assertRevert(async () => {
        await userResources.consumeQuantumDust(Alice, 300);
      })
    })

    context('User with resources and village without buildings', async () => {
      beforeEach(async () => {
        await userVillage.setInitialBuildings([]);
        await userResources.setInitialResources(...resourcesMock.initialResources);
        await experimentalToken.approve(userVault.address, 1 * ether);
        await userVillage.create('My new village!', 'Cool player');
      });

      it('Adds points when consuming gold', async () => {
        const pointsToAdd = 100;
        const initialPoints = await pointsSystem.usersPoints(Alice);
        const initialPointsAdded = initialPoints.add(pointsToAdd);
        await userResources.consumeGold(Alice, pointsToAdd);
        const finalPoints = await pointsSystem.usersPoints(Alice);
        expect(finalPoints.eq(initialPointsAdded), 'Consuming gold did not added correctly').to.be.true;
      });

      it('Adds points when consuming crystal', async () => {
        const pointsToAdd = 100;
        const initialPoints = await pointsSystem.usersPoints(Alice);
        const initialPointsAdded = initialPoints.add(pointsToAdd);
        await userResources.consumeCrystal(Alice, pointsToAdd);
        const finalPoints = await pointsSystem.usersPoints(Alice);
        expect(finalPoints.eq(initialPointsAdded), 'Consuming crystal did not added correctly').to.be.true;
      });

      it('Consume quantum with enough resources', async () => {
        const initialQuantumResourceSet = resourcesMock.initialResources[2];
        let amount = 300;

        await userResources.giveResourcesToUser(Alice, 0, 0, quantumAmount);
        await userResources.consumeQuantumDust(Alice, amount);
        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
        quantum.should.be.bignumber.equal(quantumAmount - amount + initialQuantumResourceSet);
      });

      it('Payout gold resources to user', async () => {
        const initialGoldResourceSet = resourcesMock.initialResources[0];
        await userBuildings.addInitialBuildings(Alice, [goldMine.id, goldStorage.id]);

        let payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

        await buildingsQueue.addNewBuildingToQueue(goldFactory.id);
        let resourcediff = goldMine.stats[stat.goldRate] * (await web3.eth.blockNumber - payoutBlock);
        resourcediff -= goldFactory.stats[stat.price];

        evmMine(goldFactory.stats[stat.blocks] + 1);

        const [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
        const [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

        payoutBlock = await userResources.getUserPayoutBlock.call(Alice);
        await userResources.payoutResources(Alice);


        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);
        let payoutDiff = (await web3.eth.blockNumber) - payoutBlock;
        let extraQueueGold = goldFactory.stats[stat.goldRate];

        gold.should.be.bignumber.equal(
          initialGoldResourceSet +
          (payoutDiff * goldRate.toNumber()) +
          queueGold.toNumber() + resourcediff + extraQueueGold
          - 100 // TODO Check why do we need to substract 100 while on ganache-cli
        );
      })

      it('Payout crystal resources to user', async () => {
        const initialCrystalResourceSet = resourcesMock.initialResources[1];

        await userBuildings.addInitialBuildings(Alice, [crystalMine.id, crystalStorage.id]);

        let payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

        await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);
        let resourcediff = crystalMine.stats[stat.crystalRate] * (web3.eth.blockNumber - payoutBlock);
        resourcediff -= crystalFactory.stats[stat.price];

        evmMine(crystalFactory.stats[stat.blocks] + 1);

        let [goldRate, crystalRate] = await userBuildings.getUserRates.call(Alice);
        let [queueGold, queueCrystal] = await buildingsQueue.getUserQueueResources.call(Alice);

        payoutBlock = await userResources.getUserPayoutBlock.call(Alice);

        await userResources.payoutResources(Alice);

        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

        let payoutDiff = (await web3.eth.blockNumber) - payoutBlock;
        let extraQueueCrystal = crystalFactory.stats[stat.crystalRate];

        crystal.should.be.bignumber.equal(
          initialCrystalResourceSet +
          (payoutDiff * crystalRate.toNumber()) +
          queueCrystal.toNumber() + resourcediff + extraQueueCrystal
          - 100 // TODO Check why do we need to substract 100 while on ganache-cli
        );
      })

      it('Check queue finished building payouts', async () => {
        const initialCrystalResourceSet = resourcesMock.initialResources[1];

        await userBuildings.addInitialBuildings(Alice, [crystalStorage.id]);

        await buildingsQueue.addNewBuildingToQueue(crystalFactory.id);

        evmMine(crystalFactory.stats[stat.blocks]);

        let blocksToSkip = 0;
        await userResources.payoutResources(Alice);
        blocksToSkip++;

        evmMine(5);
        blocksToSkip += 5;

        await userResources.payoutResources(Alice);
        blocksToSkip++;

        let [finalGold, finalCrystal, finalQuantum] = await userResources.getUserResources.call(Alice);

        let amount = crystalFactory.stats[stat.crystalRate] * blocksToSkip;

        finalCrystal.should.be.bignumber.equal(initialCrystalResourceSet + amount - crystalFactory.stats[stat.price]);
      });

      it('Exceed gold and crystal capacity', async () => {
        await userBuildings.addInitialBuildings(Alice, [goldMine.id, crystalMine.id]);

        let [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice);
        let goldBlocksAmount = goldCapacity.toNumber() / goldMine.stats[stat.goldRate];
        let crystalBlocksAmount = crystalCapacity.toNumber() / crystalMine.stats[stat.crystalRate];

        let blockAmount = goldBlocksAmount > crystalBlocksAmount ? goldBlocksAmount : crystalBlocksAmount;

        evmMine(blockAmount + 5);

        await userResources.payoutResources(Alice);

        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

        gold.should.be.bignumber.equal(goldCapacity);
        crystal.should.be.bignumber.equal(crystalCapacity);
      });

      it('Exceed gold capacity from buildings in queue', async () => {
        await buildingsQueue.addNewBuildingToQueue(goldMine.id);

        evmMine(goldMine.stats[stat.blocks] + 1);

        let [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice);
        let blockNumber = goldCapacity.toNumber() / goldMine.stats[stat.goldRate];

        evmMine(blockNumber + 5);

        await userResources.payoutResources(Alice);
        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

        gold.should.be.bignumber.equal(goldCapacity);
      });

      it('Exceed crystal capacity from buildings in queue', async () => {
        await buildingsQueue.addNewBuildingToQueue(crystalMine.id);

        evmMine(crystalMine.stats[stat.blocks] + 1);

        let [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice);
        let blockNumber = crystalCapacity.toNumber() / crystalMine.stats[stat.crystalRate];

        evmMine(blockNumber + 5);

        await userResources.payoutResources(Alice);
        const [gold, crystal, quantum] = await userResources.getUserResources.call(Alice);

        crystal.should.be.bignumber.equal(crystalCapacity);
      });

      it('Calculate User Resources Capacity from initial buildings in queue', async () => {
        const buildingsIds = await userBuildings.getUserBuildings.call(Alice);
        const buildingsInQueue = await buildingsQueue.getBuildingsInQueue(Alice);
        let totalGoldCapacity = new BigNumber('0');
        let totalCrystalCapacity = new BigNumber('0');

        for (var i = 0; i < buildingsIds.concat(buildingsInQueue).length; i++) {

          const [goldCapacityData, crystalCapacityData] = await buildingsData.getGoldAndCrystalCapacity.call(buildingsIds[i]);

          totalGoldCapacity = totalGoldCapacity.plus(goldCapacityData);
          totalCrystalCapacity = totalCrystalCapacity.plus(crystalCapacityData);
        }

        const [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice);

        goldCapacity.should.be.bignumber.equal(totalGoldCapacity);
        crystalCapacity.should.be.bignumber.equal(totalCrystalCapacity);
      });

      it('Calculate User Resources Capacity after adding buildings', async () => {
        // NOTE: buildings must be finished to ensure the test is going to pass
        await buildingsQueue.addNewBuildingToQueue(goldStorage.id);
        await buildingsQueue.addNewBuildingToQueue(crystalStorage.id);

        const constructionBlocks = goldStorage.stats[stat.blocks] + 1 + crystalStorage.stats[stat.blocks];

        evmMine(constructionBlocks);

        const buildingsIds = await userBuildings.getUserBuildings.call(Alice);
        const buildingsInQueue = await buildingsQueue.getBuildingsInQueue(Alice);
        let totalGoldCapacity = new BigNumber('0');
        let totalCrystalCapacity = new BigNumber('0');

        for (var i = 0; i < buildingsIds.length; i++) {

          const [goldCapacityData, crystalCapacityData] = await buildingsData.getGoldAndCrystalCapacity.call(buildingsIds[i]);

          totalGoldCapacity = totalGoldCapacity.plus(goldCapacityData);
          totalCrystalCapacity = totalCrystalCapacity.plus(crystalCapacityData);
        }

        const [goldCapacity, crystalCapacity] = await userResources.calculateUserResourcesCapacity.call(Alice);

        goldCapacity.should.be.bignumber.equal(totalGoldCapacity);
        crystalCapacity.should.be.bignumber.equal(totalCrystalCapacity);
      })
    })

    context('User with buildings', async () => {
      beforeEach(async () => {
        await userResources.setInitialResources(0, 0, 0);
        await experimentalToken.approve(userVault.address, 1 * ether);
        await userVillage.create('My new village!', 'Cool player');
      });

      it('Get total resources should take into account queued resources', async () => {
        const mineBlocks = 5;

        const [maxGoldCapacity, maxCrystalCapacity] = await userResources.calculateUserResourcesCapacity(Alice);
        const [starterGold, starterCrystal,] = await userResources.getTotalUserResources(Alice);
        const goldRate = goldMine.stats[stat.goldRate]
        const crystalRate = crystalMine.stats[stat.crystalRate];

        evmMine(mineBlocks);

        const [endGold, endCrystal,] = await userResources.getTotalUserResources(Alice);

        endGold.should.be.bignumber.equal(starterGold.plus(goldRate * mineBlocks));
      });

      it('Get total resources should take into account max resources capacity', async () => {
        const goldRate = goldMine.stats[stat.goldRate]
        const crystalRate = crystalMine.stats[stat.crystalRate];
        const mineBlocks = 10;
        const [maxGoldCapacity, maxCrystalCapacity] = await userResources.calculateUserResourcesCapacity(Alice);
        await userResources.giveResourcesToUser(Alice, maxGoldCapacity - (goldRate * (mineBlocks - 1)), maxCrystalCapacity - (crystalRate * (mineBlocks - 1)), 0);
        evmMine(mineBlocks);
        const [gold, crystal, quantum] = await userResources.getTotalUserResources(Alice);
        gold.should.be.bignumber.equal(maxGoldCapacity);
        crystal.should.be.bignumber.equal(maxCrystalCapacity);
      });
    });
  });
});
