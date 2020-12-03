const Ethereum = (function () {
  let privateKey;
  const erc_20_abi = [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "spender",
          type: "address",
        },
        {
          name: "value",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "xxx",
      outputs: [
        {
          name: "",
          type: "bytes32",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "from",
          type: "address",
        },
        {
          name: "to",
          type: "address",
        },
        {
          name: "value",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [
        {
          name: "",
          type: "uint8",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "to",
          type: "address",
        },
        {
          name: "value",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
        {
          name: "",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          name: "_totalSupply",
          type: "uint256",
        },
        {
          name: "_name",
          type: "string",
        },
        {
          name: "_symbol",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          name: "to",
          type: "address",
        },
        {
          indexed: false,
          name: "value",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          name: "value",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
  ];
  let rpcEndpoit;
  let chainId = 1;
  const txCommonArray = {
    1: { chain: "mainnet" },
    3: { chain: "ropsten" },
    4: { chain: "rinkeby" },
    5: { chain: "goerli" },
    42: { chain: "kovan" },
  };
  function _signSend(body) {
    const tx = new ethereumHelper.ethereumjsTx.Transaction(
      body,
      txCommonArray[chainId]
    );
    tx.sign(ethereumHelper.bops.from(privateKey, "hex"));
    const txStr = "0x" + tx.serialize().toString("hex");
    return txStr;
  }

  function rpcRequest(payload, cb) {
    fetch(rpcEndpoit, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ ...payload, id: 1, jsonrpc: "2.0" }),
    })
      .then((res) => res.json())
      .then((res) => {
        cb(null, res);
      })
      .catch((err) => {
        cb(err.message, "");
      });
  }

  return class InnerEthereum {
    constructor(config) {
      ethereumHelper.abiDecoder.addABI(erc_20_abi);
      rpcEndpoit = config.url;
      privateKey = config.privateKey.startsWith("0x")
        ? config.privateKey.substr(2)
        : config.privateKey;
      this.isMetaMask = false;
      this.selectedAddress = null;
      this.networkVersion = null;
      this.chainId = null;
      this.events = Object.create(null);
      this.accounts = [];
      this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
      this._sendSync = this._sendSync.bind(this);
      this._rpcRequest = this._rpcRequest.bind(this);
      this.enable = this.enable.bind(this);
      this.request = this.request.bind(this);
      this.send = this.send.bind(this);
      this.sendAsync = this.sendAsync.bind(this);
      this.selectedAddress = ethereumHelper.web3.eth.accounts.privateKeyToAccount(
        privateKey
      ).address;
      this.accounts.push(this.selectedAddress);
      setTimeout(() => {
        this._rpcRequest(
          {
            method: "net_version",
            params: [],
          },
          (err, res) => {
            if (err) throw "network error";
            this.chainId = res.result;
            chainId = res.result;
            this.networkVersion = this.chainId;
            if (!txCommonArray[+res.result]) {
              txCommonArray[+res.result] = {
                common: ethereumHelper.ethereumjsCommon.default.forCustomChain(
                  "mainnet",
                  {
                    name: "custom",
                    networkId: +this.chainId,
                    chainId: +this.chainId,
                  },
                  "petersburg"
                ),
              };
            }
            this.emit("chainChanged", this.chainId);
            this.emit("connect", { chainId: this.chainId });
          }
        );
      }, 1000);
    }
    isConnected() {
      return true;
    }

    request(args) {
      const { method, params } = args;
      return new Promise((resolve, reject) => {
        this._rpcRequest(
          { method, params },
          this._getRpcPromiseCallback(resolve, reject)
        );
      });
    }

    sendAsync(payload, cb) {
      this._rpcRequest(payload, cb);
    }

    send(methodOrPayload, callbackOrArgs) {
      if (
        typeof methodOrPayload === "string" &&
        (!callbackOrArgs || Array.isArray(callbackOrArgs))
      ) {
        return new Promise((resolve, reject) => {
          try {
            this._rpcRequest(
              { method: methodOrPayload, params: callbackOrArgs },
              this._getRpcPromiseCallback(resolve, reject, false)
            );
          } catch (error) {
            reject(error);
          }
        });
      } else if (
        typeof methodOrPayload === "object" &&
        typeof callbackOrArgs === "function"
      ) {
        return this._rpcRequest(methodOrPayload, callbackOrArgs);
      }
      return this._sendSync(methodOrPayload);
    }

    _rpcRequest(payload, callback, isInternal = false) {
      let cb = callback;
      if (!Array.isArray(payload)) {
        if (
          payload.method === "eth_accounts" ||
          payload.method === "eth_requestAccounts"
        ) {
          cb = (err, res) => {
            this._handleAccountsChanged(
              res.result || [],
              payload.method === "eth_accounts",
              isInternal
            );
            callback(err, res);
          };
        }
      }
      this._handleRpc(payload, cb);
    }

    enable() {
      return new Promise((resolve, reject) => {
        try {
          this._rpcRequest(
            { method: "eth_requestAccounts", params: [] },
            this._getRpcPromiseCallback(resolve, reject)
          );
        } catch (error) {
          reject(error);
        }
      });
    }

    on(key, fn) {
      if (typeof fn !== "function") {
        throw new Error("The listener must be a function");
      }
      if (this.events[key]) {
        this.events[key].push(fn);
      } else {
        this.events[key] = [fn];
      }
    }

    emit(key, data) {
      if (this.events[key]) {
        this.events[key].forEach((fn) => fn(data));
      }
    }

    _getRpcPromiseCallback(resolve, reject, unwrapResult = true) {
      return (error, response) => {
        if (error || response.error) {
          reject(error || response.error);
        } else {
          !unwrapResult || Array.isArray(response)
            ? resolve(response)
            : resolve(response.result);
        }
      };
    }

    _setDefaultTransaciton(payload, cb) {
      const getNocne = (address, callback) => {
        let body = {
          method: "eth_getTransactionCount",
          params: [address, "latest"],
        };
        rpcRequest(body, callback);
      };
      if (!payload.params[0].gas) {
        payload.params[0].gas = ethereumHelper.web3.utils.toHex("3000000");
      }

      if (!payload.params[0].nonce) {
        getNocne(this.selectedAddress, (err, res) => {
          if (err) {
            cb(err.message, "");
          } else {
            payload.params[0].nonce = res.result;
            cb(null, payload);
          }
        });
      } else {
        cb(null, payload);
      }
    }

    _handleRpc(payload, cb) {
      // console.log("--------payload------", payload);
      if (
        payload.method === "eth_requestAccounts" ||
        payload.method === "eth_accounts"
      ) {
        cb(null, [this.selectedAddress]);
        return;
      }
      if (payload.method === "eth_sign") {
        let hashStr = ethereumHelper.web3.utils.sha3(payload.params[1]);
        let result = ethereumHelper.ethereumCryptography.ecdsaSign(
          ethereumHelper.bops.from(hashStr.substr(2), "hex"),
          ethereumHelper.bops.from(privateKey, "hex")
        );
        cb(null, {
          result: "0x" + ethereumHelper.bops.to(result.signature, "hex"),
        });
        return;
      }
      if (payload.method === "personal_sign") {
        let result = ethereumHelper.signUtils.personalSign(
          ethereumHelper.bops.from(privateKey, "hex"),
          { data: payload.params[0] }
        );
        cb(null, { result });
        return;
      }
      if (payload.method === "eth_signTypedData") {
        let result = ethereumHelper.signUtils.signTypedMessage(
          ethereumHelper.bops.from(privateKey, "hex"),
          { data: payload.params[0] },
          "V1"
        );
        cb(null, { result });
        return;
      }
      if (payload.method === "eth_signTypedData_v3") {
        let result = ethereumHelper.signUtils.signTypedMessage(
          ethereumHelper.bops.from(privateKey, "hex"),
          { data: JSON.parse(payload.params[0]) },
          "V3"
        );
        cb(null, { result });
        return;
      }
      if (payload.method === "eth_signTypedData_v4") {
        let result = ethereumHelper.signUtils.signTypedMessage(
          ethereumHelper.bops.from(privateKey, "hex"),
          { data: payload.params[0] },
          "v4"
        );
        cb(null, { result });
        return;
      }

      if (payload.method === "eth_sendTransaction") {
        window.parent.api.OSWallet.showSignUI(
          { ...payload.params[0] },
          (code) => {
            if (code === 1) {
              this._setDefaultTransaciton(payload, (err, p) => {
                if (err) {
                  cb(err, "");
                } else {
                  let { id, jsonrpc, ...body } = p;
                  const signStr = _signSend(body.params[0]);
                  rpcRequest(
                    {
                      method: "eth_sendRawTransaction",
                      params: [signStr],
                    },
                    cb
                  );
                }
              });
            } else {
              cb("user reject", "");
            }
          }
        );
        return;
      }
      rpcRequest(payload, cb);
    }

    _handleAccountsChanged() {
      this.emit("accountsChanged", [this.selectedAddress]);
    }

    _sendSync(payload) {
      let result;
      switch (payload.method) {
        case "eth_accounts":
          result = this.selectedAddress ? [this.selectedAddress] : [];
          break;
        case "eth_coinbase":
          result = this.selectedAddress || null;
          break;
        case "eth_uninstallFilter":
          result = true;
          break;
        case "net_version":
          result = this.networkVersion || null;
          break;
        default:
          throw new Error("unsuport method");
      }
      return {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result,
      };
    }
  };
})();
console.log("----metamask wallet-----------");

let config = {
  url: "https://rinkeby.infura.io/v3/1c352eac1b9c43139a4e481088c84de5",
  privateKey:
    "71dba4875154d1b119c76b801dcf9bcc2a9bf1464f7d94cf00590f43f93a2e4c",
  address: "0x18435677DaFec607e0F358fc8526061B0ee04a62",
  erc20Contract: "0xF8C25191f5d99Ef9e0E0F752FF55488aF3642766",
};
// bsc test
config = {
  ...config,
  url: "https://data-seed-prebsc-1-s1.binance.org:8545",
  erc20Contract: "0xd1B170d3e20275Ae465eD5e79cEA44511CD2C2Aa",
};

let ethereum = new Ethereum(config);
const web3 = new Web3(ethereum);
ethereum.on("accountsChanged", function (accounts) {
  console.log("----accounts----", accounts);
});
ethereum.on("chainChanged", function (id) {
  console.log("----chainChanged----", id);
});

function getUserBalance() {
  web3.eth.getBalance(config.address).then(console.log);
}

function contractHandler() {
  let myContract = new web3.eth.Contract(erc20Json, config.erc20Contract, {
    gasPrice: "20000000000", // default gas price in wei, 20 gwei in this case,
    gasLimit: "8000000",
    from: config.address,
  });
  myContract.methods
    .balanceOf(config.address)
    .call()
    .then((b) => {
      console.log("---contract balance call balanceOf--- ", b);
    });

  myContract.methods
    .transfer(config.erc20Contract, 100)
    .send()
    .on("transactionHash", function (hash) {
      console.log("------contract balance send balanceOf-----hash-----", hash);
    })
    .on("receipt", function (receipt) {
      console.log(
        "-----contract balance send balanceOf------recipt-----",
        receipt
      );
    });
}
contractHandler();
function signType() {
  const msgParams = [
    {
      type: "string",
      name: "Message",
      value: "Hi, Alice!",
    },
    {
      type: "uint32",
      name: "A number",
      value: "1337",
    },
  ];

  web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData",
      params: [msgParams, config.address],
      from: config.address,
    },
    function (err, result) {
      console.log("-----eth_signTypedData----", result);
      let address = ethereumHelper.signUtils.recoverTypedMessage(
        { data: msgParams, sig: result.result },
        "V1"
      );
      console.log("-----eth_signTypedData recover----", address);
    }
  );
}

function signMsg() {
  web3.eth.sign("Hello World", config.address).then((res) => {
    console.log("---eth sign------", res);
  });
}

function personalSing() {
  web3.eth.accounts.sign("Hello World", config.address).then((ss) => {
    console.log("--------ss---", ss);
  });
}

function signType3() {
  const msgParamV3 = JSON.stringify({
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
      ],
      Mail: [
        { name: "from", type: "Person" },
        { name: "to", type: "Person" },
        { name: "contents", type: "string" },
      ],
    },
    primaryType: "Mail",
    domain: {
      name: "Ether Mail",
      version: "1",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    message: {
      from: {
        name: "Cow",
        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
      },
      to: { name: "Bob", wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB" },
      contents: "Hello, Bob!",
    },
  });

  web3.currentProvider.sendAsync(
    {
      method: "eth_signTypedData_v3",
      params: [msgParamV3, config.address],
      from: config.address,
    },
    function (err, result) {
      console.log("-----eth_signTypedData_v3----", result);
      let address = ethereumHelper.signUtils.recoverTypedMessage(
        { data: JSON.parse(msgParamV3), sig: result.result },
        "V3"
      );
      console.log("-----eth_signTypedData_v3 recover----", address);
    }
  );
}
