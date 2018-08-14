pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import './UserBuildings.sol';
import './UserVillage.sol';
import '../assets/buildings/BuildingsQueue.sol';
import '../assets/units/UnitsQueue.sol';
import '../system/PointsSystem.sol';
import '../system/BattleSystem.sol';
import '../Versioned.sol';

/*
 * @title UserResources (WIP)
 * @notice This contract handles the user resources.
 * @dev Keeps track of users active resources.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/6
 */
contract UserResources is NoOwner, Versioned {
	using SafeMath for uint256;

	/*
   * @event Event for initializing user resources.
   * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
   */
	event InitUserResources(address indexed _user,
		 											uint _gold,
													uint _crystal,
													uint _quantumDust);

	/*
	 * @event Event for giving resources to a user.
	 * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum dust.
	 */
  event GiveResourcesToUser(address indexed _user,
													  uint _gold,
													  uint _crystal,
													  uint _quantumDust);

  /*
	 * @event Event for taking resources from a user.
	 * @param _user who loses the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum dust.
	 */
  event TakeResourcesFromUser(address indexed _user,
  													  uint _gold,
  													  uint _crystal,
  													  uint _quantumDust);

	/*
	 * @event Event for consuming user gold.
	 * @param _user The user to consume gold from.
	 * @param _price the amount of gold.
	 */
  event ConsumeGold(address indexed _user, uint _price);

	/*
	 * @event Event for consuming user crystal.
	 * @param _user The user to consume crystal from.
	 * @param _price the amount of crystal.
	 */
  event ConsumeCrystal(address indexed _user, uint _price);

	/*
	 * @event Event for consuming user quantum.
	 * @param _user The user to consume quantum from.
	 * @param _price the amount of quantum.
	 */
  event ConsumeQuantum(address indexed _user, uint _price);

	/*
	 * @event Event for paying out resources to user.
	 * @param _gold The amount of gold the user generated and will receive.
	 * @param _crystal The amount of crystal the user generated and will receive.
	 */
	event PayoutResources(uint _gold, uint _crystal);

	/*
	 * @event Event for seting initial resources of user.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
	 */
	event SetInitialResources(uint _gold, uint _crystal, uint _quantumDust);

	uint initialGold = 0;
	uint initialCrystal = 0;
	uint initialQuantumDust = 0;

	struct Resources {
		bool initialized;
		uint gold;
		uint crystal;
		uint quantumDust;
	}

	// Mapping of user -> resources (keeps track of owned resources).
	mapping (address => Resources) public usersResources;

	// Mapping of user -> last payout block (keeps track of the last block where the user was paid).
	mapping (address => uint) public usersPayoutBlock;

  UserResources previousUserResources;

  BattleSystem battleSystem;
	BuildingsQueue buildingsQueue;
  PointsSystem pointsSystem;
	UnitsQueue unitsQueue;
	UserBuildings userBuildings;
	UserVillage userVillage;

	/**
	 * @notice Constructor: Instantiate User Resources contract.
	 * @dev Constructor function.
	 */
	constructor() public {
	}

	/**
	 * @notice Makes the contract type verifiable.
	 * @dev Function to prove the contract is User Resources.
	 */
	function isUserResources() external pure returns (bool) {
		return true;
	}

	/**
	 * @notice Sets the contract's version and instantiates the previous version contract.
	 * @dev Function to set the contract version and instantiate the previous User Resources.
	 * @param _previousUserResources the address of previous User Resources contract. (address)
	 * @param _version the current contract version number. (uint)
	 */
	function setUserResourcesVersion(UserResources _previousUserResources, uint _version) external onlyOwner {
		require(_previousUserResources.isUserResources());
		require(_version > _previousUserResources.version());
		previousUserResources = _previousUserResources;
		setVersion(_version);
	}

	/*
   * @title Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
	function setUserVillage(UserVillage _userVillage) external onlyOwner {
		require(_userVillage.isUserVillage());
		userVillage = _userVillage;
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
   * @title Instantiate Units Queue contract.
   * @dev Function to provide Units Queue address and instantiate it.
   * @param _unitsQueue the address of Units Queue contract. (address)
   */
	function setUnitsQueue(UnitsQueue _unitsQueue) external onlyOwner {
		require(_unitsQueue.isUnitsQueue());
		unitsQueue = _unitsQueue;
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
   * @title Initiate user resources.
   * @dev Function to add the initial resources to a new user.
   * @param _user address of the user to give the resources. (address)
	 * @return A boolean that indicates if the operation was successful.
   */
	function initUserResources(address _user) external returns (bool) {
		require(msg.sender == address(userVillage) || msg.sender == owner);
		require(!usersResources[_user].initialized);

		usersResources[_user].initialized = true;
		usersResources[_user].gold = initialGold;
		usersResources[_user].crystal = initialCrystal;
		usersResources[_user].quantumDust = initialQuantumDust;

		emit InitUserResources(_user, initialGold, initialCrystal, initialQuantumDust);
		return true;
	}

	/*
   * @title Get user resources.
   * @dev Function that returns the user resources amount.
   * @param _user address of the user to get the resources from.
   */
	function getUserResources(address _user) external view returns (uint gold,
																																	uint crystal,
																																	uint quantumDust) {
		return (usersResources[_user].gold,
						usersResources[_user].crystal,
						usersResources[_user].quantumDust);
	}

	/*
   * @title Set initial resources.
   * @dev Function to set the initial amount of each resource.
   * @param _gold the initial amount of gold a user will receive. (uint)
   * @param _crystal the initial amount of crystal a user will receive. (uint)
   * @param _quantumDust the initial amount of quantumDust a user will. receive (uint)
   */
	function setInitialResources(uint _gold,
															 uint _crystal,
															 uint _quantumDust) external onlyOwner {
	 if (_gold >= 0 && initialGold != _gold) {
     initialGold = _gold;
   }
	 if (_crystal >= 0 && initialCrystal != _crystal) {
     initialCrystal = _crystal;
   }
	 if (_quantumDust >= 0 && initialQuantumDust != _quantumDust) {
     initialQuantumDust = _quantumDust;
   }

	 emit SetInitialResources(_gold, _crystal, _quantumDust);
	}

	/*
   * @title Consume user's Gold.
   * @dev Function to consume an amount of gold from a user.
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of gold to be consumed. (uint)
   */
	function consumeGold(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(battleSystem) ||
						msg.sender == address(buildingsQueue) ||
						msg.sender == address(unitsQueue) ||
						msg.sender == owner);
		payoutResources(_user);
		require(usersResources[_user].gold >= _price);
		usersResources[_user].gold = SafeMath.sub(usersResources[_user].gold, _price);
		if (_price > 0) {
			pointsSystem.addPointsToUser(_user, _price);
		}
		emit ConsumeGold(_user, _price);

		return true;
	}

	/*
   * @title Consume user's Crystal.
   * @dev Function to consume an amount of crystal from a user.
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of crystal to be consumed. (uint)
   */
	function consumeCrystal(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(battleSystem) ||
						msg.sender == address(buildingsQueue) ||
						msg.sender == address(unitsQueue) ||
						msg.sender == owner);
		payoutResources(_user);
		require(usersResources[_user].crystal >= _price);
		usersResources[_user].crystal = SafeMath.sub(usersResources[_user].crystal, _price);
		if (_price > 0) {
			pointsSystem.addPointsToUser(_user, _price);
		}

		emit ConsumeCrystal(_user, _price);

		return true;
	}

	/*
   * @title Consume user's Quantum Dust.
   * @dev Function to consume an amount of quantum dust from a user.
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of quantum dust to be consumed. (uint)
   */
	function consumeQuantumDust(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue) ||
						msg.sender == address(unitsQueue) ||
						msg.sender == owner);
		require(usersResources[_user].quantumDust >= _price);
		usersResources[_user].quantumDust = SafeMath.sub(usersResources[_user].quantumDust, _price);
		if (_price > 0) {
			pointsSystem.addPointsToUser(_user, _price);
		}

		emit ConsumeQuantum(_user, _price);

		return true;
	}

	/*
   * @title Take Resources From User.
   * @dev Function to take the specified resources from the user.
	 * @param _user who loses the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
   */
	function takeResourcesFromUser(address _user,
  															 uint _gold,
  															 uint _crystal,
  															 uint _quantumDust) public {

		require(msg.sender == owner ||
						msg.sender == address(battleSystem));


		if (_gold > 0) {
			usersResources[_user].gold = usersResources[_user].gold.sub(_gold);
		}
		if (_crystal > 0) {
      usersResources[_user].crystal = usersResources[_user].crystal.sub(_crystal);
		}
    if (_quantumDust > 0) {
      usersResources[_user].quantumDust = usersResources[_user].quantumDust.sub(_quantumDust);
    }

		emit TakeResourcesFromUser(_user, _gold, _crystal, _quantumDust);
	}

  /*
   * @title Give Resources To User.
   * @dev Function give the specified resources to the user.
	 * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
   */
	function giveResourcesToUser(address _user,
															 uint _gold,
															 uint _crystal,
															 uint _quantumDust) public {

		require(msg.sender == owner ||
						msg.sender == address(battleSystem) ||
						msg.sender == address(buildingsQueue) ||
						msg.sender == address(unitsQueue) ||
						msg.sender == address(userBuildings));

		uint goldCapacity = 0;
		uint crystalCapacity = 0;
		(goldCapacity, crystalCapacity) = calculateUserResourcesCapacity(_user);

		uint goldGiven = 0;
		uint crystalGiven = 0;

		if (_gold > 0) {
			uint totalAddedGold = usersResources[_user].gold.add(_gold);
			goldGiven = (totalAddedGold < goldCapacity) ? _gold : (_gold - (totalAddedGold - goldCapacity));
			usersResources[_user].gold = (totalAddedGold < goldCapacity) ? totalAddedGold : goldCapacity;
		}

		if (_crystal > 0) {
			uint totalAddedCrystal = usersResources[_user].crystal.add(_crystal);
			crystalGiven = (totalAddedCrystal < crystalCapacity) ? _crystal : (_crystal - (totalAddedCrystal - crystalCapacity));
			usersResources[_user].crystal = (totalAddedCrystal < crystalCapacity) ? totalAddedCrystal : crystalCapacity;
		}

		usersResources[_user].quantumDust += _quantumDust;

		emit GiveResourcesToUser(_user, goldGiven, crystalGiven, _quantumDust);
	}

	/*
   * @title Initialize User Payout Block.
   * @dev Function to initialize the payout block when creating a new user/village.
	 * Only callable from User Village contract.
	 * @param _user The new user.
   */
	function initPayoutBlock(address _user) external {
		require(msg.sender == address(userVillage) || msg.sender == owner);
		usersPayoutBlock[_user] = block.number;
	}

	/*
   * @title Payout Resources.
   * @dev Function to payout the user the resources generated since previous payout.
	 * @param _user The user to calculate and receive the payout.
   */
	function payoutResources(address _user) public {
	  uint256 diff = SafeMath.sub(block.number, usersPayoutBlock[_user]);

		if (diff > 0) {
			uint gold = 0;
			uint crystal = 0;

			(gold, crystal) = calculateUserResources(_user);

			giveResourcesToUser(_user, gold, crystal, 0);

			usersPayoutBlock[_user] = block.number;

			emit PayoutResources(gold, crystal);
		}
	}

	/*
   * @title Calculate User Resources.
   * @dev Function to calculate the resources generated in buildings queue and user buildings.
	 * @param _user The user to calculate the resources.
   */

	function calculateUserResources(address _user) public view returns (uint userGold, uint userCrystal) {
		uint256 diff = SafeMath.sub(block.number, usersPayoutBlock[_user]);

		if (diff > 0) {
			uint goldRate = 0;
			uint crystalRate = 0;

			(goldRate, crystalRate) = userBuildings.getUserRates(_user);

			(userGold, userCrystal) = buildingsQueue.getUserQueueResources(_user);

			userGold = SafeMath.add(userGold, SafeMath.mul(goldRate, diff));
			userCrystal = SafeMath.add(userCrystal, SafeMath.mul(crystalRate, diff));
		}

		return (userGold, userCrystal);
	}

	/*
   * @title Calculate User Resources.
   * @dev Function to calculate the resources generated in buildings queue and user buildings.
	 * @param _user The user to calculate the resources.
   */

	function calculateUserResourcesCapacity(address _user) public view returns (uint goldCapacity, uint crystalCapacity) {
		uint queueGoldCapacity = 0;
		uint queueCyrstalCapacity = 0;

		(goldCapacity, crystalCapacity) = userBuildings.getUserResourcesCapacity(_user);

		(queueGoldCapacity, queueCyrstalCapacity) = buildingsQueue.getUserResourcesCapacity(_user);

		goldCapacity = SafeMath.add(goldCapacity, queueGoldCapacity);
		crystalCapacity = SafeMath.add(crystalCapacity, queueCyrstalCapacity);

		return (goldCapacity, crystalCapacity);
	}

	/*
   * @title Get User Payout Block.
   * @dev Function to get the last payout block number of that user.
	 * @param _user The user to calculate and receive the payout.
	 * @return a uint representing the number of the block where the user was paid.
   */
	function getUserPayoutBlock(address _user) external view returns (uint) {
		return usersPayoutBlock[_user];
	}

	/*
   * @title Get Total User Resources.
	 * @dev Function that returns the user resources amount, taking into account
	 * the queued resources.
   * @param _user address of the user to get the resources from.
	 * @return array of uint representing resources (uint[])
   */
	function getTotalUserResources(address _user) external view returns (uint[]) {
		uint gold = 0;
    uint goldCapacity = 0;
		uint crystal = 0;
		uint crystalCapacity = 0;
		(gold, crystal) = calculateUserResources(_user);
    (goldCapacity, crystalCapacity) = calculateUserResourcesCapacity(_user);

    uint[] memory resources = new uint[](3);

		resources[0] = gold + usersResources[_user].gold;
    resources[0] = resources[0] > goldCapacity? goldCapacity : resources[0];

		resources[1] = crystal + usersResources[_user].crystal;
    resources[1] = resources[1] > crystalCapacity? crystalCapacity : resources[1];

		resources[2] = usersResources[_user].quantumDust;

    return resources;
	}

}
