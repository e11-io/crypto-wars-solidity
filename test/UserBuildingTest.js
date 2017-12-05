const UserVillage = artifacts.require('UserVillage');
const BuildingsData = artifacts.require('BuildingsData');
const UserBuildings = artifacts.require('UserBuildings');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const UserResources = artifacts.require('UserResources');

var buildingsMock = require('../mocks/buildings');

const stat = buildingsMock.stats;

contract('User Buildings Test', accounts => {
  let userVillage, buildingsData, userBuildings, experimentalToken, userVault, userResources = {};

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);

  beforeEach(async () => {
    experimentalToken = await ExperimentalToken.new();
    userVault = await UserVault.new(experimentalToken.address);
    userResources = await UserResources.new();
    buildingsData = await BuildingsData.new();
    userBuildings= await UserBuildings.new(buildingsData.address);
    userVillage = await UserVillage.new(userVault.address,
                                        userResources.address,
                                        userBuildings.address);

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
    await buildingsData.addBuilding(buildingsMock.initialBuildings[6].id,
      buildingsMock.initialBuildings[6].name,
      buildingsMock.initialBuildings[6].stats);
    await experimentalToken.approve(userVault.address, 1 * ether);
  })

  it('Check if initial buildings added correctly after user creation', async () => {
    let ids = [1, 2, 3];

    await userVillage.create('My new village!','Cool player', {gasPrice: web3.eth.gasPrice});

    const buildings = await userBuildings.getUserBuildings.call(Alice);

    assert.equal(buildings.toString(), ids.toString(), 'Buildings are not the expected');
  })

  context('Existing initial buildings period. Set Alice as User Village after create village', async () => {
    beforeEach(async () => {
      await userVillage.create('My new village!','Cool player');
      await userBuildings.setUserVillage(Alice);
    })

    it('Add new Gold Mine', async () => {
      let ids = [2];
      await userBuildings.addInitialBuildings(Alice, ids);

      const buildings = await userBuildings.getUserBuildings.call(Alice);

      assert.equal(buildings.toString(), '1,2,3,2', 'Buildings are not the expected');
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

      const isUnique = await userBuildings.buildingTypeIsUnique.call(Alice, goldMine.stats[stat.typeId]);

      assert.equal(isUnique, false);
    })

    it('Check building type is unique true', async () => {
      let goldStorage = buildingsMock.initialBuildings[11];

      const isUnique = await userBuildings.buildingTypeIsUnique.call(Alice, goldStorage.stats[stat.typeId]);

      assert.equal(isUnique, true);
    })
  })
})
