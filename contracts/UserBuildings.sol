pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './BuildingsData.sol';
import './UserVillage.sol';
import './UserResources.sol';
import './BuildingsQueue.sol';

/**
 * @title UserBuildings (WIP)
 * @notice This contract set which buildings belongs to an user.
 * @dev Keeps track of users active buildings.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/3
 */

contract UserBuildings is NoOwner {
  using SafeMath for uint;

  /**
   * event for adding multiple buildings to a user logging
   * @param user the address of the user to add the buildings
   * @param ids the IDs of the buildings to be added
   * @param indexes the indexes of the buildings to be added
   */
  event AddUserBuildings(address user, uint[] ids, uint[] indexes);

  /**
   * event for upgrading a building to a user logging
   * @param user the address of the user to give the upgraded building
   * @param id the id of the new building (upgrade)
   * @param index the index of the building (upgrade)
   */
  event UpgradeBuilding(address user, uint id, uint index);

  /**
   * event for adding the initial buildings to a user logging
   * @param user the address of the user to add the buildings
   * @param ids the IDs of the buildings to be added to user
   */
  event AddInitialBuildings(address user, uint[] ids);

  /**
   * event for removing buildings to a user logging
   * @param user the address of the user to remove the buildings
   * @param ids the IDs of the buildings to be removed
   * @param indexes the indexes of the buildings to be removed
   */
  event RemoveUserBuildings(address user, uint[] ids, uint[] indexes);

  /*
   * event for initializing a new building right before the construction starts logging.
   * @param _user the address of the user to initialize the buildings
   * @param _id the id of the building to be initialize
   */
  event InitNewBuilding(address user, uint index);

  struct Building {
    uint id;
    bool active;
  }

  // Mapping of user -> buildings ids (keeps track of owned buildings)
  mapping (address => Building[]) public userBuildings;

  BuildingsData buildingsData;
  UserVillage userVillage;
  UserResources userResources;
  BuildingsQueue buildingsQueue;


  function UserBuildings(address _buildingsData) {
    buildingsData = BuildingsData(_buildingsData);
  }

  /**
   * @notice Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
  function setUserVillage(address _userVillage) external onlyOwner {
    userVillage = UserVillage(_userVillage);
  }

  /**
   * @notice Instantiate User Resources contract.
   * @dev Function to provide User Resources address and instantiate it.
   * @param _userResources the address of User Resources contract. (address)
   */
  function setUserResources(address _userResources) external onlyOwner {
    userResources = UserResources(_userResources);
  }

  /**
   * @notice Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setBuildingsData(address _buildingsData) external onlyOwner {
    buildingsData = BuildingsData(_buildingsData);
  }

  /**
   * @notice Instantiate Buildings Queue contract.
   * @dev Function to provide Buildings Queue address and instantiate it.
   * @param _buildingsQueue the address of Buildings Queue contract. (address)
   */
  function setBuildingsQueue(address _buildingsQueue) external onlyOwner {
    buildingsQueue = BuildingsQueue(_buildingsQueue);
  }


  /*
   * @title Add User Buildings
   * @dev Function to add multiple buildings to a user
   * @params _user the address of the user to add building. (address)
   * @param _ids An array of IDs of the buildings to add. (uint)
   * @param _indexes An array of indexes of the buildings to add. (uint)
   * @return A boolean that indicates if the operation was successful.
   */

  function addUserBuildings(address _user, uint[] _ids, uint[] _indexes) external returns (bool) {
    require(msg.sender == address(buildingsQueue));

    require(_ids.length == _indexes.length);

    uint length = _ids.length;

    for (uint i = 0; i < length; i++) {
      require(_ids[i] >= 0);
      require(buildingsData.checkBuildingExist(_ids[i]));
    }

    for (uint j = 0; j < length; j++) {
      userBuildings[_user][_indexes[j]] = Building(_ids[j], true);
    }

    AddUserBuildings(_user, _ids, _indexes);

    return true;
  }

  /*
   * @title Add Initial Buildings
   * @dev Function to add the initial buildings to a user
   * @param user the address of the user to add the buildings
   * @param ids the IDs of the buildings to be added to user
   * @return A boolean that indicates if the operation was successful.
   */
  function addInitialBuildings(address _user, uint[] _ids) external returns (bool) {
    require(msg.sender == address(userVillage));

    for (uint i = 0; i < _ids.length; i++) {
      require(_ids[i] >= 0);
      require(buildingsData.checkBuildingExist(_ids[i]));
    }

    for (uint j = 0; j < _ids.length; j++) {
      userBuildings[_user].push(Building(_ids[j], true));
    }

    AddInitialBuildings(_user, _ids);

    return true;
  }

  /*
   * @title Init New Building
   * @dev Function to initialize a new building right before the construction starts.
   * Its added to the UserBuildings array to give it and index, and set as Active False.
   * @param _user the address of the user to initialize the buildings
   * @param _id the id of the building to be initialize
   * @return A uint that indicates the index of the initialized building.
   */
  function initNewBuilding(address _user, uint _id) external returns (uint index) {
    require(buildingsData.checkBuildingExist(_id));

    userBuildings[_user].push(Building(_id, false));

    InitNewBuilding(_user, userBuildings[_user].length - 1);

    return userBuildings[_user].length - 1;
  }

  /*
   * @title Remove User Buildings
   * @dev Function to disable multiple user buildings.
   * The buildings are not removed from the array, they are all set to Active False.
   * @param _user the address of the user to remove the buildings
   * @param _ids the ids of the building to be removed
   * @param _indexes the indexes of the building to be removed
   * @return A boolean that indicates if the operation was successful.
   */
  function removeUserBuildings(address _user, uint[] _ids, uint[] _indexes) external returns (bool) {
    require(_ids.length == _indexes.length);

    for (uint i = 0; i < _ids.length; i++) {
      require(buildingsData.checkBuildingExist(_ids[i]));
      require(userBuildings[_user][_indexes[i]].id == _ids[i]);
      userBuildings[_user][_indexes[i]].active = false;
    }

    require(returnResourcesToUser(_user, _ids));

    RemoveUserBuildings(_user, _ids, _indexes);

    return true;
  }

  /*
   * @title Upgrade Building
   * @dev Function to upgrade a user building.
   * The upgrade (building) replace the old building in the array.
   * @param _user the address of the user
   * @param _id the id of the upgrade
   * @param _index the index of the building to be replace
   * @return A boolean that indicates if the operation was successful.
   */
  function upgradeBuilding(address _user, uint _id, uint _index) external returns (bool) {
    require(_user != address(0));
    require(msg.sender == address(buildingsQueue));
    require(userBuildings[_user][_index].id == _id);

    userBuildings[_user][_index].active = false;

    return true;
  }

  /*
   * @title Get User Buildings
   * @dev Function to get the buildings of the specified address.
   * @param _user The address to query the buildings of. (address)
   * @return A uint[] representing the array of buildings owned by the passed address.
   */
  function getUserBuildings(address _user) external returns (uint[]) {
    uint length = userBuildings[_user].length;
    uint[] memory buildingIds = new uint[](length);
    for (uint i = 0; i < length; i++) {
      buildingIds[i] = userBuildings[_user][i].id;
    }
    return buildingIds;
  }

  /*
   * @title Get Building Id and Status
   * @dev Function to get id and status of a building. Only used for for testing.
   * @param _user The address to query the buildings of. (address)
   * @param _index The index of the building. (address)
   * @return A a uint representing the id and a bool representing if the building is active or not.
   */
  function getUserBuildingIdAndStatus(address _user, uint _index) external returns (uint id, bool active) {
    return (userBuildings[_user][_index].id, userBuildings[_user][_index].active);
  }

  /*
   * @title Return Resources To User
   * @dev Used when removing a building. Gets the price and resource type of the building
   * been removed, and returns a percentage of the price to the user.
   * @param _user The address of the user to return resources. (address)
   * @param _ids The ids of the building been remove. (address)
   * @return A boolean that indicates if the operation was successful.
   */
  function returnResourcesToUser(address _user, uint[] _ids) internal returns (bool) {
    /*TODO: re-use this function in BuildingsQueue*/
    uint price;
    uint resourceType;
    uint blocks;
    for (uint i = 0; i < _ids.length; i++) {
      (price, resourceType, blocks) = buildingsData.getBuildingData(_ids[i]);
      if (price > 0) {
        price = (price * 60 / 100);
        if (resourceType == 0) {
          userResources.giveResourcesToUser(_user, price, 0, 0);
        }
        if (resourceType == 1) {
          userResources.giveResourcesToUser(_user, 0, price, 0);
        }
        if (resourceType == 2) {
          userResources.giveResourcesToUser(_user, 0, 0, price);
        }
      }
    }
    return true;
  }

  /*
   * @title Get User Rates
   * @dev Function to iterate through the user buildings and calculate the gold and crystal rates.
   * @param _user The address of the user to get the rates of. (address)
   * @return A two uints that indicates if the amount of gold and crystal rates.
   */
  function getUserRates(address _user) external returns (uint totalGoldRate, uint totalCrystalRate) {
    uint goldRate;
    uint crystalRate;

		for (uint i = 0; i < userBuildings[_user].length; i++) {
      if (userBuildings[_user][i].active == true) {
        (goldRate, crystalRate) = buildingsData.getGoldAndCrystalRates(userBuildings[_user][i].id);
        if (goldRate > 0) {
          totalGoldRate = SafeMath.add(totalGoldRate, goldRate);
        }

        if (crystalRate > 0) {
          totalCrystalRate = SafeMath.add(totalCrystalRate, crystalRate);
        }
      }
    }

    return (totalGoldRate, totalCrystalRate);
	}

  /*
   * @title Building Type is Unique
   * @dev Function to check if the user has or not a specific building type in his buildings.
   * @param _user The address of the user to get the rates of. (address)
   * @param _typeid The id of the type to look for in the buildings. (uint)
   * @return A boolean that indicates if the user has or not that type of building.
   */
  function buildingTypeIsUnique(address _user, uint _typeId) public returns (bool) {
    bool unique = true;
    uint i = 0;
    while (unique && i < userBuildings[_user].length) {
      if (_typeId == buildingsData.getBuildingTypeId(userBuildings[_user][i].id)) {
        return false;
      }
      i++;
    }
    return unique;
  }
}
