pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './UserBuildings.sol';
import './BuildingsData.sol';
import './UserResources.sol';

/**
 * @title BuildingsQueue (WIP)
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/4
 */
contract BuildingsQueue {
  using SafeMath for uint;

  /**
   * @dev Event for Adding a building to the queue system logging.
   * @param _user who receives the building.
   * @param _id the id of the building to be added.
   * @param _index the index of the building to be added.
	 * @param _skin the id of the skin of the building.
	 * @param _startBlock the number of the block where the construction is gonna start.
	 * @param _endBlock the number of the block where the construction is gonna be ready.
	 * @param _queueId a provisional id for new buildings in queue when they don't have index.
   */
  event AddNewBuildingToQueue(address _user,
                           uint _id,
                           uint _index,
                           uint _skin,
                           uint _startBlock,
                           uint _endBlock,
                           uint _queueId);


  struct Build {
    uint id;
    uint index;
    uint skin;
    uint startBlock;
    uint endBlock;
    uint queueId;
  }

  UserBuildings userBuildings;
  BuildingsData buildingsData;
  UserResources userResources;

  // Mapping of user -> build struct array (keeps track of buildings in construction queue)
  mapping (address => Build[]) public userBuildingsQueue;

  // Mapping of user -> last queue id made (keeps track of the queueId of the last building in queue)
  mapping (address => uint) public lastQueueId;


  function setUserBuildings(address _userBuildings) {
    userBuildings = UserBuildings(_userBuildings);
  }

  function setBuildingsData(address _buildingsData) {
    buildingsData = BuildingsData(_buildingsData);
  }

  function setUserResources(address _userResources) {
    userResources = UserResources(_userResources);
  }

  /**
   * @notice Add New Building To Queue.
   * @dev Function to add a new building to the construction queue of the user.
   * @param _id of the building to add to the queue. (uint)
   * @param _skin of the building. (uint)
   */
  function addNewBuildingToQueue(uint _id, uint _skin) external {
    require(msg.sender != address(0));
    require(buildingsData.checkBuildingExist(_id));

    uint blocks = checkPriceAndGetBlock(msg.sender, _id);
    uint startBlock = getStartBlock(msg.sender);

    uint newQueueId = lastQueueId[msg.sender] + 1;
    uint index = 0;
    uint endBlock = startBlock.add(blocks);
    userBuildingsQueue[msg.sender].push(Build(
      _id, index, _skin, startBlock, endBlock, newQueueId
    ));

    lastQueueId[msg.sender] = newQueueId;

    AddNewBuildingToQueue(msg.sender,
                          _id,
                          index,
                          _skin,
                          startBlock,
                          endBlock,
                          newQueueId);
  }

  /**
   * @notice Update Queue.
   * @dev Function to update the user buildings queue. Finished buildings
   *  will be send to the User Buildings contract and removed from the construction
   *  queue. Queue will be resized and updated with only the unfinished buildings.
   * @param _user the address of the user's queue to be updated. (address)
   * @return an array of the finished buildings ids. (uint[])
   */
  function updateQueue(address _user) external returns (uint[]) {
    require(_user != address(0));
    require(userBuildingsQueue[_user].length > 0);

    uint blockNum = block.number;
    uint length = userBuildingsQueue[_user].length;
    uint i = 0;

    while (i < length && userBuildingsQueue[_user][i].endBlock <= blockNum) {
      i++;
    }

    uint[] memory finishedIds = new uint[](i);
    uint[] memory finishedIndexes = new uint[](i);

    if (i == 0) {
      return finishedIds;
    }

    for (uint j = 0; j < i; j++) {
      Build storage building = userBuildingsQueue[_user][j];
      finishedIds[j] = building.id;
      finishedIndexes[j] = building.index;
    }

    require(userBuildings.addUserBuildings(_user, finishedIds, finishedIndexes));

    require(shiftUserBuildings(_user, i));

    return finishedIds;
  }

  /**
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

  /**
   * @notice Get the last building in the construction queue of the user.
   * @param _user . (address)
   */
  function getLastUserBuilding(address _user) external returns (uint id,
                                                                uint skin,
                                                                uint startBlock,
                                                                uint endBlock) {
    require(_user != address(0));
    require(userBuildingsQueue[_user].length > 0);

    Build storage b = userBuildingsQueue[_user][userBuildingsQueue[_user].length -1];
    return (b.id, b.skin, b.startBlock, b.endBlock);
  }

  /**
   * @notice Check Building Price and Get Block of it.
   * @dev Function to check if the user has the necessary amount of resources
   *  to build/upgrade the building. And returns the amount of blocks that
   *  building takes to be done.
   * @param _user the address of the user. (address)
   * @param _id of building to be checked. (uint)
   * @return returns the amount of blocks that building takes to be done.
   */
  function checkPriceAndGetBlock(address _user, uint _id) internal returns (uint) {
    int price;
    int resourceType;
    int blocks;
    (price, resourceType, blocks) = buildingsData.getBuildingData(_id);
    require(resourceType == 0 || resourceType == 1 || resourceType == 2);
    if (price > 0) {
      if (resourceType == 0) {
        require(userResources.consumeGold(_user, uint(price)));
      }
      if (resourceType == 1) {
        require(userResources.consumeCrystal(_user, uint(price)));
      }
      if (resourceType == 2) {
        require(userResources.consumeQuantumDust(_user, uint(price)));
      }
    }
    return uint(blocks);
  }

  /**
   * @notice Set Start Block.
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

  /**
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

  /**
   * @notice Get Building Id and Block.
   * @dev Function to check the id and end block of a building in queue.
   *  Only used for testing.
   * @param _user the address of the user's queue to search in. (address)
   * @param _index the index of the element to return in the array. (uint)
   */
  function getBuildingIdAndEndBlock(address _user, uint _index) external returns (uint id, uint endBlock) {
    require(_index >= 0);
    require(userBuildingsQueue[_user].length >= _index);
    return (userBuildingsQueue[_user][_index].id, userBuildingsQueue[_user][_index].endBlock);
  }

}
