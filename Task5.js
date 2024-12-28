const EventEmitter = require('events');

class TaskEmitter extends EventEmitter {}
const taskEmitter = new TaskEmitter();

const asyncMapObservable = async (array, debounceTime, parallelLimit = 3, signal) => {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (signal && signal.aborted) {
            await taskEmitter.emitAsync('abort', { message: 'Operation aborted' });
            return;
        }

        if (currentIndex >= array.length) return;

        const index = currentIndex++;
        activePromises++;

        await taskEmitter.emitAsync('taskStart', { index });

        const startTime = Date.now();

        try {
            // Logic should be here
            const result = await new Promise(resolve => {
                const n = array[index];
                console.log(`Simulating processing of number ${n}`);
                setTimeout(() => {
                    resolve(n * 2); 
                }, 500); 
            });

            results[index] = result;

            if (debounceTime > 0) {
                const elapsed = Date.now() - startTime;
                if (elapsed < debounceTime) {
                    await new Promise(resolve => setTimeout(resolve, debounceTime - elapsed));
                }
            }

            await taskEmitter.emitAsync('taskComplete', { index, result });
        } catch (error) {
            await taskEmitter.emitAsync('taskError', { index, error });
        } finally {
            activePromises--;
            processNext();
        }
    };

    for (let i = 0; i < parallelLimit && currentIndex < array.length; i++) {
        processNext();
    }

    return new Promise((resolve, reject) => {
        const checkCompletion = setInterval(async () => {
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
};

TaskEmitter.prototype.emitAsync = async function (event, data) {
    const listeners = this.listeners(event);
    for (const listener of listeners) {
        await listener(data);
    }
};

(async () => {
    const nums = [1, 2, 3, 4, 5];
    const controller = new AbortController();

    taskEmitter.on('taskStart', async ({ index }) => {
        console.log(`Task ${index + 1} started.`);
    });

    taskEmitter.on('taskComplete', async ({ index, result }) => {
        console.log(`Task ${index + 1} Done: ${result}`);
    });

    taskEmitter.on('taskError', async ({ index, error }) => {
        console.log(`Task ${index + 1} failed: ${error.message}`);
    });

    taskEmitter.on('abort', async ({ message }) => {
        console.log(message);
    });

    console.log('Starting processing with debounce and abort support...');
    asyncMapObservable(nums, 100, 2, controller.signal)
        .then(res => {
            console.log('Result:', res);
        })
        .catch(err => {
            console.log('Error:', err.message);
        });

    setTimeout(() => {
        console.log('Aborting...');
        controller.abort();
    }, 1000);
})();
