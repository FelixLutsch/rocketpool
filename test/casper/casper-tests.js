import { printTitle, getContractAddressFromStorage, mineBlockAmount } from '../utils';
import { scenarioEpochIsCurrent, scenarioIncrementDynasty, scenarioVerifyDecimal10 } from './casper-scenarios';


export default function({owner}) {

    // Reinitialise a clean Casper with correct epoch
    before(async () => {
        
    });

    contract('Casper', async (accounts) => {

        // With the newly deployed Casper contract, check the epoch is current
        it(printTitle('casper', 'epoch is current and correct'), async () => {
            await scenarioEpochIsCurrent(owner);
            await mineBlockAmount(20);
        });

        // Simulate Caspers epoch and dynasty changing
        it(printTitle('casper', 'verify DECIMAL10 stored/read correctly using base_penalty_factor'), async () => {
            await scenarioVerifyDecimal10(owner);
        });

        


    });

}
