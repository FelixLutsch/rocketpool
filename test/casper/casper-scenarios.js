import { mineBlockAmount } from '../utils';
import { CasperValidation } from '../artifacts';
import { CasperInstance, casperEpochIncrementAmount } from '../casper';


// Retrieve base_penalty_factor which is a DECIMAL10 attribute and should be greater than 0 but less than 1
export async function scenarioVerifyDecimal10(fromAddress) {
    let casper = await CasperInstance();
    let result = await casper.methods.base_penalty_factor().call({from: fromAddress});
    assert.isTrue(result > 0 && result < 1, 'Verified Casper DECIMAL10 is a float');
}

// The current Epoch is the expected epoch
export async function scenarioEpochIsCurrent(fromAddress) {
    // Casper
    const casper = await CasperInstance();
    // Get the current epoch
    let epochCurrent = await casper.methods.current_epoch().call({from: fromAddress});
    // Get the current epoch length
    let epochBlockLength = await casper.methods.epoch_length().call({from: fromAddress});
    // Get the current block number
    let blockCurrent = web3.eth.blockNumber;
    // This would be the current epoch we expect
    let epochExpected = Math.floor(blockCurrent/epochBlockLength);
    //console.log(blockCurrent, epochBlockLength, epochCurrent, epochExpected);
    assert.equal(epochExpected, epochCurrent, 'Casper epoch is not current');
}

// Increments Casper epoch and asserts current epoch is set correctly
export async function scenarioIncrementEpochAndInitialise(fromAddress, amount) {
    // Casper
    const casper = await CasperInstance();
    // Get the current epoch
    let epochCurrent = await casper.methods.current_epoch().call({from: fromAddress});
    await casperEpochIncrementAmount(fromAddress, amount);
    // Get the current epoch after
    let epochCurrentAfter = await casper.methods.current_epoch().call({from: fromAddress});
    //console.log(epochCurrent, epochCurrentAfter, parseInt(epochCurrent) + parseInt(amount));
    assert.equal(parseInt(epochCurrentAfter), parseInt(epochCurrent) + parseInt(amount), 'Updated Casper epoch does not match');
}


// Increments Casper dynasty and asserts current dynasty is set correctly
export async function scenarioIncrementDynasty(fromAddress) {
    const casper = await Casper.deployed();
    let casperDynastyOld = await casper.get_dynasty.call();
    await casper.set_increment_dynasty({from: fromAddress});
    let casperDynastyNew = await casper.get_dynasty.call();
    assert.equal(casperDynastyNew.valueOf(), parseInt(casperDynastyOld.valueOf()) + 1, 'Updated Casper dynasty does not match');
}


// Creates validation contract and asserts contract was created successfully
export async function scenarioCreateValidationContract({fromAddress}) {

    // Create a blank contract for use in making validation address contracts
    // 500k gas limit @ 10 gwei TODO: Make these configurable on the smart node package by reading from RocketSettings contract so we can adjust when needed
    const valCodeContract = await CasperValidation.new({gas: 500000, gasPrice: 10000000000, from: fromAddress});

    // Assert that contract was created successfully
    assert.notEqual(valCodeContract.address, 0, 'Validation contract creation failed');

    // Return validation contract address
    return valCodeContract.address;

}

