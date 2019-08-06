const Block = require('./block');
const {cryptoHash} = require('../CryptoUtil');

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()];

    }
    addBlock({data}) {
        const newBlock = Block.minedBlock({
            lastBlock: this.chain[this.chain.length-1], 
            data
        });
        this.chain.push(newBlock);
    }
    //Chain replacement function that is called for tests in the blockchain.tests.js file.
    replaceChain(chain) {
        if(chain.length <= this.chain.length) {
            console.error('The incoming chain must be longer');
            return;
        }
        if(!Blockchain.isValidChain(chain)){
            console.error('the incoming chain must be valid');
            return;
        }
        console.log('Replacing chain with', chain);
        this.chain = chain;
    };

    //Chain Validation function, whose tests are being run in the blockchain.test.js file
static isValidChain(chain) {
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) {
    return false;
};
    for (let i=1; i<chain.length; i++) {
        const block = chain[i];
        const actualLastHash = chain[i-1].hash;
        const lastDifficulty = chain[i-1].difficulty;
        const{timestamp, lastHash, hash, nonce, difficulty, data} = block;

        if(lastHash !== actualLastHash) return false;

        const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

        if(hash !== validatedHash) return false;

        if(Math.abs(lastDifficulty - difficulty) > 1) return false;
    }
    return true;
};


};


module.exports = Blockchain;