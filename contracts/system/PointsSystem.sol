pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import './BattleSystem.sol';
import '../assets/buildings/BuildingsQueue.sol';
import '../user/UserResources.sol';
import '../user/UserUnits.sol';
import '../Versioned.sol';

/**
 * @title PointsSystem (WIP)
 * @notice This contract will be in charge of the points system
 * @dev Implementation of points algorithm
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/
 */

contract PointsSystem is NoOwner, Versioned {
  using SafeMath for uint;

  /**
  * event to track points changes on users
  * @param user the address of the user with updated points
  * @param finalPoints user's final amount of points
  */
  event PointsChanged(address indexed user, uint finalPoints);

  // users => points
  mapping(address => uint) public usersPoints;

  // Percentage of difference of points to be in same range of lower and upper rivals.
  uint lowerPointsThreshold;
  uint upperPointsThreshold;

  PointsSystem previousPointsSystem;

  BattleSystem battleSystem;
  BuildingsQueue buildingsQueue;
  UserResources userResources;
  UserUnits userUnits;

  /**
    * @notice Constructor: Instantiate Points System contract.
    * @dev Constructor function to provide Points System address and instantiate it.
    */
  constructor() public {
  }

  /**
    * @notice Makes the contract type verifiable.
    * @dev Function to prove the contract is Points System.
    */
  function isPointsSystem() external pure returns (bool) {
    return true;
  }

  /**
    * @notice Sets the contract's version and instantiates the previous version contract.
    * @dev Function to set the contract version and instantiate the previous Points System.
    * @param _previousPointsSystem the address of previous Points System contract. (address)
    * @param _version the current contract version number. (uint)
    */
  function setPointsSystemVersion(PointsSystem _previousPointsSystem, uint _version) external onlyOwner {
    require(_previousPointsSystem.isPointsSystem());
    require(_version > _previousPointsSystem.version());
    previousPointsSystem = _previousPointsSystem;
    setVersion(_version);
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
    * @notice Instantiate Buildings Queue contract.
    * @dev Function to provide Buildings Queue address and instantiate it.
    * @param _buildingsQueue the address of Buildings Queue contract. (address)
    */
  function setBuildingsQueue(BuildingsQueue _buildingsQueue) external onlyOwner {
    require(_buildingsQueue.isBuildingsQueue());
    buildingsQueue = _buildingsQueue;
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
    * @notice Set Points Threshold.
    * @dev Function to set the points threshold.
    * @param _lowerPointsThreshold its the max percentage of difference for a lower rival.
    * @param _upperPointsThreshold its the max percentage of difference for an upper rival.
    */
  function setPointsThreshold(uint _lowerPointsThreshold, uint _upperPointsThreshold) external onlyOwner {
    require(_lowerPointsThreshold > 0 && _lowerPointsThreshold < 100);
    require(_upperPointsThreshold > 0);
    lowerPointsThreshold = _lowerPointsThreshold;
    upperPointsThreshold = _upperPointsThreshold;
  }

  function getPointsThreshold() external view returns (uint, uint) {
    return (lowerPointsThreshold, upperPointsThreshold);
  }


  /*
   * @title Are In Points Range
   * @dev Gets a bool representing if _attacker & _defender are in range
   * @param _attacker The address of the first user. (address)
   * @param _defender The address of the second user. (address)
   * @return bool
   */
  function areInPointsRange(address _attacker, address _defender) public view returns (bool) {
    if (_attacker == address(0) || _defender == address(0) || _attacker == _defender) return false;
    if (usersPoints[_attacker] == 0 || usersPoints[_defender] == 0) return false;

    uint pointsPercentageDifference;
    if (usersPoints[_attacker] < usersPoints[_defender]) {
      // Will only be in range if the difference between points is less % than upperPointsThreshold
      pointsPercentageDifference = (usersPoints[_defender].mul(100) / usersPoints[_attacker]) - 100;
      return pointsPercentageDifference < upperPointsThreshold;
    } else {
      uint pointsDifference = usersPoints[_attacker].sub(usersPoints[_defender]);
      // Will only be in range if the difference between points is less % than lowerPointsThreshold
      pointsPercentageDifference = pointsDifference.mul(100) / usersPoints[_attacker];
      return pointsPercentageDifference < lowerPointsThreshold;
    }
  }

  /*
   * @title Add Points To User
   * @dev Adds points to user
   * @param _user The address of the user to add the points. (address)
   * @param _points The amount of points to be added (uint)
   * @return uint
   */
  function addPointsToUser(address _user, uint _points) external returns (uint) {
    require(msg.sender == owner || msg.sender == address(userResources));
    require(_points > 0);
    usersPoints[_user] = usersPoints[_user].add(_points);
    emit PointsChanged(_user, usersPoints[_user]);
    return usersPoints[_user];
  }

  /*
   * @title Sub Points To User
   * @dev Subtracts points to user
   * @param _user The address of the user to subtract the points. (address)
   * @param _points The amount of points to be subtracted (uint)
   * @return uint
   */
  function subPointsToUser(address _user, uint _points) external returns (uint) {
    require(msg.sender == owner ||
            msg.sender == address(userUnits) ||
            msg.sender == address(buildingsQueue));
    require(_points > 0);
    if (_points < usersPoints[_user]) {
      usersPoints[_user] = usersPoints[_user].sub(_points);
    } else {
      usersPoints[_user] = 0;
    }
    emit PointsChanged(_user, usersPoints[_user]);
    return usersPoints[_user];
  }

  /*
   * @title Can Attack
   * @dev Gets a bool representing if _attacker can attack by points or revenge
   * @param _attacker The address of the attacker. (address)
   * @param _defender The address of the defender. (address)
   * @return bool
   */
  function canAttack(address _attacker, address _defender) external view returns (bool) {
    return (areInPointsRange(_attacker, _defender) || battleSystem.canAttackByRevenge(_attacker, _defender));
  }
}
