
const EthereumTx = require('ethereumjs-tx')
const Web3 = require('web3');

const BattleSystem = require('../src/assets/contracts/BattleSystem.json');
const PointsSystem = require('../src/assets/contracts/PointsSystem.json');
const ExperimentalToken = require('../src/assets/contracts/ExperimentalToken.json');
const UserResources = require('../src/assets/contracts/UserResources.json');
const UserUnits = require('../src/assets/contracts/UserUnits.json');
const UserVillage = require('../src/assets/contracts/UserVillage.json');


const contracts = require('../data/contracts');
const buildingsMock = require('../data/production/buildings');
const resourcesMock = require('../data/production/resources');
const deployConfig = require('../mocks/deploy-config');
const { testAccounts } = require('../mocks/populate-poa-environment.json');

const cityCenter_1 = buildingsMock.initialBuildings.find(building => building.name === 'city_center_1');

const initialUserBuildings = [cityCenter_1.id];
const { endpoint, privateKey } = deployConfig.e11;

const newWeb3 = new Web3(endpoint);
const ether = Math.pow(10, 18);

const battleSystemContract = new newWeb3.eth.Contract(BattleSystem.abi, contracts.BattleSystem);
const pointsSystemContract = new newWeb3.eth.Contract(PointsSystem.abi, contracts.PointsSystem);
const experimentalTokenContract = new newWeb3.eth.Contract(ExperimentalToken.abi, contracts.ExperimentalToken);
const userResourcesContract = new newWeb3.eth.Contract(UserResources.abi, contracts.UserResources);
const userUnitsContract = new newWeb3.eth.Contract(UserUnits.abi, contracts.UserUnits);
const userVillageContract = new newWeb3.eth.Contract(UserVillage.abi, contracts.UserVillage);

const executeAttacks = false;

const deployPrivateKey = Buffer.from(privateKey, 'hex');
let deployerNonce = 0;
let accounts = [];

const defaultTxParams = {
  gasPrice: newWeb3.utils.toHex(newWeb3.utils.toWei('1', 'gwei')),
  gasLimit: newWeb3.utils.toHex(8000000),
  value: '0x',
  chainId: 311001
}

function signTransaction(txParams, signerPrivKey) {
  const ethereumTx = new EthereumTx(txParams);
  ethereumTx.sign(signerPrivKey);
  return `0x${ethereumTx.serialize().toString('hex')}`;
}

async function setInitialBuildings(buildings, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(deployerNonce),
    to: contracts.UserVillage,
    data: userVillageContract.methods.setInitialBuildings(buildings).encodeABI(),
  };
  deployerNonce += 1;
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function setInitialResources(resources, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(deployerNonce),
    to: contracts.UserResources,
    data: userResourcesContract.methods.setInitialResources(...resources).encodeABI(),
  };
  deployerNonce += 1;
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function transferE11(to, amount, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(deployerNonce),
    to: contracts.ExperimentalToken,
    data: experimentalTokenContract.methods.transfer(to, amount).encodeABI(),
  };
  deployerNonce += 1;
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function transferEth(to, amount, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    to,
    nonce: newWeb3.utils.toHex(deployerNonce),
  };
  deployerNonce += 1;
  txParams.value = newWeb3.utils.toHex(amount);
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function approve(to, amount, from, signerNonce, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(signerNonce),
    to: contracts.ExperimentalToken,
    data: experimentalTokenContract.methods.approve(to, amount).encodeABI(),
  };
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function createVillage(villageName, userName, from, signerNonce, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(signerNonce),
    to: contracts.UserVillage,
    data: userVillageContract.methods.create(villageName, userName).encodeABI(),
  };
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function attack(to, unitsIds, unitsQuantities, from, signerNonce, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(signerNonce),
    to: contracts.BattleSystem,
    data: battleSystemContract.methods.attack(to, unitsIds, unitsQuantities).encodeABI(),
  };
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function addPoints(user, points, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(deployerNonce),
    to: contracts.PointsSystem,
    data: pointsSystemContract.methods.addPointsToUser(user, points).encodeABI(),
  };
  deployerNonce += 1;
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function addUserUnits(user, unitsIds, unitsQuantities, from, signerPrivKey) {
  const txParams = {
    ...defaultTxParams,
    nonce: newWeb3.utils.toHex(deployerNonce),
    to: contracts.UserUnits,
    data: userUnitsContract.methods.addUserUnits(user, unitsIds, unitsQuantities).encodeABI(),
  };
  deployerNonce += 1;
  const signedTransaction = signTransaction(txParams, signerPrivKey);
  await newWeb3.eth.sendSignedTransaction(signedTransaction, { from });
}

async function getAccounts(oldWeb3) {
  return new Promise((res, rej) => {
    // Get active accounts
    oldWeb3.eth.getAccounts(async (err, accounts) => {
      if (err) rej(err);
      res(accounts);
    });
  });
}

module.exports = async (callback, a, b, c) => {
  try {
    accounts = await getAccounts(web3);
    deployerNonce = await newWeb3.eth.getTransactionCount(accounts[0]);
    for (var i = 0; i < testAccounts.length; i++) {
      const testAccountPrivKey = Buffer.from(testAccounts[i].privKey, 'hex');
      const testAccountHasVillage = await userVillageContract.methods.hasVillage(testAccounts[i].address).call();
      const testAccountPoints = await pointsSystemContract.methods.usersPoints(testAccounts[i].address).call();
      const testAccountUnit = (testAccounts[i].unitsIds && testAccounts[i].unitsIds.length > 0) ? await userUnitsContract.methods.getTotalUserUnitQuantity(testAccounts[i].address, testAccounts[i].unitsIds[0]).call() : 0;
      let testAccountNonce = await newWeb3.eth.getTransactionCount(testAccounts[i].address);

      if (!testAccountHasVillage) {
        let testAccountEthBalance = await newWeb3.eth.getBalance(testAccounts[i].address);
        testAccountEthBalance = newWeb3.utils.fromWei(testAccountEthBalance, 'ether');
        console.log('setting stuff for', testAccounts[i].username, `(${testAccounts[i].address})`);

        // Sets initial buildings and innitial resources
        setInitialBuildings(testAccounts[i].buildings, accounts[0], deployPrivateKey);
        console.log('setted initial buildings');
        setInitialResources(testAccounts[i].resources, accounts[0], deployPrivateKey);
        console.log('setted initial resources');

        // Transfer some e11 tokens to the user (will need to create village)
        transferE11(testAccounts[i].address, 2 * ether, accounts[0], deployPrivateKey);
        console.log('sent token');

        // Transfer some eth to the user (will need to transact)
        await transferEth(testAccounts[i].address, 1 * ether, accounts[0], deployPrivateKey);
        console.log('sent eth');
        // Sending approval for user vault, so it can consume the e11 token
        approve(
          contracts.UserVault,
          1 * ether,
          testAccounts[i].address,
          testAccountNonce,
          testAccountPrivKey
        );
        testAccountNonce += 1;
        console.log(testAccounts[i].username, 'approved userVault');

        // Creating the village
        createVillage(
          testAccounts[i].villagename,
          testAccounts[i].username,
          testAccounts[i].address,
          testAccountNonce,
          testAccountPrivKey
        );
        testAccountNonce += 1;
        console.log(testAccounts[i].username, 'created village', testAccounts[i].villagename);
      } else {
        console.log(testAccounts[i].username, 'already has a village');
      }

      if (parseInt(testAccountPoints) === 0) {
        addPoints(
          testAccounts[i].address,
          testAccounts[i].points,
          accounts[0],
          deployPrivateKey
        );
        console.log(testAccounts[i].username, 'added points', testAccounts[i].points);
      } else {
        console.log(testAccounts[i].username, 'already has points');
      }

      if (testAccounts[i].unitsIds && testAccounts[i].unitsIds.length > 0 && parseInt(testAccountUnit) === 0) {
        await addUserUnits(
          testAccounts[i].address,
          testAccounts[i].unitsIds,
          testAccounts[i].unitsQuantities,
          accounts[0],
          deployPrivateKey
        );
        console.log(testAccounts[i].username, 'added units');
      } else {
        if (!testAccounts[i].unitsIds || (testAccounts[i].unitsIds && testAccounts[i].unitsIds.length === 0))
          console.log(testAccounts[i].username, 'does not have assigned units');
        if (parseInt(testAccountUnit) !== 0) console.log(testAccounts[i].username, 'already has units assigned');
      }

      if (executeAttacks && testAccounts[i].attacks && testAccounts[i].attacks.length > 0) {
        for (let x = 0; x < testAccounts[i].attacks.length; x++){
          await attack(
            testAccounts[i].attacks[x].to,
            testAccounts[i].attacks[x].unitsIds,
            testAccounts[i].attacks[x].unitsQuantities,
            testAccounts[i].address,
            testAccountNonce,
            testAccountPrivKey
          );
          testAccountNonce += 1;
          const attacked = testAccounts.filter(acc => acc.address === testAccounts[i].attacks[x].to);
          const attackedUser = attacked[0].username;
          console.log(testAccounts[i].username, 'attacked', attackedUser);
        }
      } else {
        if (!testAccounts[i].attacks || (testAccounts[i].attacks && testAccounts[i].attacks.length === 0))
          console.log(testAccounts[i].username, 'does not have assigned attacks');
      }
    }
  } catch (err) {
    console.error('error while setting users', err.message);
  }
  try {
    setInitialBuildings(initialUserBuildings, accounts[0], deployPrivateKey);
    await setInitialResources(resourcesMock.initialResources, accounts[0], deployPrivateKey);
    console.log('resetted initial buildings and resources');
  } catch (err) {
    console.error('error while resetting initial buildings and resources', err.message);
  }
  // End process
  process.exit(0);
}
