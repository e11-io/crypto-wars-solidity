pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './UserBuildings.sol';
import './BuildingsData.sol';
import './UserResources.sol';

/*
 * @title BuildingsQueue (WIP)
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/4
 */
contract BuildingsQueue is NoOwner {
  using SafeMath for uint;

  /*
   * @dev Event for Adding a building to the queue system logging.
   * @param _user who receives the building.
   * @param _id the id of the building to be added.
   * @param _index the index of the building to be added.
	 * @param _startBlock the number of the block where the construction is gonna start.
	 * @param _endBlock the number of the block where the construction is gonna be ready.
   */
  event AddNewBuildingToQueue(address _user,
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
  event UpdateQueue(address _user,
                           uint[] _ids,
                           uint[] _indexes);

 /*
  * @dev Event for upgrading a building to the queue system logging.
  * @param _idOfUpgrade the id of the building to be added.
  * @param _index the index of the building to be added.
  * @param _startBlock the number of the block where the construction is gonna start.
  * @param _endBlock the number of the block where the construction is gonna be ready.
  */
  event UpgradeBuilding(uint _idOfUpgrade, uint _index, uint startBlock, uint endBlock);

 /*
  *
  */
  event RemoveBuilding(address _user, uint _id, uint _index);

  struct Build {
    uint32 id;
    uint32 index;
    uint64 startBlock;
    uint64 endBlock;
  }

  UserBuildings userBuildings;
  BuildingsData buildingsData;
  UserResources userResources;

  // Mapping of user -> build struct array (keeps track of buildings in construction queue)
  mapping (address => Build[]) public userBuildingsQueue;

  /*
   * @title Instantiate User Buildings contract.
   * @dev Function to provide User Buildings address and instantiate it.
   * @param _userBuildings the address of User Buildings contract. (address)
   */
  function setUserBuildings(address _userBuildings) external onlyOwner {
    userBuildings = UserBuildings(_userBuildings);
  }

  /*
   * @title Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setBuildingsData(address _buildingsData) external onlyOwner {
    buildingsData = BuildingsData(_buildingsData);
  }

  /*
   * @title Instantiate User Resources contract.
   * @dev Function to provide User Resources address and instantiate it.
   * @param _userResources the address of User Resources contract. (address)
   */
  function setUserResources(address _userResources) external onlyOwner {
    userResources = UserResources(_userResources);
  }

  /*
   * @notice Add New Building To Queue.
   * @dev Function to add a new building to the construction queue of the user.
   * @param _id of the building to add to the queue. (uint)
   */
  function addNewBuildingToQueue(uint _id) external {
    require(buildingsData.checkBuildingExist(_id));

    uint typeId = buildingsData.getBuildingTypeId(_id);

    require(userBuildings.buildingTypeIsUnique(msg.sender, typeId));

    uint price;
    uint resourceType;
    uint blocks;
    (price, resourceType, blocks) = buildingsData.getBuildingData(_id);


    consumeResources(msg.sender, price, resourceType);

    uint startBlock = getStartBlock(msg.sender);
    uint index = userBuildings.initNewBuilding(msg.sender, _id);
    uint endBlock = startBlock.add(blocks);

    userBuildingsQueue[msg.sender].push(Build(
      uint32(_id),
      uint32(index),
      uint64(startBlock),
      uint64(endBlock)
    ));

    AddNewBuildingToQueue(msg.sender,
                          _id,
                          index,
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
    require(userBuildingsQueue[_user].length > 0);

    uint length = userBuildingsQueue[_user].length;
    uint i = 0;

    while (i < length && userBuildingsQueue[_user][i].endBlock <= block.number) {
      i++;
    }

    uint[] memory finishedIds = new uint[](i);
    uint[] memory finishedIndexes = new uint[](i);

    if (i == 0) {
      UpdateQueue(_user, finishedIds, finishedIndexes);
      return;
    }

    for (uint j = 0; j < i; j++) {
      Build storage building = userBuildingsQueue[_user][j];
      finishedIds[j] = building.id;
      finishedIndexes[j] = building.index;
    }

    require(userBuildings.addUserBuildings(_user, finishedIds, finishedIndexes));

    require(shiftUserBuildings(_user, i));

    UpdateQueue(_user, finishedIds, finishedIndexes);
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
    require(buildingsData.checkBuildingExist(_id));
    require(buildingsData.checkBuildingExist(_idOfUpgrade));
    require(buildingsData.checkUpgrade(_id, _idOfUpgrade));

    bool buildingIsInQueue;
    uint buildingIndexInQueue;
    (buildingIsInQueue, buildingIndexInQueue) = findBuildingInQueue(msg.sender, _id, _index);

    if (buildingIsInQueue) {
      updateQueue(msg.sender);
    }
    
    require(userBuildings.upgradeBuilding(msg.sender, _id, _index));

    require(userBuildings.upgradeBuilding(msg.sender, _id, _index));
    
    uint price;
    uint resourceType;
    uint blocks;
    (price, resourceType, blocks) = buildingsData.getBuildingData(_id);
    consumeResources(msg.sender, price, resourceType);

    uint startBlock = getStartBlock(msg.sender);
    uint endBlock = startBlock.add(blocks);

    userBuildingsQueue[msg.sender].push(Build(
      uint32(_idOfUpgrade), uint32(_index), uint64(startBlock), uint64(endBlock)
    ));

    UpgradeBuilding(_idOfUpgrade, _index, startBlock, endBlock);
  }

  /*
   * @title Remove Building.
   * @dev Function to cancel/remove building from queue. The building is set
   * to Active false in User Buildings.
   * @param _id The id of the building to be removed. (uint)
   * @param _index The Index of the building to be removed. (uint)
   */
  function removeBuilding(uint _id, uint _index) external {
    require(buildingsData.checkBuildingExist(_id));

    bool buildingIsInQueue;
    uint buildingIndexInQueue;

    (buildingIsInQueue, buildingIndexInQueue) = findBuildingInQueue(msg.sender, _id, _index);

    userResources.payoutResources(msg.sender);

    if (buildingIsInQueue) {
      if (userBuildingsQueue[msg.sender][buildingIndexInQueue].endBlock > block.number) {
          updateQueueBlocks(msg.sender, buildingIndexInQueue);
      }
      require(shiftOneUserBuilding(msg.sender, buildingIndexInQueue));
    }

    uint[] memory ids = new uint[](1);
    uint[] memory indexes = new uint[](1);

    ids[0] = _id;
    indexes[0] = _index;

    userBuildings.removeUserBuildings(msg.sender, ids, indexes);

    RemoveBuilding(msg.sender, _id, _index);

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
    require(_index >= 0);
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
  function shiftUserBuildings(address _user, uint _amount) internal constant returns (bool) {
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
  function getLastUserBuilding(address _user) external returns (uint id,
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
  function getStartBlock(address _user) internal returns (uint) {
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
  function getBuildingsInQueue(address _user) external returns (uint[]) {
    require(_user != address(0));

    uint length = userBuildingsQueue[_user].length;
    uint[] memory buildings = new uint[](length);
    for (uint i = 0; i < length; i++) {
      buildings[i] = userBuildingsQueue[_user][i].id;
    }
    return buildings;
  }

  /*
   * @notice Get Buildings Id and Index.
   * @dev Function to get the ids and indexes of all the buildings in queue.
   * @param _user the address of the user. (address)
   * @return two uint arrays representiong the ids and the indexes of the building.
   */
  function getBuildingsIdAndIndex(address _user) external returns (uint[], uint[]) {
    require(_user != address(0));

    uint length = userBuildingsQueue[_user].length;
    uint[] memory ids = new uint[](length);
    uint[] memory indexes = new uint[](length);
    for (uint i = 0; i < length; i++) {
      ids[i] = userBuildingsQueue[_user][i].id;
      indexes[i] = userBuildingsQueue[_user][i].index;
    }
    return (ids, indexes);
  }

  /*
   * @notice Get Ids and Blocks.
   * @dev Function to get the ids, start block and end block of all buildings in queue.
   * Used only for testing.
   * @param _user the address of the user. (address)
   * @return three uint arrays representiong the ids, startBlock and endBlock of heach building.
   */
  function getIdAndBlocks(address _user) external returns (uint[], uint[], uint[]) {
    require(_user != address(0));

    uint length = userBuildingsQueue[_user].length;
    uint[] memory ids = new uint[](length);
    uint[] memory startBlocks = new uint[](length);
    uint[] memory endBlocks = new uint[](length);
    for (uint i = 0; i < length; i++) {
      ids[i] = userBuildingsQueue[_user][i].id;
      startBlocks[i] = userBuildingsQueue[_user][i].startBlock;
      endBlocks[i] = userBuildingsQueue[_user][i].endBlock;
    }
    return (ids, startBlocks, endBlocks);
  }

  /*
   * @notice Get Building Id and Block.
   * @dev Function to check the id and end block of a building in queue.
   *  Only used for testing.
   * @param _user The address of the user's queue to search in. (address)
   * @param _index The index of the element to return in the array. (uint)
   */
  function getBuildingIdAndEndBlock(address _user, uint _index) external returns (uint id, uint endBlock) {
    require(_index >= 0);
    require(userBuildingsQueue[_user].length >= _index);
    return (userBuildingsQueue[_user][_index].id, userBuildingsQueue[_user][_index].endBlock);
  }

  /*
   * @notice Get Building Index.
   * @dev Function to get the id and index of a building.
   * Used only for testing.
   * @param _user The address of the user. (address)
   * @param _indexInQueue The index in queue of the building. (uint)
   * @return Two uints representiong the id and index of a building.
   */
  function getBuildingIndex(address _user, uint _indexInQueue) external returns (uint id, uint index) {
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
  function getUserQueueResources(address _user) external returns (uint queueGold, uint queueCrystal) {
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
}
