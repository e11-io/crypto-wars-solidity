pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './BuildingsData.sol';
import './UserVillage.sol';

/**
 * @title UserBuildings (WIP)
 * @notice This contract set which buildings belongs to an user.
 * @dev Keeps track of users active buildings.
 * Aditional funtionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/3
 */
contract UserBuildings is NoOwner {

  /**
   * event for adding multiple buildings to a user logging
   * @param userAddress the address of the user to add the building
   * @param ids the IDs of the buildings to be added
   */
  event AddUserBuildings(address userAddress, uint[] ids);

  // Mapping of user -> buildings ids (keeps track of owned buildings)
  mapping (address => uint[]) public userBuildings;

  BuildingsData buildingsData;
  UserVillage userVillage;

  function UserBuildings(address _buildingsData) {
    buildingsData = BuildingsData(_buildingsData);
  }

  function setUserVillage(address _userVillage) external onlyOwner {
    userVillage = UserVillage(_userVillage);
  }


  /**
   * @notice Add new buildings to an user
   * @dev Function to add multiple buildings to a user
   * @param _ids An array of IDs of the buildings to add. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function addUserBuildings(address _user, uint[] _ids) external returns (bool) {
    require(msg.sender == address(userVillage));
    for (uint i = 0; i < _ids.length; i++) {
      require(_ids[i] >= 0);
      require(buildingsData.checkBuildingExist(_ids[i]));
    }
    for (uint j = 0; j < _ids.length; j++) {
      userBuildings[_user].push(_ids[j]);
    }
    AddUserBuildings(_user, _ids);
    return true;
  }

  /**
   * @notice Get user buildings
   * @dev Gets the buildings of the specified address.
   * @param _user The address to query the buildings of. (address)
   * @return An uint[] representing the array of buildings owned by the passed address.
   */
  function getUserBuildings(address _user) external returns (uint[]) {
    return userBuildings[_user];
  }

}
