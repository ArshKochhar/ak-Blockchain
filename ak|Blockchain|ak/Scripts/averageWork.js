const Blockchain = require('../blockchain')
const blockchain = new Blockchain();

// Investigating the proof of work system by writing a script which checks 
// how the dynamic difficulty is adjusted by the system to approach the mine rate.

blockchain.addBlock({data: 'initial'});

console.log('first block', blockchain.chain[blockchain.chain.length-1]);

let previousTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for (let i = 0; i<10000; i++ ) {
    previousTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp

    blockchain.addBlock({ data: `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length-1];

    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - previousTimestamp;
    times.push(timeDiff);

    average = times.reduce((total, num) => (total + num))/times.length;

  console.log(`time to mine that block: ${timeDiff}ms. Difficulty: ${nextBlock.difficulty}. Average Time: ${average}ms`);
}
