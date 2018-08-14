#!/usr/bin/env bash
curl https://e11.io/e11-private.json > e11-private.json
geth --datadir=$HOME/.e11private init e11-private.json
rm e11-private.json
geth --networkid=311 --datadir=$HOME/.e11private --cache=512 --bootnodes enode://5ad3d840d39a91cbdf8082ded225c2b1ae62e2432aaa8e95c6a551713d6f0a497fe9129628d08a7ddb0adaf8fe9c129f3adc66abdb436c0587c061fd4962b212@54.201.158.240:30303 --rpc --rpcport 8311 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "bd,eth,net,web3,debug,personal"
