pragma solidity ^0.4.23;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';
import './Versioned.sol';

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
   * @notice Create new definition of a building
   * @dev This method create a new Building definition that can be use on the game.
   * @param id (uint)
   * @param name (string)
   * @stats array of stats for the new building: (int32[])
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
  function addBuilding(uint id,
                       string name,
                       int32[] stats) external onlyOwner {

    require(keccak256(buildings[id].name) == keccak256(""));
    require(keccak256(name) != keccak256(""));
    require(stats[0] >= 0); //"health"
    require(stats[1] >= 0); //"defense"
    require(stats[2] >= 0); //"attack"
    require(stats[3] >= 0); //"goldCapacity"
    require(stats[4] >= 0); //"crystalCapacity"
    require(stats[5] >= 0); //"goldRate"
    require(stats[6] >= 0); //"crystalRate"
    require(stats[7] >= 0); //"price"
    require(stats[8] >= 0); //"resource"
    require(stats[9] >= 0); //"block"
    require(stats[10] >= 0); //"previousLevelId"
    require(stats[11] >= 0); //"typeId"

    buildings[id] = Building(name,
                             stats[0],
                             stats[1],
                             stats[2],
                             stats[3],
                             stats[4],
                             stats[5],
                             stats[6],
                             stats[7],
                             stats[8],
                             stats[9],
                             stats[10],
                             stats[11]);
    buildingIds.push(id);
    emit AddBuilding(id, name);
  }

  /*
   * @title Update building
   * @dev This method is used to update buildings name and stats
   * @param id (uint)
   * @stats array of stats for the new building: (int32[])
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
  function updateBuilding(uint id,
                          string name,
                          int32[] stats) external onlyOwner {
    require(keccak256(buildings[id].name) != keccak256(""));

    updateBuildingBasicsA(id, name, stats);
    updateBuildingBasicsB(id, stats);

    emit UpdateBuilding(id, name);
  }

  /*
   * @title Update Building Basics A
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param id (uint)
   * @stats array of stats for the new building: (int32[])
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
  function updateBuildingBasicsA(uint id, string name, int32[] stats) internal {
      if (keccak256(name) != keccak256("")) {
        buildings[id].name = name;
      }
      if (stats[0] >= 0 && buildings[id].health != stats[0]) {
        buildings[id].health = stats[0];
      }
      if (stats[1] >= 0 && buildings[id].defense != stats[1]) {
        buildings[id].defense = stats[1];
      }
      if (stats[2] >= 0 && buildings[id].attack != stats[2]) {
        buildings[id].attack = stats[2];
      }
      if (stats[3] >= 0 && buildings[id].goldCapacity != stats[3]) {
        buildings[id].goldCapacity = stats[3];
      }
  }

  /*
   * @title Update Building Basics B
   * @dev This method does part of the checks to update or not each stat.
   * Its necessary to divide in two function because of the limited amout of storage
   * variables solidity allows to use.
   * @param id (uint)
   * @stats array of stats for the new building: (int32[])
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
  function updateBuildingBasicsB(uint id, int32[] stats) internal {
      if (stats[4] >= 0 && buildings[id].crystalCapacity != stats[4]) {
        buildings[id].crystalCapacity = stats[4];
      }
      if (stats[5] >= 0 && buildings[id].goldRate != stats[5]) {
        buildings[id].goldRate = stats[5];
      }
      if (stats[6] >= 0 && buildings[id].crystalRate != stats[6]) {
        buildings[id].crystalRate = stats[6];
      }
      if (stats[7] >= 0 && buildings[id].price != stats[7]) {
        buildings[id].price = stats[7];
      }
      if (stats[8] >= 0 && buildings[id].resource != stats[8]) {
        buildings[id].resource = stats[8];
      }
      if (stats[9] >= 0 && buildings[id].blocks != stats[9]) {
        buildings[id].blocks = stats[9];
      }
      if (stats[10] >= 0 && buildings[id].previousLevelId != stats[10]) {
        buildings[id].previousLevelId = stats[10];
      }
      if (stats[11] >= 0 && buildings[id].typeId != stats[11]) {
        buildings[id].typeId = stats[11];
      }
  }

  /*
   * @title Check Building Exist
   * @dev Check if a building exists.
   * @param _id The id of the building to check. (uint)
   * @return A boolean that indicates if the building exists or not.
   */
  function checkBuildingExist(uint _id) external view returns (bool) {
    return keccak256(buildings[_id].name) != keccak256("");
  }

  /*
   * @title Check Upgrade
   * @dev Check if the id of the previous level is the correct.
   * @param _id The id of the previous level building. (uint)
   * @param _idOfUpgrade The id of the upgrade. (uint)
   * @return A boolean that indicates if the ids match or not.
   */
  function checkUpgrade(uint _id, uint _idOfUpgrade) external view returns (bool) {
    require(buildings[_idOfUpgrade].previousLevelId == int32(_id));
    return true;
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
    require(keccak256(buildings[_id].name) != keccak256(""));
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
    require(keccak256(buildings[_id].name) != keccak256(""));
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
    require(keccak256(buildings[_id].name) != keccak256(""));
    return (uint(buildings[_id].goldCapacity), uint(buildings[_id].crystalCapacity));
  }

}
