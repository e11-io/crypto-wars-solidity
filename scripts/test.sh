#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
  # Kill the ganache instance that we started (if we started one and if it's still running).
  if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
    kill -9 $ganache_pid
  fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
  ganache_port=8355
else
  ganache_port=8345
fi

ganache_running() {
  nc -z localhost "$ganache_port"
}

start_ganache() {
  # We define 10 accounts with balance 1M ether, needed for high-value tests.
  local accounts=(
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d0,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d1,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d2,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d3,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d4,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d5,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d6,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d7,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d8,1000000000000000000000000"
    --account="0x001865fd4b4cfbeb4ec8ac33e00c3569368d2ecaaa7fd5479d9b96854e46e1d9,1000000000000000000000000"
  )

  if [ "$SOLIDITY_COVERAGE" = true ]; then
    node_modules/.bin/testrpc-sc --gasLimit 0xfffffffffff --port "$ganache_port" "${accounts[@]}" > /dev/null &
  else
    node_modules/.bin/ganache-cli --gasLimit 7000000 --port "$ganache_port" "${accounts[@]}" > /dev/null &
  fi

  ganache_pid=$!
}

if ganache_running; then
  echo "Using existing ganache instance"
else
  echo "Starting our own ganache instance"
  start_ganache
fi

if [ "$SOLIDITY_COVERAGE" = true ]; then

  # Run coverage
  node_modules/.bin/solidity-coverage

  if [ "$UPLOAD_COVERALLS" = true ]; then
    cat coverage/lcov.info | node_modules/.bin/coveralls
  fi
else
  SOLIDITY_TEST=true node_modules/.bin/truffle test --network ganache "$@"
fi
