pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import './BuildingsData.sol';
import './UserVillage.sol';

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
   * @param userAddress the address of the user to add the building
   * @param ids the IDs of the buildings to be added
   */
  event AddUserBuildings(address userAddress, uint[] ids);
  event UpgradeBuilding(address userAddress, uint id, uint index);

  event SetUserVillage(address _userVillage);

  struct Building {
    uint id;
    bool deleted;
  }

  // Mapping of user -> buildings ids (keeps track of owned buildings)
  mapping (address => Building[]) public userBuildings;

  BuildingsData buildingsData;
  UserVillage userVillage;

  function UserBuildings(address _buildingsData) {
    buildingsData = BuildingsData(_buildingsData);
  }

  function setUserVillage(address _userVillage) external onlyOwner {
    userVillage = UserVillage(_userVillage);
    SetUserVillage(_userVillage);
  }


  /**
   * @notice Add new buildings to an user
   * @dev Function to add multiple buildings to a user
   * @param _ids An array of IDs of the buildings to add. (uint)
   * @return A boolean that indicates if the operation was successful.
   */

  function addUserBuildings(address _user, uint[] _ids, uint[] _indexes) external returns (bool) {
    uint length = _ids.length;
    require(_ids.length == _indexes.length);
    for (uint i = 0; i < length; i++) {
      require(_ids[i] >= 0);
      require(buildingsData.checkBuildingExist(_ids[i]));
    }

    for (uint j = 0; j < length; j++) {
      if (_indexes[j] == 0) {
        userBuildings[_user].push(Building(_ids[j], false));
      }

      if (_indexes[j] > 0) {
        userBuildings[_user][_indexes[j]] = Building(_ids[j], false);
      }
    }

    return true;
  }

  /**
   * @notice Get user buildings
   * @dev Gets the buildings of the specified address.
   * @param _user The address to query the buildings of. (address)
   * @return An uint[] representing the array of buildings owned by the passed address.
   */
  function getUserBuildings(address _user) external returns (uint[]) {
    uint length = userBuildings[_user].length;
    uint[] memory buildingIds = new uint[](length);
    for (uint i = 0; i < length; i++) {
      buildingIds[i] = userBuildings[_user][i].id;
    }
    return buildingIds;
  }

  function getIndexForNewBuilding(address _user) external returns (uint) {
    uint index = userBuildings[_user].length + 1;
    return index;
  }

}
