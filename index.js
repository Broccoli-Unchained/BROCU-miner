
const Miner = require("./brocu-accel");


const miningLogger = require("./lib/mining-logger");

const fs = require('fs');

var pjson = require('./package.json');
//var minerConfig = require('./miner-config.json');

const { ethers } = require("ethers");

var ContractInterface = require("./contracts/DeployedContractInfo")


var NetworkInterface = require("./lib/network-interface");

var PoolInterface = require("./lib/pool-interface");
 
var provider ;
var wallet ;

var running = true;

console.log('Welcome to BROCU Miner!')
console.log('Version: ',pjson.version)
console.log('\n')

const minerConfigRaw = fs.readFileSync('./miner-config.json');
const minerConfig = JSON.parse(minerConfigRaw);


function loadConfig()
{
  provider = new ethers.providers.JsonRpcProvider(minerConfig.web3provider);
  wallet = new ethers.Wallet(minerConfig.mining_account_private_key, provider);

   

  miningLogger.init();
  //NetworkInterfaces

    NetworkInterface.init(ethers, provider, wallet, miningLogger, minerConfig.contract_address, minerConfig.gas_price_gwei, minerConfig.priority_gas_fee_gwei);
    PoolInterface.init(ethers, provider, wallet, miningLogger, minerConfig.contract_address, minerConfig.pool_url);


  Miner.init( minerConfig.contract_address, ethers, wallet, miningLogger  );
  Miner.setNetworkInterface(NetworkInterface);
  Miner.setPoolInterface(PoolInterface);
}


async function initMining()
{
 

  Miner.mine(
    minerConfig.mining_style,
    wallet,
    provider, 
    minerConfig.pool_url,
    minerConfig.gas_price_gwei,
    minerConfig.priority_gas_fee_gwei
  )


}


loadConfig();
initMining();
