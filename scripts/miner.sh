#!/usr/bin/env bash
curl http://network.e11.io/e11.json > e11.json
geth init --datadir .datadir e11.json
rm e11.json
geth --networkid 311 --cache 512 --port 30303 --maxpeers 50 --bootnodesv4 enode://f297c16e1847d4174f74eb308da3505cfaa0b3a9cd0c14a71c31370387556f572e678f6ab36edd8da58b8dd0b6bf26cac1e40f95d577d0f2c8f1abea616a36c7@35.163.201.132:30303 --bootnodesv5 enode://f297c16e1847d4174f74eb308da3505cfaa0b3a9cd0c14a71c31370387556f572e678f6ab36edd8da58b8dd0b6bf26cac1e40f95d577d0f2c8f1abea616a36c7@35.163.201.132:30303?discport=30304 --unlock 0 --password signer.pass --mine --targetgaslimit 6000000 --gasprice 18000000000 --keystore . --datadir .datadir --rpc --rpcport 8311 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "bd,eth,net,web3,debug,personal"
