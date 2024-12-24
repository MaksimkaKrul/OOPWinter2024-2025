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

const asyncMapPromise = async (array, asyncCallback, debounceTime, parallelLimit = 3) => {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (currentIndex >= array.length) return;

        while (activePromises >= parallelLimit) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const index = currentIndex++;
        activePromises++;

        const startTime = Date.now();

        const promise = asyncCallback(array[index], index, array);

        promise.then(result => {
            results[index] = result;

            if (debounceTime > 0) {
                const elapsed = Date.now() - startTime;
                if (elapsed < debounceTime) {
                    setTimeout(() => results.push(result), debounceTime - elapsed);
                }
            }

            activePromises--;
            processNext();
        }).catch(error => {
            console.log('Error:', error);
            activePromises--;
            processNext();
        });
    };

    for (let i = 0; i < parallelLimit && currentIndex < array.length; i++) {
        processNext();
    }

    return new Promise((resolve) => {
        const checkCompletion = setInterval(() => {
            if (activePromises === 0 && currentIndex === array.length) {
                clearInterval(checkCompletion);
                resolve(results);
            }
        }, 50);
    });
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
        const asyncCallback = (item, index, array) => new Promise(resolve => {
            const delay = Math.random() * 1000;
            console.log(`Task ${index + 1} started, will take ${Math.round(delay)}ms`);
            setTimeout(() => {
                console.log(`Task ${index + 1} completed`);
                resolve(`Result ${index + 1}`);
            }, delay);
        });

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

const delay = async (ms) => {
    const start = Date.now();
    while (Date.now() - start < ms) {}
};

(async () => {
    defineDemo4();
})();