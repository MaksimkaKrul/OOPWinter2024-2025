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

const asyncMapPromise = async (array, debounceTime = 0, parallelLimit = 3, signal) => {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (signal?.aborted) {
            console.log('Aborted!');
            throw new Error('Operation aborted');
        }

        if (currentIndex >= array.length) return;

        while (activePromises >= parallelLimit) {
            if (signal?.aborted) {
                console.log('Aborted!');
                throw new Error('Operation aborted');
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const index = currentIndex++;
        activePromises++;

        try {
            const startTime = Date.now();

            // Logic should be here
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
            console.error(`Error processing index ${index}:`, error);
        } finally {
            activePromises--;
            await processNext();
        }
    };

    const workers = Array.from({ length: Math.min(parallelLimit, array.length) }, processNext);

    await Promise.allSettled(workers);

    if (signal?.aborted) {
        throw new Error('Operation aborted');
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
        const callback = (n) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(n * 3);
                }, 500);
            });
        };

        console.log('Demo 3: Start');
        asyncMapPromise(nums, callback, 100)
            .then(res => {
                console.log('Demo 3 Result:', res);
            }).catch((err) => console.log('Demo 3 Error:', err));
    };

    demo3();
};

const defineDemo4 = () => {
    const demo4 = () => {
        const asyncCallback = (item, index, array) => {
            return new Promise(resolve => {
                const delay = Math.random() * 1000;
                console.log(`Task ${index + 1} started, will take ${Math.round(delay)}ms`);
                setTimeout(() => {
                    console.log(`Task ${index + 1} completed`);
                    resolve(`Result ${index + 1}`);
                }, delay);
            });
        };

        const testAsyncMap = async () => {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const debounceTime = 0;
            const parallelLimit = 3;

            const results = await asyncMapPromise(array, asyncCallback, debounceTime, parallelLimit);
            console.log('All tasks completed with results:', results);
        };

        testAsyncMap();
    };

    demo4();
};

const defineDemoWithAbort = () => {
    const demo = () => {
        const nums = [1, 2, 3, 4, 5];
        const controller = new AbortController();
        asyncMapPromise(nums, 100, 2, controller.signal)
            .then(res => {
                console.log('Demo Result:', res); 
            })
            .catch(err => {
                console.log('Demo Error:', err.message);
            });
        
        setTimeout(() => {
            console.log('Aborting operation:');
            controller.abort();
        }, 1000);
        
    };

    demo();
};

const delay = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
};

(async () => {
    defineDemo4();
    defineDemoWithAbort();
})();