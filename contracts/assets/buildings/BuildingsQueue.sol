pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import './BuildingsData.sol';
import '../AssetsRequirements.sol';
import '../../user/UserBuildings.sol';
import '../../user/UserResources.sol';
import '../../user/UserVillage.sol';
import '../../system/PointsSystem.sol';
import '../../Versioned.sol';

/*
 * @title BuildingsQueue (WIP)
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/4
 */
contract BuildingsQueue is NoOwner, Versioned {
  using SafeMath for uint;

  /*
   * @dev Event for Adding a building to the queue system logging.
   * @param _user who receives the building.
   * @param _id the id of the building to be added.
   * @param _index the index of the building to be added.
	 * @param _startBlock the number of the block where the construction is gonna start.
	 * @param _endBlock the number of the block where the construction is gonna be ready.
   */
  event AddNewBuildingToQueue(address indexed _user,
                              uint _id,
                              uint _index,
                              uint _startBlock,
                              uint _endBlock);

 /*
  * @dev Event for Updating the buildings queue. Buildings that are ready will be
  * tranfered to the user buildings contract, and removed from the queue.
  * @param _user the address of the user's queue to be updated. (address)
  * @param _ids The ids of the finished buldings. (uint[])
  * @param _indexes The indexes of the finished buldings. (uint[])
  */
  event UpdateQueue(address indexed _user,
                    uint[] _ids,
                    uint[] _indexes);

 /*
  * @dev Event for upgrading a building to the queue system logging.
  * @param _idOfUpgrade the id of the building to be added.
  * @param _index the index of the building to be added.
  * @param _startBlock the number of the block where the construction is gonna start.
  * @param _endBlock the number of the block where the construction is gonna be ready.
  */
  event UpgradeBuilding(address indexed _user, uint _idOfUpgrade, uint _index, uint startBlock, uint endBlock);

  /*
   * @dev Event for removing a building from the queue.
   * @param _user the address of the user. (address)
   * @param _id The id of the removed bulding. (uint)
   * @param _index The index of the removed buldings. (uint)
   */
  event RemoveBuilding(address indexed _user, uint _id, uint _index);

  struct Build {
    uint32 id;
    uint32 index;
    uint64 startBlock;
    uint64 endBlock;
  }

  BuildingsQueue previousBuildingsQueue;

  AssetsRequirements assetsRequirements;
  BuildingsData buildingsData;
  UserBuildings userBuildings;
  UserResources userResources;
  UserVillage userVillage;
  PointsSystem pointsSystem;

  // Mapping of user -> build struct array (keeps track of buildings in construction queue)
  mapping (address => Build[]) public userBuildingsQueue;

  /*
   * @notice Constructor: Instantiate Buildings Queue contract.
   * @dev Constructor function to provide User Buildings address and instantiate it.
   */
  constructor() public {
  }

  /*
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is Buildings Queue.
   */
  function isBuildingsQueue() external pure returns (bool) {
    return true;
  }

  /*
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous Buildings Queue.
   * @param _previousBuildingsQueue the address of previous Buildings Queue contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setBuildingsQueueVersion(BuildingsQueue _previousBuildingsQueue, uint _version) external onlyOwner {
    require(_previousBuildingsQueue.isBuildingsQueue());
    require(_version > _previousBuildingsQueue.version());
    previousBuildingsQueue =_previousBuildingsQueue;
    setVersion(_version);
  }

  /*
   * @title Instantiate User Buildings contract.
   * @dev Function to provide User Buildings address and instantiate it.
   * @param _userBuildings the address of User Buildings contract. (address)
   */
  function setUserBuildings(UserBuildings _userBuildings) external onlyOwner {
    require(_userBuildings.isUserBuildings());
    userBuildings = _userBuildings;
  }

  /*
   * @title Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setBuildingsData(BuildingsData _buildingsData) external onlyOwner {
    require(_buildingsData.isBuildingsData());
    buildingsData = _buildingsData;
  }

  /*
   * @title Instantiate User Resources contract.
   * @dev Function to provide User Resources address and instantiate it.
   * @param _userResources the address of User Resources contract. (address)
   */
  function setUserResources(UserResources _userResources) external onlyOwner {
    require(_userResources.isUserResources());
    userResources = _userResources;
  }

  /*
   * @title Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
	function setUserVillage(UserVillage _userVillage) external onlyOwner {
		require(_userVillage.isUserVillage());
		userVillage = _userVillage;
	}

  /*
   * @title Instantiate Assets Requirements contract.
   * @dev Function to provide Assets Requirements address and instantiate it.
   * @param _assetsRequirements the address of Assets Requirements contract. (address)
   */
  function setAssetsRequirements(AssetsRequirements _assetsRequirements) external onlyOwner {
    require(_assetsRequirements.isAssetsRequirements());
    assetsRequirements = _assetsRequirements;
  }

  /*
   * @title Instantiate Points System contract.
   * @dev Function to provide Points System address and instantiate it.
   * @param _pointsSystem the address of Points System contract. (address)
   */
	function setPointsSystem(PointsSystem _pointsSystem) external onlyOwner {
		require(_pointsSystem.isPointsSystem());
		pointsSystem = _pointsSystem;
	}

  /*
   * @notice Add New Building To Queue.
   * @dev Function to add a new building to the construction queue of the user.
      index -2: building type is not unique and the builiding cant be created.
      index -1: building type is unique and the building can be created. Must be initialized.
      index >= 0: building was deleted and must be created again. Modifing it's active variable to true.
   * @param _id of the building to add to the queue. (uint)
   */
  function addNewBuildingToQueue(uint _id) external {
    require(userVillage.hasVillage(msg.sender));
    require(buildingsData.checkBuildingExist(_id));
    require(assetsRequirements.validateUserAssetRequirements(msg.sender, _id));

    uint typeId = buildingsData.getBuildingTypeId(_id);
    int index = userBuildings.buildingTypeIsUnique(msg.sender, typeId, _id);

    require(index > -2);

    uint price;
    uint resourceType;
    uint blocks;
    (price, resourceType, blocks) = buildingsData.getBuildingData(_id);

    consumeResources(msg.sender, price, resourceType);

    if  (index == -1) {
      index = int(userBuildings.initNewBuilding(msg.sender, _id));
    }

    uint startBlock = getStartBlock(msg.sender);
    uint endBlock = startBlock.add(blocks);

    userBuildingsQueue[msg.sender].push(Build(
      uint32(_id),
      uint32(uint(index)),
      uint64(startBlock),
      uint64(endBlock)
    ));

    emit AddNewBuildingToQueue(msg.sender,
                               _id,
                               uint(index),
                               startBlock,
                               endBlock);
  }

  /*
   * @title Update Queue.
   * @dev Function to update the user buildings queue. Finished buildings
   *  will be send to the User Buildings contract and removed from the construction
   *  queue. Queue will be resized and updated with only the unfinished buildings.
   * @param _user the address of the user's queue to be updated. (address)
   * @return an array of the finished buildings ids. (uint[])
   */
  function updateQueue(address _user) public {
    require(_user != address(0));
    if (userBuildingsQueue[_user].length == 0) {
      return;
    }

    uint length = userBuildingsQueue[_user].length;
    uint i = 0;

    while (i < length && userBuildingsQueue[_user][i].endBlock < block.number) {
      i++;
    }

    uint[] memory finishedIds = new uint[](i);
    uint[] memory finishedIndexes = new uint[](i);

    if (i == 0) {
      emit UpdateQueue(_user, finishedIds, finishedIndexes);
      return;
    }

    for (uint j = 0; j < i; j++) {
      Build storage building = userBuildingsQueue[_user][j];
      finishedIds[j] = building.id;
      finishedIndexes[j] = building.index;
    }

    require(userBuildings.addUserBuildings(_user, finishedIds, finishedIndexes));

    require(shiftUserBuildings(_user, i));

    emit UpdateQueue(_user, finishedIds, finishedIndexes);
  }

  /*
   * @title Upgrade Building.
   * @dev Function to upgrade a buildings. If the building is in queue
   *  the queue is updated.
   * @param _id The id of the building that is gonna be replaced for the upgrade. (uint)
   * @param _idOfUpgrade The id of the upgrade. (uint)
   * @param _index The index of the building. (uint)
   */
  function upgradeBuilding(uint _id, uint _idOfUpgrade, uint _index) external {
    require(userVillage.hasVillage(msg.sender));
    require(buildingsData.checkBuildingExist(_id));
    require(buildingsData.checkBuildingExist(_idOfUpgrade));
    require(buildingsData.checkUpgrade(_id, _idOfUpgrade));
    require(assetsRequirements.validateUserAssetRequirements(msg.sender, _idOfUpgrade));


    bool buildingIsInQueue;
    uint buildingIndexInQueue;
    (buildingIsInQueue, buildingIndexInQueue) = findBuildingInQueue(msg.sender, _id, _index);

    uint price;
    uint resourceType;
    uint blocks;
    (price, resourceType, blocks) = buildingsData.getBuildingData(_idOfUpgrade);

    consumeResources(msg.sender, price, resourceType);

    if (buildingIsInQueue) {
      require(userBuildingsQueue[msg.sender][buildingIndexInQueue].endBlock < block.number);
      updateQueue(msg.sender);
    }

    require(userBuildings.upgradeBuilding(msg.sender, _id, _index));

    uint startBlock = getStartBlock(msg.sender);
    uint endBlock = startBlock.add(blocks);

    userBuildingsQueue[msg.sender].push(Build(
      uint32(_idOfUpgrade), uint32(_index), uint64(startBlock), uint64(endBlock)
    ));

    emit UpgradeBuilding(msg.sender, _idOfUpgrade, _index, startBlock, endBlock);
  }

  /*
   * @title Find Building In Queue.
   * @dev Function to find a building in queue.
   * @param _user The address of the user. (address)
   * @param _id The id of the building. (uint)
   * @param _index The Index of the building. (uint)
   * @return A boolean representing if the building exists in the queue
   * and a uint representing the index/position of the building in the queue.
   */
  function findBuildingInQueue(address _user, uint _id, uint _index) public view returns (bool exists, uint indexInQueue) {
    for (uint i = 0; i < userBuildingsQueue[_user].length; i++) {
      if (_index == userBuildingsQueue[_user][i].index && _id == userBuildingsQueue[_user][i].id) {
        return (true, i);
      }
    }
    return (false, 0);
  }

  /*
   * @title Update Queue Blocks.
   * @dev Function to update the start and end blocks of each building in queue
   * when a building is removed.
   * @param _user The address of the user's queue to be updated. (address)
   * @param _queueIndex The index in queue of the building. (uint)
   */
  function updateQueueBlocks(address _user, uint _queueIndex) internal {
    uint64 blocks;
    for (uint i = _queueIndex + 1; i < userBuildingsQueue[_user].length; i++) {
      /* TODO: might need to implement safe math later*/
      blocks = userBuildingsQueue[_user][i].endBlock - userBuildingsQueue[_user][i].startBlock;
      if (i == _queueIndex + 1) {
        if (userBuildingsQueue[_user][_queueIndex].startBlock >= block.number) {
          userBuildingsQueue[_user][i].startBlock = userBuildingsQueue[_user][i - 1].startBlock;
        }
        if (userBuildingsQueue[_user][_queueIndex].startBlock < block.number) {
          userBuildingsQueue[_user][i].startBlock = uint64(block.number);
        }
        userBuildingsQueue[_user][i].endBlock = userBuildingsQueue[_user][i].startBlock + blocks;
      } else {
        userBuildingsQueue[_user][i].startBlock = userBuildingsQueue[_user][i - 1].endBlock;
        userBuildingsQueue[_user][i].endBlock = userBuildingsQueue[_user][i].startBlock + blocks;
      }
    }
  }

  /*
   * @notice Shift User Buildings.
   * @dev Function to shift the specified amount of builds from user buildings queue.
   *  Being a chronologically ordered array, finished buildings will be always
   *  first on the array.
   * @param _user the address of the user's queue to be updated. (address)
   * @param _amount of buildings to be shifted from the array. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function shiftUserBuildings(address _user, uint _amount) internal returns (bool) {
    require(_amount <= userBuildingsQueue[_user].length);

    for (uint i = _amount; i < userBuildingsQueue[_user].length; i++){
      userBuildingsQueue[_user][i - _amount] = userBuildingsQueue[_user][i];
    }
    for (uint j = 1; j <= _amount; j++){
      delete userBuildingsQueue[_user][userBuildingsQueue[_user].length - j];
    }
    userBuildingsQueue[_user].length -= _amount;
    return true;
  }

  /*
   * @notice Shift One User Buildings.
   * @dev Function to shift one specified building from user buildings queue.
   * @param _user The address of the user's queue to be updated. (address)
   * @param _index The index of the building to be removed. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function shiftOneUserBuilding(address _user, uint _index) internal returns (bool) {
    for (uint i = _index; i < userBuildingsQueue[_user].length; i++) {
      if (i == userBuildingsQueue[_user].length - 1) {
        delete userBuildingsQueue[_user][userBuildingsQueue[_user].length - 1];
      } else {
        userBuildingsQueue[_user][i] = userBuildingsQueue[_user][i + 1];
      }
    }
    userBuildingsQueue[_user].length -= 1;
    return true;
  }

  /*
   * @notice Get the last building in the construction queue of the user.
   * @param _user . (address)
   */
  function getLastUserBuilding(address _user) external view returns (uint id,
                                                                     uint startBlock,
                                                                     uint endBlock) {
    require(_user != address(0));
    require(userBuildingsQueue[_user].length > 0);

    Build storage b = userBuildingsQueue[_user][userBuildingsQueue[_user].length -1];
    return (b.id, b.startBlock, b.endBlock);
  }

  /*
   * @notice Check Building Price and Get Block of it.
   * @dev Function to check if the user has the necessary amount of resources
   *  to build/upgrade the building. And returns the amount of blocks that
   *  building takes to be done.
   * @param _user the address of the user. (address)
   * @param _price the price for the upgrade. (uint)
   * @param _resourceType the type of the resource to consume. (uint)
   * @return returns the amount of blocks that building takes to be done.
   */
  function consumeResources(address _user, uint _price, uint _resourceType) internal {
    require(_resourceType == 0 || _resourceType == 1 || _resourceType == 2);
    if (_price > 0) {
      if (_resourceType == 0) {
        require(userResources.consumeGold(_user, _price));
      }
      if (_resourceType == 1) {
        require(userResources.consumeCrystal(_user, _price));
      }
      if (_resourceType == 2) {
        require(userResources.consumeQuantumDust(_user, _price));
      }
    }
  }

  /*
   * @notice Get Start Block.
   * @dev Function to get the start block number of the new building to be
   *  added in the queue.
   * @param _user the address of the user (address)
   */
  function getStartBlock(address _user) internal view returns (uint) {
    uint length = userBuildingsQueue[_user].length;
    uint startBlock = block.number;
    if (length > 0) {
      Build storage lastBuilding = userBuildingsQueue[_user][SafeMath.sub(length, 1)];
      if (block.number < lastBuilding.endBlock ) {
        startBlock = lastBuilding.endBlock;
      }
    }
    return startBlock;
  }

  /*
   * @notice Get Buildings in Queue.
   * @dev Function to check the ids of all the user's buildings in queue.
   * @param _user the address of the user's queue to be shown. (address)
   */
  function getBuildingsInQueue(address _user) external view returns (uint[]) {
    require(_user != address(0));

    uint length = userBuildingsQueue[_user].length;
    uint[] memory buildings = new uint[](length);
    for (uint i = 0; i < length; i++) {
      buildings[i] = userBuildingsQueue[_user][i].id;
    }
    return buildings;
  }

  /*
   * @notice Get Ids and Blocks.
   * @dev Function to get the ids, start block and end block of all buildings in queue.
   * Used only for testing.
   * @param _user the address of the user. (address)
   * @return four uint arrays representiong the id, startBlock, endBlock and index of each building.
   */
  function getBuildings(address _user) external view returns (uint[], uint[], uint[], uint[]) {
    require(_user != address(0));

    uint length = userBuildingsQueue[_user].length;
    uint[] memory ids = new uint[](length);
    uint[] memory startBlocks = new uint[](length);
    uint[] memory endBlocks = new uint[](length);
    uint[] memory indexes = new uint[](length);
    for (uint i = 0; i < length; i++) {
      ids[i] = userBuildingsQueue[_user][i].id;
      startBlocks[i] = userBuildingsQueue[_user][i].startBlock;
      endBlocks[i] = userBuildingsQueue[_user][i].endBlock;
      indexes[i] = userBuildingsQueue[_user][i].index;
    }
    return (ids, startBlocks, endBlocks, indexes);
  }

  /*
   * @notice Get Building Id and Block.
   * @dev Function to check the id and end block of a building in queue.
   * @param _user The address of the user's queue to search in. (address)
   * @param _index The index of the element to return in the array. (uint)
   */
  function getBuildingIdAndEndBlock(address _user, uint _indexInQueue) external view returns (uint id, uint endBlock) {
    require(userBuildingsQueue[_user].length > _indexInQueue);
    return (userBuildingsQueue[_user][_indexInQueue].id, userBuildingsQueue[_user][_indexInQueue].endBlock);
  }

  /*
   * @notice Get Building Index.
   * @dev Function to get the id and index of a building.
   * Used only for testing.
   * @param _user The address of the user. (address)
   * @param _indexInQueue The index in queue of the building. (uint)
   * @return Two uints representiong the id and index of a building.
   */
  function getBuildingIndex(address _user, uint _indexInQueue) external view returns (uint id, uint index) {
    require(_user != address(0));
    require(_indexInQueue < userBuildingsQueue[_user].length);

    return (userBuildingsQueue[_user][_indexInQueue].id, userBuildingsQueue[_user][_indexInQueue].index);
  }

  /*
   * @notice Get User Queue Resources.
   * @dev Function to get the amount of gold and crystal produced in the buildings Queue
   * since the last payout to the user.
   * @param _user The address of the user to give the resources. (address)
   * @param _payoutBlock The block where was the last payout to the user. (uint)
   * @return Two uints representing the gold and crystal produced in the queue system.
   */
  function getUserQueueResources(address _user) external view returns (uint queueGold, uint queueCrystal) {
    uint goldRate;
    uint crystalRate;
    uint diff;
    uint payoutBlock = userResources.usersPayoutBlock(_user);


		for (uint i = 0; i < userBuildingsQueue[_user].length; i++) {
      if (userBuildingsQueue[_user][i].endBlock < block.number) {
        (goldRate, crystalRate) = buildingsData.getGoldAndCrystalRates(userBuildingsQueue[_user][i].id);

        if (userBuildingsQueue[_user][i].endBlock > payoutBlock) {
          diff = SafeMath.sub(block.number, userBuildingsQueue[_user][i].endBlock);
        } else {
          diff = SafeMath.sub(block.number, payoutBlock);
        }


        if (diff > 0) {
          if (goldRate > 0) {
            queueGold = SafeMath.add(queueGold, SafeMath.mul(goldRate, diff));
          }

          if (crystalRate > 0) {
            queueCrystal = SafeMath.add(queueCrystal, SafeMath.mul(crystalRate, diff));
          }
        }
      }
    }

    return (queueGold, queueCrystal);
	}

  /*
   * @title Get Buildings Queue Length
   * @dev Get the length of the buildings Queue.
   * @param _user The address of the user. (address)
   */
  function getBuildingsQueueLength(address _user) external view returns (uint length) {
    return userBuildingsQueue[_user].length;
  }

  /*
   * @title Cancel Building.
   * @dev Function to cancel/remove building from queue. The building is set
   * to Active false in User Buildings.
   * @param _id The id of the building to be removed. (uint)
   * @param _index The Index of the building to be removed. (uint)
   */
  function cancelBuilding(uint _id, uint _index) external {
    require(buildingsData.checkBuildingExist(_id));

    bool buildingIsInQueue;
    uint buildingIndexInQueue;

    (buildingIsInQueue, buildingIndexInQueue) = findBuildingInQueue(msg.sender, _id, _index);

    require(buildingIsInQueue);
    require(userBuildingsQueue[msg.sender][buildingIndexInQueue].endBlock > block.number);

    userResources.payoutResources(msg.sender);
    updateQueueBlocks(msg.sender, buildingIndexInQueue);
    require(shiftOneUserBuilding(msg.sender, buildingIndexInQueue));

    uint pointsToSubtract = 0;
    (pointsToSubtract,,) = buildingsData.getBuildingData(_id);
    if (pointsToSubtract > 0) {
      pointsSystem.subPointsToUser(msg.sender, pointsToSubtract);
    }

    require(userBuildings.updateBuildingStatus(msg.sender, _id, _index));

    emit RemoveBuilding(msg.sender, _id, _index);

  }

  /*
   * @title Get User Resources Capacity.
   * @dev Function to get the resources capacity of the buildings in queue.
   * @param _user The address of the user. (address)
   * @return Two uints representing the gold and crystal capacity of the buildings in queue.
   */
  function getUserResourcesCapacity(address _user) external view returns (uint totalGoldCapacity, uint totalCrystalCapacity) {
    uint goldCapacity;
    uint crystalCapacity;

		for (uint i = 0; i < userBuildingsQueue[_user].length; i++) {
      uint buildingId = 0;
      if (userBuildingsQueue[_user][i].endBlock < block.number) {
        buildingId = userBuildingsQueue[_user][i].id;
      }
      if (userBuildingsQueue[_user][i].endBlock >= block.number &&
         ((userBuildingsQueue[_user][i].id - userBuildingsQueue[_user][i].id % 1000) / 1000) > 1) {
        buildingId = userBuildingsQueue[_user][i].id - 1000;
      }

      if (buildingId > 0) {
        (goldCapacity, crystalCapacity) = buildingsData.getGoldAndCrystalCapacity(buildingId);

        if (goldCapacity > 0) {
          totalGoldCapacity = SafeMath.add(totalGoldCapacity, goldCapacity);
        }

        if (crystalCapacity > 0) {
          totalCrystalCapacity = SafeMath.add(totalCrystalCapacity, crystalCapacity);
        }
      }
    }

    return (totalGoldCapacity, totalCrystalCapacity);
  }

}
