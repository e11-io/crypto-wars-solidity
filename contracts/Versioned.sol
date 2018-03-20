pragma solidity ^0.4.18;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

/**
 * @title Versioned
 * @dev The Versioned contract has a version number, and provides migration functionality.
 */
contract Versioned is Ownable {
  uint public version;
  mapping(address => bool) public migratedUsers;

  event UserMigrated(address indexed user, address indexed newContract);

  /**
   * @dev The Versioned constructor, unused
  function Versioned() public {
  }
  */

  /**
   * @dev Throws if called by a migrated user.
   */
  modifier notMigrated() {
    require(migratedUsers[msg.sender] != true);
    _;
  }

  /**
   * @dev Sets the contract's version
   */
  function setVersion(uint _version) public onlyOwner {
    version = _version;
  }

  /**
   * @dev Allows the user to migrate itself to a new contract.
   * @param _newContract The address of the contract to transfer the user to.
   * It checks if the new contract has a valid mayor version.
   */
  function migrateUser(Versioned _newContract) public notMigrated {
    require(_newContract.version() > version);
    migratedUsers[msg.sender] = true;
    UserMigrated(msg.sender, _newContract);
  }

}
