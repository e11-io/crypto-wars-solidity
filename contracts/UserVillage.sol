pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';
import './UserVault.sol';
import './UserResources.sol';
import './UserBuildings.sol';

/**
 * @title UserVillage (WIP)
 * @dev Manages the user village.
 * Aditional funtionality might be added to allow the village to be destroyed,
 * transfered to another user, paused and unpaused.
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/1
 */
contract UserVillage is NoOwner {

	/**
   * @dev event for village creation logging
   * @param owner who created the village
	 * @param name the name of the village
   * @param username the username of the owner
   */
	event VillageCreated(address indexed owner, string name, string username);

	// Mapping of user -> village name (keeps track of owned villages)
	mapping(address => string) public villages;
	// Mapping of username -> user (useful for quick lookup)
	mapping(bytes32 => address) private addreses;

	// Vault contract used to store in-game currency.
	UserVault userVault;
	UserResources userResources;
	UserBuildings userBuildings;
	uint[] initialBuildingsIds = [uint(0),uint(1), uint(2)] ;


	/**
   * @dev UserVillage Constructor
   * @param _userVault The address of the vault used to track user token balances.
   */
	function UserVillage(address _userVault,
											 address _userResources,
											 address _userBuildings) {
		userVault = UserVault(_userVault);
		userResources = UserResources(_userResources);
		userBuildings = UserBuildings(_userBuildings);
	}

	/**
   * @notice Creates a new village
   * @dev Function to create a village
   * @param _name The name of the new village. (Not-Empty)
   * @param _username The name of the new user. (Not-Empty Unique)
   */
  function create(string _name, string _username) external {
    require(keccak256(_name) != keccak256("")); // 'invalid_village_name'
    require(keccak256(_username) != keccak256("")); // 'invalid_user_name'
		require(keccak256(villages[msg.sender]) == keccak256("")); // 'user_already_has_village'
		require(addreses[keccak256(_username)] == address(0)); // 'user_name_already_in_use'

		// Check and Transfer user's token.
		require(userVault.add(msg.sender, 1 ether)); // 'could_not_transfer_tokens'
		require(userResources.initUserResources(msg.sender));
		require(userBuildings.addUserBuildings(msg.sender, initialBuildingsIds));

		villages[msg.sender] = _name;
		addreses[keccak256(_username)] = msg.sender;
		VillageCreated(msg.sender, _name, _username);
  }

}
