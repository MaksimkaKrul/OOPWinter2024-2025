async function asyncMap(array, asyncCallback, debounceTime) {
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
}

async function asyncMapPromise(array, asyncCallback, debounceTime, parallelLimit = 3, signal) {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (signal && signal.aborted) {
            if (!signal._logged) {
                console.log('Aborted!');
                signal._logged = true;
            }
            return;
        }

        if (currentIndex >= array.length) return;

        while (activePromises >= parallelLimit) {
            if (signal && signal.aborted) {
                if (!signal._logged) {
                    console.log('Aborted!');
                    signal._logged = true;
                }
                return;
            }
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        const index = currentIndex++;
        activePromises++;

        const startTime = Date.now();

        try {
            const result = await asyncCallback(array[index], index, array);

            results[index] = result;

            if (debounceTime > 0) {
                const elapsed = Date.now() - startTime;
                if (elapsed < debounceTime) {
                    await new Promise(resolve => setTimeout(resolve, debounceTime - elapsed));
                }
            }
        } catch (error) {
            console.log('Error:', error);
        } finally {
            activePromises--;
            processNext();
        }
    };

    for (let i = 0; i < parallelLimit && currentIndex < array.length; i++) {
        processNext();
    }

    return new Promise((resolve, reject) => {
        const checkCompletion = setInterval(() => {
            if (signal && signal.aborted) {
                clearInterval(checkCompletion);
                reject(new Error('Operation aborted'));
            }

            if (activePromises === 0 && currentIndex === array.length) {
                clearInterval(checkCompletion);
                resolve(results);
            }
        }, 50);
    });
}

// function defineDemo1() {
//     async function demo1() {
//         const nums = [1, 2, 3, 4, 5];
//         const callback = async (n) => {
//             await delay(100);
//             return n * 2;
//         };

//         console.log('Demo 1: Start');
//         const res = await asyncMap(nums, callback);
//         console.log('Demo 1 Result:', res);
//     }

//     demo1();
// }

// function defineDemo2() {
//     async function demo2() {
//         const nums = [1, 2, 3, 4, 5];
//         const callback = async (n) => {
//             await delay(500);
//             return n * 3;
//         };

//         console.log('Demo 2: Start');
//         const res = await asyncMap(nums, callback, 100);
//         console.log('Demo 2 Result:', res);
//     }

//     demo2();
// }

function defineDemo3() {
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
}

function defineDemo4() {
    const demo4 = () => {
        async function asyncCallback(item, index, array) {
            return new Promise(resolve => {
                const delay = Math.random() * 1000;
                console.log(`Task ${index + 1} started, will take ${Math.round(delay)}ms`);
                setTimeout(() => {
                    console.log(`Task ${index + 1} completed`);
                    resolve(`Result ${index + 1}`);
                }, delay);
            });
        }

        async function testAsyncMap() {
            const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const debounceTime = 0;
            const parallelLimit = 3;

            const results = await asyncMapPromise(array, asyncCallback, debounceTime, parallelLimit);
            console.log('All tasks completed with results:', results);
        }

        testAsyncMap();

    };

    demo4();
}

function defineDemoWithAbort() {
    const demo = () => {
        const nums = [1, 2, 3, 4, 5];
        const callback = (n) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(n * 3);
                }, 500);
            });
        };

        const controller = new AbortController();

        console.log('Demo with AbortController: Start');

        asyncMapPromise(nums, callback, 100, 2, controller.signal)
            .then(res => {
                console.log('Demo Result:', res);
            })
            .catch(err => {
                console.log('Demo Error:', err.message);
            });

        setTimeout(() => {
            console.log('Aborting operation...');
            controller.abort();
        }, 1000);
    };

    demo();
}


async function delay(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
    }
}

(async () => {
    defineDemo4();
    defineDemoWithAbort();
})();