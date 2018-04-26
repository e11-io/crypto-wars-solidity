pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './Versioned.sol';

/**
 * @title UnitsData (WIP)
 * @notice This contract specifies how units are set up.
 * @dev You can add units and update them
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/
 */
contract UnitsData is NoOwner, Versioned {

  /**
   * @dev event for adding unit to contract logging
   * @param id of the added unit
   * @param name the name of the unit
   */
  event AddUnit(uint id, string name);

  /**
   * event for updating a unit logging
   * @param id of the updated unit
   * @param name the name of the unit
   */
  event UpdateUnit(uint id, string name);

  struct Unit {
    string name;
    int32 health;
    int32 defense;
    int32 attack;
    int32 price;
    int32 resource;
    int32 blocks;
  }

  // Mapping of id -> unit struct.
  mapping (uint => Unit) public units;

  uint[] public unitIds;

  UnitsData previousUnitsData;

  /*
   * @notice Constructor: Instantiate Units Data contract.
   * @dev Constructor function.
   */
  constructor() public {
  }

  /*
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is Units Data.
   */
  function isUnitsData() external pure returns (bool) {
    return true;
  }

  /*
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous Units Data.
   * @param _previousUnitsData the address of previous Units Data contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setUnitsDataVersion(UnitsData _previousUnitsData, uint _version) external onlyOwner {
    require(_previousUnitsData.isUnitsData());
    require(_version > _previousUnitsData.version());
    previousUnitsData = _previousUnitsData;
    setVersion(_version);
  }

  /*
   * @notice Get the amount of existing units.
   */
  function getUnitIdsLength() external view returns(uint) {
    return unitIds.length;
  }

  /*
   * @notice Create new definition of a unit
   * @dev This method create a new Unit definition that can be use on the game.
   * @param id (uint)
   * @param name (string)
   * @stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function addUnit(uint id,
                   string name,
                   int32[] stats) external onlyOwner {

    require(keccak256(units[id].name) == keccak256(""));
    require(keccak256(name) != keccak256(""));
    require(stats[0] >= 0); //"health"
    require(stats[1] >= 0); //"defense"
    require(stats[2] >= 0); //"attack"
    require(stats[3] >= 0); //"price"
    require(stats[4] >= 0); //"resource"
    require(stats[5] >= 0); //"block"

    units[id] = Unit(name,
                     stats[0],
                     stats[1],
                     stats[2],
                     stats[3],
                     stats[4],
                     stats[5]);
    unitIds.push(id);
    emit AddUnit(id, name);
  }

  /*
   * @title Update unit
   * @dev This method is used to update units name and stats
   * @param id (uint)
   * @stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function updateUnit(uint id,
                      string name,
                      int32[] stats) external onlyOwner {
    require(keccak256(units[id].name) != keccak256(""));

    updateUnitBasics(id, name, stats);

    emit UpdateUnit(id, name);
  }

  /*
   * @title Update Unit Basics
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param id (uint)
   * @stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function updateUnitBasics(uint id, string name, int32[] stats) internal {
      if (keccak256(name) != keccak256("")) {
        units[id].name = name;
      }
      if (stats[0] >= 0 && units[id].health != stats[0]) {
        units[id].health = stats[0];
      }
      if (stats[1] >= 0 && units[id].defense != stats[1]) {
        units[id].defense = stats[1];
      }
      if (stats[2] >= 0 && units[id].attack != stats[2]) {
        units[id].attack = stats[2];
      }
      if (stats[3] >= 0 && units[id].price != stats[3]) {
        units[id].price = stats[3];
      }
      if (stats[4] >= 0 && units[id].resource != stats[4]) {
        units[id].resource = stats[4];
      }
      if (stats[5] >= 0 && units[id].blocks != stats[5]) {
        units[id].blocks = stats[5];
      }
  }

  /*
   * @title Check Unit Exist
   * @dev Check if a unit exists.
   * @param _id The id of the unit to check. (uint)
   * @return A boolean that indicates if the unit exists or not.
   */
  function checkUnitExist(uint _id) external view returns (bool) {
    return keccak256(units[_id].name) != keccak256("");
  }

  /*
   * @title Get Unit Data
   * @dev Gets the price, resource type and number of blocks a unit takes to build.
   * @param _id The id of the unit. (uint)
   * @return price, resource and blocks of the unit.
   */
  function getUnitData(uint _id) external view returns (uint price,
                                                        uint resource,
                                                        uint blocks) {
    require(keccak256(units[_id].name) != keccak256(""));
    return (
      uint(units[_id].price),
      uint(units[_id].resource),
      uint(units[_id].blocks)
    );
  }

  /*
   * @title Get Battle Rates
   * @dev Get the amount of health, defense and attack a unit has.
   * @param _id The id of the unit. (uint)
   * @return .
   */
  function getBattleRates(uint _id) external view returns (uint health,
                                                           uint defense,
                                                           uint attack) {
    require(keccak256(units[_id].name) != keccak256(""));
    return (uint(units[_id].health), uint(units[_id].defense), uint(units[_id].attack));
  }

}
