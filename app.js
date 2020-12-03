const Web3 = require('web3')
window["ethereumHelper"] = {
  ethereumjsCommon: require("ethereumjs-common"),
  ethereumjsTx: require("ethereumjs-tx"),
  web3: new Web3(),
  abiDecoder: require('abi-decoder'),
  signUtils: require("eth-sig-util"),
  ethereumjsutil: require("ethereumjs-util"),
  bops: require("bops"),
  ethereumCryptography: require("ethereum-cryptography/secp256k1"),
};
