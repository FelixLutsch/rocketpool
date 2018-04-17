import { printTitle, getContractAddressFromStorage } from '../utils';
import { scenarioIncrementEpoch, scenarioIncrementDynasty, scenarioVerifyDecimal10 } from './casper-scenarios';


export default function({owner}) {

    contract('Casper', async (accounts) => {


        // Simulate Caspers epoch and dynasty changing
        it(printTitle('casper', 'simulate Caspers epoch and dynasty changing'), async () => {
            await scenarioVerifyDecimal10(owner);
            await scenarioIncrementEpoch(owner);
            await scenarioIncrementEpoch(owner);
            await scenarioIncrementDynasty(owner);
        });


    });

}
