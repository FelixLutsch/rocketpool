import { sendDeployTransaction } from '../_lib/smart-node/validation-code-contract';
import { printTitle, assertThrows, getContractAddressFromStorage, mineBlockAmount } from '../_lib/utils/general';
import { scenarioEpochIsCurrent, scenarioIncrementEpochAndInitialise, scenarioVerifyDecimal10, scenarioDeposit } from './casper-scenarios';
import { CasperInstance, casperEpochInitialise } from '../_lib/casper/casper';


export default function({owner}) {

    contract.only('Casper', async (accounts) => {

         /**
         * Config
         */

        // User/Validator addresses
        const validatorFirst = accounts[1];
        const validatorSecond = accounts[2];
        
        
        // Since new blocks occur for each transaction, make sure to inialise any new epochs automatically between tests
        beforeEach(async () => {
            await casperEpochInitialise(owner);
        });

        // Simulate Caspers epoch and dynasty changing
        it(printTitle('casper', 'verify DECIMAL10 stored/read correctly using base_penalty_factor'), async () => {
            await scenarioVerifyDecimal10(owner);
        });

        // With the newly deployed Casper contract, check the epoch is current
        it(printTitle('casper', 'epoch is current and correct'), async () => {
            await scenarioEpochIsCurrent(owner);
        });

        // Incrememnt the current Casper epoch and initalise it
        it(printTitle('casper', 'epoch increment by 2 and initialise the new epoch'), async () => {
            await scenarioIncrementEpochAndInitialise(owner, 2);
        });

        // Fail to deposit less than the Casper minimum
        it(printTitle('validatorFirst', 'fail to deposit less than the Casper minimum'), async () => {
            // Casper
            const casper = await CasperInstance();
            // Get the current epoch
            let epochCurrent = await casper.methods.current_epoch().call({from: validatorFirst});
            let lastNonVoterRescale = await casper.methods.last_nonvoter_rescale().call({from: validatorFirst});
            // Get the min deposit allowed minus 1 ether
            let minDepositInWei = parseInt(await casper.methods.MIN_DEPOSIT_SIZE().call({from: validatorFirst})) - web3.toWei(1, 'ether');
            // Deploy a validation contract for the user
            let validationTx = await sendDeployTransaction(validatorFirst, null);
            // Deposit with Casper
            await assertThrows(scenarioDeposit(validatorFirst, minDepositInWei, validationTx.contractAddress, validatorFirst));
        });

  
        // Deposit to Casper
        it(printTitle('validatorFirst', 'makes a successful minimum deposit into Casper'), async () => {
            // Casper
            const casper = await CasperInstance();
            // Get the current epoch
            let epochCurrent = await casper.methods.current_epoch().call({from: validatorFirst});
            let lastNonVoterRescale = await casper.methods.last_nonvoter_rescale().call({from: validatorFirst});
            // Get the min deposit allowed
            let minDepositInWei = await casper.methods.MIN_DEPOSIT_SIZE().call({from: validatorFirst});
            // Deploy a validation contract for the user
            let validationTx = await sendDeployTransaction(validatorFirst, null);
            // Deposit with Casper
            await scenarioDeposit(validatorFirst, minDepositInWei, validationTx.contractAddress, validatorFirst);
        });

        


    });

}
