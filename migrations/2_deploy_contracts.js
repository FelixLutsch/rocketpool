// Config
const config = require('../truffle.js');

// Contacts
const rocketStorage = artifacts.require('./RocketStorage.sol');
const rocketRole = artifacts.require('./RocketRole.sol');
const rocketPool = artifacts.require('./RocketPool.sol');
const rocketUser = artifacts.require('./RocketUser.sol');
const rocketNode = artifacts.require('./RocketNode.sol');
const rocketPoolMiniDelegate = artifacts.require('./RocketPoolMiniDelegate.sol');
const rocketDepositToken = artifacts.require('./RocketDepositToken.sol');
const rocketPartnerAPI = artifacts.require('./RocketPartnerAPI.sol');
const rocketVault = artifacts.require('./RocketVault.sol');
const rocketVaultStore = artifacts.require('./RocketVaultStore.sol');
const rocketSettings = artifacts.require('./RocketSettings.sol');
const rocketFactory = artifacts.require('./RocketFactory.sol');
const rocketUpgrade = artifacts.require('./RocketUpgrade.sol');
const rocketUtils = artifacts.require('./RocketUtils.sol');
const rocketPoolTokenDummy = artifacts.require('./contract/DummyRocketPoolToken.sol');
const dummyCasper = artifacts.require('./contract/casper/DummyCasper.sol');

// Accounts
const accounts = web3.eth.accounts;

// Casper settings
const casperInit = require('../contracts/contract/casper/compiled/simple_casper_init.js');

// Load ABI files and parse
const loadABI = function(abiFilePath) {
  return JSON.parse(config.fs.readFileSync(abiFilePath));
}


/*
// Casper - Precompiled Real Version
const casper = new web3.eth.Contract('./contracts/contract/casper/compiled/simple_casper.abi', '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', {
  from: accounts[0], 
  gasPrice: '20000000000' // 20 gwei
});

const casper = myContract.deploy({
  data: './contracts/contract/casper/compiled/simple_casper.bin',
  arguments: [123, 'My String']
})
.send({
  from: '0x1234567890123456789012345678901234567891',
  gas: 1500000,
  gasPrice: '30000000000000'
}, function(error, transactionHash){ ... })
.on('error', function(error){ ... })
.on('transactionHash', function(transactionHash){ ... })
.on('receipt', function(receipt){
 console.log(receipt.contractAddress) // contains the new contract address
})
.on('confirmation', function(confirmationNumber, receipt){ ... })
.then(function(newContractInstance){
  console.log(newContractInstance.options.address) // instance with the new contract address
});
*/



module.exports = async (deployer, network) => {
    // Set our web3 1.0 provider
    let $web3;
    if ( network == 'development' || network == 'dev' ) {
      $web3 = new config.web3('http://localhost:8545');
    }  
    // Deploy rocketStorage first - has to be done in this order so that the following contracts already know the storage address
    return deployer.deploy(rocketStorage).then(() => {
      // Deploy casper dummy contract
      return deployer.deploy(dummyCasper).then(() => {
        // Seed Casper with some funds to cover the rewards + deposit sent back
        web3.eth.sendTransaction({
          from: accounts[0],
          to: dummyCasper.address,
          value: web3.toWei('6', 'ether'),
          gas: 1000000,
        });
        // Deploy Rocket Vault
        return deployer.deploy(rocketVault, rocketStorage.address).then(() => {
        // Deploy Rocket Vault Store
        return deployer.deploy(rocketVaultStore, rocketStorage.address).then(() => {
          // Deploy Rocket Utils
          return deployer.deploy(rocketUtils, rocketStorage.address).then(() => {
            // Deploy Rocket Upgrade
            return deployer.deploy(rocketUpgrade, rocketStorage.address).then(() => {
              // Deploy Rocket Role
              return deployer.deploy(rocketRole, rocketStorage.address).then(() => {
                // Deploy Rocket User
                return deployer.deploy(rocketUser, rocketStorage.address).then(() => {
                  // Deploy rocket 3rd party partner API
                  return deployer.deploy(rocketPartnerAPI, rocketStorage.address).then(() => {
                    // Deploy rocket deposit token
                    return deployer.deploy(rocketDepositToken, rocketStorage.address).then(() => {
                      // Deploy rocket factory
                      return deployer.deploy(rocketFactory, rocketStorage.address).then(() => {
                        // Deploy rocket settings
                        return deployer.deploy(rocketSettings, rocketStorage.address).then(() => {
                          // Deploy the main rocket pool
                          return deployer.deploy(rocketPool, rocketStorage.address).then(() => {
                            // Deploy the rocket node
                            return deployer.deploy(rocketNode, rocketStorage.address).then(() => {
                              // Deploy the rocket pool mini delegate
                              return deployer.deploy(rocketPoolMiniDelegate, rocketStorage.address).then(() => {
                                // Deploy dummy RPL Token contract for testing
                                return deployer.deploy(rocketPoolTokenDummy).then(() => {
                                  // Precompiled - Purity Checker
                                  const purityChecker = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/purity_checker.abi'), null, {
                                      from: accounts[0], 
                                      gasPrice: '20000000000' // 20 gwei
                                  });
                                  // Deploy Purity Checker
                                  return purityChecker.deploy({data: config.fs.readFileSync('./contracts/contract/casper/compiled/purity_checker.bin')
                                  }).send({from: accounts[0], gas: 1500000, gasPrice: '20000000000'}, function(error, transactionHash){ 
                                  }).then(async (purityCheckerContract) => {
                                    // Precompiled - Signature Hasher
                                    const sigHasher = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/sighash.abi'), null, {
                                        from: accounts[0], 
                                        gasPrice: '20000000000' // 20 gwei
                                    });
                                    // Deploy Signature Hasher
                                    return sigHasher.deploy({data: config.fs.readFileSync('./contracts/contract/casper/compiled/sighash.bin')
                                    }).send({from: accounts[0], gas: 1500000, gasPrice: '20000000000'}, function(error, transactionHash){ 
                                    }).then(async (sigHashContract) => {
                                      // Precompiled - Casper
                                      const casper = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/simple_casper.abi'), null, {
                                          from: accounts[0], 
                                          gasPrice: '20000000000' // 20 gwei
                                      });
                                      console.log(casperInit.init(accounts[0], sigHashContract._address, purityCheckerContract._address, web3.toWei('5', 'ether')));
                                      // Deploy Casper
                                      return casper.deploy(
                                        // Casper settings 
                                        { arguments: casperInit.init(accounts[0], sigHashContract._address, purityCheckerContract._address, web3.toWei('5', 'ether')),
                                          data: config.fs.readFileSync('./contracts/contract/casper/compiled/simple_casper.bin')
                                        }).send({from: accounts[0], gas: 2000000, gasPrice: '20000000000'}, function(error, transactionHash){ 
                                        }).then(async (casperContract) => {
                                        // Update the storage with the new addresses
                                        return rocketStorage.deployed().then(async rocketStorageInstance => {
                                          console.log('\n');

                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage Address');
                                          console.log(rocketStorage.address);

                                          // Dummy Casper
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', dummyCasper.address),
                                            dummyCasper.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'casper'),
                                            dummyCasper.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage DummyCasper Address');
                                          console.log(dummyCasper.address);


                                          // Rocket Pool
                                          // First register the contract address as being part of the network so we can do a validation check using just the address
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketPool.address),
                                            rocketPool.address
                                          );
                                          // Now register again that contracts name so we can retrieve it by name if needed
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketPool'),
                                            rocketPool.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketPool Address');
                                          console.log(rocketPool.address);

                                          // Rocket Role
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketRole.address),
                                            rocketRole.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketRole'),
                                            rocketRole.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketRole Address');
                                          console.log(rocketRole.address);

                                          // Rocket User
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketUser.address),
                                            rocketUser.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketUser'),
                                            rocketUser.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketUser Address');
                                          console.log(rocketUser.address);

                                          // Rocket Node
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketNode.address),
                                            rocketNode.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketNode'),
                                            rocketNode.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketNode Address');
                                          console.log(rocketNode.address);

                                          // Rocket Pool Mini Delegate
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketPoolMiniDelegate.address),
                                            rocketPoolMiniDelegate.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketPoolMiniDelegate'),
                                            rocketPoolMiniDelegate.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketPoolMiniDelegate Address');
                                          console.log(rocketPoolMiniDelegate.address);

                                          // Rocket Factory
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketFactory.address),
                                            rocketFactory.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketFactory'),
                                            rocketFactory.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketFactory Address');
                                          console.log(rocketFactory.address);

                                          // Rocket Upgrade
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketUpgrade.address),
                                            rocketUpgrade.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketUpgrade'),
                                            rocketUpgrade.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketUpgrade Address');
                                          console.log(rocketUpgrade.address);

                                          // Rocket Utils
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketUtils.address),
                                            rocketUtils.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketUtils'),
                                            rocketUtils.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketUtils Address');
                                          console.log(rocketUtils.address);

                                          // Rocket Partner API
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketPartnerAPI.address),
                                            rocketPartnerAPI.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketPartnerAPI'),
                                            rocketPartnerAPI.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketPartnerAPI Address');
                                          console.log(rocketPartnerAPI.address);

                                          // Rocket Deposit Token
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketDepositToken.address),
                                            rocketDepositToken.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketDepositToken'),
                                            rocketDepositToken.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketDepositToken Address');
                                          console.log(rocketDepositToken.address);

                                          // Rocket Pool Token
                                          await rocketStorageInstance.setAddress(
                                            // If we are migrating to live mainnet, set the token address for the current live RPL contract
                                            config.web3.utils.soliditySha3('contract.name', 'rocketPoolToken'),
                                            network == 'live' ? '0xb4efd85c19999d84251304bda99e90b92300bd93' : rocketPoolTokenDummy.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketPoolToken Address');
                                          console.log(rocketPoolTokenDummy.address);

                                          // Rocket Vault
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketVault.address),
                                            rocketVault.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketVault'),
                                            rocketVault.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketVault Address');
                                          console.log(rocketVault.address);

                                          // Rocket Vault Store
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketVaultStore.address),
                                            rocketVaultStore.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketVaultStore'),
                                            rocketVaultStore.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage rocketVaultStore Address');
                                          console.log(rocketVaultStore.address);

                                          // Rocket Settings
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', rocketSettings.address),
                                            rocketSettings.address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'rocketSettings'),
                                            rocketSettings.address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Storage RocketSettings Address');
                                          console.log(rocketSettings.address);
                                                  
                                          
                                          /*** Deploy precompiled contracts */
                                          
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', purityCheckerContract._address),
                                            purityCheckerContract._address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'purityChecker'),
                                            purityCheckerContract._address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Precompiled - Purity Checker Address');
                                          console.log(purityCheckerContract._address);
                                          
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', sigHashContract._address),
                                            sigHashContract._address
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'signatureHasher'),
                                            sigHashContract._address
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Precompiled - Signature Hasher Address');
                                          console.log(sigHashContract._address);

                                          // Set Caspers address based on the network
                                          const casperContractAddress = network == 'live' ? '0xENTERCASPERSLIVECONTRACTADDRESS' : casperContract._address;

                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', casperContractAddress),
                                            casperContractAddress
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'casper'),
                                            casperContractAddress
                                          );
                                          // Log it
                                          console.log('\x1b[33m%s\x1b[0m:', 'Set Precompiled - Casper Address');
                                          console.log(casperContractAddress);
                                          console.log('\n');    
                                        
                                        

                                          /*** Initialise **********/
                                          const rocketSettingsInstance = await rocketSettings.deployed();
                                          await rocketSettingsInstance.init();

                                          console.log('\x1b[32m%s\x1b[0m', 'Post - Settings Initialised');

                                          /*** Permissions *********/
                                          
                                          // Disable direct access to storage now
                                          await rocketStorageInstance.setBool(
                                            config.web3.utils.soliditySha3('contract.storage.initialised'),
                                            true
                                          );
                                          // Log it
                                          console.log('\x1b[32m%s\x1b[0m', 'Post - Storage Direct Access Removed');
                                          // Return
                                          return deployer;
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};
