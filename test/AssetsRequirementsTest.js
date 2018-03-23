const AssetsRequirements = artifacts.require('AssetsRequirements');
const BuildingsData = artifacts.require('BuildingsData');
const BuildingsQueue = artifacts.require('BuildingsQueue');
const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserBuildings = artifacts.require('UserBuildings');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('./helpers/assertThrow');
const { initializeContracts } = require('./helpers/initializeContracts');
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

const buildingsMock = require('../mocks/buildings-test');
const stat = buildingsMock.stats;

contract('Assets Requirements Test', (accounts) => {
  let assetsRequirements, buildingsQueue, buildingsData, userResources, userVillage, userVault, experimentalToken;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10,18);
  const initialUserBuildings = [
    buildingsMock.initialBuildings[0].id,
  ];

  const goldMine = buildingsMock.initialBuildings[1];
  const goldMineLvl2 = buildingsMock.initialBuildings[4];
  const goldFactory = buildingsMock.initialBuildings[7];
  const goldStorage = buildingsMock.initialBuildings[11];
  const crystalStorage = buildingsMock.initialBuildings[12];



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
    assert.isTrue(await isVersioned(assetsRequirements, AssetsRequirements));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(assetsRequirements));
  })

  it('Set Building Requirements', async () => {
    await assetsRequirements.setAssetRequirements(goldMine.id, goldMine.requirements);

    let requirements = await assetsRequirements.getRequirements.call(goldMine.id);

    assert.equal(requirements.toString(), goldMine.requirements.toString());
  })

  context('Set needed buildings requirement Period', async () => {
    beforeEach(async () => {
      await assetsRequirements.setAssetRequirements(goldMine.id, goldMine.requirements);
      await assetsRequirements.setAssetRequirements(goldFactory.id, goldFactory.requirements);
      await assetsRequirements.setAssetRequirements(goldStorage.id, goldStorage.requirements);
    })

    it('Add Asset Requirement', async () => {
      await assetsRequirements.addAssetRequirement(goldMine.id, crystalStorage.id);

      let requirements = await assetsRequirements.getRequirements.call(goldMine.id);

      assert.equal(requirements.toString(), goldMine.requirements.concat([crystalStorage.id]));
    })

    it('Remove Asset Requirement', async () => {
      await assetsRequirements.removeAssetRequirement(goldStorage.id, goldStorage.requirements[0]);

      let requirements = await assetsRequirements.getRequirements.call(goldStorage.id);

      assert.equal(requirements.toString(), goldStorage.requirements.slice(1).toString());
    })

    it('Update Asset Requirement', async () => {
      await assetsRequirements.updateAssetRequirement(goldMine.id, goldMine.requirements[0], crystalStorage.id);

      let requirements = await assetsRequirements.getRequirements.call(goldMine.id);
      assert.equal(requirements.toString(), crystalStorage.id.toString());
    })

    it('Set Assets Requirements Errors', async () => {
      // Passing _id equal to 0
      assertRevert(async () => {
        await assetsRequirements.setAssetRequirements(0, goldMine.requirements);
      })

      // Passing nonexistent building _id
      assertRevert(async () => {
        await assetsRequirements.setAssetRequirements(12345, goldMine.requirements);
      })

      // Passing empty _requirements array
      assertRevert(async () => {
        await assetsRequirements.setAssetRequirements(goldMine.id, []);
      })

      // Trying to create an existen _id and _requirement
      assertRevert(async () => {
        await assetsRequirements.setAssetRequirements(goldMine.id, goldMine.requirements);
      })

      // Passing nonexistent _requirement
      assertRevert(async () => {
        await assetsRequirements.setAssetRequirements(goldMine.id, [12345]);
      })
    })

    it('Add Assets Requirements Errors', async () => {
      // Passing _requirement > 0
      assertRevert(async () => {
        await assetsRequirements.addAssetRequirement(goldMine.id, 0);
      })

      // Passing same _id and _requirement
      assertRevert(async () => {
        await assetsRequirements.addAssetRequirement(goldMine.id, goldMine.id);
      })

      // Passing nonexistent requirement
      assertRevert(async () => {
        await assetsRequirements.addAssetRequirement(goldMine.id, 12345);
      })

      // Passing a requirement that the building already has
      assertRevert(async () => {
        await assetsRequirements.addAssetRequirement(goldMine.id, goldMine.requirements[0]);
      })

      // Passing a same typeid building as a requirement
      assertRevert(async () => {
        await assetsRequirements.addAssetRequirement(goldMineLvl2.id, [goldMine.id]);
      })
    })

    it('Remove Assets Requirements Errors', async () => {
      // Passing _requirement > 0
      assertRevert(async () => {
        await assetsRequirements.removeAssetRequirement(goldMine.id, 0);
      })

      // Passing same _id and _requirement
      assertRevert(async () => {
        await assetsRequirements.removeAssetRequirement(goldMine.id, goldMine.id);
      })

      // Removing a requirement that the building doesnt have.
      assertRevert(async () => {
        await assetsRequirements.removeAssetRequirement(goldMine.id, crystalStorage.id);
      })
    })

    it('Update Assets Requirements Errors', async () => {
      // Trying to upgrade nonexistent requierement
      assertRevert(async () => {
        await assetsRequirements.updateAssetRequirement(crystalStorage.id, goldMine.requirements[0], 1004);
      })

      // Passing 0 as _newRequirement
      assertRevert(async () => {
        await assetsRequirements.updateAssetRequirement(goldMine.id, goldMine.requirements[0], 0);
      })

      // Passing nonexistent building as _newRequirement
      assertRevert(async () => {
        await assetsRequirements.updateAssetRequirement(goldMine.id, goldMine.requirements[0], 12345);
      })

      // Passing as _oldRequirement a building id that the requirement doesnt have.
      assertRevert(async () => {
        await assetsRequirements.updateAssetRequirement(goldMine.id, crystalStorage.id, 1007);
      })
    })

      context('User with Village period', async() => {
        beforeEach(async () => {
          await experimentalToken.approve(userVault.address, 1 * ether);
          await userVillage.create('My new village!','Cool player');
          await userResources.giveResourcesToUser(Alice, 1000, 1000, 200);
        })

        it('Check Requirements to build gold factory', async () => {
          let canBuildGoldMine = await assetsRequirements.validateUserAssetRequirements(Alice, goldMine.id);

          assert.equal(true, canBuildGoldMine);

          await buildingsQueue.addNewBuildingToQueue(goldMine.id);

          for (var i = 0; i < goldMine.stats[stat.blocks] + 1; i++) {
            await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
          }

          let canBuildGoldFactory = await assetsRequirements.validateUserAssetRequirements(Alice, goldFactory.id);

          assert.equal(true, canBuildGoldFactory);
        })

        it('Try to build gold factory without gold mine', async () => {
          let canBuildGoldFactory = await assetsRequirements.validateUserAssetRequirements(Alice, goldFactory.id);

          assert.equal(false, canBuildGoldFactory);
        })

        it('Try to build gold factory while gold mine is being created', async () => {
          let canBuildGoldMine = await assetsRequirements.validateUserAssetRequirements(Alice, goldMine.id);

          assert.equal(true, canBuildGoldMine);

          await buildingsQueue.addNewBuildingToQueue(goldMine.id);

          let canBuildGoldFactory = await assetsRequirements.validateUserAssetRequirements(Alice, goldFactory.id);

          assert.equal(false, canBuildGoldFactory);
        })

        it('Try to build gold storage with gold mine without gold factory', async () => {
          let canBuildGoldMine = await assetsRequirements.validateUserAssetRequirements(Alice, goldMine.id);

          assert.equal(true, canBuildGoldMine);

          await buildingsQueue.addNewBuildingToQueue(goldMine.id);

          for (var i = 0; i < goldMine.stats[stat.blocks] + 1; i++) {
            await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
          }

          let canBuildGoldStorage = await assetsRequirements.validateUserAssetRequirements(Alice, goldStorage.id);

          assert.equal(false, canBuildGoldStorage);
        })

        it('Build gold mine, gold factory and gold storage', async () => {
          let canBuildGoldMine = await assetsRequirements.validateUserAssetRequirements(Alice, goldMine.id);

          assert.equal(true, canBuildGoldMine);

          await buildingsQueue.addNewBuildingToQueue(goldMine.id);

          for (var i = 0; i < goldMine.stats[stat.blocks] + 1; i++) {
            await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
          }

          let canBuildGoldFactory = await assetsRequirements.validateUserAssetRequirements(Alice, goldFactory.id);

          assert.equal(true, canBuildGoldFactory);

          await buildingsQueue.addNewBuildingToQueue(goldFactory.id);

          for (var i = 0; i < goldFactory.stats[stat.blocks] + 1; i++) {
            await web3.currentProvider.send({jsonrpc: "2.0", method: "evm_mine", params: [], id: 0});
          }

          let canBuildGoldStorage = await assetsRequirements.validateUserAssetRequirements(Alice, goldStorage.id);

          assert.equal(true, canBuildGoldStorage);
        })

        it('Validating building without requierements', async () => {
          let canBeBuilt = await assetsRequirements.validateUserAssetRequirements(Alice, 1004);
          assert.equal(true, canBeBuilt);
        })
      })
    })
});
