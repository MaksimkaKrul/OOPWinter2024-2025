const EventEmitter = require('events');

class TaskEmitter extends EventEmitter {}
const taskEmitter = new TaskEmitter();

async function asyncMapObservable(array, asyncCallback, parallelLimit = 3) {
    const results = [];
    let activePromises = 0;
    let currentIndex = 0;

    const processNext = async () => {
        if (currentIndex >= array.length) return;

        const index = currentIndex++;
        activePromises++;

        taskEmitter.emit('taskStart', { index });

        try {
            const result = await asyncCallback(array[index]);
            results[index] = result;
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

    while (activePromises > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
    }

    return results;
}

(async () => {
    const nums = [1, 2, 3, 4, 5];
    const callback = async (n) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return n * 2;
    };

    taskEmitter.on('taskStart', ({ index }) => {
        console.log(`Task ${index + 1} started.`);
    });

    taskEmitter.on('taskComplete', ({ index, result }) => {
        console.log(`Task ${index + 1} Done: ${result}`);
    });

    taskEmitter.on('taskError', ({ index, error }) => {
        console.log(`Task ${index + 1} failed: ${error.message}`);
    });

    console.log('Starting events');
    const results = await asyncMapObservable(nums, callback, 2);
    console.log('Result:', results);
})();
