pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';
import 'openzeppelin-solidity/contracts/ownership/CanReclaimToken.sol';
import 'openzeppelin-solidity/contracts/ownership/HasNoContracts.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';
import 'openzeppelin-solidity/contracts/token/ERC20/ERC20Basic.sol';


contract ExperimentalPreICO is CanReclaimToken, HasNoContracts {
  using SafeMath for uint256;

  address public beneficiary;
  bool public fundingGoalReached = false;
  bool public crowdsaleClosed = false;
  ERC20Basic public rewardToken;
  uint256 public fundingGoal;
  uint256 public fundingCap;
  uint256 public paymentMin;
  uint256 public paymentMax;
  uint256 public amountRaised;
  uint256 public rate;

  mapping(address => uint256) public balanceOf;
  mapping(address => bool) public whitelistedAddresses;
  event GoalReached(address beneficiaryAddress, uint256 amount);
  event FundTransfer(address backer, uint256 amount, bool isContribution);

  /**
   * @dev data structure to hold information about campaign contributors
   */
  constructor(address _wallet,
              uint256 _goalInEthers,
              uint256 _capInEthers,
              uint256 _minPaymentInEthers,
              uint256 _maxPaymentInEthers,
              uint256 _rate,
              address _rewardToken) public {
    require(_goalInEthers > 0);
    require(_capInEthers >= _goalInEthers);
    require(_minPaymentInEthers > 0);
    require(_maxPaymentInEthers > _minPaymentInEthers);
    require(_rate > 0);
    require(_wallet != 0x0);
    beneficiary = _wallet;
    fundingGoal = _goalInEthers.mul(1 ether);
    fundingCap = _capInEthers.mul(1 ether);
    paymentMin = _minPaymentInEthers.mul(1 ether);
    paymentMax = _maxPaymentInEthers.mul(1 ether);
    rate = _rate;
    rewardToken = ERC20Basic(_rewardToken);
  }

  /**
   * @dev The default function that is called whenever anyone sends funds to the contract
   */
  function () external payable crowdsaleActive {
    require(validPurchase());
    uint256 amount = msg.value;
    balanceOf[msg.sender] = balanceOf[msg.sender].add(amount);
    amountRaised = amountRaised.add(amount);
    rewardToken.transfer(msg.sender, amount.mul(rate));
    emit FundTransfer(msg.sender, amount, true);
  }

  /**
   * @dev Throws if called when crowdsale is still open.
   */
  modifier crowdsaleEnded() {
    require(crowdsaleClosed == true);
    _;
  }

  /**
   * @dev Throws if called when crowdsale has closed.
   */
  modifier crowdsaleActive() {
    require(crowdsaleClosed == false);
    _;
  }

  /**
   * @dev return true if the transaction can buy tokens
   */
  function validPurchase() internal view returns (bool) {
    bool whitelisted = whitelistedAddresses[msg.sender] == true;
    bool validAmmount = msg.value >= paymentMin && msg.value <= paymentMax;
    bool availableFunding = fundingCap >= amountRaised.add(msg.value);
    return whitelisted && validAmmount && availableFunding;
  }

  /**
   * @dev checks if the goal has been reached
   */
  function checkGoal() external onlyOwner {
    if (amountRaised >= fundingGoal){
      fundingGoalReached = true;
      emit GoalReached(beneficiary, amountRaised);
    }
  }

  /**
   * @dev ends or resumes the crowdsale
   */
  function endCrowdsale() external onlyOwner {
    crowdsaleClosed = true;
  }

  /**
   * @dev Allows backers to withdraw their funds in the crowdsale was unsuccessful,
   * and allow the owner to send the amount raised to the beneficiary
   */
  function safeWithdrawal() external crowdsaleEnded {
    if (!fundingGoalReached) {
      uint256 amount = balanceOf[msg.sender];
      balanceOf[msg.sender] = 0;
      if (amount > 0) {
        if (msg.sender.send(amount)) {
          emit FundTransfer(msg.sender, amount, false);
        } else {
          balanceOf[msg.sender] = amount;
        }
      }
    }

    if (fundingGoalReached && owner == msg.sender) {
      if (beneficiary.send(amountRaised)) {
        emit FundTransfer(beneficiary, amountRaised, false);
      } else {
        //If we fail to send the funds to beneficiary, unlock funders balance
        fundingGoalReached = false;
      }
    }
  }

  /**
   * @dev Whitelists a list of addresses
   */
  function whitelistAddress (address[] addresses) external onlyOwner crowdsaleActive {
    for (uint i = 0; i < addresses.length; i++) {
      whitelistedAddresses[addresses[i]] = true;
    }
  }

  function activeCrowdsale() external onlyOwner {
    crowdsaleClosed = false;
  }
}
