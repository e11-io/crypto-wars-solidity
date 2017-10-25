const ExperimentalToken = artifacts.require('ExperimentalToken');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');
const SimpleToken = artifacts.require('SimpleToken');
const UserResources = artifacts.require('UserResources');

const { assertInvalidOpcode } = require('./helpers/assertThrow')

contract('User Vault Test', accounts => {
  let experimentalToken, userVault, userVillage, simpleToken, userResources = {};

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10, 18);
  const amountA = 500 * ether;
  const amountB = 200 * ether;

  beforeEach(async () =>  {
    experimentalToken = await ExperimentalToken.new();
    simpleToken = await SimpleToken.new();
    userVault = await UserVault.new(experimentalToken.address);
    userResources = await UserResources.new();

    // We deployed this one because we don't need to get a new instance of it every time
    userVillage = await UserVillage.deployed();
  })

  it('Reclaim token != experimentalToken', async () => {
    const initial_balance = await simpleToken.balanceOf(Alice);

    await simpleToken.transfer(Bob, amountA);
    await simpleToken.transfer(userVault.address, amountB, {from: Bob});

    assert.equal((await simpleToken.balanceOf(userVault.address)).toNumber(), amountB);

    await userVault.reclaimToken(simpleToken.address);

    assert.equal((await simpleToken.balanceOf(userVault.address)).toNumber(), 0);

    const balance = await simpleToken.balanceOf(Alice);

    assert.equal(balance.toNumber(), initial_balance - (amountA - amountB), 'Alice, wrong balance after reclaimToken');
  })

  it('Reclaim experimentalToken', async () => {
    const initial_balance = await experimentalToken.balanceOf(Alice);

    await experimentalToken.transfer(Bob, amountA);
    await experimentalToken.transfer(userVault.address, amountB, {from: Bob});

    assert.equal((await experimentalToken.balanceOf(userVault.address)).toNumber(), amountB);

    return assertInvalidOpcode(async () => {
      await userVault.reclaimToken(experimentalToken.address);
    })
  })

  it('Add tokens from account without e11 balance', async () => {
    await experimentalToken.approve(userVault.address, 1 * ether, {from: Bob});

    return assertInvalidOpcode(async () => {
      await userVault.add(Bob, 1 * ether);
    })
  })

  it('Balance of user without balance', async () => {
    const balance = await userVault.balanceOf(Bob);

    assert.equal(balance.toNumber(), 0);
  })

  context('User with balance period', async () => {
    beforeEach(async () => {
      await experimentalToken.transfer(Bob, 5 * ether);
      await experimentalToken.approve(userVault.address, 2 * ether, {from: Bob});
    })

    it('Add tokens from account with e11', async () => {
      let amount = 1 * ether;
      await userVault.add(Bob, amount);

      const balance = await userVault.balanceOf(Bob);

      assert.equal(balance.toNumber(), amount);
    })

    it('Add from same user twice', async () => {
      let amount = 1 * ether;

      await userVault.add(Bob, amount);
      await userVault.add(Bob, amount);

      const balance = await userVault.balanceOf(Bob);

      assert.equal(balance.toNumber(), amount * 2);
    })
  })
})
