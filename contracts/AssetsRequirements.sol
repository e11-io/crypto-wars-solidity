pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './Versioned.sol';
import './BuildingsData.sol';
import './BuildingsQueue.sol';
import './UnitsData.sol';
import './UserBuildings.sol';

/**
 * @title AssetsRequirements (WIP)
 * @notice This contract lists the assets creation requirements.
 * @dev You can add requirements and update them
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/
 */
contract AssetsRequirements is NoOwner, Versioned {

  /**
   * @dev event for setting up the requirements for an asset
   * @param id of the asset
   * @param requirements the requirements array of the asset
   */
  event SetAssetRequirements(uint id, uint[] requirements);

  /**
   * @dev event for adding a new requirements to an asset
   * @param id of the asset
   * @param requirement the new requirement of the asset
   */
  event AddedAssetRequirement(uint id, uint requirement);

  /**
   * event for removing a requirement from an asset
   * @param id of the asset to remove the requirement from
   * @param requirement the requirement to remove
   */
  event RemovedAssetRequirement(uint id, uint requirement);

  /**
   * event for updating an asset requirement
   * @param id of the asset to update
   * @param oldRequirement the old requirement to be updated
   * @param newRequirement the new requirement
   */
  event UpdatedAssetRequirement(uint id, uint oldRequirement, uint newRequirement);

  AssetsRequirements previousAssetsRequirements;
  BuildingsData buildingsData;
  BuildingsQueue buildingsQueue;
  UnitsData unitsData;
  UserBuildings userBuildings;

  // Mapping of uint (buildings id) -> uint[] (buildings ids).
  mapping (uint => uint[]) public requirements;


  /*
   * @notice Constructor: Instantiate Assets Requirements contract.
   * @dev Constructor function.
   */
  constructor() public {
  }

  /*
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is Assets Requirements.
   */
  function isAssetsRequirements() external pure returns (bool) {
    return true;
  }

  /*
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous Assets Requirements.
   * @param _previousAssetsRequirements the address of previous Assets Requirements contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setAssetsRequirementsVersion(AssetsRequirements _previousAssetsRequirements, uint _version) external onlyOwner {
    require(_previousAssetsRequirements.isAssetsRequirements());
    require(_version > _previousAssetsRequirements.version());
    previousAssetsRequirements = _previousAssetsRequirements;
    setVersion(_version);
  }

  /*
   * @notice Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setBuildingsData(BuildingsData _buildingsData) external onlyOwner {
    require(_buildingsData.isBuildingsData());
    buildingsData = _buildingsData;
  }

  /*
   * @title Instantiate Buildings Queue contract.
   * @dev Function to provide Buildings Queue address and instantiate it.
   * @param _buildingsQueue the address of Buildings Queue contract. (address)
   */
  function setBuildingsQueue(BuildingsQueue _buildingsQueue) external onlyOwner {
    require(_buildingsQueue.isBuildingsQueue());
    buildingsQueue = _buildingsQueue;
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
   * @notice Instantiate Buildings Data contract.
   * @dev Function to provide Buildings Data address and instantiate it.
   * @param _buildingsData the address of Buildings Data contract. (address)
   */
  function setUnitsData(UnitsData _unitsData) external onlyOwner {
    require(_unitsData.isUnitsData());
    unitsData = _unitsData;
  }

  /*
   * @notice Add new asset with requirements
   * @dev This method create a new Asset Requirement definition that can be used on the game.
   * @param _id (uint)
   * @param _requirements (uint[]) array of requirements for the asset:
   *      class (int32)
   *      level (int32)
   *      typeId (int32)
   */
  function setAssetRequirements(uint _id,
                                uint[] _requirements) external onlyOwner {

    require(_id > 0);
    require(buildingsData.checkBuildingExist(_id) || unitsData.checkUnitExist(_id));
    require(_requirements.length > 0);
    require(requirements[_id].length == 0);

    for (uint i = 0; i < _requirements.length; i++) {
      validateRequirement(_id, _requirements[i]);
    }

    requirements[_id] = _requirements;

    emit SetAssetRequirements(_id, _requirements);
  }

  /*
   * @title Add a specific asset requirement
   * @dev This method is used to add a requirement to an asset
   * @param _id (uint)
   * @param _requirement (uint)
   */
  function addAssetRequirement(uint _id,
                               uint _requirement) external onlyOwner {

    require(_requirement > 0);
    require(_requirement != _id);
    validateRequirement(_id, _requirement);

    bool found = false;
    for (uint i = 0; i < requirements[_id].length; i++) {
      if (requirements[_id][i] == _requirement) {
        found = true;
      }
    }
    require(!found);

    requirements[_id].push(_requirement);

    emit AddedAssetRequirement(_id, _requirement);
  }

  /*
   * @title Remove a specific asset requirement
   * @dev This method is used to remove a requirement from an asset
   * @param _id (uint)
   * @param _requirement (uint)
   */
  function removeAssetRequirement(uint _id,
                                  uint _requirement) external onlyOwner {
    require(_requirement > 0);
    require(_requirement != _id);

    bool found = false;
    uint i = 0;
    while (i < requirements[_id].length && !found) {
      if (requirements[_id][i] == _requirement) {
        found = true;
      } else {
        i++;
      }
    }
    require(found);

    require(shiftRequirement(_id, i));

    emit RemovedAssetRequirement(_id, _requirement);
  }

  /*
   * @title Update a specific asset requirement
   * @dev This method is used to update an asset requirement
   * @param _id (uint)
   * @param _oldRequirement (int32)
   * @param _newRequirement (int32)
   */
  function updateAssetRequirement(uint _id,
                                  uint _oldRequirement,
                                  uint _newRequirement) external onlyOwner {
    require(requirements[_id].length > 0);
    validateRequirement(_id, _newRequirement);

    uint i = 0;
    bool updated = false;
    while (i < requirements[_id].length && !updated) {
      if (requirements[_id][i] == _oldRequirement) {
        requirements[_id][i] = _newRequirement;
        updated = true;
      }
      i++;
    }

    require(updated);

    emit UpdatedAssetRequirement(_id, _oldRequirement, _newRequirement);
  }

  /*
   * @title Check user asset requirements
   * @dev This method is used to check if a user has the requirements for an asset
   * @param _user (address)
   * @param _id (uint)
   */
  function validateUserAssetRequirements(address _user, uint _id) external view returns (bool valid) {
    if (requirements[_id].length == 0) return true;

    uint[] memory userBuildingsIds;
    uint userBuildingsLength;
    (userBuildingsLength, userBuildingsIds) = getUserBuildingsIds(_user);

    uint[] memory buildingsQueueIds;
    uint buildingsQueueLength;
    (buildingsQueueLength, buildingsQueueIds) = getBuildingsQueueIds(_user);

    valid = true;
    bool userBuildingRequirement = false;
    bool buildingsQueueRequirement = false;
    uint i = 0;
    while (i < requirements[_id].length && valid) {
      userBuildingRequirement = checkRequirement(userBuildingsIds, userBuildingsLength, requirements[_id][i]);
      buildingsQueueRequirement = checkRequirement(buildingsQueueIds, buildingsQueueLength, requirements[_id][i]);
      if (!userBuildingRequirement && !buildingsQueueRequirement) {
        valid = false;
      }
      i++;
    }
    return valid;
  }

  /*
   * @title Get User Buildings Ids
   * @dev This method is used to get the buildings in User Buildings that are valid to check requirements.
   * @param _user (address)
   */
  function getUserBuildingsIds(address _user) internal view returns (uint userBuildingsLength, uint[] userBuildingsIds) {
    userBuildingsLength = userBuildings.getUserBuildingsLength(_user);
    userBuildingsIds = new uint[](userBuildingsLength);
    uint id;
    uint diff = 0;
    bool active;
    for (uint index = 0; index < userBuildingsLength; index++) {
      (id, active) = userBuildings.getUserBuildingIdAndStatus(_user, index);
      if (active) {
        userBuildingsIds[index - diff] = id;
      } else {
        bool isInQueue;
        (isInQueue, )= buildingsQueue.findBuildingInQueue(_user, id + 1000, index);
        if (isInQueue) {
          userBuildingsIds[index - diff] = id;
        } else {
          diff++;
        }
      }
    }
    return (userBuildingsLength - diff, userBuildingsIds);
  }

  /*
   * @title Get Buildings Queue Ids
   * @dev This method is used to get the buildings in Buildings Queue that are valid to check requirements.
   * @param _user (address)
   */
  function getBuildingsQueueIds(address _user) internal view returns (uint buildingsQueueLength, uint[] buildingsQueueIds) {
    buildingsQueueLength = buildingsQueue.getBuildingsQueueLength(_user);
    buildingsQueueIds = new uint[](buildingsQueueLength);
    uint id;
    uint index = 0;
    uint endBlock;
    while (index < buildingsQueueLength) {
      (id, endBlock) = buildingsQueue.getBuildingIdAndEndBlock(_user, index);
      if (endBlock < block.number) {
        buildingsQueueIds[index] = id;
      } else {
        buildingsQueueLength = index;
      }
      index++;
    }
    return (buildingsQueueLength, buildingsQueueIds);
  }

  /*
   * @title Check requirement type and level against an array of buildingIds
   * @dev This method is a helper used to check if a user has the requirements for an asset
   * @param _ids (uint[])
   * @param _length (uint) the valid length from the filtered original array
   * @param _requirement (uint)
   */
  function checkRequirement(uint[] _ids, uint _length, uint _requirement) internal pure returns (bool valid) {
    uint i = 0;
    bool found = false;
    /* Loops through _ids until it find a building with the same typeId
     * and then compares if the user level is the same or greater than the requirement level.
     */
    while (i < _length && !found) {
      // Gets the last 3 digits (xxxxx000) of the id (typeId)
      if (_ids[i] % 1000 == _requirement % 1000) {
        found = true;
        // Gets the previous 3 digits (xx000xxx) of the id (level)
        if (((_ids[i] - (_ids[i] % 1000)) / 1000) % 1000 >=
            ((_requirement - (_requirement % 1000)) / 1000) % 1000) {
          valid = true;
        }
      }
      i++;
    }
    return valid;
  }

  /*
  * @title Validates if a specific requirement is valid
  * @dev This method is used to check if a specific requirement is valid
  * @param _id (uint)
  * @param _requirement (uint)
  */
  function validateRequirement(uint _id, uint _requirement) internal view returns (bool valid)  {
    require(_requirement > 0);

    // Require to be a unit or to have a different type id
    require(_id < 1000 || (_id % 1000 != _requirement % 1000));
    require(buildingsData.checkBuildingExist(_requirement));
    return true;
  }

  /*
   * @title Get Requirements
   * @dev Function to get the building requirements.
   * @param _id The id of the building. (uint)
   * @return an array of uints representing the requirements.
   */
  function getRequirements(uint _id) external view returns (uint[]) {
    return requirements[_id];
  }

  /*
   * @notice Shift Requirement.
   * @dev Function to shift one specified building's requirement.
   * @param _id The id of the building. (address)
   * @param _index The index of the requirement to be removed. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function shiftRequirement(uint _id, uint _index) internal returns (bool) {
    for (uint i = _index; i < requirements[_id].length; i++) {
      if (i == requirements[_id].length - 1) {
        delete requirements[_id][requirements[_id].length - 1];
      } else {
        requirements[_id][i] = requirements[_id][i + 1];
      }
    }
    requirements[_id].length -= 1;
    return true;
  }

}
