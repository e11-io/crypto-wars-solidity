pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import '../assets/buildings/BuildingsQueue.sol';
import '../assets/units/UnitsData.sol';
import '../assets/units/UnitsQueue.sol';
import '../system/PointsSystem.sol';
import '../user/UserResources.sol';
import '../user/UserUnits.sol';
import '../user/UserVillage.sol';
import '../Versioned.sol';

/**
 * @title BattleSystem (WIP)
 * @notice This contract will be in charge of the battle system
 * @dev Implementation of attack and bounty algorithms
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/
 */

contract BattleSystem is NoOwner, Versioned {
  using SafeMath for uint;
  /**
   * @dev event to track attacks results
   * @param attacker ethereum address of the attacker.
   * @param defender ethereum address of the defender.
   * @param attackerIds ids of the attacker units.
   * @param attackerQuantities quantities of the attacker units.
   * @param attackerDeadQuantities amount of dead units of the attacker.
   * @param defenderIds ids of the defender units.
   * @param defenderQuantities quantities of the defender units.
   * @param defenderDeadQuantities amount of dead units of the defender.
   */
  event AttackUnits(
    address indexed attacker,
    address indexed defender,
    uint[] attackerIds,
    uint[] attackerQuantities,
    uint[] attackerDeadQuantities,
    uint[] defenderIds,
    uint[] defenderQuantities,
    uint[] defenderDeadQuantities
  );

  /**
   * @dev event to track attacks results
   * @param attacker ethereum address of the attacker.
   * @param defender ethereum address of the defender.
   * @param attackerRewards resources stolen by the attacker.
   * @param defenderRewards resources rewarded to defender.
   */
  event AttackRewards(
    address indexed attacker,
    address indexed defender,
    uint[] attackerRewards,
    uint[] defenderRewards
  );

  // Attack vars
  uint attackCooldown; // Attack cooldown blocks
  uint rewardAttackerModifier; // Percent of total resources
  uint rewardDefenderModifier; // Percentage of gold
  mapping(address => uint256) public userLastAttack; // To keep track of attack cooldown

  // Revenge vars
  mapping(address => mapping(address => uint)) usersAttacks; // user attacked => user who attacked => block number
  uint revengeTimeThreshold; // Amount of blocks in which someone can take a revenge.

  BattleSystem previousBattleSystem;

  BuildingsQueue buildingsQueue;
  UnitsData unitsData;
  UnitsQueue unitsQueue;
  UserResources userResources;
  UserUnits userUnits;
  UserVillage userVillage;
  PointsSystem pointsSystem;

  /**
    * @notice Constructor: Instantiate Battle System contract.
    * @dev Constructor function to provide Battle System address and instantiate it.
    */
  constructor() public {
  }

  /**
    * @notice Makes the contract type verifiable.
    * @dev Function to prove the contract is User Units.
    */
  function isBattleSystem() external pure returns (bool) {
    return true;
  }

  /**
    * @notice Sets the contract's version and instantiates the previous version contract.
    * @dev Function to set the contract version and instantiate the previous Battle System.
    * @param _previousBattleSystem the address of previous Battle System contract. (address)
    * @param _version the current contract version number. (uint)
    */
  function setBattleSystemVersion(BattleSystem _previousBattleSystem, uint _version) external onlyOwner {
    require(_previousBattleSystem.isBattleSystem());
    require(_version > _previousBattleSystem.version());
    previousBattleSystem = _previousBattleSystem;
    setVersion(_version);
  }

  /**
    * @notice Instantiate User Village contract.
    * @dev Function to provide User Village address and instantiate it.
    * @param _userVillage the address of User Village contract. (address)
    */
  function setUserVillage(UserVillage _userVillage) external onlyOwner {
    require(_userVillage.isUserVillage());
    userVillage = _userVillage;
  }

  /**
    * @notice Instantiate Units Queue contract.
    * @dev Function to provide Units Queue address and instantiate it.
    * @param _unitsQueue the address of Units Queue contract. (address)
    */
  function setUnitsQueue(UnitsQueue _unitsQueue) external onlyOwner {
    require(_unitsQueue.isUnitsQueue());
    unitsQueue = _unitsQueue;
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
    * @notice Instantiate User Resources contract.
    * @dev Function to provide User Resources address and instantiate it.
    * @param _userResources the address of User Resources contract. (address)
    */
  function setUserResources(UserResources _userResources) external onlyOwner {
    require(_userResources.isUserResources());
    userResources = _userResources;
  }

  /**
    * @notice Instantiate Buildings Queue contract.
    * @dev Function to provide Buildings Queue address and instantiate it.
    * @param _buildingsQueue the address of Buildings Queue contract. (address)
    */
  function setBuildingsQueue(BuildingsQueue _buildingsQueue) external onlyOwner {
    require(_buildingsQueue.isBuildingsQueue());
    buildingsQueue = _buildingsQueue;
  }

  /**
    * @notice Instantiate Units Data contract.
    * @dev Function to provide Units Data address and instantiate it.
    * @param _unitsData the address of Units Data contract. (address)
    */
  function setUnitsData(UnitsData _unitsData) external onlyOwner {
    require(_unitsData.isUnitsData());
    unitsData = _unitsData;
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

  /**
    * @notice Set Attack Cooldown.
    * @dev Function to set the attack cooldown.
    * @param _attackCooldown minimum amount of blocks that will have to wait a user between attacks
    */
  function setAttackCooldown(uint _attackCooldown) external onlyOwner {
    attackCooldown = _attackCooldown;
  }

  function getAttackCooldown() external view returns (uint) {
    return attackCooldown;
  }

  /**
    * @notice Set Reward Defender Modifier.
    * @dev Function to set reward defender modifier.
    * @param _rewardDefenderModifier the percent of total gold of units killed that will be rewarded to defender.
    */
  function setRewardDefenderModifier(uint _rewardDefenderModifier) external onlyOwner {
    rewardDefenderModifier = _rewardDefenderModifier;
  }

  function getRewardDefenderModifier() external view returns (uint) {
    return rewardDefenderModifier;
  }

  /**
    * @notice Set Reward Attacker Modifier.
    * @dev Function to set reward attack modifier.
    * @param _rewardAttackerModifier the maximum percent of resources that an attacker can steal.
    */
  function setRewardAttackerModifier(uint _rewardAttackerModifier) external onlyOwner {
    rewardAttackerModifier = _rewardAttackerModifier;
  }

  function getRewardAttackerModifier() external view returns (uint) {
    return rewardAttackerModifier;
  }

  /**
    * @notice Set Revenge Threshold.
    * @dev Function to set the revenge threshold.
    * @param _revengeTimeThreshold its the max amount of blocks between an attack and its revenge.
    */
  function setRevengeTimeThreshold(uint _revengeTimeThreshold) external onlyOwner {
    require(_revengeTimeThreshold > 0);
    revengeTimeThreshold = _revengeTimeThreshold;
  }

  function getRevengeTimeThreshold() external view returns (uint) {
    return revengeTimeThreshold;
  }

  /*
   * @title Can Attack By Revenge
   * @dev Gets a bool representing if _attacker can attack by revenge _defender
   * @param _attacker The address of the attacker. (address)
   * @param _defender The address of the defender. (address)
   * @return bool
   */
  function canAttackByRevenge(address _attacker, address _defender) public view returns (bool) {
    return ((block.number - usersAttacks[_attacker][_defender]) < revengeTimeThreshold);
  }

  /*
   * @title Set Revange Block
   * @dev Set the block number where the user was attack.
   * @param _attacker The address of the attacker. (address)
   * @param _defender The address of the defender. (address)
   */
  function setRevengeBlock(address _attacker, address _defender) internal {
    usersAttacks[_defender][_attacker] = block.number;
  }

  /*
   * @title Clear Revenge
   * @dev Once the revenge is used, clear the revenge option from user.
   * @param _attacker The address of the attacker. (address)
   * @param _defender The address of the defender. (address)
   */
  function clearRevenge(address _attacker, address _defender) internal {
    delete usersAttacks[_attacker][_defender];
  }

  /**
    * @notice Attack
    * @dev Function to attach a user
    * @param _defender the address of the user to attack (address)
    * @param _ids An array of IDs of the units to use on attack. (uint)
    * @param _quantities An array of quantity of units to use on attack. (uint)
    */
  function attack(address _defender,
                  uint[] _ids,
                  uint[] _quantities) external returns(uint[] attackerDeadQuantities,
                                                       uint[] defenderIds,
                                                       uint[] defenderQuantities,
                                                       uint[] defenderDeadQuantities,
                                                       uint[] attackerRewards,
                                                       uint[] defenderRewards){

    // see if data its ok (care about cooldown, and check if user is attacking)
    require(userVillage.hasVillage(msg.sender));
    require(userVillage.hasVillage(_defender));
    require(_ids.length > 0 && _ids.length == _quantities.length, "Data inconsistent"); // check that data makes sense
    require(block.number - userLastAttack[msg.sender] > attackCooldown, "Attack on cooldown"); // check cooldown from attacker
    require(block.number - userLastAttack[_defender] > 0, "Defender its attacking"); // checks that defender its not attacking this block
    // update buildings & compare city center levels
    buildingsQueue.updateQueue(_defender);
    buildingsQueue.updateQueue(msg.sender);
    // check if can attack by points or revenge
    require(
      pointsSystem.canAttack(msg.sender, _defender),
      "Attacker its not in points range nor taking revenge"
    );
    // update units & check if attacker has enough units
    unitsQueue.updateQueue(_defender);
    unitsQueue.updateQueue(msg.sender);
    for (uint i = 0; i < _ids.length; i++) {
      require(_quantities[i] <= userUnits.getUserUnitQuantity(msg.sender, _ids[i]), "Attacker does not have that amount of units");
    }
    // update available resources for each user
    userResources.payoutResources(_defender);
    userResources.payoutResources(msg.sender);

    // bring more info about defender
    (defenderIds, defenderQuantities) = userUnits.getUserUnitsAndQuantities(_defender);

    // calculate stuff
    (attackerDeadQuantities, defenderDeadQuantities) = calculateBattleOutcome(_ids, _quantities, defenderIds, defenderQuantities);

    // calculate battle rewards for defender
    defenderRewards = getResourcesReward(_ids, attackerDeadQuantities, defenderIds, defenderDeadQuantities);

    // calculate battle reward for attacker
    attackerRewards = calculateStealOutcome(_defender, _ids, _quantities, defenderIds, defenderQuantities);

    // always take revenge if available.
    if (canAttackByRevenge(msg.sender, _defender)) {
      clearRevenge(msg.sender, _defender);
    }

    // attacker steals resources if he can
    if (attackerRewards[0] > 0 || attackerRewards[1] > 0) {
      userResources.takeResourcesFromUser(_defender,
                                          attackerRewards[0],
                                          attackerRewards[1],
                                          0);
      userResources.giveResourcesToUser(msg.sender,
                                        attackerRewards[0],
                                        attackerRewards[1],
                                        0);
    }

    // payoutResources to defender
    userResources.giveResourcesToUser(_defender,
        															defenderRewards[0],
        															defenderRewards[1],
        															0);

    // kill units
    userUnits.removeUserUnits(msg.sender, _ids, attackerDeadQuantities);
    userUnits.removeUserUnits(_defender, defenderIds, defenderDeadQuantities);

    // update last attacks
    userLastAttack[msg.sender] = block.number;

    // authorize possible revenge.
    setRevengeBlock(msg.sender, _defender);

    // emit event
    emit AttackUnits(
      msg.sender,
      _defender,
      _ids,
      _quantities,
      attackerDeadQuantities,
      defenderIds,
      defenderQuantities,
      defenderDeadQuantities
    );

    emit AttackRewards(
      msg.sender,
      _defender,
      attackerRewards,
      defenderRewards
    );
  }

  /**
   * HELPERS
   */

  function calculateBattleOutcome(uint[] _attackerIds,
                                  uint[] _attackerQuantities,
                                  uint[] _defenderIds,
                                  uint[] _defenderQuantities)
                                  private view returns (uint[] attackerDeadQuantities,
                                                        uint[] defenderDeadQuantities) {

    uint attackerAttack;
    uint attackerDefense;
    (,attackerDefense, attackerAttack) = userUnits.getBattleStatsFromUnits(_attackerIds, _attackerQuantities);

    uint defenderAttack;
    uint defenderDefense;
    (,defenderDefense, defenderAttack) = userUnits.getBattleStatsFromUnits(_defenderIds, _defenderQuantities);

    uint trueDamageOfAttacker = 0;
    uint trueDamageOfDefender = 0;

    if (defenderDefense < attackerAttack) {
      trueDamageOfAttacker = attackerAttack.sub(defenderDefense);
      defenderDeadQuantities = damageUnits(trueDamageOfAttacker, _defenderIds, _defenderQuantities);
    } else {
      defenderDeadQuantities = new uint[](_defenderQuantities.length); // zero units will die
    }

    if (attackerDefense < defenderAttack) {
      trueDamageOfDefender = defenderAttack.sub(attackerDefense);
      attackerDeadQuantities = damageUnits(trueDamageOfDefender, _attackerIds, _attackerQuantities);
    } else {
      attackerDeadQuantities = new uint[](_attackerQuantities.length); // zero units will die
    }
  }

  function calculateStealOutcome(address _defender,
                                 uint[] _attackerIds,
                                 uint[] _attackerQuantities,
                                 uint[] _defenderIds,
                                 uint[] _defenderQuantities) private view returns (uint[] resourcesRewards) {

    // resourcesRewards[0] -> gold
    // resourcesRewards[1] -> crystal
    resourcesRewards = new uint[](2);

    // stats[0] -> attackerDefense
    // stats[1] -> attackerAttack
    // stats[2] -> defenderDefense
    // stats[3] -> defenderAttack
    uint[] memory stats = new uint[](4);
    (, stats[0], stats[1]) = userUnits.getBattleStatsFromUnits(_attackerIds, _attackerQuantities);
    (, stats[2], stats[3]) = userUnits.getBattleStatsFromUnits(_defenderIds, _defenderQuantities);

    // attacker can only steal, if his attack its bigger than the defender's defense
    // and if his defense its bigger than the defenders attack
    // this way, the attacker knocks all defenses, and some of his units are not knocked out
    // so they can steal
    if (stats[2] < stats[1] && (stats[3] < stats[0] || stats[3] == 0)) {
      uint[] memory knockedAttackerUnits = knockUnits(stats[3], _attackerIds, _attackerQuantities);
      uint[] memory totalUnitsThatCanSteal = new uint[](_attackerIds.length);
      for (uint i = 0; i < _attackerIds.length; i ++) {
        totalUnitsThatCanSteal[i] = _attackerQuantities[i].sub(knockedAttackerUnits[i]);
      }
      uint attackerAttackPostKnocked;
      (,,attackerAttackPostKnocked) = userUnits.getBattleStatsFromUnits(_attackerIds, totalUnitsThatCanSteal);
      uint percentageStolen = (attackerAttackPostKnocked  * rewardAttackerModifier) / stats[1];
      if (percentageStolen > 0) {
        (resourcesRewards[0], resourcesRewards[1],) = userResources.getUserResources(_defender);
        resourcesRewards[0] = (percentageStolen * resourcesRewards[0]) / 100;
        resourcesRewards[1] = (percentageStolen * resourcesRewards[1]) / 100;
      }
    }
  }

  function chooseIndexOfStrongerUnit(uint[] _ids,
                                     uint[] _quantities,
                                     uint[] _killedQuantities) private view returns (uint indexOfStrongerUnit) {
    uint strongerDefense = 0;
    for (uint i = 0; i < _ids.length; i++) {
      uint unitDefense;
      (,unitDefense,) = unitsData.getBattleRates(_ids[i]);
      if (_quantities[i] - _killedQuantities[i] > 0 && (unitDefense > strongerDefense)) {
        indexOfStrongerUnit = i;
        strongerDefense = unitDefense;
      }
    }
    return indexOfStrongerUnit;
  }

  function knockUnits(uint _damage, uint[] _ids, uint[] _quantities) private view returns (uint[] knockedQuantities) {
    knockedQuantities = new uint[](_ids.length);
    uint zeroedTroops = 0;
    while (_damage > 0 && zeroedTroops != _quantities.length) {
      uint strongerUnitIndex = chooseIndexOfStrongerUnit(_ids, _quantities, knockedQuantities);
      uint unitDefense;
      (,unitDefense,) = unitsData.getBattleRates(_ids[strongerUnitIndex]);
      uint canKill = _damage / unitDefense;
      if (canKill > 0) {
        knockedQuantities[strongerUnitIndex] = (canKill < _quantities[strongerUnitIndex]) ? canKill : _quantities[strongerUnitIndex];
        zeroedTroops = zeroedTroops.add((canKill < _quantities[strongerUnitIndex]) ? 0 : 1);
        _damage = (knockedQuantities[strongerUnitIndex] * unitDefense < _damage) ? _damage.sub(knockedQuantities[strongerUnitIndex] * unitDefense) : 0;
      } else {
        _damage = 0;
      }
    }
    return knockedQuantities;
  }

  function damageUnits(uint _damage, uint[] _ids, uint[] _quantities) private view returns (uint[] killedQuantities) {
    killedQuantities = new uint[](_ids.length);
    uint zeroedTroops = 0;
    while (_damage > 0 && zeroedTroops != _quantities.length) {
      uint strongerUnitIndex = chooseIndexOfStrongerUnit(_ids, _quantities, killedQuantities);
      uint unitHealth;
      (unitHealth,,) = unitsData.getBattleRates(_ids[strongerUnitIndex]);
      uint canKill = _damage / unitHealth;
      if (canKill > 0) {
        killedQuantities[strongerUnitIndex] = (canKill < _quantities[strongerUnitIndex]) ? canKill : _quantities[strongerUnitIndex];
        zeroedTroops = zeroedTroops.add((canKill < _quantities[strongerUnitIndex]) ? 0 : 1);
        _damage = (killedQuantities[strongerUnitIndex] * unitHealth < _damage) ? _damage.sub(killedQuantities[strongerUnitIndex] * unitHealth) : 0;
      } else {
        _damage = 0;
      }
    }
    return killedQuantities;
  }

  function getResourcesReward(uint[] _attackerIds,
                              uint[] _attackerQuantities,
                              uint[] _defenderIds,
                              uint[] _defenderQuantities) private view returns (uint[] resourcesRewards) {
    uint price;
    uint resource;
    uint goldReward;
    uint crystalReward;
    resourcesRewards = new uint[](2);

    for (uint i = 0; i < _attackerIds.length; i++) {
      (price, resource,) = unitsData.getUnitData(_attackerIds[i]);

      if (resource == 0) {
        goldReward = goldReward.add(price.mul(_attackerQuantities[i]));
      }
      if (resource == 1) {
        crystalReward = crystalReward.add(price.mul(_attackerQuantities[i]));
      }
    }

    for (uint j = 0; j < _defenderIds.length; j++) {
      (price,resource,)= unitsData.getUnitData(_defenderIds[j]);

      if (resource == 0) {
        goldReward = goldReward.add(price.mul(_defenderQuantities[j]));
      }
      if (resource == 1) {
        crystalReward = crystalReward.add(price.mul(_defenderQuantities[j]));
      }
    }

    goldReward = (goldReward * rewardDefenderModifier / 100);
    crystalReward = (crystalReward * rewardDefenderModifier / 100);

    resourcesRewards[0] = goldReward;
    resourcesRewards[1] = crystalReward;
    return resourcesRewards;
  }
}
