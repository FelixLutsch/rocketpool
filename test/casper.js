// Casper functionaility for Rocket Pools unit tests


const $Web3 = require('web3');
const $web3 = new $Web3('http://localhost:8545');
const FS = require('fs');

import { getABI, soliditySha3 } from './utils';
import { RocketStorage, RocketUpgrade } from './artifacts';


// Casper settings
const casperInit = require('../contracts/contract/casper/compiled/simple_casper_init.js');

// Deploy a new and fresh instance of Casper for each contract unit test that requires it, this automatically creates the correct epoch for Casper to start from
// NOTE: Not currently used anymore, will remove when 100% sure its no longer needed
export async function init({owner}) {

    // Deploy Casper and related contracts
    const deployContracts = async () => {

        // Get our RocketStorage
        const rocketStorageInstance = await RocketStorage.deployed();
        const rocketUpgradeInstance = await RocketUpgrade.deployed();
        
        // Precompiled - Casper
        const casper = new $web3.eth.Contract(getABI('./contracts/contract/casper/compiled/simple_casper.abi'), null, {
            from: owner, 
            gasPrice: '20000000000' // 20 gwei
        });
        // Deploy Casper
        let casperContract = await casper.deploy(
          // Casper settings 
          { arguments: casperInit.init(
              owner, 
              await rocketStorageInstance.getAddress(soliditySha3('contract.name', 'sigHasher')), 
              await rocketStorageInstance.getAddress(soliditySha3('contract.name', 'purityChecker')), 
              web3.toWei('5', 'ether')
          ),
            data: FS.readFileSync('./contracts/contract/casper/compiled/simple_casper.bin')
          }).send({from: owner, gas: 5000000, gasPrice: '20000000000'});
          
         // Set Caspers address 
         await rocketUpgradeInstance.upgradeContract('casper', casperContract._address, true, true);    

         console.log(casperContract._address);

    }

    // Redeploy now
    deployContracts();

}
