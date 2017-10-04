pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './UserVillage.sol';


contract UserResources is NoOwner {

	event InitUserResources(address _user,
		 											uint gold,
													uint crystal,
													uint quantumDust);

	uint initialGold = 0;
	uint initialCrystal = 0;
	uint initialQuantumDust = 0;

	struct Resources {
		bool initialized;
		uint gold;
		uint crystal;
		uint quantumDust;
	}

	mapping (address => Resources) public usersResources;

	UserVillage userVillage;

	function setUserVillageAddress(address _userVillage) external onlyOwner {
		userVillage = UserVillage(_userVillage);
	}

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

	function getUserResources(address _user) external returns (uint[3]) {
		Resources storage r = usersResources[_user];
		return ([r.gold, r.crystal, r.quantumDust]);
	}

	function setInitialResources(uint _gold,
															 uint _crystal,
															 uint _quantumDust
															 ) external onlyOwner {
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
}
