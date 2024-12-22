const EventEmitter = require('events');

class TaskEmitter extends EventEmitter {}
const taskEmitter = new TaskEmitter();

async function asyncMapObservable(array, asyncCallback, debounceTime, parallelLimit = 3, signal) {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (signal && signal.aborted) {
            taskEmitter.emit('abort', { message: 'Operation aborted' });
            return;
        }

        if (currentIndex >= array.length) return;

        const index = currentIndex++;
        activePromises++;

        taskEmitter.emit('taskStart', { index });

        const startTime = Date.now();

        try {
            const result = await asyncCallback(array[index]);
            results[index] = result;

            if (debounceTime > 0) {
                const elapsed = Date.now() - startTime;
                if (elapsed < debounceTime) {
                    await new Promise(resolve => setTimeout(resolve, debounceTime - elapsed));
                }
            }

            taskEmitter.emit('taskComplete', { index, result });
        } catch (error) {
            taskEmitter.emit('taskError', { index, error });
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


(async () => {
    const nums = [1, 2, 3, 4, 5];
    const callback = async (n) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return n * 2;
    };

    const controller = new AbortController();

    taskEmitter.on('taskStart', ({ index }) => {
        console.log(`Task ${index + 1} started.`);
    });

    taskEmitter.on('taskComplete', ({ index, result }) => {
        console.log(`Task ${index + 1} Done: ${result}`);
    });

    taskEmitter.on('taskError', ({ index, error }) => {
        console.log(`Task ${index + 1} failed: ${error.message}`);
    });

    taskEmitter.on('abort', ({ message }) => {
        console.log(message);
    });

    console.log('Starting deb. and abort');
    asyncMapObservable(nums, callback, 100, 2, controller.signal)
        .then(res => {
            console.log('Result:', res);
        })
        .catch(err => {
            console.log('Error:', err.message);
        });

    setTimeout(() => {
        console.log('Aborting');
        controller.abort();
    }, 1000);
})();