// Add the web3 node module
const Web3 = require('web3')
const schedule = require('node-schedule');
const cfg = require('./config')
const db = require('./mydb');
const ks = require('./key');
const tx = require('./sendtx')
const watcher = require('./watcher')

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Show web3 where it needs to look for the Ethereum node.
let web3 = new Web3(cfg.provider);

 

 
async function sendTx() {
	console.log("sendTx \n")
	db.sendEth( async function (results) {
		//console.log(JSON.stringify(results))
		
		for(let i = 0; i < results.length; i++){
			//console.log(JSON.stringify(results[i]))
 
			await tx.sendETH(cfg.privkey, results[i].userId, results[i].recordNum,  results[i].recordId )
			db.updateRecoedState(results[i].recordId , 1 )
		}
	})
}

const  writeBalance = ()=>{
		schedule.scheduleJob('0 30 11 * * *',()=>{
		web3.eth.getBalance(cfg.address, (err, wei) => { 
			let balance = web3.utils.fromWei(wei, 'gwei') 
			console.log('balance: ', balance )
			db.updateBalance(1, balance)	
		})
	}); 
}


// main
writeBalance();
watcher.watchEtherTransfers()
console.log('Started watching Ether transfers')

setInterval(sendTx, cfg.interval)
 