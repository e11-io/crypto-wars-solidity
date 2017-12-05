#!/usr/bin/env bash
curl http://network.e11.io/e11.json > e11.json
geth --datadir=$HOME/.e11 init e11.json
rm e11.json
geth --networkid=311 --datadir=$HOME/.e11 --cache=512 --bootnodes=enode://f297c16e1847d4174f74eb308da3505cfaa0b3a9cd0c14a71c31370387556f572e678f6ab36edd8da58b8dd0b6bf26cac1e40f95d577d0f2c8f1abea616a36c7@35.163.201.132:30303 --rpc --rpcport 8311 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "bd,eth,net,web3,debug,personal"
