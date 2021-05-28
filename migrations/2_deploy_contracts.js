const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");



module.exports = async function(deployer,network,accounts) {

  //Deploy mock DAI Token
  await deployer.deploy(DaiToken)
  const daiToken=await DaiToken.deployed()

  //Deploy mock DAPP Token
  await deployer.deploy(DappToken)
  const dappToken=await DappToken.deployed()

  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address )
  const tokenFarm=await TokenFarm.deployed()  
  // deployer.deploy(TokenFarm);

  //Transfering tokens to tokenFarm
  await dappToken.transfer(tokenFarm.address,'1000000000000000000000000')

  //transfer 100 Mock Dai tokens to the investor
  await daiToken.transfer(accounts[1],'100000000000000000000')

};
