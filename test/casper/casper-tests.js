import { sendDeployTransaction } from '../_lib/smart-node/validation-code-contract';
import { printTitle, getContractAddressFromStorage, mineBlockAmount } from '../_lib/utils/general';
import { scenarioEpochIsCurrent, scenarioIncrementEpochAndInitialise, scenarioVerifyDecimal10, scenarioDeposit } from './casper-scenarios';
import { CasperInstance, casperEpochInitialise } from '../_lib/casper/casper';


export default function({owner}) {

    contract.only('Casper', async (accounts) => {

         /**
         * Config
         */

        // User addresses
        const userFirst = accounts[1];
        const userSecond = accounts[2];
        
        
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

        // Deposit to Casper
        it(printTitle('userFirst', 'makes a successful minimum deposit into Casper'), async () => {
            // Casper
            const casper = await CasperInstance();
            // Get the min deposit allowed
            let minDepositInWei = await casper.methods.MIN_DEPOSIT_SIZE().call({from: userFirst});
            // Deploy a validation contract for the user
            let validationTx = await sendDeployTransaction(userFirst, null);
            // Deposit with Casper
            await scenarioDeposit(userFirst, minDepositInWei, validationTx.contractAddress, userFirst);
        });

        


    });

}
