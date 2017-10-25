pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './UserVillage.sol';
import './BuildingsQueue.sol';

/**
 * @title UserResources (WIP)
 * @notice This contract handles the user resources.
 * @dev Keeps track of users active resources.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/6
 */
contract UserResources is NoOwner {

	/**
   * @dev Event for initiating user resources logging.
   * @param user who receives the resources.
	 * @param gold the amount of gold.
	 * @param crystal the amount of crystal.
	 * @param quantumDust the amount of quantum Dust.
   */
	event InitUserResources(address user,
		 											uint gold,
													uint crystal,
													uint quantumDust);

	/**
	 * @dev Event for giving resources to a user logging.
	 * @param _user who receives the resources.
	 * @param _gold the amount of gold.
	 * @param _crystal the amount of crystal.
	 * @param _quantumDust the amount of quantum Dust.
	 */
  event GiveResourcesToUser(address _user,
													  uint _gold,
													  uint _crystal,
													  uint _quantumDust);

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

	UserVillage userVillage;
	BuildingsQueue buildingsQueue;

	/**
   * @notice Instantiate User Village contract.
   * @dev Function to provide User Village address and instantiate it.
   * @param _userVillage the address of User Village contract. (address)
   */
	function setUserVillageAddress(address _userVillage) external onlyOwner {
		userVillage = UserVillage(_userVillage);
	}

	function setBuildingsQueue(address _buildingsQueue) external onlyOwner {
		buildingsQueue = BuildingsQueue(_buildingsQueue);
	}

	/**
   * @notice Initiate user resources.
   * @dev Function to add the initial resources to a new user.
   * @param _user address of the user to give the resources. (address)
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

	/**
   * @notice Get user resources.
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

	/**
   * @notice Set initial resources.
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
	}

	/**
   * @notice Consume user's Gold.
   * @dev Function to consume an amount of gold from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of gold to be consumed. (uint)
   */
	function consumeGold(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		require(usersResources[_user].gold >= _price);
		usersResources[_user].gold = SafeMath.sub(usersResources[_user].gold, _price);
		return true;
	}

	/**
   * @notice Consume user's Crystal.
   * @dev Function to consume an amount of crystal from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of crystal to be consumed. (uint)
   */
	function consumeCrystal(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		require(usersResources[_user].crystal >= _price);
		usersResources[_user].crystal = SafeMath.sub(usersResources[_user].crystal, _price);
		return true;
	}

	/**
   * @notice Consume user's Quantum Dust.
   * @dev Function to consume an amount of quantum dust from a user. Only callable from BuildingsQueue
   * @param _user the user that is going to consume the resource. (address)
   * @param _price the amount of quantum dust to be consumed. (uint)
   */
	function consumeQuantumDust(address _user, uint _price) external returns (bool) {
		require(msg.sender == address(buildingsQueue));
		require(usersResources[_user].quantumDust >= _price);
		usersResources[_user].quantumDust = SafeMath.sub(usersResources[_user].quantumDust, _price);
		return true;
	}

	function giveResourcesToUser(address _user,
															 uint _gold,
															 uint _crystal,
															 uint _quantumDust) external onlyOwner {
		require(_gold >= 0);
		require(_crystal >= 0);
		require(_quantumDust >= 0);
		usersResources[_user].gold = _gold;
		usersResources[_user].crystal = _crystal;
		usersResources[_user].quantumDust = _quantumDust;

		GiveResourcesToUser(_user, _gold, _crystal, _quantumDust);
	}

}
