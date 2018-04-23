import { mineBlockAmount } from '../_lib/utils/general';
import { CasperValidation } from '../_lib/artifacts';
import { CasperInstance, casperEpochIncrementAmount } from '../_lib/casper/casper';


// Retrieve BASE_PENALTY_FACTOR which is a DECIMAL10 attribute and should be greater than 0 but less than 1
export async function scenarioVerifyDecimal10(fromAddress) {
    let casper = await CasperInstance();
    let result = await casper.methods.BASE_PENALTY_FACTOR().call({from: fromAddress});
    assert.isTrue(result > 0 && result < 1, 'Verified Casper DECIMAL10 is a float');
}

// The current Epoch is the expected epoch
export async function scenarioEpochIsCurrent(fromAddress) {
    // Casper
    const casper = await CasperInstance();
    // Get the current epoch
    let epochCurrent = await casper.methods.current_epoch().call({from: fromAddress});
    // Get the current epoch length
    let epochBlockLength = await casper.methods.EPOCH_LENGTH().call({from: fromAddress});
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

// An address makes a deposit into Casper
export async function scenarioDeposit(fromAddress, amountInWei, validationAddr, withdrawalAddr) {
    // Casper
    const casper = await CasperInstance();
    //console.log(fromAddress, web3.fromWei(amountInWei, 'ether'), validationAddr, withdrawalAddr);
    let tx = await casper.methods.deposit(validationAddr, withdrawalAddr).send({
        from: fromAddress, 
        gas: 3750000, 
        gasPrice: '20000000000',
        value: amountInWei
    });
    console.log(tx);
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

