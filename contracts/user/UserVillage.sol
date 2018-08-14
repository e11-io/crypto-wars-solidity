pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import './UserBuildings.sol';
import './UserResources.sol';
import './UserUnits.sol';
import './UserVault.sol';
import '../assets/buildings/BuildingsData.sol';
import '../system/BattleSystem.sol';
import '../system/PointsSystem.sol';
import '../Versioned.sol';

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
	// Mapping of address -> username (useful for quick lookup)
	mapping(address => string) public usernames;

	// Vault contract used to store in-game currency.
	uint[] initialBuildingsIds;

  UserVillage previousUserVillage;

	BattleSystem battleSystem;
	BuildingsData buildingsData;
	PointsSystem pointsSystem;
	UserBuildings userBuildings;
	UserResources userResources;
	UserUnits userUnits;
	UserVault userVault;

	/**
   * @dev Constructor: Instantiate User Village contract.
   */
	constructor() public {
	}

	/**
	 * @notice Makes the contract type verifiable.
	 * @dev Function to prove the contract is User Village.
	 */
	function isUserVillage() external pure returns (bool) {
		return true;
	}

	/**
   * @notice Instantiate Battle System contract.
   * @dev Function to provide Battle System address and instantiate it.
   * @param _battleSystem the address of Battle System contract. (address)
   */
  function setBattleSystem(BattleSystem _battleSystem) external onlyOwner {
    require(_battleSystem.isBattleSystem());
    battleSystem = _battleSystem;
  }

	/**
	 * @notice Sets the contract's version and instantiates the previous version contract.
	 * @dev Function to set the contract version and instantiate the previous User Village.
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
   * @title Instantiate Points System contract.
   * @dev Function to provide Points System address and instantiate it.
   * @param _pointsSystem the address of Points System contract. (address)
   */
	function setPointsSystem(PointsSystem _pointsSystem) external onlyOwner {
		require(_pointsSystem.isPointsSystem());
		pointsSystem = _pointsSystem;
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
   * @notice Instantiate User Units contract.
   * @dev Function to provide User Units address and instantiate it.
   * @param _userUnits the address of User Units contract. (address)
   */
  function setUserUnits(UserUnits _userUnits) external onlyOwner {
    require(_userUnits.isUserUnits());
    userUnits = _userUnits;
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
		bytes32 _nameBytes = stringToBytes32(_name);
    require(_nameBytes != 0x0);

		bytes32 _usernameBytes = stringToBytes32(_username);
    require(_usernameBytes != 0x0);

		bytes32 _villageNameBytes = stringToBytes32(villages[msg.sender]);
    require(_villageNameBytes == 0x0);

		require(addresses[_usernameBytes] == address(0)); // 'user_name_already_in_use'
		usernames[msg.sender] = _username;

		// Check and Transfer user's token.
		require(userVault.add(msg.sender, 1 ether)); // 'could_not_transfer_tokens'
		require(userResources.initUserResources(msg.sender));
		userResources.initPayoutBlock(msg.sender);
		require(userBuildings.addInitialBuildings(msg.sender, initialBuildingsIds));

		villages[msg.sender] = _name;
		addresses[_usernameBytes] = msg.sender;
		emit VillageCreated(msg.sender, _name, _username);
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

	/**
   * @notice User Has Villabe
   * @dev Function to know if a user has a village.
   * @param _user the address of the user.
	 * @return bool
   */
	function hasVillage(address _user) public view returns (bool) {
		bytes32 _villageNameBytes = stringToBytes32(villages[_user]);
    return (_villageNameBytes != 0x0);
	}

	/**
   * @notice String to bytes 32
   * @dev Helper to convert a string to a bytes32
   * @param _string the string to convert
	 * @return bytes32
   */
	function stringToBytes32(string memory _string) internal pure returns (bytes32 result) {
    bytes memory tempEmptyStringTest = bytes(_string);
    if (tempEmptyStringTest.length == 0) {
      return 0x0;
    }

    assembly {
      result := mload(add(_string, 32))
    }
	}

	/**
   * @notice Get User Info
   * @dev Will get all info of a user.
   * @param _user the address of the user.
	 * @return username, villageName, unitsIds, unitsQuantities, battleStats,
	 * resources, and canAttack.
   */
	function getUserInfo(address _user) public view returns (string username,
            																							 string villageName,
            																							 uint[] unitsIds,
            																							 uint[] unitsQuantities,
            																							 uint[] battleStats,
            																							 uint[] resources,
            																							 bool canAttack,
																													 bool canTakeRevenge) {
		username = usernames[_user];
		villageName = villages[_user];
		(unitsIds, unitsQuantities) = userUnits.getTotalUserUnitsAndQuantities(_user);
		battleStats = userUnits.getTotalBattleStats(_user);
		resources = userResources.getTotalUserResources(_user);
		canAttack = pointsSystem.canAttack(msg.sender, _user);
		canTakeRevenge = battleSystem.canAttackByRevenge(msg.sender, _user);
	}
}
