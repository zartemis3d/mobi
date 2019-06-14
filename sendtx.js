const cfg = require('./config');
//const fs = require('fs');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
const keythereum = require("keythereum");
const db = require('./mydb');

const web3 = new Web3(cfg.provider);
const gas_limit = 80000
let nonce = -1

const abi_erc20 = [{ 'constant': false, 'inputs': [{ 'name': '_spender', 'type': 'address' }, { 'name': '_value', 'type': 'uint256' }], 'name': 'approve', 'outputs': [{ 'name': 'success', 'type': 'bool' }], 'payable': false, 'type': 'function' }, { 'constant': true, 'inputs': [], 'name': 'totalSupply', 'outputs': [{ 'name': 'totalSupply', 'type': 'uint256' }], 'payable': false, 'type': 'function' }, { 'constant': false, 'inputs': [{ 'name': '_from', 'type': 'address' }, { 'name': '_to', 'type': 'address' }, { 'name': '_value', 'type': 'uint256' }], 'name': 'transferFrom', 'outputs': [{ 'name': 'success', 'type': 'bool' }], 'payable': false, 'type': 'function' }, { 'constant': true, 'inputs': [{ 'name': '_owner', 'type': 'address' }], 'name': 'balanceOf', 'outputs': [{ 'name': 'balance', 'type': 'uint256' }], 'payable': false, 'type': 'function' }, { 'constant': false, 'inputs': [{ 'name': '_to', 'type': 'address' }, { 'name': '_value', 'type': 'uint256' }], 'name': 'transfer', 'outputs': [{ 'name': 'success', 'type': 'bool' }], 'payable': false, 'type': 'function' }, { 'constant': true, 'inputs': [{ 'name': '_owner', 'type': 'address' }, { 'name': '_spender', 'type': 'address' }], 'name': 'allowance', 'outputs': [{ 'name': 'remaining', 'type': 'uint256' }], 'payable': false, 'type': 'function' }, { 'anonymous': false, 'inputs': [{ 'indexed': true, 'name': '_from', 'type': 'address' }, { 'indexed': true, 'name': '_to', 'type': 'address' }, { 'indexed': false, 'name': '_value', 'type': 'uint256' }], 'name': 'Transfer', 'type': 'event' }, { 'anonymous': false, 'inputs': [{ 'indexed': true, 'name': '_owner', 'type': 'address' }, { 'indexed': true, 'name': '_spender', 'type': 'address' }, { 'indexed': false, 'name': '_value', 'type': 'uint256' }], 'name': 'Approval', 'type': 'event' }];

/**
 * pk 私钥
 * destAddress  目标地址
 * contractAddress   token 的合约地址
 * val   转账金额
 * nonce    为0 时, 会自动读取最新nonce 值
 */
async function sendToken(pk, destAddress, contractAddress, val, nonce, id) {
  const myAddress = keythereum.privateKeyToAddress(pk)
  const privKey = Buffer.from(pk, 'hex')

  if (nonce == 0)
    nonce = await web3.eth.getTransactionCount(myAddress);

  console.log("nonce:", nonce);
  console.log("myAddress:", myAddress);

  let gas_price = await web3.eth.getGasPrice();
  console.log(`ETH gas price: ` + web3.utils.fromWei(gas_price, 'gwei'))
  gas_price = web3.utils.toBN(gas_price);
  //gas_price = web3.utils.toBN(web3.utils.toWei('4', 'gwei'))

  var contract = new web3.eth.Contract(abi_erc20, contractAddress, {
    from: myAddress
  });

  let rawTransaction = {
    // "from: myAddress,
    nonce: "0x" + nonce.toString(16),
    gasPrice: web3.utils.toHex(gas_price),
    gasLimit: web3.utils.toHex(gas_limit),
    to: contractAddress,
    value: "0x0",
    data: contract.methods.transfer(destAddress, val).encodeABI(),
    //"chainId: 0x01
  };

  let tx = new Tx(rawTransaction);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  try {
    let transaction = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

    //console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    transaction.on('confirmation', (confirmationNumber, receipt) => {
      //console.log('confirmation', confirmationNumber);
    });

    transaction.on('transactionHash', hash => {
      console.log('hash', hash);
      mylog(id, myAddress, destAddress, hash, '')
    });

    transaction.on('receipt', receipt => {
      //console.log('reciept', receipt);
    });

    transaction.on('error', error => {
      console.log('ERR', error);  
      //if ( error.message.includes( 'There is another transaction with same nonce' ) )
      mylog(id, myAddress, destAddress, '', error.toString() )
    });

  } catch (error) {
    console.log('sendSignedTransaction err:', error);
  }
}

// val  单位 gwei
async function sendETH(pk, destAddress, val, id) {
  console.log(`${destAddress} ==> ${val}`);
  const myAddress = keythereum.privateKeyToAddress(pk)
  const privKey = Buffer.from(pk, 'hex')

  if (nonce == -1)
    nonce = await web3.eth.getTransactionCount(myAddress);
  else
    nonce++  

  console.log("nonce:", nonce);
  console.log("myAddress:", myAddress);

  let gas_price = await web3.eth.getGasPrice();
  gas_price = web3.utils.toBN(gas_price);
  gas_price.iadd(web3.utils.toBN(5000000000));   //在网络基础上加 5 gwei

  console.log(`ETH gas price: ` + web3.utils.fromWei(gas_price, 'gwei'))
  gas_price = web3.utils.toBN(gas_price);
  
  // Value to be sent, converted to wei and then into a hex value
  let txValue = web3.utils.numberToHex(web3.utils.toWei(web3.utils.toBN(val), 'gwei'));
 
  let rawTransaction = {
    // "from: myAddress,
    nonce: "0x" + nonce.toString(16),
    gasPrice: web3.utils.toHex(gas_price),
    gasLimit: web3.utils.toHex(gas_limit),
    to: destAddress,
    value: txValue,
    // data: ''  // var txData = web3.utils.asciiToHex('oh hai mark'); 
    //"chainId: 0x01
  };

  let tx = new Tx(rawTransaction);
  tx.sign(privKey);
  let serializedTx = tx.serialize();

  try {
    let transaction = web3.eth.sendSignedTransaction('0x' + serializedTx.toString('hex'));

    //console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
    transaction.on('confirmation', (confirmationNumber, receipt) => {
      //console.log('confirmation', confirmationNumber);
      if (confirmationNumber > 5) {  //转账成功
         console.log(`tx confirm ${id}`);
          db.updateRecoedState(id, 2)
      }
    });

    transaction.on('transactionHash', hash => {
      db.updateHash(id, hash)
      mylog(id, myAddress, destAddress, hash, '')
    });

    transaction.on('receipt', receipt => {
      //console.log('reciept', receipt);
    });

    transaction.on('error', error => {
      console.log('ERR', error);
      //if ( error.message.includes( 'There is another transaction with same nonce' ) )
      mylog(id, myAddress, destAddress, '', error.toString() )
    });

  } catch (error) {
    console.log('sendSignedTransaction err:', error);
  }
}


function mylog(id, from, to, hash, err) {
  console.log(id, from, to, hash, err)    
/*   id.writeHead(200, { 'Content-Type': 'application/json' });
  let obj = {
    from: from,
    to: to,
    hash: hash,
    err: err
  }
  id.write(JSON.stringify(obj));
  id.end(); */
}



//sendToken('', '0x4d8e9a179550497bc687f305181dc242f06765b0', '0x2f9bd09b043b089983f9af31b6a4a637f045dc41', '119900000000000000000000', 4, null)
//sendETH('', '0xaed3086d4a773632e9012dec1c917206176ef7b4', '0.123', 0, null)

module.exports = {
  sendETH
}
 