
const { ethers } = require("ethers");
var web3Utils = require('web3-utils')

const Tx = require('ethereumjs-tx')

//const Vault = require("./vault");


var tokenContractJSON = require('../contracts/_BroccoliUnchained.json');


var busySendingSolution = false;
var queuedMiningSolutions = [];


var lastSubmittedMiningSolutionChallengeNumber;

module.exports =  {


  init(ethers, provider, wallet,  miningLogger, contractAddress, gasPriceGwei, priorityGasFeeGwei)
  {
    

    this.gasPriceGwei=gasPriceGwei;
    this.priorityGasFeeGwei = priorityGasFeeGwei ;
    this.provider = provider; 

    this.wallet = wallet;

    this.tokenContract =  new ethers.Contract(contractAddress, tokenContractJSON.abi, wallet); 

    this.miningLogger = miningLogger;


    busySendingSolution = false;

    var self= this;

    setInterval(function(){ self.sendMiningSolutions()} , 500)

  },



    async checkMiningSolution(addressFrom,solution_number,challenge_digest,challenge_number,target,callback){

      this.tokenContract.checkMintSolution(solution_number,challenge_digest, challenge_number, target)

    },


  async sendMiningSolutions()
    {

      var self = this;

    //  console.log( 'sendMiningSolutions' )
      if(busySendingSolution == false)
      {
        if(queuedMiningSolutions.length > 0)
        {
          //busySendingSolution = true;


          var nextSolution = queuedMiningSolutions.pop();

          this.miningLogger.appendToStandardLog("Popping queued mining solution " + nextSolution.toString())


          if( nextSolution.challenge_number != lastSubmittedMiningSolutionChallengeNumber)
          {
            lastSubmittedMiningSolutionChallengeNumber =  nextSolution.challenge_number;
            //console.log('popping mining solution off stack ')

            try{
            var response = await this.submitMiningSolution(nextSolution.hashingEthAddress,
              nextSolution.solution_number, nextSolution.challenge_digest  );
            }catch(e)
            {
              this.miningLogger.appendToErrorLog(e)
              console.log(e);
            }
          }


          busySendingSolution = false;
        }
      }



    },


    async collectMiningParameters( )
    {

      var miningDifficultyString = await this.tokenContract.getMiningDifficulty()  ;
      var miningDifficulty = parseInt(miningDifficultyString)

      var miningTargetString = await this.tokenContract.getMiningTarget() ;
      var miningTarget = web3Utils.toBN(miningTargetString)

      var challengeNumber = await this.tokenContract.getChallengeNumber() ;

      console.log("collecting mining parameters..");
      //console.log('Mining difficulty:', miningDifficulty);
      console.log('Challenge number:', challengeNumber)

      return {
        miningDifficulty: miningDifficulty,
        challengeNumber: challengeNumber,
        miningTarget: miningTarget
      };

    },


  queueMiningSolution( solnData )
  {

    //console.log('pushed solution to stack')
    queuedMiningSolutions.push( solnData );

  },




  async submitMiningSolution(addressFrom, solutionNumber, challengeDigest) {
    console.log("\n--- Submitting solution for reward ---");
    console.log("Nonce:", solutionNumber);
    console.log("Challenge Digest:", challengeDigest, "\n");

    try {
      const txCount = await this.wallet.getTransactionCount();
      console.log("Transaction Count:", txCount);

      

      // Prepare the transaction data
      const txData = await this.tokenContract.populateTransaction.mint(
        solutionNumber,
        challengeDigest
      );

      const gasPrice = ethers.utils.parseUnits(this.gasPriceGwei.toString(), "gwei");
      /*const estimatedGasCost = await this.provider.estimateGas({
        ...txData,
        from: addressFrom
      });*/

     // console.log("Estimated Gas Cost:", estimatedGasCost.toString());
      console.log("Transaction Data:", txData.data);

      // Prepare and send the transaction
     /* const txOptions = {
        ...txData,
        nonce: txCount,
        gasLimit: estimatedGasCost,
        gasPrice: gasPrice
      };*/


      var max_gas_cost = 1704624;


       // Set EIP-1559 fee parameters
       const maxFeePerGas = ethers.utils.parseUnits(this.gasPriceGwei.toString(), "gwei"); // Example: 50 gwei max fee per gas
       const maxPriorityFeePerGas = ethers.utils.parseUnits(this.priorityGasFeeGwei.toString(), "gwei"); // Example: 2 gwei priority fee

       // Prepare and send the transaction with Type 2 options
       const txOptions = {
           ...txData,
           nonce: txCount,
           gasLimit: max_gas_cost,
           maxFeePerGas: maxFeePerGas,
           maxPriorityFeePerGas: maxPriorityFeePerGas,
           type: 2 // Explicitly set Type 2 transaction
       };


      const transactionResponse = await this.wallet.sendTransaction(txOptions);
      console.log("Transaction Hash:", transactionResponse.hash);

      const receipt = await transactionResponse.wait(); // Wait for transaction confirmation
      console.log("Transaction confirmed in block", receipt.blockNumber);

      return receipt;
    } catch (error) {
      console.error("Transaction failed:", error);
      return error;
    }
  }

  
  /*
  async submitMiningSolution(addressFrom,solution_number,challenge_digest){

    this.miningLogger.appendToStandardLog("Submitting Solution " + challenge_digest)



    console.log( '\n' )
    console.log( '---Submitting solution for reward---')
    console.log( 'nonce ',solution_number )
    console.log( 'challenge_digest ',challenge_digest )
    console.log( '\n' )

   var mintMethod = this.tokenContract.methods.mint(solution_number,challenge_digest);

  try{
    var txCount = await this.web3.eth.getTransactionCount(addressFrom);
    console.log('txCount',txCount)
   } catch(error) {  //here goes if someAsyncPromise() rejected}
    console.log(error);
      this.miningLogger.appendToErrorLog(error)
     return error;    //this will result in a resolved promise.
   }


   var addressTo = this.tokenContract.options.address;



    var txData = this.web3.eth.abi.encodeFunctionCall({
            name: 'mint',
            type: 'function',
            inputs: [{
                type: 'uint256',
                name: 'nonce'
            },{
                type: 'bytes32',
                name: 'challenge_digest'
            }]
        }, [solution_number, challenge_digest]);

    var gweiToWei = 1e9;


    var gas_price_wei = this.gas_price_gwei * gweiToWei;
    var max_gas_cost = 1704624;



    var estimatedGasCost = await mintMethod.estimateGas({gas: max_gas_cost, from:addressFrom, to: addressTo });


    //console.log('estimatedGasCost',estimatedGasCost);
    console.log('txData',txData);

    console.log('addressFrom',addressFrom);
    console.log('addressTo',addressTo);



    //if( estimatedGasCost > max_gas_cost){
    //  console.log("Gas estimate too high!  Something went wrong ")
    //  return;
    //}


    const txOptions = {
      nonce: web3Utils.toHex(txCount),
      gas: web3Utils.toHex(estimatedGasCost), 
      gasPrice: web3Utils.toHex( gas_price_wei ),
      value: 0,
      to: addressTo,
      from: addressFrom,
      data: txData
    }


      var miner_wallet = this.miner_wallet;


  return new Promise(function (result,error) {

       this.sendSignedRawTransaction(this.web3,txOptions,addressFrom, pKey, function(err, res) {
        if (err) error(err)
          result(res)
      })

    }.bind(this));


  },




  async sendSignedRawTransaction(web3,txOptions,addressFrom, pKey ,callback) {


    var fullPrivKey = pKey;

    var privKey = this.truncate0xFromString( fullPrivKey )

    const privateKey = Buffer.from( privKey, 'hex')
    const transaction = new Tx(txOptions)


    transaction.sign(privateKey)


    const serializedTx = transaction.serialize().toString('hex')

      try
      {
        var result =  web3.eth.sendSignedTransaction('0x' + serializedTx, callback)
      }catch(e)
      {
        console.log(e);
      }
  },


   truncate0xFromString(s)
  {

    if(s.startsWith('0x')){
      return s.substring(2);
    }
    return s;
  }


*/


}
