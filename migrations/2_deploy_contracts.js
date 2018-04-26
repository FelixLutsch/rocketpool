// Config
const config = require('../truffle.js');

// Artifactor 
//const artifactor = new config.artifactor('./contracts/contract/casper/compiled');

// Contracts
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
// Casper live contract address
let casperContractAddress = '0XADDLIVECASPERADDRESS';

// Load ABI files and parse
const loadABI = function(abiFilePath) {
  return JSON.parse(config.fs.readFileSync(abiFilePath));
}


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
                                                  
                                          
      
                                          /*** Initialise Settings **********/
                                          const rocketSettingsInstance = await rocketSettings.deployed();
                                          await rocketSettingsInstance.init();

                                          console.log('\x1b[32m%s\x1b[0m', 'Post - Settings Initialised');
                                          console.log(rocketSettings.address);


                                          /*** Casper Precompiled Contracts **********/

                                          // These only need to be deployed when testing
                                          if ( network != 'live' ) {

                                              // Seed a user account which has signed the transaction used to create the RLP decoder
                                              // TX for the RLP DECODER CONTRACT HERE https://github.com/ethereum/vyper/blob/master/vyper/utils.py#L110
                                              await $web3.eth.sendTransaction({
                                                from: accounts[0],
                                                to: '0xd2c560282c9C02465C2dAcdEF3E859E730848761',
                                                value: 6270960000000000,
                                                gas: 1000000,
                                              });
                                              // Send the signed transaction now - creates contract @ 0xCb969cAAad21A78a24083164ffa81604317Ab603
                                              let rlpTX = await $web3.eth.sendSignedTransaction('0xf90237808506fc23ac00830330888080b902246102128061000e60003961022056600060007f010000000000000000000000000000000000000000000000000000000000000060003504600060c082121515585760f882121561004d5760bf820336141558576001905061006e565b600181013560f783036020035260005160f6830301361415585760f6820390505b5b368112156101c2577f010000000000000000000000000000000000000000000000000000000000000081350483602086026040015260018501945060808112156100d55760018461044001526001828561046001376001820191506021840193506101bc565b60b881121561014357608081038461044001526080810360018301856104600137608181141561012e5760807f010000000000000000000000000000000000000000000000000000000000000060018401350412151558575b607f81038201915060608103840193506101bb565b60c08112156101b857600182013560b782036020035260005160388112157f010000000000000000000000000000000000000000000000000000000000000060018501350402155857808561044001528060b6838501038661046001378060b6830301830192506020810185019450506101ba565bfe5b5b5b5061006f565b601f841315155857602060208502016020810391505b6000821215156101fc578082604001510182826104400301526020820391506101d8565b808401610420528381018161044003f350505050505b6000f31b2d4f');
                                              

                                              // Precompiled - Purity Checker
                                              const purityChecker = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/purity_checker.abi'), null, {
                                                from: accounts[0], 
                                                gasPrice: '20000000000' // 20 gwei
                                              });
                                              // Deploy Purity Checker
                                              const purityCheckerContract = await purityChecker.deploy({data: config.fs.readFileSync('./contracts/contract/casper/compiled/purity_checker.bin')}).send({
                                                      from: accounts[0], 
                                                      gas: 1500000, 
                                                      gasPrice: '20000000000'
                                              });

                                              // Precompiled - Signature Hasher
                                              const sigHasher = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/sighash.abi'), null, {
                                                  from: accounts[0], 
                                                  gasPrice: '20000000000' // 20 gwei
                                              });
                                              // Deploy Signature Hasher
                                              const sigHashContract = await sigHasher.deploy({data: config.fs.readFileSync('./contracts/contract/casper/compiled/sighash.bin')}).send({
                                                    from: accounts[0], 
                                                    gas: 1500000, 
                                                    gasPrice: '20000000000'
                                              });

                                              // Note Casper is deployed as late as possible to make sure its initial current_epoch correctly (if many transactions occur after its deployment, block number will be too far for the correct epoch to be used)
                                              // Precompiled - Casper
                                              const casper = new $web3.eth.Contract(loadABI('./contracts/contract/casper/compiled/simple_casper.abi'), null, {
                                                  from: accounts[0], 
                                                  gasPrice: '20000000000' // 20 gwei
                                              });
                                              // Deploy Casper
                                              let casperBytecode = config.fs.readFileSync('./contracts/contract/casper/compiled/simple_casper_test.bin');
                                              // Update the casper bytecode to not use the rlp_decoder address specified here https://github.com/ethereum/vyper/blob/170229494a582735dc2973eb2b6f4ef6f493f67c/vyper/utils.py#L106
                                              // We need it to use the one we deployed, otherwise we'd need to recompile Vyper to use this one, so do a find and replace in the bytecode
                                              casperBytecode = casperBytecode.toString().replace(/5185D17c44699cecC3133114F8df70753b856709/gi, 'Cb969cAAad21A78a24083164ffa81604317Ab603');
                                              // Create the contract now
                                              const casperContract = await casper.deploy(
                                                // Casper settings 
                                                { arguments: casperInit.init(accounts[0], sigHashContract._address, purityCheckerContract._address, web3.toWei('5', 'ether')),
                                                  data: casperBytecode}).send({
                                                    from: accounts[0], 
                                                    gas: 5000000, 
                                                    gasPrice: '20000000000'
                                              });
                                              // Set the Casper contract address
                                              casperContractAddress = casperContract._address;
                                              // Log it
                                              console.log('\x1b[32m%s\x1b[0m:', 'Casper - Deployed and Initialised');
                                              console.log(casperContractAddress); 
                                          }

                                          // Set Caspers address in Rocket Storage
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.address', casperContractAddress),
                                            casperContractAddress
                                          );
                                          await rocketStorageInstance.setAddress(
                                            config.web3.utils.soliditySha3('contract.name', 'casper'),
                                            casperContractAddress
                                          );
                                          // Log it
                                          console.log('\x1b[32m%s\x1b[0m:', 'Casper - Address Updated');
                                          console.log(casperContractAddress); 

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
                                        //});

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
