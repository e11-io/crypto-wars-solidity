pragma solidity ^0.4.15;

/**
 * @title BuildingsQueue (NOT-STARTED)
 * @dev Issue: * https://github.com/e11-io/crypto-wars-solidity/issues/4
 */
contract BuildingsQueue {

  struct Build {
    uint id;
    uint skin;
    uint start;
    uint end;
  }

  mapping (address => Build[]) public userBuildingsQueue;

}
