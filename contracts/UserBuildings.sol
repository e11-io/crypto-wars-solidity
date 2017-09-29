pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';

/**
 * @title UserBuildings (WIP)
 * @notice This contract set which buildings belongs to an user.
 * @dev Keeps track of users active buildings.
 * Aditional funtionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/3
 */
contract UserBuildings is NoOwner {

  /**
   * @dev event for adding a building to a user logging
   * @param userAddress the address of the user to add the building
   * @param buildingId the id of the building to be added
   */
  event AddUserBuilding(address userAddress, uint buildingId);

  // Mapping of user -> buildings ids (keeps track of owned buildings)
  mapping (address => uint[]) userBuildings;

  /**
   * @notice Add new building to an user
   * @dev Function to add a building
   * @param _buildingId The ID of the building to add. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function addUserBuilding(uint _buildingId) public returns (bool) {
    // TODO require check if valid
    userBuildings[msg.sender].push(_buildingId);
    AddUserBuilding(msg.sender, _buildingId);
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
