async function asyncMapObservable(array, asyncCallback, parallelLimit = 3) {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (currentIndex >= array.length) return;

        const index = currentIndex++;
        activePromises++;

        try {
            const result = await asyncCallback(array[index]);
            results[index] = result;
        } catch (error) {
            console.error(`Error processing item ${index}:`, error);
        } finally {
            activePromises--;
            processNext(); 
        }
    };

    for (let i = 0; i < parallelLimit && currentIndex < array.length; i++) {
        processNext();
    }

    while (activePromises > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
}

// Example usage
(async () => {
    const nums = [1, 2, 3, 4, 5];
    const callback = async (n) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return n * 2;
    };

    console.log('Starting base functionality...');
    const results = await asyncMapObservable(nums, callback, 2);
    console.log('Results:', results);
})();