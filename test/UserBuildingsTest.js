const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const BuildingsQueue = artifacts.require('BuildingsQueue');

const { assertRevert } = require('./helpers/assertThrow');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const buildingsMock = require('../mocks/buildings-test');
const stat = buildingsMock.stats;

const cityCenter = buildingsMock.initialBuildings.find(b => b.name == 'city_center_1');
const goldMine = buildingsMock.initialBuildings.find(b => b.name == 'gold_mine_1');
const crystalMine = buildingsMock.initialBuildings.find(b => b.name == 'crystal_mine_1');
const portal = buildingsMock.initialBuildings.find(b => b.name == 'portal_1');
const goldStorage = buildingsMock.initialBuildings.find(b => b.name == 'gold_storage_1');

contract('User Buildings Test', accounts => {
  let assetsRequirements, userVillage, buildingsData, userBuildings, experimentalToken, userVault, userResources, buildingsQueue;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);
  const initialUserBuildings = [
    cityCenter.id,
    goldMine.id,
    crystalMine.id,
  ];

  beforeEach(async () => {
    assetsRequirements = await AssetsRequirements.new();
    buildingsData = await BuildingsData.new();
    experimentalToken = await ExperimentalToken.new();
    userBuildings= await UserBuildings.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();
    buildingsQueue = await BuildingsQueue.new();

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

    await buildingsData.addBuilding(cityCenter.id,
      cityCenter.name,
      cityCenter.stats);
    await buildingsData.addBuilding(goldMine.id,
      goldMine.name,
      goldMine.stats);
    await buildingsData.addBuilding(crystalMine.id,
      crystalMine.name,
      crystalMine.stats);
    await buildingsData.addBuilding(portal.id,
      portal.name,
      portal.stats);
    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.setInitialBuildings(initialUserBuildings);
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(userBuildings, UserBuildings));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(userBuildings));
  })

  it('Should now allow to set wrong contracts', async () => {
    await assertRevert(async () => {
      await userBuildings.setBuildingsData(experimentalToken.address);
    })
    await assertRevert(async () => {
      await userBuildings.setBuildingsQueue(experimentalToken.address);
    })
    await assertRevert(async () => {
      await userBuildings.setUserResources(experimentalToken.address);
    })
    await assertRevert(async () => {
      await userBuildings.setUserVillage(experimentalToken.address);
    })
  })

  it('Check if initial buildings added correctly after user creation', async () => {
    let ids = [
      cityCenter.id,
      goldMine.id,
      crystalMine.id,
    ];

    await userVillage.create('My new village!','Cool player', {gasPrice: web3.eth.gasPrice});

    const buildings = await userBuildings.getUserBuildings.call(Alice);

    assert.equal(buildings.toString(), ids.toString(), 'Buildings are not the expected');
  })

  it('Try add user building not from buildingsQueue contract', async () => {
    await assertRevert(async () => {
      await userBuildings.addUserBuildings(Alice, [2], [4]);
    })
  })

  it('Try add initial building not from user village contract', async () => {
    await assertRevert(async () => {
      await userBuildings.addInitialBuildings(Alice, [2], { from: Bob });
    })
  })

  it('Try init new building not from buildings queue contract or owner', async () => {
    await assertRevert(async () => {
      await userBuildings.initNewBuilding(Alice, [2], { from: Bob });
    })
  })

  it('Try remove user buildings not from buildings queue contract or owner', async () => {
    await assertRevert(async () => {
      await userBuildings.removeUserBuildings(Alice, [2], [1], { from: Bob });
    })
  })

  it('Try upgrade building not from buildings queue contract or owner', async () => {
    await assertRevert(async () => {
      await userBuildings.upgradeBuilding(Alice, 2, 1, { from: Bob });
    })
  })

  context('Existing initial buildings period.', async () => {
    beforeEach(async () => {
      await userVillage.create('My new village!','Cool player');
    })

    it('Add new Gold Mine using addInitialBuildings', async () => {
      let ids = [goldMine.id];
      await userBuildings.addInitialBuildings(Alice, ids);

      const buildings = await userBuildings.getUserBuildings.call(Alice);

      let idsToCheck = initialUserBuildings.concat(ids);
      assert.equal(buildings.toString(), idsToCheck.toString(), 'Buildings are not the expected');
    })

    it('Remove gold mine building', async () => {
      const [initialGoldRate, initialCrystalRate] = await userBuildings.getUserRates.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == goldMine.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [goldMine.id], [index]);

      const [finalGoldRate, finalCrystalRate] = await userBuildings.getUserRates.call(Alice);
      const [building_id, active] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(finalGoldRate.toNumber(), initialGoldRate - goldMine.stats[stat.goldRate]);
      assert.equal(false, active);
    })

    it('Remove building that costs quantum', async () => {
      await userBuildings.addInitialBuildings(Alice, [portal.id]);

      const [initialGold, initialCrystal, initialQuantum] =  await userResources.getUserResources.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == portal.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [portal.id], [index]);

      const [finalGold, finalCrystal, finalQuantum] =  await userResources.getUserResources.call(Alice);
      const [building_id, active] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      let amountReturned = portal.stats[stat.price] * 60 / 100;

      assert.equal(finalQuantum.toNumber(), initialQuantum.toNumber() + amountReturned);
      assert.equal(false, active);
    })

    it('Check return resources to user wieh remove building', async () => {
      const [initialUserGold, userCrystalA, userQuantumA] = await userResources.getUserResources.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == goldMine.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [goldMine.id], [index]);

      const [finalUserGold, userCrystalB, userQuantumB] = await userResources.getUserResources.call(Alice);
      const [price, resourceType, blocks] = await buildingsData.getBuildingData.call(goldMine.id);

      // TODO Set return percentage dynamically
      assert.equal(finalUserGold.toNumber(), initialUserGold.toNumber() + (price.toNumber() * 60 / 100));
    })

    it('Remove gold mine & crystal mine building', async () => {
      const [initialGoldRate, initialCrystalRate] = await userBuildings.getUserRates.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let indexA = -1;
      let indexB = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == goldMine.id) {
          indexA = i;
        }
        if (id.toNumber() == crystalMine.id) {
          indexB = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [goldMine.id, crystalMine.id], [indexA, indexB]);

      const [finalGoldRate, finalCrystalRate] = await userBuildings.getUserRates.call(Alice);
      const [goldMine_id, goldMine_deleted] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, indexA);
      const [crystalMine_id, crystalMine_deleted] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, indexA);

      assert.equal(false, goldMine_deleted);
      assert.equal(false, crystalMine_deleted);
      assert.equal(finalGoldRate, initialGoldRate - goldMine.stats[stat.goldRate]);
      assert.equal(finalCrystalRate, initialCrystalRate - crystalMine.stats[stat.crystalRate]);
    })

    it('Check building type is unique false', async () => {
      let isUnique = false;

      const index = await userBuildings.buildingTypeIsUnique.call(Alice, goldMine.stats[stat.typeId], goldMine.id);

      if (index > -2) isUnique = true;
      assert.equal(isUnique, false);
    })

    it('Check building type is unique true', async () => {
      let isUnique = false;

      const index = await userBuildings.buildingTypeIsUnique.call(Alice, goldStorage.stats[stat.typeId], goldStorage.id);

      if (index > -2) isUnique = true;
      assert.equal(isUnique, true);
    })

    it('Pass an array with negative ids to add initial buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.addInitialBuildings(Alice, [-2, 2]);
      })
    })

    it('Pass an array with non-existent ids to add initial buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.addInitialBuildings(Alice, [865, 2]);
      })
    })

    it('Pass arrays with different lengths to Add User Buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.addUserBuildings(Alice, [1,2], [2]);
      })

    })

    it('Pass buildings that doesnt exist to add user buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.addUserBuildings(Alice, [865, 2], [2, 3]);
      })
    })

    it('Pass building id that doesnt exist to init new building', async () => {
      await assertRevert(async () => {
        await userBuildings.initNewBuilding(Alice, [865]);
      })
    })

    it('Pass arrays with different lengths to remove user buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.removeUserBuildings(Alice, [2, 3], [1]);
      })
    })

    it('Pass building id that doesnt exist to remove user buildings', async () => {
      await assertRevert(async () => {
        await userBuildings.removeUserBuildings(Alice, [865], [2]);
      })
    })

    it('Pass user address 0 to upgrade building', async () => {
      await assertRevert(async () => {
        await userBuildings.upgradeBuilding(0, 2, 1);
      })
    })

    it('Pass wrong id of index to upgrade building', async () => {
      await assertRevert(async () => {
        await userBuildings.upgradeBuilding(Alice, 3, 1);
      })
    })

  })
})
