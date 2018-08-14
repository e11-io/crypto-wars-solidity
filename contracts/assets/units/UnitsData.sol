pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';

import '../../Versioned.sol';

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
    uint32 health;
    uint32 defense;
    uint32 attack;
    uint32 price;
    uint32 resource;
    uint32 blocks;
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
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function addUnit(uint _id,
                   string _name,
                   int64[] _stats) external onlyOwner {

    bytes32 _unitNameBytes = stringToBytes32(units[_id].name);
    require(_unitNameBytes == 0x0);
    bytes32 _nameBytes = stringToBytes32(_name);
    require(_nameBytes != 0x0);
    require(_stats[0] >= 0); //"health"
    require(_stats[1] >= 0); //"defense"
    require(_stats[2] >= 0); //"attack"
    require(_stats[3] >= 0); //"price"
    require(_stats[4] >= 0); //"resource"
    require(_stats[5] >= 0); //"block"

    units[_id] = Unit(_name,
                      uint32(_stats[0]),
                      uint32(_stats[1]),
                      uint32(_stats[2]),
                      uint32(_stats[3]),
                      uint32(_stats[4]),
                      uint32(_stats[5]));
    unitIds.push(_id);
    emit AddUnit(_id, _name);
  }

  /*
   * @title Update unit
   * @dev This method is used to update units name and stats
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function updateUnit(uint _id,
                      string _name,
                      int64[] _stats) external onlyOwner {

    bytes32 _unitNameBytes = stringToBytes32(units[_id].name);
    require(_unitNameBytes != 0x0);

    updateUnitBasics(_id, _name, _stats);

    emit UpdateUnit(_id, _name);
  }

  /*
   * @title Update Unit Basics
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new unit: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   */
  function updateUnitBasics(uint _id, string _name, int64[] _stats) internal {
    bytes32 _nameBytes = stringToBytes32(_name);
    if (_nameBytes != 0x0) {
      units[_id].name = _name;
    }
    if (_stats[0] >= 0 && units[_id].health != uint32(_stats[0])) {
      units[_id].health = uint32(_stats[0]);
    }
    if (_stats[1] >= 0 && units[_id].defense != uint32(_stats[1])) {
      units[_id].defense = uint32(_stats[1]);
    }
    if (_stats[2] >= 0 && units[_id].attack != uint32(_stats[2])) {
      units[_id].attack = uint32(_stats[2]);
    }
    if (_stats[3] >= 0 && units[_id].price != uint32(_stats[3])) {
      units[_id].price = uint32(_stats[3]);
    }
    if (_stats[4] >= 0 && units[_id].resource != uint32(_stats[4])) {
      units[_id].resource = uint32(_stats[4]);
    }
    if (_stats[5] >= 0 && units[_id].blocks != uint32(_stats[5])) {
      units[_id].blocks = uint32(_stats[5]);
    }
  }

  /*
   * @title Check Unit Exist
   * @dev Check if a unit exists.
   * @param _id The id of the unit to check. (uint)
   * @return A boolean that indicates if the unit exists or not.
   */
  function checkUnitExist(uint _id) external view returns (bool) {
    bytes32 _unitNameBytes = stringToBytes32(units[_id].name);
    return (_unitNameBytes != 0x0);
  }

  /*
   * @title Gets Unit Data
   * @dev Gets the price, resource type and number of blocks a unit takes to build.
   * @param _id The id of the unit. (uint)
   * @return price, resource and blocks of the unit.
   */
  function getUnitData(uint _id) external view returns (uint price,
                                                        uint resource,
                                                        uint blocks) {
    bytes32 _unitNameBytes = stringToBytes32(units[_id].name);
    if (_unitNameBytes == 0x0) return (0, 0, 0);
    return (
      uint(units[_id].price),
      uint(units[_id].resource),
      uint(units[_id].blocks)
    );
  }

  /*
   * @title Get Units Ids
   * @dev Function to get the ids of all the units.
   * @return A uint array representing all the units ids.
   */
  function getUnitsIds() external view returns (uint[]) {
    uint[] memory allUnitsIds = new uint[](unitIds.length);
    for (uint i = 0; i < unitIds.length; i++) {
      allUnitsIds[i] = unitIds[i];
    }
    return allUnitsIds;
  }

  /*
   * @title Get Battle Rates
   * @dev Get the amount of health, defense and attack a unit has.
   * @param _id The id of the unit. (uint)
   * @return arrays of information
   *      health (uint)
   *      defense (uint)
   *      attack (uint)
   */
  function getBattleRates(uint _id) external view returns (uint health,
                                                           uint defense,
                                                           uint attack) {
    bytes32 _unitNameBytes = stringToBytes32(units[_id].name);
    if (_unitNameBytes == 0x0) return (0, 0, 0);
    return (uint(units[_id].health), uint(units[_id].defense), uint(units[_id].attack));
  }

  /*
   * @notice Get All units A
   * @dev This method gets some information of the units.
   * @returns arrays of information
   *      name (bytes32)
   *      id (uint)
   *      health (uint)
   *      defense (uint)
   *      attack (uint)
   */
  function getAllUnitsA() external view returns(bytes32[] name,
                                                uint[] id,
                                                uint32[] health,
                                                uint32[] defense,
                                                uint32[] attack) {
    name = new bytes32[](unitIds.length);
    id = new uint[](unitIds.length);
    health = new uint32[](unitIds.length);
    defense = new uint32[](unitIds.length);
    attack = new uint32[](unitIds.length);

    for(uint i = 0; i < unitIds.length; i ++) {
      Unit storage unit = units[unitIds[i]];
      name[i] = stringToBytes32(unit.name);
      id[i] = unitIds[i];
      health[i] = unit.health;
      defense[i] = unit.defense;
      attack[i] = unit.attack;
    }

    return(name,
           id,
           health,
           defense,
           attack);
  }

  /*
   * @notice Get All units B
   * @dev This method gets some information of the units. Intended to be called
   * with getAllUnitsA.
   * @returns arrays of information
   *      price (uint)
   *      resource (uint)
   *      blocks (uint)
   */
  function getAllUnitsB() external view returns(uint32[] price,
                                                uint32[] resource,
                                                uint32[] blocks) {
    price = new uint32[](unitIds.length);
    resource = new uint32[](unitIds.length);
    blocks = new uint32[](unitIds.length);

    for(uint i = 0; i < unitIds.length; i ++) {
      Unit storage unit = units[unitIds[i]];
      price[i] = unit.price;
      resource[i] = unit.resource;
      blocks[i] = unit.blocks;
    }

    return(price,
           resource,
           blocks);
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

}
