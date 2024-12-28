const asyncMapCallback = (array, asyncCallback, debounceTime, done) => {
    const results = [];
    let currentIndex = 0;
    debounceTime = debounceTime || 0;

    const processNext = () => {
        if (currentIndex >= array.length) {
            done(results); 
            return;
        }

        const startTime = Date.now();

        try {
            asyncCallback(array[currentIndex], currentIndex, array, (result) => {
                try {
                    results.push(result);
                    currentIndex++;

                    const elapsed = Date.now() - startTime;
                    if (debounceTime > 0 && elapsed < debounceTime) {
                        setTimeout(processNext, debounceTime - elapsed);
                    } else {
                        processNext();
                    }
                } catch (error) {
                    console.error('Error in asyncCallback result handling:', error);
                    done(results);
                }
            });
        } catch (error) {
            console.error('Error in asyncCallback execution:', error);
            done(results);
        }
    };

    processNext();
};

const defineDemo1 = () => {
    const demo1 = () => {
        const nums = [1, 2, 3, 4, 5];
        const callback = (n, index, array, done) => {
            delay(100, () => {
                done(n * 2);
            });
        };

        console.log('Demo 1:');
        asyncMapCallback(nums, callback, 0, (res) => {
            console.log('Demo 1:', res);
        });
    };

    demo1();
};

const defineDemo2 = () => {
    const demo2 = () => {
        const nums = [1, 2, 3, 4, 5];
        const callback = (n, index, array, done) => {
            delay(500, () => {
                done(n * 3);
            });
        };

        console.log('Demo 2:');
        asyncMapCallback(nums, callback, 100, (res) => {
            console.log('Demo 2:', res);
        });
    };

    demo2();
};

const delay = (ms, done) => {
    setTimeout(done, ms);
};

(() => {
    defineDemo1();
    defineDemo2();
})();
