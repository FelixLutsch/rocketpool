#!/usr/bin/env node

/**
 * Module dependencies.
 */

const $Web3 = require('web3');
const $web3 = new $Web3('http://localhost:8545');
const RLP = require('rlp');
const secp256k1 = require('secp256k1');
const EthCrypto = require('eth-crypto');

// Sign
function signRaw(hash, privateKey) {
    hash = addTrailing0x(hash);
    if (hash.length !== 66)
        throw new Error('sign(): Can only sign hashes, given: ' + hash);

    const sigObj = secp256k1.sign(
        new Buffer(removeTrailing0x(hash), 'hex'),
        new Buffer(removeTrailing0x(privateKey), 'hex')
    );

    const recoveryId = sigObj.recovery === 1 ? '1c' : '1b';
    const sig = sigObj.signature.toString('hex') + recoveryId;

    const v = sig.slice(128,130);
    const r = sig.slice(0,64);
    const s = sig.slice(64,128);
    
    return {
        sig,
        v,
        r,
        s
    };
}

// Address formatting tools
function removeTrailing0x(str) {
    if (str.startsWith('0x'))
        return str.substring(2);
    else return str;
}

function addTrailing0x(str) {
    if (!str.startsWith('0x'))
        return '0x' + str;
    else return str;
}


let validatorIndex = 1;
//let targetHash = "0x9b55f7a0b2fb3a5446becf58e5aa9829a019037f476107786fde41699d4c932a";
let targetHash = Buffer.from('2583983b77a71c321faaa2a3e2edb2449e2adb173a903ef3515592d3c9cbd54f', 'hex');
let pkey = Buffer.from('0xc6d2ac9b00bd599c4ce9d3a69c91e496eb9e79781d9dc84c79bafa7618f45f37', 'hex');
let casperCurrentEpoch = 7;
let sourceEpoch = 6;
// RLP encode the required vote message
let sigHash = $web3.utils.keccak256(RLP.encode([validatorIndex,targetHash,casperCurrentEpoch,sourceEpoch]));

function paddy(string, padlen, padchar) {
    string = string.substr(0, 2) == '0x' ? string.slice(2) : string;
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + string).slice(-pad.length);
}


const publicKey = EthCrypto.publicKeyByPrivateKey(
    'c6d2ac9b00bd599c4ce9d3a69c91e496eb9e79781d9dc84c79bafa7618f45f37'
);

const signatureOb = signRaw(
    sigHash, // hash of message
    'c6d2ac9b00bd599c4ce9d3a69c91e496eb9e79781d9dc84c79bafa7618f45f37', // privateKey
);

const signer = EthCrypto.recover(
    signatureOb.sig,
    sigHash // signed message hash
);



async function logs() { 
    console.log(signer);
    console.log("\n");
    console.log(signatureOb);
    console.log("\n");
    console.log(paddy(signatureOb.v, 64));
    console.log(paddy(signatureOb.r, 64));
    console.log(paddy(signatureOb.s, 64));
    console.log(paddy(signatureOb.v, 64) + paddy(signatureOb.r, 64) + paddy(signatureOb.s, 64));
    console.log("\n");
}
logs();
