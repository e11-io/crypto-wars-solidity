const ExperimentalToken = artifacts.require('ExperimentalToken');
const ExperimentalPreICO = artifacts.require('ExperimentalPreICO');

// IMPORTANT: This test is made for reachedGoal: 10 ETH, and capGoal 13 ETH.
const { assertRevert, assertSenderWithoutFunds } = require('../helpers/assertThrow');

const preICOMock = require('../../data/preICO');

const goalInEthers = preICOMock.goal
const capInEthers = preICOMock.cap
const minPaymentInEthers = preICOMock.minPayment
const maxPaymentInEthers = preICOMock.maxPayment
const rate = preICOMock.rate

contract('ExperimentalPreICO', function(accounts) {

  let experimentalToken, preICO;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const Carol = accounts[2];

  const wallet = Alice;

  const ether = Math.pow(10, 18);
  const e11Amount = preICOMock.cap * preICOMock.rate * ether;


  beforeEach(async () => {
    experimentalToken = await ExperimentalToken.new();
    preICO = await ExperimentalPreICO.new(
      wallet,
      goalInEthers,
      capInEthers,
      minPaymentInEthers,
      maxPaymentInEthers,
      rate,
      experimentalToken.address
    );

  })

  it('Trasnfering e11 from ExperimentalToken to Pre ICO contract', async() => {
    await experimentalToken.transfer(preICO.address, e11Amount);

    let balance = await experimentalToken.balanceOf(preICO.address);

    assert.equal(balance.toNumber(), e11Amount, 'PreICO didnt recieved e11')

  });

  it('PreICO Whitlisting', async() => {
    await preICO.whitelistAddress([Alice, Bob]);

    let isWhitelisted = await preICO.whitelistedAddresses(Bob);

    assert.equal(isWhitelisted, true, 'The account is not whitelisted');
  });

  it('Purchase token without being whitelisted', async() => {
    await assertRevert(async () => {
      await web3.eth.sendTransaction({from: Carol, to: preICO.address, value: ether, gas: 1000000});
    })
  });

  context('PreICO contract has tokens and Bob whitelisted period', async () => {
    beforeEach(async () => {
      await experimentalToken.transfer(preICO.address, e11Amount);
      await preICO.whitelistAddress([Bob]);
    })

    it('PreICO first purchase', async() => {
      let bob_initial_e11 = await experimentalToken.balanceOf(Bob);

      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: ether, gas: 7000000, gasPrice: 0 });

      let bob_final_e11 = await experimentalToken.balanceOf(Bob);

      assert.equal(bob_final_e11.toNumber(), bob_initial_e11.toNumber() + ether * preICOMock.rate);
    });

    it('Max payments', async() => {
      let bob_initial_e11 = await experimentalToken.balanceOf(Bob);
      let bob_initial_eth =  await web3.eth.getBalance(Bob);
      let maxPayment = preICOMock.maxPayment;

      await web3.eth.sendTransaction({from:Bob, to: preICO.address, value: maxPayment * ether, gas: 7000000, gasPrice: 0 });

      let bob_final_e11 = await experimentalToken.balanceOf(Bob);
      let bob_final_eth =  await web3.eth.getBalance(Bob);

      let finalBalance = bob_initial_e11.toNumber() / ether + maxPayment * preICOMock.rate;
      assert.equal(bob_final_e11.toNumber() / ether, finalBalance)
    });

    it('Safe Withdrawal After crowdsaleClosed', async() => {
      const amount = 1;
      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });

      let bob_initial_eth = await web3.eth.getBalance(Bob);

      await preICO.endCrowdsale();
      await preICO.safeWithdrawal({from: Bob, gas: 100000, gasPrice: 0});

      let bob_final_eth =  await web3.eth.getBalance(Bob);

      assert.equal(Math.round(bob_final_eth.toNumber() / ether), Math.round(bob_initial_eth.toNumber() / ether + amount))
    });

    it('Reach Eth Goal', async() => {
      const amount = 3;
      let alice_initial_eth =  await web3.eth.getBalance(Alice);

      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });
      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });
      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });
      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: 1 * ether, gas: 7000000, gasPrice: 0 });

      await preICO.endCrowdsale({gas: 7000000, gasPrice: 0 });
      await preICO.checkGoal({gas: 7000000, gasPrice: 0 });
      await preICO.safeWithdrawal({gas: 7000000, gasPrice: 0 });

      let amountRaised = await preICO.amountRaised.call();
      let alice_final_eth =  await web3.eth.getBalance(Alice);
      let fundingGoalReached = await preICO.fundingGoalReached.call();

      assert.equal(fundingGoalReached, true);
      assert.equal(alice_final_eth.equals(alice_initial_eth.plus(amountRaised)), true);
    });

    it('Try endCrowdsale Without Ownership', async() => {
      await assertRevert(async () => {
        await preICO.endCrowdsale({from: Bob});
      })
    });

    it('Reactivates Crowdsale', async () => {
      assert.equal(await preICO.crowdsaleClosed(), false);
      await preICO.endCrowdsale();
      assert.equal(await preICO.crowdsaleClosed(), true);
      await preICO.activeCrowdsale();
      assert.equal(await preICO.crowdsaleClosed(), false);
    });

    it('Safe Withdrawal Before crowdsaleClosed', async() => {
      const amount = 3;

      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });

      await assertRevert(async () => {
        await preICO.safeWithdrawal({from: Bob, gas: 7000000, gasPrice: 0 });
      })
    });

    it('Safe Withdrawal of a non contributor when goal not reached', async() => {
      const amount = 3;
      let carol_initial_eth =  await web3.eth.getBalance(Carol);

      await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: amount * ether, gas: 7000000, gasPrice: 0 });
      await preICO.endCrowdsale();
      await preICO.safeWithdrawal({from: Carol, gas: 7000000, gasPrice: 0 });


      let carol_final_eth =  await web3.eth.getBalance(Carol);

      assert.equal(carol_final_eth.toNumber(), carol_initial_eth.toNumber());
    });

    it('Transfer OnwerShip', async() => {
      await preICO.transferOwnership(Bob);

      let owner = await preICO.owner.call();

      assert.equal(owner, Bob);
    });

    it('Try buying without ether', async() => {
      const bob_initial_eth = await web3.eth.getBalance(Bob);

      amount = bob_initial_eth.toNumber() - 0.5 * ether;

      await web3.eth.sendTransaction({from: Bob, to: Alice, value: amount, gas: 7000000, gasPrice: 0});

      const bob_final_eth = await web3.eth.getBalance(Bob);

      await assertSenderWithoutFunds(async () => {
       await web3.eth.sendTransaction({from: Bob, to: preICO.address, value: ether, gas: 7000000, gasPrice: 0});
      })
    });
  })
});
