const chunkIterator = async function* (array, chunkSize) {
    for (let i = 0; i < array.length; i += chunkSize) {
        yield array.slice(i, i + chunkSize);
    }
};

const processChunks = async (array, asyncCallback, chunkSize = 5) => {
    const results = [];
    console.log('Starting chunk processing...');

    for await (const chunk of chunkIterator(array, chunkSize)) {
        console.log(`Processing chunk: ${JSON.stringify(chunk)}`);

        const chunkResult = [];
        for (const item of chunk) {
            console.log(`Processing item: ${item}`);
            const result = await asyncCallback(item);
            chunkResult.push(result);
        }

        console.log(`Processed chunk results: ${JSON.stringify(chunkResult)}`);
        results.push(...chunkResult);
    }

    console.log('All chunks processed.');
    return results;
};

const defineDemoTask4 = () => {
    const demoTask4 = async () => {
        const largeDataset = Array.from({ length: 50 }, (_, i) => i + 1);
        const asyncCallback = async (n) => {
            console.log(`Simulating processing of number ${n}`);
            await new Promise(resolve => setTimeout(resolve, 300)); 
            return `${n} Done`;
        };

        console.log('Processing large dataset...');
        const results = await processChunks(largeDataset, asyncCallback, 10);
        console.log('Task 4 Result:', results);
    };

    demoTask4();
};

(async () => {
    defineDemoTask4();
})();
