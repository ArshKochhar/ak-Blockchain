const {STARTING_BALANCE} = require('../configure');
const {ec} = require('../CryptoUtil');
const cryptoHash = require('../CryptoUtil/cryptohash');

class Wallet {
    constructor() {
        this.balance = STARTING_BALANCE;

        this.keyPair = ec.genKeyPair();

        this.publicKey =  this.keyPair.getPublic().encode('hex');
        
    }
    sign(data) {
        return this.keyPair.sign(cryptoHash(data))
    }
};

module.exports= Wallet;