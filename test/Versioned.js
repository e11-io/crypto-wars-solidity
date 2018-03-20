'use strict';
const { assertRevert } = require('./helpers/assertThrow');

const Versioned = artifacts.require('Versioned');

contract('Versioned', function(accounts) {
  let versioned;
  const Alice = accounts[0];
  const Bob = accounts[1];

  beforeEach(async function() {
    versioned = await Versioned.new();
  });

  it('should not have version', async function() {
    let version = await versioned.version();
    assert.isTrue(version.toNumber() === 0);
  });

  it('should set version', async function() {
    await versioned.setVersion(1);
    let version = await versioned.version();
    assert.isTrue(version.toNumber() === 1);
  });

  it('should not allow to set version if not an owner', async function() {
    return assertRevert(async () => {
      await versioned.setVersion(1, {from: Bob});
    });
  });

  it('should not allow to migrate user', async function() {
    let versioned2 = await Versioned.new();
    return assertRevert(async () => {
      await versioned.migrateUser(versioned2.address);
    });
  });

  it('should allow to migrate user', async function() {
    let versioned2 = await Versioned.new();
    await versioned2.setVersion(1);
    await versioned.migrateUser(versioned2.address);
    let migrated = await versioned.migratedUsers.call(Alice);
    assert.isTrue(migrated);
  });

  it('should not allow to migrate user more than once', async function() {
    let versioned2 = await Versioned.new();
    await versioned2.setVersion(1);
    await versioned.migrateUser(versioned2.address);
    let migrated = await versioned.migratedUsers.call(Alice);
    return assertRevert(async () => {
      await versioned.migrateUser(versioned2.address);
    });
  });

});
