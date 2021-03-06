
// Print pretty test title
export function printTitle(user, desc) {
    return '\x1b[33m' + user + '\u001b[00m: \u001b[01;34m' + desc;
}

// Assert that an error is thrown
export async function assertThrows(promise, err, expected) {
    try {
        await promise;
        assert.isNotOk(true, err);
    } catch (e) {
        if(!expected){
            assert.include(e.message, 'VM Exception');
        }
        else{
            assert.include(e.message, expected);
        }
    }
}

// Print the event to console
export function printEvent (type, result, colour) {
  console.log('\n');
  console.log(
    colour,
    '*** ' + type.toUpperCase() + ' EVENT: ' + result.event + ' *******************************'
  );
  console.log('\n');
  console.log(result.args);
  console.log('\n');
};

// The newer version of Web3 is used for hashing, the old one that comes with truffle does it incorrectly. Waiting for them to upgrade truffles web3.
const web3New = require('web3');
export function soliditySha3() {
    return web3New.utils.soliditySha3.apply(web3New, Array.prototype.slice.call(arguments));
}

const ethereumUtils = require('ethereumjs-util');
export function hashMessage(data) {
    var message = web3New.utils.isHexStrict(data) ? web3New.utils.hexToBytes(data) : data;
    var messageBuffer = Buffer.from(message);
    var preamble = "\x19Ethereum Signed Message:\n" + message.length;
    var preambleBuffer = Buffer.from(preamble);    
    var ethMessage = Buffer.concat([preambleBuffer, messageBuffer]);
    return web3New.utils.bytesToHex(ethereumUtils.sha3(ethMessage));
}
