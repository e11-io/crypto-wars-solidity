pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './UserBuildings.sol';
import './UserResources.sol';
import './UserVault.sol';
import './BuildingsData.sol';
import './Versioned.sol';

/**
 * @title UserVillage (WIP)
 * @dev Manages the user village.
 * Additional functionality might be added to allow the village to be destroyed,
 * transferred to another user, paused and un-paused.
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/1
 */
contract UserVillage is NoOwner, Versioned {

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
	mapping(bytes32 => address) public addresses;

	// Vault contract used to store in-game currency.
	uint[] initialBuildingsIds;

	BuildingsData buildingsData;
	UserVillage previousUserVillage;
	UserBuildings userBuildings;
	UserResources userResources;
	UserVault userVault;

	/**
   * @dev UserVillage Constructor: Instantiate User Village contract.
   */
	function UserVillage() public {
	}

	/**
	 * @notice Makes the contract type verifiable.
	 * @dev Function to prove the contract is User Village.
	 */
	function isUserVillage() external pure returns (bool) {
		return true;
	}

	/**
	 * @notice Sets the contract's version and instantiates the previous version contract.
	 * @dev Function to set the contract version and instantiate the previous User Buildings.
	 * @param _previousUserVillage the address of previous User Village contract. (address)
	 * @param _version the current contract version number. (uint)
	 */
	function setUserVillageVersion(UserVillage _previousUserVillage, uint _version) external onlyOwner {
		require(_previousUserVillage.isUserVillage());
		require(_version > _previousUserVillage.version());
		previousUserVillage = _previousUserVillage;
		setVersion(_version);
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

	/*
   * @title Instantiate User Buildings contract.
   * @dev Function to provide User Buildings address and instantiate it.
   * @param _userBuildings the address of User Buildings contract. (address)
   */
	function setUserBuildings(UserBuildings _userBuildings) external onlyOwner {
		require(_userBuildings.isUserBuildings());
		userBuildings = _userBuildings;
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
   * @notice Instantiate User Vault contract.
   * @dev Function to provide User Vault address and instantiate it.
   * @param _userVault the address of User Vault contract. (address)
   */
  function setUserVault(UserVault _userVault) external onlyOwner {
    require(_userVault.isUserVault());
    userVault = _userVault;
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
		require(addresses[keccak256(_username)] == address(0)); // 'user_name_already_in_use'

		// Check and Transfer user's token.
		require(userVault.add(msg.sender, 1 ether)); // 'could_not_transfer_tokens'
		require(userResources.initUserResources(msg.sender));
		userResources.initPayoutBlock(msg.sender);
		require(userBuildings.addInitialBuildings(msg.sender, initialBuildingsIds));

		villages[msg.sender] = _name;
		addresses[keccak256(_username)] = msg.sender;
		VillageCreated(msg.sender, _name, _username);
  }

	/**
   * @notice Set Initial Buildings
   * @dev Function to set the array with the initial buildings ids.
   * @param _ids The ids of the buildings (uint[])
   */
	function setInitialBuildings(uint[] _ids) external onlyOwner {
		if (_ids.length > 0) {
			for (uint i = 0; i < _ids.length; i++) {
				require(buildingsData.checkBuildingExist(_ids[i]));
			}
		}

		initialBuildingsIds = _ids;
	}

}
