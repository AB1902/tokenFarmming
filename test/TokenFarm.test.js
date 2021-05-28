const { assert } = require("chai")
const { default: Web3 } = require("web3")

const DaiToken=artifacts.require("DaiToken")
const DappToken=artifacts.require("DappToken")
const TokenFarm=artifacts.require("TokenFarm")

require("chai")
    .use(require("chai-as-promised"))
    .should()

function tokens(n){
    return web3.utils.toWei(n,'ether')
}


contract('TokenFarm', ([owner,investor])=> {

    let daiToken,dappToken,tokenFarm
    before(async() => {
        //loading contracts
        daiToken=await DaiToken.new()
        dappToken=await DappToken.new()
        tokenFarm=await TokenFarm.new(dappToken.address,daiToken.address)

        //transferrinng all dapp tokens to TokenFarm
        await dappToken.transfer(tokenFarm.address,tokens('1000000'))

        //sending tokens to investor
        await daiToken.transfer(investor,tokens('100'),{from:owner})

    })

    //tests:
    describe("mock dai deployment",async () =>{
        it("has a name", async () => {
            const name=await daiToken.name()
            assert.equal(name,"Mock DAI Token")
        })
    })

    describe("Dapp Token deployment",async () =>{
        it("has a name", async () => {
            const name=await dappToken.name()
            assert.equal(name,"DApp Token")
        })
    })

    describe("Token Farm deployment",async () =>{
        it("has a name", async () => {
            const name=await tokenFarm.name()
            assert.equal(name,"Dapp Token Farm")
        })
    })

    it("contract has tokens",async()=>{
        let balance=await dappToken.balanceOf(tokenFarm.address)
        assert.equal(balance.toString(),tokens('1000000'))
    })

    describe("Farming tokens", async() => {
        it("rewards investors for staking mDai tokens",async() => {
            let result
            
            //check investor balance before staking  
            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),"investor Mock DAI wallet balance correct before staking")
            
            //state mock DAI Tokens
            await daiToken.approve(tokenFarm.address,tokens('100'),{from:investor})
            await tokenFarm.stakeTokens(tokens('100'),{from:investor})
            
            //check staking result
            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('0'),"investor MOCK DAI wallet balance correct after staking")

            result=await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('100'),"Tokens from MOCK DAI balance correct after staking")
        
            result=await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('100'),"investor staking balance correct after staking")

            result= await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),'true',"investor staking status correct after staking")

            //issue tokens
            await tokenFarm.issueTokens({from:owner})

            //check investor balance
            result=await dappToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),"investor dapp token wallet balance correct after issuing tokens")

            //only owner can call to issue tokens
            await tokenFarm.issueTokens({from:investor}).should.be.rejected;

            //unstake tokens
            await tokenFarm.unstakeTokens({from:investor})

            //check results after unstaking 
            result=await daiToken.balanceOf(investor)
            assert.equal(result.toString(),tokens('100'),"investor mock DAI token wallet correct after staking")

            result=await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(),tokens('0'),"token farm mock dai token balance correct after staking")

            result=await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(),tokens('0'),"investor balance correct after staking")

            result=await tokenFarm.isStaking(investor)
            assert.equal(result.toString(),"false","investor staking status is correct after staking")

        })
    })


})