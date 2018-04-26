const ExperimentalToken = artifacts.require('ExperimentalToken');
const SimpleToken = artifacts.require('SimpleToken');
const UserResources = artifacts.require('UserResources');
const UserVault = artifacts.require('UserVault');
const UserVillage = artifacts.require('UserVillage');

const { assertRevert } = require('./helpers/assertThrow')
const { isVersioned } = require('./helpers/isVersioned');
const { setContractsTest } = require('./helpers/setContractsTest');

contract('User Vault Test', accounts => {
  let experimentalToken, userVault, userVillage, simpleToken, userResources;

  const Alice = accounts[0];
  const Bob = accounts[1];
  const ether = Math.pow(10, 18);
  const amountA = 500 * ether;
  const amountB = 200 * ether;

  beforeEach(async () =>  {
    experimentalToken = await ExperimentalToken.new();
    simpleToken = await SimpleToken.new();
    userResources = await UserResources.new();
    userVault = await UserVault.new();
    // We use the deployed UserVillage because we don't need to get a new instance of it every time
    userVillage = await UserVillage.deployed();

    await userVault.setExperimentalToken(experimentalToken.address);
  })

  it('Is Versioned', async () => {
    assert.isTrue(await isVersioned(userVault, UserVault));
  })

  it('Set Contracts', async () => {
    assert.isTrue(await setContractsTest(userVault));
  })

  it('Reclaim token != experimentalToken', async () => {
    const initial_balance = await simpleToken.balanceOf.call(Alice);

    await simpleToken.transfer(Bob, amountA);
    await simpleToken.transfer(userVault.address, amountB, {from: Bob});

    let balance = await simpleToken.balanceOf.call(userVault.address);
    assert.equal(balance.toNumber(), amountB);

    await userVault.reclaimToken(simpleToken.address);

    balance = await simpleToken.balanceOf.call(userVault.address);
    assert.equal(balance.toNumber(), 0);

    balance = await simpleToken.balanceOf.call(Alice);
    assert.equal(balance.toNumber(), initial_balance - (amountA - amountB), 'Alice, wrong balance after reclaimToken');
  })

  it('Reclaim experimentalToken', async () => {
    const initial_balance = await experimentalToken.balanceOf.call(Alice);

    await experimentalToken.transfer(Bob, amountA);
    await experimentalToken.transfer(userVault.address, amountB, {from: Bob});

    let balance = await experimentalToken.balanceOf.call(userVault.address);
    assert.equal(balance.toNumber(), amountB);
    await assertRevert(async () => {
      await userVault.reclaimToken(experimentalToken.address);
    })
  })

  it('Add tokens from account without e11 balance', async () => {
    await experimentalToken.approve(userVault.address, 1 * ether, {from: Bob});

    await assertRevert(async () => {
      await userVault.add(Bob, 1 * ether);
    })
  })

  it('Balance of user without balance', async () => {
    const balance = await userVault.balanceOf.call(Bob);

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

      let balance = await userVault.balanceOf.call(Bob);

      assert.equal(balance.toNumber(), amount);
    })

    it('Add from same user twice', async () => {
      let amount = 1 * ether;

      await userVault.add(Bob, amount);
      await userVault.add(Bob, amount);

      let balance = await userVault.balanceOf.call(Bob);

      assert.equal(balance.toNumber(), amount * 2);
    })
  })
})
