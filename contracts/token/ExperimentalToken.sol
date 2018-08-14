pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract ExperimentalToken is StandardToken {

  string public constant name = "Experimental Token";
  string public constant symbol = "e11";

  uint8 public constant decimals = 18;

  uint256 public constant INITIAL_SUPPLY = 100000000 * 1 ether;

  /**
   * @dev Constructor that gives msg.sender all existing tokens.
   */
  constructor() public {
    totalSupply_ = INITIAL_SUPPLY;
    balances[msg.sender] = INITIAL_SUPPLY;
  }

}
