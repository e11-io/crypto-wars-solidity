pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/NoOwner.sol';
import '../../Versioned.sol';

/**
 * @title BuildingsData (WIP)
 * @notice This contract specifies how buildings are set up.
 * @dev You can add buildings and update them
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/5
 */
contract BuildingsData is NoOwner, Versioned {

  /**
   * @dev event for adding building to contract logging
   * @param id of the added building
   * @param name the name of the building
   */
  event AddBuilding(uint id, string name);

  /**
   * event for updating a building logging
   * @param id of the updated building
   * @param name the name of the building
   */
  event UpdateBuilding(uint id, string name);

  struct Building {
    string name;
    int32 health;
    int32 defense;
    int32 attack;
    int32 goldCapacity;
    int32 crystalCapacity;
    int32 goldRate;
    int32 crystalRate;
    int32 price;
    int32 resource;
    int32 blocks;
    int32 previousLevelId;
    int32 typeId;
  }

  // Mapping of id -> building struct.
  mapping (uint => Building) public buildings;

  uint[] public buildingIds;

  BuildingsData previousBuildingsData;

  /*
   * @notice Constructor: Instantiate Buildings Data contract.
   * @dev Constructor function.
   */
  constructor() public {
  }

  /*
   * @notice Makes the contract type verifiable.
   * @dev Function to prove the contract is Buildings Data.
   */
  function isBuildingsData() external pure returns (bool) {
    return true;
  }

  /*
   * @notice Sets the contract's version and instantiates the previous version contract.
   * @dev Function to set the contract version and instantiate the previous Buildings Data.
   * @param _previousBuildingsData the address of previous Buildings Data contract. (address)
   * @param _version the current contract version number. (uint)
   */
  function setBuildingsDataVersion(BuildingsData _previousBuildingsData, uint _version) external onlyOwner {
    require(_previousBuildingsData.isBuildingsData());
    require(_version > _previousBuildingsData.version());
    previousBuildingsData = _previousBuildingsData;
    setVersion(_version);
  }

  /*
   * @notice Get the amount of existing buildings.
   */
  function getBuildingIdsLength() external view returns(uint) {
    return buildingIds.length;
  }

  /*
   * @notice Get All Builduings A
   * @dev This method gets some information of the buildings.
   * @returns arrays of information
   *      name (byes32)
   *      id (uint)
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      goldCapacity (int)
   *      crystalCapacity (int)
   */
  function getAllBuildingsA() external view returns(bytes32[] name,
                                                    uint[] id,
                                                    int32[] health,
                                                    int32[] defense,
                                                    int32[] attack,
                                                    int32[] goldCapacity,
                                                    int32[] crystalCapacity) {
    name = new bytes32[](buildingIds.length);
    id = new uint[](buildingIds.length);
    health = new int32[](buildingIds.length);
    defense = new int32[](buildingIds.length);
    attack = new int32[](buildingIds.length);
    goldCapacity = new int32[](buildingIds.length);
    crystalCapacity = new int32[](buildingIds.length);

    for(uint i = 0; i < buildingIds.length; i ++) {
      Building storage building = buildings[buildingIds[i]];
      name[i] = stringToBytes32(building.name);
      id[i] = buildingIds[i];
      health[i] = building.health;
      defense[i] = building.defense;
      attack[i] = building.attack;
      goldCapacity[i] = building.goldCapacity;
      crystalCapacity[i] = building.crystalCapacity;
    }

    return(name,
           id,
           health,
           defense,
           attack,
           goldCapacity,
           crystalCapacity);
  }

  /*
   * @notice Get All Builduings B
   * @dev This method gets some information of the buildings. Intended to be called
   * with getAllBuildingsA.
   * @returns arrays of information
   *      goldRate (int)
   *      crystalRate (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   *      previousLevelId (int)
   *      typeId (int)
   */
  function getAllBuildingsB() external view returns(int32[] goldRate,
                                                 int32[] crystalRate,
                                                 int32[] price,
                                                 int32[] resource,
                                                 int32[] blocks,
                                                 int32[] previousLevelId,
                                                 int32[] typeId) {

    goldRate = new int32[](buildingIds.length);
    crystalRate = new int32[](buildingIds.length);
    price = new int32[](buildingIds.length);
    resource = new int32[](buildingIds.length);
    blocks = new int32[](buildingIds.length);
    previousLevelId = new int32[](buildingIds.length);
    typeId = new int32[](buildingIds.length);

    for(uint i = 0; i < buildingIds.length; i ++) {
      Building storage building = buildings[buildingIds[i]];
      goldRate[i] = building.goldRate;
      crystalRate[i] = building.crystalRate;
      price[i] = building.price;
      resource[i] = building.resource;
      blocks[i] = building.blocks;
      previousLevelId[i] = building.previousLevelId;
      typeId[i] = building.typeId;
    }

    return(goldRate,
           crystalRate,
           price,
           resource,
           blocks,
           previousLevelId,
           typeId);
  }

  /*
   * @notice Create new definition of a building
   * @dev This method create a new Building definition that can be use on the game.
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new building: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      goldCapacity (int)
   *      crystalCapacity (int)
   *      goldRate (int)
   *      crystalRate (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   *      previousLevelId (int)
   *      typeId (int)
   */
  function addBuilding(uint _id,
                       string _name,
                       int32[] _stats) external onlyOwner {

    bytes32 _buildingNameBytes = stringToBytes32(buildings[_id].name);
    require(_buildingNameBytes == 0x0);
    bytes32 _nameBytes = stringToBytes32(_name);
    require(_nameBytes != 0x0);
    require(_stats[0] >= 0); //"health"
    require(_stats[1] >= 0); //"defense"
    require(_stats[2] >= 0); //"attack"
    require(_stats[3] >= 0); //"goldCapacity"
    require(_stats[4] >= 0); //"crystalCapacity"
    require(_stats[5] >= 0); //"goldRate"
    require(_stats[6] >= 0); //"crystalRate"
    require(_stats[7] >= 0); //"price"
    require(_stats[8] >= 0); //"resource"
    require(_stats[9] >= 0); //"block"
    require(_stats[10] >= 0); //"previousLevelId"
    require(_stats[11] >= 0); //"typeId"

    buildings[_id] = Building(_name,
                              _stats[0],
                              _stats[1],
                              _stats[2],
                              _stats[3],
                              _stats[4],
                              _stats[5],
                              _stats[6],
                              _stats[7],
                              _stats[8],
                              _stats[9],
                              _stats[10],
                              _stats[11]);
    buildingIds.push(_id);
    emit AddBuilding(_id, _name);
  }

  /*
   * @title Update building
   * @dev This method is used to update buildings name and stats
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new building: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      goldCapacity (int)
   *      crystalCapacity (int)
   *      goldRate (int)
   *      crystalRate (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   *      previousLevelId (int)
   *      typeId (int)
   */
  function updateBuilding(uint _id,
                          string _name,
                          int32[] _stats) external onlyOwner {

    bytes32 _buildingNameBytes = stringToBytes32(buildings[_id].name);
    require(_buildingNameBytes != 0x0);

    updateBuildingBasicsA(_id, _name, _stats);
    updateBuildingBasicsB(_id, _stats);

    emit UpdateBuilding(_id, _name);
  }

  /* TODO CHANGE AND RE ORDER AS GET BUILDINGS A
   * @title Update Building Basics A
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param _id (uint)
   * @param _name (string)
   * @param _stats array of stats for the new building: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      goldCapacity (int)
   *      crystalCapacity (int)
   *      goldRate (int)
   *      crystalRate (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   *      previousLevelId (int)
   *      typeId (int)
   */
  function updateBuildingBasicsA(uint _id, string _name, int32[] _stats) internal {
    bytes memory _nameBytes = bytes(_name);
    if ((_nameBytes).length != 0) {
      buildings[_id].name = _name;
    }
    if (_stats[0] >= 0 && buildings[_id].health != _stats[0]) {
      buildings[_id].health = _stats[0];
    }
    if (_stats[1] >= 0 && buildings[_id].defense != _stats[1]) {
      buildings[_id].defense = _stats[1];
    }
    if (_stats[2] >= 0 && buildings[_id].attack != _stats[2]) {
      buildings[_id].attack = _stats[2];
    }
    if (_stats[3] >= 0 && buildings[_id].goldCapacity != _stats[3]) {
      buildings[_id].goldCapacity = _stats[3];
    }
  }

  /* TODO CHANGE AND RE ORDER AS GET BUILDINGS B
   * @title Update Building Basics B
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param _id (uint)
   * @param _stats array of stats for the new building: (int32[])
   *      health (int)
   *      defense (int)
   *      attack (int)
   *      goldCapacity (int)
   *      crystalCapacity (int)
   *      goldRate (int)
   *      crystalRate (int)
   *      price (int)
   *      resource (int)
   *      blocks (int)
   *      previousLevelId (int)
   *      typeId (int)
   */
  function updateBuildingBasicsB(uint _id, int32[] _stats) internal {
      if (_stats[4] >= 0 && buildings[_id].crystalCapacity != _stats[4]) {
        buildings[_id].crystalCapacity = _stats[4];
      }
      if (_stats[5] >= 0 && buildings[_id].goldRate != _stats[5]) {
        buildings[_id].goldRate = _stats[5];
      }
      if (_stats[6] >= 0 && buildings[_id].crystalRate != _stats[6]) {
        buildings[_id].crystalRate = _stats[6];
      }
      if (_stats[7] >= 0 && buildings[_id].price != _stats[7]) {
        buildings[_id].price = _stats[7];
      }
      if (_stats[8] >= 0 && buildings[_id].resource != _stats[8]) {
        buildings[_id].resource = _stats[8];
      }
      if (_stats[9] >= 0 && buildings[_id].blocks != _stats[9]) {
        buildings[_id].blocks = _stats[9];
      }
      if (_stats[10] >= 0 && buildings[_id].previousLevelId != _stats[10]) {
        buildings[_id].previousLevelId = _stats[10];
      }
      if (_stats[11] >= 0 && buildings[_id].typeId != _stats[11]) {
        buildings[_id].typeId = _stats[11];
      }
  }

  /*
   * @title Check Building Exist
   * @dev Check if a building exists.
   * @param _id The id of the building to check. (uint)
   * @return A boolean that indicates if the building exists or not.
   */
  function checkBuildingExist(uint _id) external view returns (bool) {
    bytes memory _buildingNameBytes = bytes(buildings[_id].name);
    return (_buildingNameBytes).length != 0;
  }

  /*
   * @title Check Upgrade
   * @dev Check if the id of the previous level is the correct.
   * @param _id The id of the previous level building. (uint)
   * @param _idOfUpgrade The id of the upgrade. (uint)
   * @return A boolean that indicates if the ids match or not.
   */
  function checkUpgrade(uint _id, uint _idOfUpgrade) external view returns (bool) {
    return buildings[_idOfUpgrade].previousLevelId == int32(_id);
  }

  /*
   * @title Get Building Data
   * @dev Get the price, resource type and number of blocks a building takes to build.
   * @param _id The id of the building. (uint)
   * @return An three uints.
   */
  function getBuildingData(uint _id) external view returns (uint price,
                                                            uint resource,
                                                            uint blocks) {
    bytes memory _buildingNameBytes = bytes(buildings[_id].name);
    if ((_buildingNameBytes).length == 0) return (0,0,0);
    return (
      uint(buildings[_id].price),
      uint(buildings[_id].resource),
      uint(buildings[_id].blocks)
    );
  }

  /*
   * @title Get Gold And Crystal Rates
   * @dev Get the amount of gold and crystal a building produce for block.
   * @param _id The id of the building. (uint)
   * @return An two uints.
   */
  function getGoldAndCrystalRates(uint _id) external view returns (uint goldRate,
                                                                   uint crystalRate) {
    bytes memory _buildingNameBytes = bytes(buildings[_id].name);
    if ((_buildingNameBytes).length == 0) return (0,0);

    return (uint(buildings[_id].goldRate), uint(buildings[_id].crystalRate));
  }

  /*
   * @title Get Building Type Id
   * @dev Get the type id of a building.
   */
  function getBuildingTypeId(uint _id) external view returns (uint) {
    return uint(buildings[_id].typeId);
  }

  /*
   * @title Get Gold and Crystal Capacity
   * @dev Get the gold a crystal capacity of a building.
   */
  function getGoldAndCrystalCapacity(uint _id) external view returns (uint goldCapacity,
                                                                      uint crystalCapacity) {
    bytes memory _buildingNameBytes = bytes(buildings[_id].name);
    if ((_buildingNameBytes).length == 0) return (0,0);
    return (uint(buildings[_id].goldCapacity), uint(buildings[_id].crystalCapacity));
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
