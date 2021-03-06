const Blockchain = require('./index');
const Block = require('./block');
const {cryptoHash} = require('../CryptoUtil');


describe('blockchain', () => {
    let blockchain, newChain, originalChain //blockchain is a dynamic variable so that it can be reassigned.
    
    // reverts the blockchain data back to original if it is being modified in each of the test.
    beforeEach(()=> {
        blockchain = new Blockchain();
        newChain = new Blockchain();

        originalChain = blockchain.chain;
    });

    it('contains a `chain` array instance', () => {
        expect(blockchain.chain instanceof Array).toBe(true);
    });

    it('starts with the genesis block', () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });

    it('adds a new block to the chain', () => {
        const newData = 'foo bar';
        blockchain.addBlock({data: newData});
        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData); 
    });

// Running tests for the isValid function (For chain validation)

    describe('isValidChain()', () => {
        
        describe('when the chain doesnt start with the genesis block', () => {
            it('returns false', () => {
                blockchain.chain[0] = {data: 'fake-genesis'};
                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
            });
        });
        describe('when the chain does start with the genesis block and has several blocks', () => {
           
                beforeEach(() => {
                    blockchain.addBlock({data: 'tiger'});
                    blockchain.addBlock({data: 'roots'});
                    blockchain.addBlock({data: 'leviathan'});
                });   
                describe('and a lastHash referece has changed', () => {
                it('returns false', () => {
                    blockchain.chain[2].lastHash = 'broken-lastHash';

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe('and the chain contains a block with an invalid field', () => {
                it('returns false', () => {
                    blockchain.chain[2].data = 'random-useless-data';
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            //Preventing a potential difficulty jump attack by adding extra validation for the blockchain.
            //isValidMethod code was also changed inthe blockchain.js file
            describe('and the chain contains a block with a jumped difficulty', () => {
                it('returns false', () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length-1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty - 3;
                    const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
                    const badBlock = new Block({timestamp, lastHash, hash, difficulty, nonce, data});
                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                    
                });
                
            });

            describe('and the chain does not contain any invalid blocks', () => {
                it('returns true', () => {
                    
                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                    
                });
            });
         });
    });

    //Running tests for the chain replacement rule
    describe ('replaceChain()', () => {
        // errorMock and errorLog are used to stub the console output and avoid unneccesary output 
        let errorMock, logMock;
        beforeEach(() => {
            //Using Jest's in-built function here to help stub the output on the console
            errorMock = jest.fn();
            logMock = jest.fn();

            global.console.error = errorMock;
            global.console.log = logMock;
        })
        describe('When the new chain is not longer than the other', () => {
            beforeEach(() => {
                newChain.chain[0] = {new: 'chain'};

                blockchain.replaceChain(newChain.chain);
            });
            it('does not replace the chain', () => {


                expect(blockchain.chain).toEqual(originalChain)
            });
            it('logs an error ', () => {
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe('When the newer chain is longer', () => {
            beforeEach(() => {
                newChain.addBlock({data: 'tiger'});
                newChain.addBlock({data: 'roots'});
                newChain.addBlock({data: 'leviathan'});
            });   

            describe('and the chain is invalid', () => {
                beforeEach(() => {
                    newChain.chain[2].hash = 'fake-hash';

                    blockchain.replaceChain(newChain.chain);
                });
                
                it('does not replace the chain', () => {

                    expect(blockchain.chain).toEqual(originalChain)
                });
                it('logs an error ', () => {
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe('and when the chain is valid', () => {
                beforeEach(()=> {
                    blockchain.replaceChain(newChain.chain);
                });
                it('replaces the chain', () => {
                    expect(blockchain.chain).toEqual(newChain.chain)
                });
                it('logs about the chain replacement', () => {
                    expect(logMock).toHaveBeenCalled();
                }); 
            });
        })

    });
});