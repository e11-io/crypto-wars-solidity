pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './UnitsData.sol';
import './UnitsQueue.sol';
import './Versioned.sol';

/**
 * @title UserUnits (WIP)
 * @notice This contract sets which units belongs to which user.
 * @dev Keeps track of users units.
 * Additional functionality might be added to ...
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/
 */

contract UserUnits is NoOwner, Versioned {
  using SafeMath for uint;

  /**
   * event for adding multiple units to a user
   * @param user the address of the user to add the units
   * @param ids the IDs of the units to be added
   * @param quantity the quantity of the units to be added
   */
  event AddUserUnits(address user, uint[] ids, uint[] quantity);

  /**
   * event for removing units to a user
   * @param user the address of the user to remove the units
   * @param ids the IDs of the units to be removed
   * @param quantity the quantity of the units to be removed
   */
  event RemoveUserUnits(address user, uint[] ids, uint[] quantity);

  /**
  * event for transfering multiple units to a user
  * @param user the address of the user to add the units
  * @param to the address of the user to add the units
  * @param ids the IDs of the units to be added
  * @param quantity the quantity of the units to be transfered
  */
  event TransferUserUnits(address user, address to, uint[] ids, uint[] quantity);

  // Mapping of user -> (units ids -> unit quantity) (keeps track of owned units and it's quantity)
  mapping (address => mapping(uint => uint)) userUnits;

  UnitsData unitsData;
  UnitsQueue unitsQueue;
  UserUnits previousUserUnits;

  /**
   * @notice Constructor: Instantiate User Units contract.
   * @dev Constructor function to provide User Units address and instantiate it.
   */
  constructor() public {
  }

  /**
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is User Units.
   */
  function isUserUnits() external pure returns (bool) {
    return true;
  }

  /**
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous User Units.
   * @param _previousUserUnits the address of previous User Units contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setUserUnitsVersion(UserUnits _previousUserUnits, uint _version) external onlyOwner {
    require(_previousUserUnits.isUserUnits());
    require(_version > _previousUserUnits.version());
    previousUserUnits = _previousUserUnits;
    setVersion(_version);
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

  /**
   * @notice Instantiate Units Queue contract.
   * @dev Function to provide Units Queue address and instantiate it.
   * @param _unitsQueue the address of Units Queue contract. (address)
   */
  function setUnitsQueue(UnitsQueue _unitsQueue) external onlyOwner {
    require(_unitsQueue.isUnitsQueue());
    unitsQueue = _unitsQueue;
  }

  /*
   * @title Add User Units
   * @dev Function to add multiple units to a user
   * @params _user the address of the user to add unit. (address)
   * @param _ids An array of IDs of the units to add. (uint)
   * @param _quantity An array of quantity of units to add. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function addUserUnits(address _user, uint[] _ids, uint[] _quantity) external returns (bool) {
    require(msg.sender == address(unitsQueue) || msg.sender == owner);

    require(_ids.length == _quantity.length);

    uint length = _ids.length;

    for (uint i = 0; i < length; i++) {
      require(unitsData.checkUnitExist(_ids[i]));
      userUnits[_user][_ids[i]] = userUnits[_user][_ids[i]].add(_quantity[i]);
    }

    emit AddUserUnits(_user, _ids, _quantity);

    return true;
  }

  /*
   * @title Remove User Units
   * @dev Function to remove multiple user units.
   * @param _user the address of the user to remove the units from
   * @param _ids the ids of the unit to be removed
   * @param _quantity the quantity of the unit to be removed
   * @return A boolean that indicates if the operation was successful.
   */
  function removeUserUnits(address _user, uint[] _ids, uint[] _quantity) external returns (bool) {
    /*TODO can be called from the Battle Contract too*/
    require(msg.sender == owner);
    require(_ids.length == _quantity.length);

    for (uint i = 0; i < _ids.length; i++) {
      require(unitsData.checkUnitExist(_ids[i]));
      userUnits[_user][_ids[i]] = userUnits[_user][_ids[i]].sub(_quantity[i]);
    }

    emit RemoveUserUnits(_user, _ids, _quantity);

    return true;
  }


  /*
   * @title Get User Battle Rates
   * @dev Function to iterate through the user units and calculate the battle rate.
   * @param _user The address of the user to get the battle rates of. (address)
   * @return Three uints indicating the amount of health, defense and attack.
   */
  function getBattleStats(address _user) external view returns (uint totalHealthStat,
                                                                uint totalDefenseStat,
                                                                uint totalAttackStat) {
    uint healthRate;
    uint defenseRate;
    uint attackRate;

    uint unitsLength = unitsData.getUnitIdsLength();
    uint[] memory allUnitsIds = new uint[](unitsLength);
    for (uint i = 0; i < unitsLength; i++) {
      allUnitsIds[i] = unitsData.unitIds(i);
    }

		for (i = 0; i < unitsLength; i++) {
      if (userUnits[_user][allUnitsIds[i]] > 0) {
        (healthRate, defenseRate, attackRate) = unitsData.getBattleRates(allUnitsIds[i]);
        if (healthRate > 0) {
          totalHealthStat = SafeMath.add(
            totalHealthStat,
            userUnits[_user][allUnitsIds[i]].mul(healthRate)
          );
        }
        if (defenseRate > 0) {
          totalDefenseStat = SafeMath.add(
            totalDefenseStat,
            userUnits[_user][allUnitsIds[i]].mul(defenseRate)
          );
        }
        if (attackRate > 0) {
          totalAttackStat = SafeMath.add(
            totalAttackStat,
            userUnits[_user][allUnitsIds[i]].mul(attackRate)
          );
        }
      }
    }

    return (totalHealthStat, totalDefenseStat, totalAttackStat);
	}

  /*
   * @title Transfer User Units
   * @dev Function to transfer multiple units to another user
   * @params _to the address of the user to transfer units to. (address)
   * @param _ids An array of IDs of the units to transfer. (uint)
   * @param _quantity An array of quantity of units to transfer. (uint)
   * @return A boolean that indicates if the operation was successful.
   */
  function transferUserUnits(address _to, uint[] _ids, uint[] _quantity) external returns (bool) {

    require(_to != msg.sender);
    require(_ids.length == _quantity.length);

    // TODO require msg.sender and _to to be part of the same alliance
    unitsQueue.updateQueue(msg.sender);

    uint length = _ids.length;

    for (uint i = 0; i < length; i++) {
      require(unitsData.checkUnitExist(_ids[i]));
      userUnits[msg.sender][_ids[i]] = userUnits[msg.sender][_ids[i]].sub(_quantity[i]);
      userUnits[_to][_ids[i]] = userUnits[_to][_ids[i]].add(_quantity[i]);
    }

    emit TransferUserUnits(msg.sender, _to, _ids, _quantity);

    return true;
  }

  /*
   * @title Get User Unit Quantity
   * @dev Function to get the quantity of a specific unit.
   * @param _user The address to query the units of. (address)
   * @param _id The id of the unit. (uint)
   * @return A uint representing how many units of this type the user has.
   */
  function getUserUnitQuantity(address _user, uint _id) external view returns (uint unitAmount) {
    return userUnits[_user][_id];
  }

  /*
   * @title Get User Units Ids
   * @dev Function to get the ids of all the units the user has.
   * @param _user The address to query the ids. (address)
   * @return A uint array representing all the units ids that the user has.
   */
  function getUserUnitsIds(address _user) external view returns (uint[]) {
    uint unitsLength = unitsData.getUnitIdsLength();
    uint[] memory ids = new uint[](unitsLength);
    uint[] memory allUnitsIds = new uint[](unitsLength);
    for (uint i = 0; i < unitsLength; i++) {
      allUnitsIds[i] = unitsData.unitIds(i);
    }

    uint counter = 0;
    for (i = 0; i < unitsLength; i++) {
      if (userUnits[_user][allUnitsIds[i]] > 0) {
        ids[counter] = allUnitsIds[i];
        counter++;
      }
    }

    uint[] memory unitsIds = new uint[](counter);
    for (i = 0; i < counter; i++) {
      unitsIds[i] = ids[i];
    }

    return unitsIds;
  }

}
