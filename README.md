# OOPWinter2024-2025
Doing Tasks here... a bit late x.x


Task 1 Report:
As result, I chosed map Array function and made async counterpart asyncMap
Its callback-based, because we have this line:
        const result = await asyncCallback(array[i], i, array);
Have both demo1 and demo2 for demostarting asyncMap without and with debounceTime
Also as additional feature - added debounce as asked, using debounceTime we do some delay if callback faster than debounce time

Task 2 report:
First I made asyncMapPromise - promise-based alternative, having debounceTime as previous task.
Promise-based use cases in Demo3 and Demo4, and Async-await use cases is still in Demo1 and Demo2 which I commented here.
Also as task asked, I added parallelist using parallelLimit, to control number of tasks that can be excecuted

Task3 report:
Sooo, task 3 was about implementing AbortController in our programm.
It was added in asyncMapPromise, which allows opperation to be aborted!
And with the "signal" parametr, we do so Aborted! will be printed only once, and there will be no repeats
On demo case of this controller: It creates abortcontroller and passes signal to our promise-based function.
After 1 sec - operation stops(aborting) with controller.abort() and give us msg about it.

Task4 report:
So, I chosed to use chunkIterator - which is async iterator in this task. It processes the data in chunks which allows to efficiently use memory for it
processChunks uses for await...of to iterate and process each chunk async.
It slices array into chuncks and process using asyncCallback.
And in defineDemoTask4 - we use it! We demonstrate chunk proccesing with large datased and for each element proccesing async.

Task5 report:
For this task I decided to use EventEmiiter via TaskEmitter, to implement reactive communication between entities.
it is used to emit events like taskStart, taskComplete etc.
And in asyncMapObsevable we used all of function from tasks before(even abort)
During process of this function, there is events that EventEmmiter reacts to.
And in Demo case all of functions shown, function process nums array, also abort controller used and event listener log start, completion, error and abortion of process.
