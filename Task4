async function* chunkIterator(array, chunkSize) {
    for (let i = 0; i < array.length; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
}

async function processChunks(array, asyncCallback, chunkSize = 5) {
    let results = [];
    console.log('Starting chunk processing...');
    
    for await (const chunk of chunkIterator(array, chunkSize)) {
        console.log(`Processing chunk: ${JSON.stringify(chunk)}`);
        
        const chunkResult = await Promise.all(chunk.map(async (item) => {
            console.log(`Processing item: ${item}`);
            return await asyncCallback(item);
        }));
        
        console.log(`Processed chunk results: ${JSON.stringify(chunkResult)}`);
        results.push(...chunkResult);
    }

    console.log('All chunks processed.');
    return results;
}


function defineDemoTask4() {
    const demoTask4 = async () => {
        const largeDataset = Array.from({ length: 50 }, (_, i) => i + 1);
        const asyncCallback = async (n) => {
            console.log(`Simulating processing of number ${n}`);
            return new Promise(resolve => {
                setTimeout(() => resolve(`${n} Done`), 300);
            });
        };

        console.log('Processing large dataset...');
        const results = await processChunks(largeDataset, asyncCallback, 10);
        console.log('Task 4 Result:', results);
    };

    demoTask4();
}

(async () => {
    defineDemoTask4();
})();
