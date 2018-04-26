pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './AssetsRequirements.sol';
import './UnitsData.sol';
import './UserUnits.sol';
import './UserResources.sol';
import './Versioned.sol';

/*
 * @title UnitsQueue (WIP)
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/4
 */
contract UnitsQueue is NoOwner, Versioned {
  using SafeMath for uint;

  /*
   * @dev Event for Adding a unit to the queue system logging.
   * @param _user who receives the unit.
   * @param _id the id of the unit to be added.
   * @param _quantity the amount of the unit to be added.
	 * @param _startBlock the number of the block where the construction is gonna start.
	 * @param _endBlock the number of the block where the construction is gonna be ready.
   */
  event AddUnitsToQueue(address _user,
                        uint _id,
                        uint _quantity,
                        uint _startBlock,
                        uint _endBlock);

 /*
  * @dev Event for Updating the units queue. Units that are ready will be
  * tranfered to the user units contract, and removed from the queue.
  * @param _user the address of the user's queue to be updated. (address)
  * @param _ids The ids of the finished buldings. (uint[])
  * @param _indexes The indexes of the finished buldings. (uint[])
  */
  event UpdateQueue(address _user,
                    uint[] _ids,
                    uint[] _indexes);

 /*
  * @dev Event for upgrading a unit to the queue system logging.
  * @param _idOfUpgrade the id of the unit to be added.
  * @param _index the index of the unit to be added.
  * @param _startBlock the number of the block where the construction is gonna start.
  * @param _endBlock the number of the block where the construction is gonna be ready.
  */
  event UpgradeUnit(uint _idOfUpgrade, uint _index, uint startBlock, uint endBlock);

  struct Build {
    uint32 id;
    uint quantity;
    uint64 startBlock;
    uint64 endBlock;
  }

  AssetsRequirements assetsRequirements;
  UnitsData unitsData;
  UnitsQueue previousUnitsQueue;
  UserUnits userUnits;
  UserResources userResources;

  // Mapping of user -> build struct array (keeps track of units in construction queue)
  mapping (address => Build[]) public userUnitsQueue;

  /*
   * @notice Constructor: Instantiate Units Queue contract.
   * @dev Constructor function to provide User Units address and instantiate it.
   */
  constructor() public {
  }

  /*
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is Units Queue.
   */
  function isUnitsQueue() external pure returns (bool) {
    return true;
  }

  /*
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous Units Queue.
   * @param _previousUnitsQueue the address of previous Units Queue contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setUnitsQueueVersion(UnitsQueue _previousUnitsQueue, uint _version) external onlyOwner {
    require(_previousUnitsQueue.isUnitsQueue());
    require(_version > _previousUnitsQueue.version());
    previousUnitsQueue =_previousUnitsQueue;
    setVersion(_version);
  }

  /*
   * @title Instantiate User Units contract.
   * @dev Function to provide User Units address and instantiate it.
   * @param _userUnits the address of User Units contract. (address)
   */
  function setUserUnits(UserUnits _userUnits) external onlyOwner {
    require(_userUnits.isUserUnits());
    userUnits = _userUnits;
  }

  /*
   * @title Instantiate Units Data contract.
   * @dev Function to provide Units Data address and instantiate it.
   * @param _unitsData the address of Units Data contract. (address)
   */
  function setUnitsData(UnitsData _unitsData) external onlyOwner {
    require(_unitsData.isUnitsData());
    unitsData = _unitsData;
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
   * @title Instantiate Assets Requirements contract.
   * @dev Function to provide Assets Requirements address and instantiate it.
   * @param _assetsRequirements the address of Assets Requirements contract. (address)
   */
  function setAssetsRequirements(AssetsRequirements _assetsRequirements) external onlyOwner {
    require(_assetsRequirements.isAssetsRequirements());
    assetsRequirements = _assetsRequirements;
  }

  /*
   * @notice Add Units To Queue.
   * @dev Function to add units to the construction queue of the user.
   * @param _id of the unit to add to the queue. (uint)
   * @param _quantity: the amount of units to be created. (uint)
   */
  function addUnitsToQueue(uint _id, uint _quantity) external {
    require(_quantity > 0);
    require(unitsData.checkUnitExist(_id));
    require(assetsRequirements.validateUserAssetRequirements(msg.sender, _id));

    uint price;
    uint resourceType;
    uint blocks;
    (price, resourceType, blocks) = unitsData.getUnitData(_id);

    price = price.mul(_quantity);

    consumeResources(msg.sender, price, resourceType);

    blocks = blocks.mul(_quantity);

    uint startBlock = getStartBlock(msg.sender);
    uint endBlock = startBlock.add(blocks);

    userUnitsQueue[msg.sender].push(Build(
      uint32(_id),
      uint32(_quantity),
      uint64(startBlock),
      uint64(endBlock)
    ));

    emit AddUnitsToQueue(msg.sender,
                         _id,
                         _quantity,
                         startBlock,
                         endBlock);
  }

  /*
   * @title Update Queue.
   * @dev Function to update the user units queue.
   *  Finished units will be send to the User Units contract and removed from the construction queue.
   *  Queue will be resized and updated with only the unfinished units.
   * @param _user the address of the user's queue to be updated. (address)
   * @return an array of the finished units ids. (uint[])
   */
  function updateQueue(address _user) public {
    require(_user != address(0));
    if (userUnitsQueue[_user].length == 0) {
      return;
    }

    uint length = userUnitsQueue[_user].length;
    uint i = 0;

    while (i < length && userUnitsQueue[_user][i].endBlock < block.number) {
      i++;
    }

    uint indexDiff = 0;
    uint unitQuantity = 0;

    if (i < length) {
      unitQuantity = proccessCurrentBlockUnits(_user, i);
      if (unitQuantity > 0) {
        indexDiff++;
      }
    }

    uint[] memory finishedIds = new uint[](i + indexDiff);
    uint[] memory finishedQuantities = new uint[](i + indexDiff);

    if (i + indexDiff == 0) {
      emit UpdateQueue(_user, finishedIds, finishedQuantities);
      return;
    }

    for (uint j = 0; j < i; j++) {
      Build storage unit = userUnitsQueue[_user][j];
      finishedIds[j] = unit.id;
      finishedQuantities[j] = unit.quantity;
    }

    if (unitQuantity > 0) {
      unit = userUnitsQueue[_user][i];
      finishedIds[i] = unit.id;
      finishedQuantities[i] = unitQuantity;
    }

    require(userUnits.addUserUnits(_user, finishedIds, finishedQuantities));

    require(shiftUserUnits(_user, i));

    emit UpdateQueue(_user, finishedIds, finishedQuantities);
  }

  /*
   * @notice Shift User Units.
   * @dev Function to shift the specified amount of builds from user units queue.
   *  Being a chronologically ordered array, finished units will be always first on the array.
   * @param _user the address of the user's queue to be updated. (address)
   * @param _amount of units to be shifted from the array. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function shiftUserUnits(address _user, uint _amount) internal returns (bool) {
    require(_amount <= userUnitsQueue[_user].length);

    for (uint i = _amount; i < userUnitsQueue[_user].length; i++){
      userUnitsQueue[_user][i - _amount] = userUnitsQueue[_user][i];
    }
    for (uint j = 1; j <= _amount; j++){
      delete userUnitsQueue[_user][userUnitsQueue[_user].length - j];
    }
    userUnitsQueue[_user].length -= _amount;
    return true;
  }


  /*
   * @notice Check Unit Price and Get Block of it.
   * @dev Function to check if the user has the necessary amount of resources to build/upgrade the unit.
   *  And returns the amount of blocks that unit takes to be done.
   * @param _user the address of the user. (address)
   * @param _price the price for the upgrade. (uint)
   * @param _resourceType the type of the resource to consume. (uint)
   * @return returns the amount of blocks that unit takes to be done.
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
   * @dev Function to get the start block number of the new unit to be added in the queue.
   * @param _user the address of the user (address)
   */
  function getStartBlock(address _user) internal view returns (uint) {
    uint length = userUnitsQueue[_user].length;
    uint startBlock = block.number;
    if (length > 0) {
      Build storage lastUnit = userUnitsQueue[_user][SafeMath.sub(length, 1)];
      if (block.number < lastUnit.endBlock ) {
        startBlock = lastUnit.endBlock;
      }
    }
    return startBlock;
  }

  /*
   * @notice Get Units in Queue.
   * @dev Function to check the ids of all the user's units in queue.
   * @param _user the address of the user's queue to be shown. (address)
   */
  function getUnitsInQueue(address _user) external view returns (uint[]) {
    require(_user != address(0));

    uint length = userUnitsQueue[_user].length;
    uint[] memory units = new uint[](length);
    for (uint i = 0; i < length; i++) {
      units[i] = userUnitsQueue[_user][i].id;
    }
    return units;
  }

  /*
   * @notice Get Ids and Blocks.
   * @dev Function to get the ids, quiantities, start block and end block of all units in queue.
   * Used only for testing.
   * @param _user the address of the user. (address)
   * @return four uint arrays representiong the id, quiantities, startBlock and endBlock of each unit.
   */
  function getUnits(address _user) external view returns (uint[], uint[], uint[], uint[]) {
    require(_user != address(0));

    uint length = userUnitsQueue[_user].length;
    uint[] memory ids = new uint[](length);
    uint[] memory quantities = new uint[](length);
    uint[] memory startBlocks = new uint[](length);
    uint[] memory endBlocks = new uint[](length);
    for (uint i = 0; i < length; i++) {
      ids[i] = userUnitsQueue[_user][i].id;
      quantities[i] = userUnitsQueue[_user][i].quantity;
      startBlocks[i] = userUnitsQueue[_user][i].startBlock;
      endBlocks[i] = userUnitsQueue[_user][i].endBlock;
    }
    return (ids, quantities, startBlocks, endBlocks);
  }

  /*
   * @notice Get Unit Id and Block.
   * @dev Function to check the id and end block of a unit in queue.
   * @param _user The address of the user's queue to search in. (address)
   * @param _index The index of the element to return in the array. (uint)
   */
  function getUnitIdAndBlocks(address _user, uint _indexInQueue) external view returns (uint id,
                                                                                        uint startBlock,
                                                                                        uint endBlock) {
    require(userUnitsQueue[_user].length > _indexInQueue);
    return (userUnitsQueue[_user][_indexInQueue].id,
            userUnitsQueue[_user][_indexInQueue].startBlock,
            userUnitsQueue[_user][_indexInQueue].endBlock);
  }

  /*
   * @notice Get User Queue Resources.
   * @dev Function to get the amount of health, defense and attack in the units Queue
   * @param _user The address of the user to give the resources. (address)
   * @return Two uints representing the health, defense and attack of the units in Units Queue.
   */
  function getBattleStats(address _user) external view returns (uint queueHealth,
                                                                uint queueDefense,
                                                                uint queueAttack) {
    uint health;
    uint defense;
    uint attack;
    uint length = userUnitsQueue[_user].length;
    uint i = 0;

		while (i < length) {
      if (userUnitsQueue[_user][i].endBlock < block.number) {
        (health, defense, attack) = unitsData.getBattleRates(userUnitsQueue[_user][i].id);

        queueHealth = queueHealth.add(userUnitsQueue[_user][i].quantity.mul(health));
        queueDefense = queueDefense.add(userUnitsQueue[_user][i].quantity.mul(defense));
        queueAttack = queueAttack.add(userUnitsQueue[_user][i].quantity.mul(attack));
      }

      if (userUnitsQueue[_user][i].endBlock >= block.number && i <= length - 1) {
        uint unitQuantity;
        (, unitQuantity) = calculateUnitQuantity(_user, i);

        if (unitQuantity > 0) {
          (health, defense, attack) = unitsData.getBattleRates(userUnitsQueue[_user][i].id);

          queueHealth = queueHealth.add(unitQuantity.mul(health));
          queueDefense = queueDefense.add(unitQuantity.mul(defense));
          queueAttack = queueAttack.add(unitQuantity.mul(attack));
        }
        i = length;
      }
      i++;
    }
    return (queueHealth, queueDefense, queueAttack);
	}

  /*
   * @title Get Units Queue Length
   * @dev Get the length of the units Queue.
   * @param _user The address of the user. (address)
   */
  function getUnitsQueueLength(address _user) external view returns (uint length) {
    return userUnitsQueue[_user].length;
  }


  /*
   * @title Sets the remaining number of units and it's new startBlock and returns the amount of ready ones.
   * @dev
   * @param _user The address of the user. (address)
   * @param _index The index of the user queue where the units are. (uint)
   */
  function proccessCurrentBlockUnits(address _user, uint _index) internal returns (uint unitQuantity) {
    /*_index = _index.add(1);*/
    uint unitBlocks;

    (unitBlocks, unitQuantity) = calculateUnitQuantity(_user, _index);

    if (unitQuantity > 0) {
      userUnitsQueue[_user][_index].quantity = userUnitsQueue[_user][_index].quantity.sub(unitQuantity);
      uint startBlock = userUnitsQueue[_user][_index].startBlock;
      userUnitsQueue[_user][_index].startBlock = uint64(startBlock.add(unitQuantity.mul(unitBlocks)));
    }

    return unitQuantity;
  }

  /*
   * @title Returns the quantity of units that are ready and the block time of the unit.
   * @dev Helper used by proccessCurrentBlockUnits to get the quantity of ready units and their block time.
   * @param _user The address of the user. (address)
   * @param _index The index of the user queue where the units are. (uint)
   */
  function calculateUnitQuantity(address _user, uint _index) internal view returns (uint unitBlocks, uint unitQuantity) {
    (,, unitBlocks) = unitsData.getUnitData(userUnitsQueue[_user][_index].id);

    /* If the batch didnt start yet or is on its first block*/
    if (block.number <= userUnitsQueue[_user][_index].startBlock) {
      return (unitBlocks, 0);
    }

    /* We substract 1 to not count the current block*/
    uint diff = block.number.sub(userUnitsQueue[_user][_index].startBlock).sub(1);
    unitQuantity = diff.div(unitBlocks);

    return (unitBlocks, unitQuantity);
  }

  /*
   * @title Get User Units Queue Length
   * @dev Function to get the lenght of user unist queue.
   * @param _user The address to query the queue length. (address)
   * @return A uint representing the length of the user units queue.
   */
  function getUserUnitsQueueLength(address _user) external view returns (uint length) {
    return userUnitsQueue[_user].length;
  }

}
