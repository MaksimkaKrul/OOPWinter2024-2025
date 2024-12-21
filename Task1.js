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

function defineDemo1() {
    async function demo1() {
        const nums = [1, 2, 3, 4, 5];
        const callback = async (n) => {
            await delay(100);
            return n * 2;
        };

        console.log('Demo 1: Start');
        const res = await asyncMap(nums, callback);
        console.log('Demo 1 Result:', res);
    }

    demo1();
}

function defineDemo2() {
    async function demo2() {
        const nums = [1, 2, 3, 4, 5];
        const callback = async (n) => {
            await delay(500);
            return n * 3;
        };

        console.log('Demo 2: Start');
        const res = await asyncMap(nums, callback, 100);
        console.log('Demo 2 Result:', res);
    }

    demo2();
}

async function delay(ms) {
    const start = Date.now();
    while (Date.now() - start < ms) {
    }
}

(async () => {
    defineDemo1(); 
    defineDemo2();
})();