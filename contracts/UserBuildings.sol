pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './BuildingsData.sol';
import './BuildingsQueue.sol';
import './UserResources.sol';
import './UserVillage.sol';
import './Versioned.sol';

/**
 * @title UserBuildings (WIP)
 * @notice This contract set which buildings belongs to an user.
 * @dev Keeps track of users active buildings.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/3
 */

contract UserBuildings is NoOwner, Versioned {
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
  BuildingsQueue buildingsQueue;
  UserBuildings previousUserBuildings;
  UserResources userResources;
  UserVillage userVillage;

  /**
   * @notice Constructor: Instantiate User Buildings contract.
   * @dev Constructor function to provide User Buildings address and instantiate it.
   */
  function UserBuildings() public {
  }

  /**
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is User Buildings.
   */
  function isUserBuildings() external pure returns (bool) {
    return true;
  }

  /**
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous User Buildings.
   * @param _previousUserBuildings the address of previous User Buildings contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setUserBuildingsVersion(UserBuildings _previousUserBuildings, uint _version) external onlyOwner {
    require(_previousUserBuildings.isUserBuildings());
    require(_version > _previousUserBuildings.version());
    previousUserBuildings = _previousUserBuildings;
    setVersion(_version);
  }

  /**
   * @notice Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
  function setUserVillage(UserVillage _userVillage) external onlyOwner {
    require(_userVillage.isUserVillage());
    userVillage = _userVillage;
  }

  /**
   * @notice Instantiate User Resources contract.
   * @dev Function to provide User Resources address and instantiate it.
   * @param _userResources the address of User Resources contract. (address)
   */
  function setUserResources(UserResources _userResources) external onlyOwner {
    require(_userResources.isUserResources());
    userResources = _userResources;
  }

  /**
   * @notice Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setBuildingsData(BuildingsData _buildingsData) external onlyOwner {
    require(_buildingsData.isBuildingsData());
    buildingsData = _buildingsData;
  }

  /**
   * @notice Instantiate Buildings Queue contract.
   * @dev Function to provide Buildings Queue address and instantiate it.
   * @param _buildingsQueue the address of Buildings Queue contract. (address)
   */
  function setBuildingsQueue(BuildingsQueue _buildingsQueue) external onlyOwner {
    require(_buildingsQueue.isBuildingsQueue());
    buildingsQueue = _buildingsQueue;
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
    require(msg.sender == address(userVillage) || msg.sender == owner);

    for (uint i = 0; i < _ids.length; i++) {
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
    require(msg.sender == address(buildingsQueue) || msg.sender == owner);
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
    require(msg.sender == address(buildingsQueue) || msg.sender == owner);
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
   * @title Get User Buildings Length
   * @dev Function to get the buildings length of the specified address.
   * @param _user The address to query the buildings length of. (address)
   * @return A uint representing the array length of buildings owned by the user.
   */
  function getUserBuildingsLength(address _user) external view returns (uint length) {
    return userBuildings[_user].length;
  }

  /*
   * @title Get User Buildings
   * @dev Function to get the buildings of the specified address.
   * @param _user The address to query the buildings of. (address)
   * @return A uint[] representing the array of buildings ids owned by the user.
   */
  function getUserBuildings(address _user) external view returns (uint[]) {
    uint length = userBuildings[_user].length;
    uint[] memory buildingIds = new uint[](length);
    for (uint i = 0; i < length; i++) {
      buildingIds[i] = userBuildings[_user][i].id;
    }
    return buildingIds;
  }

  /*
   * @title Get Building Id and Status
   * @dev Function to get the id and status of a building.
   * @param _user The address to query the buildings of. (address)
   * @param _index The index of the building. (uint)
   * @return A uint representing the id and a bool representing if the building is active or not.
   */
  function getUserBuildingIdAndStatus(address _user, uint _index) external view returns (uint id, bool active) {
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
  function getUserRates(address _user) external view returns (uint totalGoldRate, uint totalCrystalRate) {
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
   * @param id The id of the building to be checked. (uint)
   * @return An int that indicates if the user has or not that type of building.
   * index -2: building type is not unique and the builiding cant be created.
   * index -1: building type is unique and the building can be created. Must be initialized.
   * index >= 0: building was deleted and must be created again. Modifing it's active variable to true.
   */
  function buildingTypeIsUnique(address _user, uint _typeId, uint _id) public view returns (int) {
    uint i = 0;
    while (i < userBuildings[_user].length) {
      if (_typeId == buildingsData.getBuildingTypeId(userBuildings[_user][i].id)) {
        if  (userBuildings[_user][i].active) {
          return -2;
        }

        bool buildingIsInQueue;

        (buildingIsInQueue,) = buildingsQueue.findBuildingInQueue(_user, _id, i);

        if (buildingIsInQueue) {
          return -2;
        }

        return int(i);
      }
      i++;
    }
    return -1;
  }

  /*
   * @title Update Building Status.
   * @dev Function to update the active status of the building.
   * @param _user The owner of the building. (address)
   * @param _id The id of the building to be updated. (uint)
   * @param _index The Index of the building to be updated. (uint)
   */
  function updateBuildingStatus(address _user, uint _id, uint _index) external returns (bool) {
    require(msg.sender == address(buildingsQueue));

    if  (_id > 2000) {
      require(userBuildings[_user][_index].id == _id - 1000);
      userBuildings[_user][_index].active = true;
      return true;
    }

    require(userBuildings[_user][_index].id == _id);
    userBuildings[_user][_index].active = false;
    return true;
  }

  /*
   * @title Get User Resources Capacity.
   * @dev Function to get the resources capacity of the buildings in user buildings.
   * @param _user The address of the user. (address)
   * @return Two uints representing the gold and crystal capacity of the buildings in queue.
   */
  function getUserResourcesCapacity(address _user) external view returns (uint totalGoldCapacity, uint totalCrystalCapacity) {
    uint goldCapacity = 0;
    uint crystalCapacity = 0;

    for (uint i = 0; i < userBuildings[_user].length; i++) {
      if (userBuildings[_user][i].active == true) {
        (goldCapacity, crystalCapacity) = buildingsData.getGoldAndCrystalCapacity(userBuildings[_user][i].id);
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
