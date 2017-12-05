pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './BuildingsQueue.sol';
import './UserBuildings.sol';
import './UserVillage.sol';

/*
 * @title UserResources (WIP)
 * @notice This contract handles the user resources.
 * @dev Keeps track of users active resources.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/6
 */
contract UserResources is NoOwner {

	/*
   * @event Event for initializing user resources.
   * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
   */
	event InitUserResources(address _user,
		 											uint _gold,
													uint _crystal,
													uint _quantumDust);

	/*
	 * @event Event for giving resources to a user.
	 * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
	 */
  event GiveResourcesToUser(address _user,
													  uint _gold,
													  uint _crystal,
													  uint _quantumDust);

	/*
	 * @event Event for consuming user gold.
	 * @param _user The user to consume gold from.
	 * @param _price the amount of gold.
	 */
  event ConsumeGold(address _user, uint _price);

	/*
	 * @event Event for consuming user crystal.
	 * @param _user The user to consume crystal from.
	 * @param _price the amount of crystal.
	 */
  event ConsumeCrystal(address _user, uint _price);

	/*
	 * @event Event for consuming user quantum.
	 * @param _user The user to consume quantum from.
	 * @param _price the amount of quantum.
	 */
  event ConsumeQuantum(address _user, uint _price);

	event PayoutResources(uint _goldRate, uint _crystalRate, uint _queueGold, uint _queueCrystal);

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

	UserVillage userVillage;
	BuildingsQueue buildingsQueue;
	UserBuildings userBuildings;

	/*
   * @title Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
	function setUserVillage(address _userVillage) external onlyOwner {
		userVillage = UserVillage(_userVillage);
	}

	/*
   * @title Instantiate Buildings Queue contract.
   * @dev Function to provide Buildings Queue address and instantiate it.
   * @param _buildingsQueue the address of Buildings Queue contract. (address)
   */
	function setBuildingsQueue(address _buildingsQueue) external onlyOwner {
		buildingsQueue = BuildingsQueue(_buildingsQueue);
	}

	/*
   * @title Instantiate User Buildings contract.
   * @dev Function to provide User Buildings address and instantiate it.
   * @param _userBuildings the address of User Buildings contract. (address)
   */
	function setUserBuildings(address _userBuildings) external onlyOwner {
		userBuildings = UserBuildings(_userBuildings);
	}

	/*
   * @title Initiate user resources.
   * @dev Function to add the initial resources to a new user.
   * @param _user address of the user to give the resources. (address)
	 * @return A boolean that indicates if the operation was successful.
   */
	function initUserResources(address _user) external returns (bool) {
		require(msg.sender == address(userVillage));
		require(!usersResources[_user].initialized);

		usersResources[_user].initialized = true;
		usersResources[_user].gold = initialGold;
		usersResources[_user].crystal = initialCrystal;
		usersResources[_user].quantumDust = initialQuantumDust;

		InitUserResources(_user, initialGold, initialCrystal, initialQuantumDust);
		return true;
	}

	/*
   * @title Get user resources.
   * @dev Function that returns the user resources amount.
   * @param _user address of the user to give the resources. (address)
   */
	function getUserResources(address _user) external returns (uint gold,
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

	 SetInitialResources(_gold, _crystal, _quantumDust);
	}

	/*
   * @title Consume user's Gold.
   * @dev Function to consume an amount of gold from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of gold to be consumed. (uint)
   */
	function consumeGold(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		payoutResources(_user);
		require(usersResources[_user].gold >= _price);
		usersResources[_user].gold = SafeMath.sub(usersResources[_user].gold, _price);

		ConsumeGold(_user, _price);

		return true;
	}

	/*
   * @title Consume user's Crystal.
   * @dev Function to consume an amount of crystal from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of crystal to be consumed. (uint)
   */
	function consumeCrystal(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		payoutResources(_user);
		require(usersResources[_user].crystal >= _price);
		usersResources[_user].crystal = SafeMath.sub(usersResources[_user].crystal, _price);

		ConsumeCrystal(_user, _price);

		return true;
	}

	/*
   * @title Consume user's Quantum Dust.
   * @dev Function to consume an amount of quantum dust from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of quantum dust to be consumed. (uint)
   */
	function consumeQuantumDust(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		require(usersResources[_user].quantumDust >= _price);
		usersResources[_user].quantumDust = SafeMath.sub(usersResources[_user].quantumDust, _price);

		ConsumeQuantum(_user, _price);

		return true;
	}

	/*
   * @title Give Resources To User.
   * @dev Function give the specified resources to the user. Only callable from Buildings Queue or User Buildings
	 * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
   */
	function giveResourcesToUser(address _user,
															 uint _gold,
															 uint _crystal,
															 uint _quantumDust) external {
		require(msg.sender == owner ||
						msg.sender == address(buildingsQueue) ||
						msg.sender == address(userBuildings));
		require(_gold >= 0);
		require(_crystal >= 0);
		require(_quantumDust >= 0);
		usersResources[_user].gold += _gold;
		usersResources[_user].crystal += _crystal;
		usersResources[_user].quantumDust += _quantumDust;

		GiveResourcesToUser(_user, _gold, _crystal, _quantumDust);
	}

	/*
   * @title Initialize User Payout Block.
   * @dev Function to initialize the payout block when creating a new user/village.
	 * Only callable from User Village contract.
	 * @param _user The new user.
   */
	function initPayoutBlock(address _user) external returns (bool) {
		require(msg.sender == address(userVillage));
		usersPayoutBlock[_user] = block.number;
		return true;
	}

	/*
   * @title Payout Resources.
   * @dev Function to payout the user the resources generated since previous payout.
	 * @param _user The user to calculate and receive the payout.
   */
	function payoutResources(address _user) public {
	  uint256 diff = SafeMath.sub(block.number, usersPayoutBlock[_user]);

		if (diff > 0) {
			uint goldRate = 0;
			uint crystalRate = 0;

			(goldRate, crystalRate) = userBuildings.getUserRates(_user);

			if (goldRate > 0) {
				usersResources[_user].gold = SafeMath.add(
					usersResources[_user].gold, SafeMath.mul(goldRate, diff)
					);
			}
			if (crystalRate > 0) {
				usersResources[_user].crystal = SafeMath.add(
					usersResources[_user].crystal, SafeMath.mul(crystalRate, diff)
				);
			}

			uint gold = 0;
			uint crystal = 0;

			(gold, crystal) = buildingsQueue.getUserQueueResources(_user);

			if (gold > 0) {
				usersResources[_user].gold = SafeMath.add(
					usersResources[_user].gold, gold
					);
			}
			if (crystal > 0) {
				usersResources[_user].crystal = SafeMath.add(
					usersResources[_user].crystal, crystal
				);
			}

			usersPayoutBlock[_user] = block.number;

			PayoutResources(goldRate, crystalRate, gold, crystal);
		}
	}

	/*
   * @title Get User Payout Block.
   * @dev Function to get the last payout block number of that user.
	 * @param _user The user to calculate and receive the payout.
	 * @return a uint representing the number of the block where the user was paid.
   */
	function getUserPayoutBlock(address _user) external returns (uint) {
		return usersPayoutBlock[_user];
	}

}
