import { printTitle, getContractAddressFromStorage, mineBlockAmount } from '../utils';
import { scenarioEpochIsCurrent, scenarioIncrementEpochAndInitialise, scenarioVerifyDecimal10 } from './casper-scenarios';
import { casperEpochInitialise } from '../casper';


export default function({owner}) {

    contract.only('Casper', async (accounts) => {

        // Since new blocks occur for each transaction, make sure to inialise any new epochs automatically between tests
        beforeEach(async () => {
            await casperEpochInitialise(owner);
        });

        // With the newly deployed Casper contract, check the epoch is current
        it(printTitle('casper', 'epoch is current and correct'), async () => {
            await scenarioEpochIsCurrent(owner);
        });

        // Incrememnt the current Casper epoch and initalise it
        it(printTitle('casper', 'epoch increment by 2 and initialise the new epoch'), async () => {
            await scenarioIncrementEpochAndInitialise(owner, 2);
        });

        // Simulate Caspers epoch and dynasty changing
        it(printTitle('casper', 'verify DECIMAL10 stored/read correctly using base_penalty_factor'), async () => {
            await scenarioVerifyDecimal10(owner);
        });

        


    });

}
