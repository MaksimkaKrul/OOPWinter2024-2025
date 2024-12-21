async function asyncMap(array, asyncCallback) {
    const results = [];

    for (let i = 0; i < array.length; i++) {
        const startTime = Date.now();

        const result = await asyncCallback(array[i], i, array);
        results.push(result);
    }
    return results;
}

defineDemo1();
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
