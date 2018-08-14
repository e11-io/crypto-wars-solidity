#!/usr/bin/env bash
curl https://e11.io/genesis-311001.json > genesis-311001.json
geth --datadir=$HOME/.e11-311001 init genesis-311001.json
rm genesis-311001.json
geth --networkid=311001 --datadir=$HOME/.e11-311001 --cache=512 --bootnodes=enode://64fe0a3ba632a7699714859eda5fd7fe331ce7ada82163f7d304494a5da2f3f36d8a63cc301fd5cd4b7f99619519ecd42ebd4e4f7b015823b2409b63ba5acbe0@34.217.128.7:30303 --rpc --rpcport 8311 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "bd,eth,net,web3,debug,personal"
