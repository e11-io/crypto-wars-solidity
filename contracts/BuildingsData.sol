pragma solidity ^0.4.15;

import 'zeppelin-solidity/contracts/ownership/NoOwner.sol';

/**
 * @title BuildingsData (WIP)
 * @notice This contract specifies how buildings are set up.
 * @dev You can add buildings and update them
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/5
 */
contract BuildingsData is NoOwner {

  /**
   * @dev event for adding building to contract logging
   * @param id of the building
	 * @param name the name of the building
   * @param health the health of the building
   * @param defense the defense of the building
   * @param attack the attack of the building
   * @param goldCapacity the amount of gold the building can store
   * @param crystalEnergyCapacity the amount of crystal energy the building can store
   * @param price the price to build the structure
   * @param resource the resource used to create the building
   */
  event AddBuilding(uint id,
                    string name,
                    int health,
                    int defense,
                    int attack,
                    int goldCapacity,
                    int crystalEnergyCapacity,
                    int price,
                    int resource);

  /**
   * event for updating a building logging
   * @dev int params with -1 are ignored
   * @param id of the building
   * @param name the name of the building
   * @param health the health of the building
   * @param defense the defense of the building
   * @param attack the attack of the building
   * @param goldCapacity the amount of gold the building can store
   * @param crystalEnergyCapacity the amount of crystal energy the building can store
   * @param price the price to build the structure
   * @param resource the resource used to create the building
   */
  event UpdateBuilding(uint id,
                       string name,
                       int health,
                       int defense,
                       int attack,
                       int goldCapacity,
                       int crystalEnergyCapacity,
                       int price,
                       int resource);

  struct Building {
    string name;
    int health;
    int defense;
    int attack;
    int goldCapacity;
    int crystalEnergyCapacity;
    int price;
    int resource;
  }

  mapping (uint => Building) public buildings;

  function BuildingsData() {
  }

  /*
   * @notice Create new definition of a building
   * @dev This method create a new Building definition that can be use on the game.
   * @param id (uint)
   * @param name (string)
   * @param health (int)
   * @param defense (int)
   * @param attack (int)
   * @param goldCapacity (int)
   * @param crystalEnergyCapacity (int)
   * @param price (int)
   * @param resource (int)
   */
  function addBuilding(uint id,
                       string name,
                       int health,
                       int defense,
                       int attack,
                       int goldCapacity,
                       int crystalEnergyCapacity,
                       int price,
                       int resource) external onlyOwner {

    require(id >= 0);
    require(keccak256(buildings[id].name) == keccak256(""));
    require(keccak256(name) != keccak256(""));
    require(health >= 0);
    require(defense >= 0);
    require(attack >= 0);
    require(goldCapacity >= 0);
    require(crystalEnergyCapacity >= 0);
    require(price >= 0);
    require(resource >= 0);

    buildings[id] = Building(name,health,defense,attack,goldCapacity,crystalEnergyCapacity,price,resource);

    Building storage build = buildings[id];
    AddBuilding(id, build.name, build.health, build.defense, build.attack,
                    build.goldCapacity, build.crystalEnergyCapacity, build.price, build.resource);


  }

  /*
   * @title Update building
   * @dev This method
   * @param id (uint)
   * @param name (string)
   * @param health (int)
   * @param defense (int)
   * @param attack (int)
   * @param goldCapacity (int)
   * @param crystalEnergyCapacity (int)
   * @param price (int)
   * @param resource (int)
   */
  function updateBuilding(uint id,
                          string name,
                          int health,
                          int defense,
                          int attack,
                          int goldCapacity,
                          int crystalEnergyCapacity,
                          int price,
                          int resource) external onlyOwner {
    require(id >= 0);
    require(keccak256(buildings[id].name) != keccak256(""));
    Building storage build = buildings[id];
    if (keccak256(name) != keccak256("")) {
      build.name = name;
    }
    if (health >= 0 && build.health != health) {
      build.health = health;
    }
    if (defense >= 0 && build.defense != defense) {
      build.defense = defense;
    }
    if (attack >= 0 && build.attack != attack) {
      build.attack = attack;
    }
    if (goldCapacity >= 0 && build.goldCapacity != goldCapacity) {
      build.goldCapacity = goldCapacity;
    }
    if (crystalEnergyCapacity >= 0 && build.crystalEnergyCapacity != crystalEnergyCapacity) {
      build.crystalEnergyCapacity = crystalEnergyCapacity;
    }
    if (price >= 0 && build.price != price) {
      build.price = price;
    }
    if (resource >= 0 && build.resource != resource) {
      build.resource = resource;
    }

    UpdateBuilding(id, build.name, build.health, build.defense, build.attack,
                    build.goldCapacity, build.crystalEnergyCapacity, build.price, build.resource);
  }

  function checkBuildingExist(uint id) external returns (bool) {
    require(id >= 0);
    require(keccak256(buildings[id].name) != keccak256(""));
    return true;
  }

}
