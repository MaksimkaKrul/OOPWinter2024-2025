const asyncMap = async (array, asyncCallback, debounceTime) => {
    const results = [];
    debounceTime = debounceTime || 0;

    for (let i = 0; i < array.length; i++) {
        const startTime = Date.now();

        const result = await asyncCallback(array[i], i, array);
        results.push(result);

        if (debounceTime > 0) {
            const elapsed = Date.now() - startTime;
            if (elapsed < debounceTime) {
                await new Promise(resolve => setTimeout(resolve, debounceTime - elapsed));
            }
        }
    }

    return results;
};

const asyncMapPromise = async (array, debounceTime, parallelLimit = 3) => {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;
    let errorOccurred = false;

    const processNext = async () => {
        if (currentIndex >= array.length) return;

        while (activePromises >= parallelLimit) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const index = currentIndex++;
        activePromises++;

        try {
            const startTime = Date.now();

            // Logic for each task should be here
            const result = await new Promise(resolve => {
                setTimeout(() => {
                    resolve(array[index] * 3); 
                }, 500);
            });
            results[index] = result;

            if (debounceTime > 0) {
                const elapsed = Date.now() - startTime;
                if (elapsed < debounceTime) {
                    await new Promise(resolve => setTimeout(resolve, debounceTime - elapsed));
                }
            }
        } catch (error) {
            errorOccurred = true;
            console.error(`Error processing index ${index}:`, error);
        } finally {
            activePromises--;
            await processNext();
        }
    };

    const workers = Array.from({ length: Math.min(parallelLimit, array.length) }, processNext);

    await Promise.all(workers);

    if (errorOccurred) {
        console.log('One or more errors occurred during processing');
    }
    
    return results; 
};


// const defineDemo1 = () => {
//     const demo1 = async () => {
//         const nums = [1, 2, 3, 4, 5];
//         const callback = async (n) => {
//             await delay(100);
//             return n * 2;
//         };

//         console.log('Demo 1: Start');
//         const res = await asyncMap(nums, callback);
//         console.log('Demo 1 Result:', res);
//     };

//     demo1();
// };

// const defineDemo2 = () => {
//     const demo2 = async () => {
//         const nums = [1, 2, 3, 4, 5];
//         const callback = async (n) => {
//             await delay(500);
//             return n * 3;
//         };

//         console.log('Demo 2: Start');
//         const res = await asyncMap(nums, callback, 100);
//         console.log('Demo 2 Result:', res);
//     };

//     demo2();
// };


const defineDemo3 = () => {
    const demo3 = () => {
        const nums = [1, 2, 3, 4, 5];
        const callback = (n) => new Promise(resolve => {
            setTimeout(() => {
                resolve(n * 3);
            }, 500);
        });

        console.log('Demo 3: Start');
        asyncMapPromise(nums, callback, 100)
            .then(res => {
                console.log('Demo 3 Result:', res);
            }).catch(err => console.log('Demo 3 Error:', err));
    };

    demo3();
};

const defineDemo4 = () => {
    const demo4 = () => {
        const testAsyncMap = async () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const debounceTime = 0;
            const parallelLimit = 3;

            const results = await asyncMapPromise(array, debounceTime, parallelLimit);
            console.log('All tasks completed with results:', results);
        };

        testAsyncMap();
    };

    demo4();
};

const delay = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
};

(async () => {
    defineDemo4();
})();