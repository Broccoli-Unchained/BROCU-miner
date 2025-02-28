
# Broccoli Unchained ERC20 Token Miner

LICENSE GPL

Solves proof of work to mine supported ERC20 tokens.  This is a CPU miner.

### Instructions (Windows / Mac)
1. Install [NodeJS](https://nodejs.org/en/download) 20 or later (nvm install 20)
2. Download BROCU-miner_win-prebuilt.zip or BROCU-miner_mac-prebuilt.zip from [releases](https://github.com/Broccoli-Unchained/BROCU-miner/releases) then unzip
3. Open a Command Prompt or Terminal window and cd into the unzipped folder
4. Set up the config file 'miner-config.json' (duplicate miner-config-sample as a reference)
5. Start the miner with 'npm run miner'

NOTE: If this doesn't work you'll likely need to build from source.

### Building from Source

#### Setup (Windows/Linux)
1. Install NodeJS 20 (nvm install 20)
2. Clone/download the project
3. Open a terminal, cd into the project folder and run 'npm install' to install dependencies
4. Run the command 'npm run build' to build C files with node-gyp
6. Set up the config file 'miner-config.json' (duplicate miner-config-sample as a reference)
7. Start the miner with 'npm run miner'

#### Setup (Mac)
1. Install Homebrew & NodeJS 20
2. Run 'brew install yarn' to install yarn package manager
3. Clone/download this project
4. Open a terminal, cd into the project folder and run 'yarn'
5. Run the command 'yarn build' to build C files with node-gyp
6. Set up the config file 'miner-config.json' (duplicate miner-config-sample as a reference)
7. Start the miner with 'node index.js' or 'npm run miner'


### NOT WORKING ?
Make sure you have build-essential installed to compile C code and make sure you have python3.   (probably 3.10) ! 

Try these commands:
> node-gyp rebuild



## Miner-Config.js File

You must create a file called 'miner-config.json' in the same directory as index.js.  Duplicate 'miner-config-sample.json' and rename it.  

If you do not have a public address or private key, use Metamask or another Etherum wallet to make them.

REMINDER: You >can< set the web3provider to a ropsten, mainnet, or other type of test-network provider and the software will still work. If solo mining (not to a pool) just be sure to define the correct contract address for that network and be sure your account has a small amount of ether (or test-ether).

    "mining_account_public_address":"0x111111",
    "mining_account_private_key":"1234567",
    "mining_style":"solo" OR "pool",
    "contract_address":"0xb6...",
    "pool_url":"http://tokenminingpool.com:8080",
    "gas_price_gwei":10,
    "cpu_thread_count": 1,
    "web3provider": "https://infura.io/API/apikey...."

---------------

NOTE: The web3provider need not be a provider like infra or alchemy, it can also be almost any public rpc node such as [PublicNode](https://www.publicnode.com) or [MeowRPC](https://meowrpc.com). Just make sure your rate-limit is sufficient. With that said you may be better off running your own node. 

### Getting Started
1. Install NodeJS v10
2. Clone this repo 
3. Install dependencies with "npm install" 
4. Duplicate the 'miner-config-sample.json' file and rename it to 'miner-config.json'
5. Set the parameters in this file appropriately
6. In the console, run the command 'npm run miner' to start mining



### Pool Mining - No pools for $BROCU are known to currently exist!
- When mining into a pool, your gasprice does not matter and you will pay NO GAS FEES  
- Every pool is different so consult each pool owner.  Typically, pools will offer a token withdraw mechanism or automatically send tokens to your address on a periodic basis or when a limit is reached


### Solo Mining
- IF SOLO MINING it is necessary to fill the mining account (it is an Ethereum account) with a small amount of ether or network gas token if not ether.
- Typically 0.005 eth is good enough to get started.  The ether is used for gas to make function calls to the token smart contract when your miner finds a solution to the Proof of Work.  
- When the gas is spent that means that you have found a solution! If you were the first to find it, you will be rewarded with $BROCU tokens.  (See the block explorer for typical gas prices at the current moment.)
- $BROCU can be mined on ETH Mainnet, BSC, Base, Mantle, WorldChain, Polygon, OP Mainnet, ETH Sepolia, Base Sepolia, BSC Testnet and OP Sepolia. Ensure you have the correct rpc node set before starting.
- $BROCU Mainnet and Testnet versions have different contract addresses, make sure the correct one is set before starting. 
- $BROCU Mainnet Contract Address:

        0x1C55f95a3C2CEfba94C41bBa2d6200F7a0Db0651

- $BROCU Testnet Contract Address:

        0xD2aF5453D9a25FB02644b190Ee7bC5cc4102D440

NOTE: If you plan on operating multiple solo miners you'll need seperate mining accounts for each instance in order to avoid the potential for a nonce collision during solution submission.





### Testing

npm run test


## Credits

1. Zegordo (Developed the accelerated CPU Miner)

        ETH address [0x8AE981d92875C88f713600EB7dC4D23FA7E0E621]



## Tokens that can be mined using Proof of Work:

1. Broccoli Unchained - https://broccoliunchained.com / https://brocu.co - https://github.com/Broccoli-Unchained/Broccoli-Unchained-Token

BROCU MINER is based on the 0xbitcoin-miner and can mine any token that implements the ERC-918 standard.
