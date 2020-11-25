const erc20Json = [
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
const Ethereum = (function () {
  let privateKey;
  function _signSend(body, chainId, commArr) {
    const tx = new ethereumHelper.ethereumjsTx.Transaction(
      {
        ...body.params[0],
        nonce: body.nonce,
      },
      commArr[chainId]
    );
    tx.sign(ethereumHelper.bops.from(privateKey, "hex"));
    const txStr = "0x" + tx.serialize().toString("hex");
    return txStr;
  }

  return class InnerEthereum {
    constructor(config) {
      this.isMetaMask = false;
      this.selectedAddress = null;
      this.networkVersion = null;
      this.chainId = null;
      this.events = Object.create(null);
      this.accounts = [];
      this.txCommonArray = {
        1: { chain: "mainnet" },
        3: { chain: "ropsten" },
        4: { chain: "rinkeby" },
        5: { chain: "goerli" },
        42: { chain: "kovan" },
      };
      this._handleAccountsChanged = this._handleAccountsChanged.bind(this);
      this._sendSync = this._sendSync.bind(this);
      this._rpcRequest = this._rpcRequest.bind(this);
      this.enable = this.enable.bind(this);
      this.request = this.request.bind(this);
      this.send = this.send.bind(this);
      this.sendAsync = this.sendAsync.bind(this);
      this.endpoit = config.url;
      this.selectedAddress = config.address;
      privateKey = config.privateKey.startsWith("0x")
        ? config.privateKey.substr(2)
        : config.privateKey;
      this.accounts.push(this.selectedAddress);
      this._rpcRequest(
        {
          method: "net_version",
          params: [],
        },
        (err, res) => {
          this.chainId = res.result;
          this.networkVersion = this.chainId;
          if (!this.txCommonArray[+this.chainId]) {
            this.txCommonArray[+this.chainId] = {
              common: ethereumHelper.ethereumjsCommon.default.forCustomChain(
                "mainnet",
                {
                  name: "bsc",
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

      setTimeout(() => {
        this.emit("accountsChanged", this.selectedAddress);
      });
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
        if (!payload.jsonrpc) {
          payload.jsonrpc = "2.0";
        }
        if (!payload.id) {
          payload.id = 1;
        }

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

    _handleRpc(payload, cb) {
      // console.log('--------payload------', payload)
      if (payload.method === "eth_sign") {
        let hashStr = ethereumHelper.web3Utils.sha3(payload.params[1]);
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

      const requst = () =>
        fetch(this.endpoit, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((res) => {
            cb(null, res);
          })
          .catch((err) => {
            cb(err.message, "");
          });
      if (payload.method === "eth_sendTransaction") {
        if (!payload.gas) {
          payload.gas = "0x" + (8000000).toString(16);
        }
        if (!payload.gasPrice) {
          payload.gasPrice = "0x" + (100 * 1e9).toString(16);
        }
        if (!payload.from) {
          payload.from = this.selectedAddress;
        }
        if (!payload.value) {
          payload.value = "0x00";
        }
        if (!payload.nonce) {
          fetch(this.endpoit, {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              method: "eth_getTransactionCount",
              id: 1,
              jsonrpc: "2.0",
              params: [this.selectedAddress, "latest"],
            }),
          })
            .then((res) => res.json())
            .then((res) => {
              payload.nonce = res.result;
              let { id, jsonrpc, ...body } = payload;
              const signStr = _signSend(body, this.chainId, this.txCommonArray);
              return fetch(this.endpoit, {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  method: "eth_sendRawTransaction",
                  id: 1,
                  jsonrpc: "2.0",
                  params: [signStr],
                }),
              });
            })
            .then((tx) => tx.json())
            .then((tx) => {
              cb(null, tx);
            });
        }
      } else {
        requst();
      }
    }

    _handleAccountsChanged(
      accounts,
      isEthAccounts = false,
      isInternal = false
    ) {
      let _accounts = accounts;
      if (!Array.isArray(accounts)) {
        _accounts = [];
      }
      this.accounts = _accounts;
      if (this.selectedAddress !== _accounts[0]) {
        this.selectedAddress = _accounts[0];
      }
      if (
        window.web3 &&
        window.web3.eth &&
        typeof window.web3.eth === "object"
      ) {
        window.web3.eth.defaultAccount = this.selectedAddress;
      }
      this.emit("accountsChanged", _accounts);
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
          this._rpcRequest(payload, NOOP);
          result = true;
          break;
        case "net_version":
          result = this.networkVersion || null;
          break;
        default:
          throw new Error(messages.errors.unsupportedSync(payload.method));
      }
      return {
        id: payload.id,
        jsonrpc: payload.jsonrpc,
        result,
      };
    }
  };
})();
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
