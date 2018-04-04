// The settings used for Casper when deploying locally
module.exports.init = function (ownerAddress, sigHashAddress, purityAddress, minDepositSize) {

        return [
            // _epoch_length - The length of an epoch in blocks - Live Casper is 50
            5,
            // _withdrawal_delay - The required withdrawal delay in epochs
            2,
            // _dynasty_logout_delay - The required logout delay in dynasties (at least 2 epochs)
            2,
            // _owner - The owner of the contract
            ownerAddress,
            // _sighasher - The signature hasher contract address
            sigHashAddress,
            // _purity_checker - The purity checker contract, checks the sig of the validator
            purityAddress,
            // _base_interest_factor - Base interest factor
            0.04,
            // _base_penalty_factor - Base penalty factor
            0.02,
            // _min_deposit_size - Minimum deposit size in wei
            minDepositSize
        ];

};
