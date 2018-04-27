#!/usr/bin/env node

/**
 * Module dependencies.
 */

const $Web3 = require('web3');
const $web3 = new $Web3('http://localhost:8545');
const RLP = require('rlp');
const convert = require('convert-string');

let validatorIndex = 1;
//let targetHash = "0x9b55f7a0b2fb3a5446becf58e5aa9829a019037f476107786fde41699d4c932a";
let targetHash = Buffer.from('9b55f7a0b2fb3a5446becf58e5aa9829a019037f476107786fde41699d4c932a', 'hex');
let pkey = Buffer.from('c6d2ac9b00bd599c4ce9d3a69c91e496eb9e79781d9dc84c79bafa7618f45f37', 'hex');
let casperCurrentEpoch = 7;
let sourceEpoch = 6;
// RLP encode the required vote message
let sigHash = $web3.utils.keccak256(RLP.encode([validatorIndex,targetHash,casperCurrentEpoch,sourceEpoch]));
// Encode it all
let signature = $web3.eth.accounts.sign(sigHash, pkey);
let combinedSig = signature.v + signature.r +  signature.s;

function paddy(string, padlen, padchar) {
    string = string.substr(0, 2) == '0x' ? string.slice(2) : string;
    var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
    var pad = new Array(1 + padlen).join(pad_char);
    return (pad + string).slice(-pad.length);
}

async function logs() { 
    console.log(await $web3.eth.sign(sigHash, '0xe6ed92d26573c67af5eca7fb2a49a807fb8f88db'));
    console.log(signature);
    console.log("\n");
    //console.log(convert.stringToBytes(targetHash));
    //console.log(targetHash); // CORRECT 
    console.log(paddy((signature.v).toString(), 64));
    console.log(paddy((signature.r).toString(), 64));
    //console.log($web3.utils.padLeft(signature.r, 64));
    console.log("\n");
    console.log(sigHash);
    console.log("\n");
    console.log(RLP.encode([validatorIndex,targetHash,casperCurrentEpoch,sourceEpoch]).toString('hex'));
    console.log("\n");
    //console.log(signature.v);
    //console.log(signature.r);
    //console.log(signature.s);
}
logs();
