const BuildingsData = artifacts.require('BuildingsData');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const BuildingsQueue = artifacts.require('BuildingsQueue');

const { assertRevert } = require('./helpers/assertThrow');
const { isVersioned } = require('./helpers/isVersioned');
const { setContracts } = require('./helpers/setContracts');

const buildingsMock = require('../mocks/buildings-test');
const stat = buildingsMock.stats;


contract('User Buildings Test', accounts => {
  let userVillage, buildingsData, userBuildings, experimentalToken, userVault, userResources, buildingsQueue;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);
  const initialUserBuildings = [
    buildingsMock.initialBuildings[0].id,
    buildingsMock.initialBuildings[1].id,
    buildingsMock.initialBuildings[2].id,
  ];

  beforeEach(async () => {
    buildingsData = await BuildingsData.new();
    experimentalToken = await ExperimentalToken.new();
    userBuildings= await UserBuildings.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    userVillage = await UserVillage.new();
    buildingsQueue = await BuildingsQueue.new();

    await userBuildings.setBuildingsData(buildingsData.address);
    await userBuildings.setUserVillage(userVillage.address);
    await userBuildings.setUserResources(userResources.address);
    await userBuildings.setBuildingsQueue(buildingsQueue.address);

    await userResources.setUserVillage(userVillage.address);
    await userResources.setUserBuildings(userBuildings.address);

    await userVault.setUserVillage(userVillage.address);
    await userVault.setExperimentalToken(experimentalToken.address);

    await userVillage.setBuildingsData(buildingsData.address);
    await userVillage.setUserBuildings(userBuildings.address);
    await userVillage.setUserResources(userResources.address);
    await userVillage.setUserVault(userVault.address);

    await buildingsData.addBuilding(buildingsMock.initialBuildings[0].id,
      buildingsMock.initialBuildings[0].name,
      buildingsMock.initialBuildings[0].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[1].id,
      buildingsMock.initialBuildings[1].name,
      buildingsMock.initialBuildings[1].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[2].id,
      buildingsMock.initialBuildings[2].name,
      buildingsMock.initialBuildings[2].stats);
    await buildingsData.addBuilding(buildingsMock.initialBuildings[6].id,
      buildingsMock.initialBuildings[6].name,
      buildingsMock.initialBuildings[6].stats);
    await experimentalToken.approve(userVault.address, 1 * ether);
    await userVillage.setInitialBuildings(initialUserBuildings);
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(userBuildings, UserBuildings));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContracts(userBuildings));
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
      buildingsMock.initialBuildings[0].id,
      buildingsMock.initialBuildings[1].id,
      buildingsMock.initialBuildings[2].id,
    ];

    await userVillage.create('My new village!','Cool player', {gasPrice: web3.eth.gasPrice});

    const buildings = await userBuildings.getUserBuildings.call(Alice);

    assert.equal(buildings.toString(), ids.toString(), 'Buildings are not the expected');
  })

  it('Try add user building not from buildingsQueue contract', async () => {
    return assertRevert(async () => {
      await userBuildings.addUserBuildings(Alice, [2], [4]);
    })
  })

  it('Try add initial building not from user village contract', async () => {
    return assertRevert(async () => {
      await userBuildings.addInitialBuildings(Alice, [2], { from: Bob });
    })
  })

  it('Try init new building not from buildings queue contract or owner', async () => {
    return assertRevert(async () => {
      await userBuildings.initNewBuilding(Alice, [2], { from: Bob });
    })
  })

  it('Try remove user buildings not from buildings queue contract or owner', async () => {
    return assertRevert(async () => {
      await userBuildings.removeUserBuildings(Alice, [2], [1], { from: Bob });
    })
  })

  it('Try upgrade building not from buildings queue contract or owner', async () => {
    return assertRevert(async () => {
      await userBuildings.upgradeBuilding(Alice, 2, 1, { from: Bob });
    })
  })

  context('Existing initial buildings period.', async () => {
    beforeEach(async () => {
      await userVillage.create('My new village!','Cool player');
    })

    it('Add new Gold Mine using addInitialBuildings', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let ids = [goldMine.id];
      await userBuildings.addInitialBuildings(Alice, ids);

      const buildings = await userBuildings.getUserBuildings.call(Alice);

      let idsToCheck = initialUserBuildings.concat(ids);
      assert.equal(buildings.toString(), idsToCheck.toString(), 'Buildings are not the expected');
    })

    it('Remove gold mine building', async () => {
      let building = buildingsMock.initialBuildings[1];

      const [initialGoldRate, initialCrystalRate] = await userBuildings.getUserRates.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == building.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [building.id], [index]);

      const [finalGoldRate, finalCrystalRate] = await userBuildings.getUserRates.call(Alice);
      const [building_id, active] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      assert.equal(finalGoldRate.toNumber(), initialGoldRate - building.stats[stat.goldRate]);
      assert.equal(false, active);
    })

    it('Remove building that costs quantum', async () => {
      let building = buildingsMock.initialBuildings[6];

      await userBuildings.addInitialBuildings(Alice, [building.id]);

      const [initialGold, initialCrystal, initialQuantum] =  await userResources.getUserResources.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == building.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [building.id], [index]);

      const [finalGold, finalCrystal, finalQuantum] =  await userResources.getUserResources.call(Alice);
      const [building_id, active] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, index);

      let amountReturned = building.stats[stat.price] * 60 / 100;

      assert.equal(finalQuantum.toNumber(), initialQuantum.toNumber() + amountReturned);
      assert.equal(false, active);
    })

    it('Check return resources to user wieh remove building', async () => {
      let building = buildingsMock.initialBuildings[1];

      const [initialUserGold, userCrystalA, userQuantumA] = await userResources.getUserResources.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let index = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == building.id) {
          index = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [building.id], [index]);

      const [finalUserGold, userCrystalB, userQuantumB] = await userResources.getUserResources.call(Alice);
      const [price, resourceType, blocks] = await buildingsData.getBuildingData.call(building.id);

      // TODO Set return percentage dynamically
      assert.equal(finalUserGold.toNumber(), initialUserGold.toNumber() + (price.toNumber() * 60 / 100));
    })

    it('Remove gold mine & crystal mine building', async () => {
      let buildingA = buildingsMock.initialBuildings[1];
      let buildingB = buildingsMock.initialBuildings[2];

      const [initialGoldRate, initialCrystalRate] = await userBuildings.getUserRates.call(Alice);

      const buildings = await userBuildings.getUserBuildings.call(Alice);
      let indexA = -1;
      let indexB = -1;
      buildings.forEach((id, i) => {
        if (id.toNumber() == buildingA.id) {
          indexA = i;
        }
        if (id.toNumber() == buildingB.id) {
          indexB = i;
        }
      });
      await userBuildings.removeUserBuildings(Alice, [buildingA.id, buildingB.id], [indexA, indexB]);

      const [finalGoldRate, finalCrystalRate] = await userBuildings.getUserRates.call(Alice);
      const [buildingA_id, buildingA_deleted] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, indexA);
      const [buildingB_id, buildingB_deleted] = await userBuildings.getUserBuildingIdAndStatus.call(Alice, indexA);

      assert.equal(false, buildingA_deleted);
      assert.equal(false, buildingB_deleted);
      assert.equal(finalGoldRate, initialGoldRate - buildingA.stats[stat.goldRate]);
      assert.equal(finalCrystalRate, initialCrystalRate - buildingB.stats[stat.crystalRate]);
    })

    it('Check building type is unique false', async () => {
      let goldMine = buildingsMock.initialBuildings[1];
      let isUnique = false;

      const index = await userBuildings.buildingTypeIsUnique.call(Alice, goldMine.stats[stat.typeId], goldMine.id);

      if (index > -2) isUnique = true;
      assert.equal(isUnique, false);
    })

    it('Check building type is unique true', async () => {
      let goldStorage = buildingsMock.initialBuildings[11];
      let isUnique = false;

      const index = await userBuildings.buildingTypeIsUnique.call(Alice, goldStorage.stats[stat.typeId], goldStorage.id);

      if (index > -2) isUnique = true;
      assert.equal(isUnique, true);
    })

    it('Pass an array with negative ids to add initial buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.addInitialBuildings(Alice, [-2, 2]);
      })
    })

    it('Pass an array with non-existent ids to add initial buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.addInitialBuildings(Alice, [865, 2]);
      })
    })

    it('Pass arrays with different lengths to Add User Buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.addUserBuildings(Alice, [1,2], [2]);
      })

    })

    it('Pass buildings that doesnt exist to add user buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.addUserBuildings(Alice, [865, 2], [2, 3]);
      })
    })

    it('Pass building id that doesnt exist to init new building', async () => {
      return assertRevert(async () => {
        await userBuildings.initNewBuilding(Alice, [865]);
      })
    })

    it('Pass arrays with different lengths to remove user buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.removeUserBuildings(Alice, [2, 3], [1]);
      })
    })

    it('Pass building id that doesnt exist to remove user buildings', async () => {
      return assertRevert(async () => {
        await userBuildings.removeUserBuildings(Alice, [865], [2]);
      })
    })

    it('Pass user address 0 to upgrade building', async () => {
      return assertRevert(async () => {
        await userBuildings.upgradeBuilding(0, 2, 1);
      })
    })

    it('Pass wrong id of index to upgrade building', async () => {
      return assertRevert(async () => {
        await userBuildings.upgradeBuilding(Alice, 3, 1);
      })
    })

  })
})
