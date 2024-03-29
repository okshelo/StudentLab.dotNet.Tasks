/*------------------------------- Partial Application---------------------------
Implement function F that allows to do
partial function application in
a form of: 𝐺(𝑥,𝑦,𝑧 ...) = 𝑁 𝐹(𝑥, 𝐺(𝑥,𝑦,𝑧 ...)) → 𝐻(𝑦,𝑧…) = 𝑁
F should accept any number of parameters to apply.
 G may accept any number of parameters.
*/

const enablePartialApplication = (fn) => (...args) => {
    if (typeof fn !== "function") {
        throw new Error("fn parameter should be function");
    }

    if (args.length >= fn.length)
        return fn(...args);
    return enablePartialApplication(fn.bind(null, ...args));
};


 let foo = partialApplication((a, b, c) => a + b + c, 1)
 console.log(foo(2, 3));
 foo = partialApplicationImpl2((a, b, c) => a + b + c, 1)
 console.log(foo(2, 3));

// returns string "123" instead of number 6
function partialApplication(func, ...args) {
    if (typeof func !== "function") {
        throw new Error("fn parameter should be function");
    }
    const fun = enablePartialApplication(func);
    return fun(...args);
}

// this one works fine
function partialApplicationImpl2(func, ...args) {
    if (typeof func !== "function") {
        throw new Error("fn parameter should be function");
    }

    if (func.length > args.length)
        return (...otherArgs) => func(...args, ...otherArgs);
    else
        return () => func(...args);
}

//const _fn = (x, y, z) => (x * y) / z;
//const fnFixedX = partialApplicationImpl2(_fn, 3); // fixes x to 3: (y, z) => (3 * y) / z
//console.log(fnFixedX(2, 1));

/*--------------------------------------Currying----------------------------------------  -
Implement function curry that allows to do currying like:
 𝑓(𝑥,𝑦,𝑧) = 𝑁, 𝑐𝑢𝑟𝑟𝑦(𝑓) = 𝑥 → (𝑦 → (𝑧 → 𝑁))
Function f may accept any number of explicit parameters.
Implicit parameters are not subject to curry.
*/

const enableCurry = (fn) => (arg) => {
    if (typeof fn !== "function") {
        throw new Error("fn parameter should be function");
    }

    if (1 >= fn.length)
        return fn(arg);
    return enableCurry(fn.bind(null, arg));
};

function curryImpl2(func) {
    if (typeof func !== "function") {
        throw new Error("fn parameter should be function");
    }

    function curry(...args) {
        if (func.length <= args.length) {
            return func(...args);
        }

        if (func.length > args.length) {
            return (...addArgs) => curry(...args, ...addArgs);
        }
    };
    return curry
}

const cfn = (x, y, z) => {
    console.log("begin");
    console.log(x);
    console.log(y);
    console.log(z);
    console.log("end");
};

/*
let test2 = enableCurry(cfn);
console.log(test2(1));
console.log(test2(1)(2));
console.log(test2(1)(2)(3));
test2 = curryImpl2(cfn);
console.log(test2(1));
console.log(test2(1)(2));
console.log(test2(1)(2)(3));
*/

/* ---------------------------------------------Linear fold--------------------------------------
Implement linear fold function that works on arrays: F(array, callback[, initialValue]),
callback: Function to execute on each value in the array, taking four arguments:
previousValue: The value previously returned in the last invocation of the callback, or initialValue, if supplied.
currentValue: The current element being processed in the array.
index: The index of the current element being processed in the array.
array: The array fold was called upon.
initialValue: Object to use as the first argument to the first call of the callback.
*/

function callbackImpl(previousValue, currentValue, i, array) {
    console.log("prev " + previousValue);
    console.log("curr " + currentValue);
    console.log("index " + i);
    console.log("array " + array.length);
    console.log("");
    return (currentValue + previousValue);
}


function processArray(array, callback, initialValue) {
    if (typeof callback !== "function") {
        throw new Error("'callback' parameter should be type of function");
    }
    if (!Array.isArray(array)) {
        throw new Error("'array' parameter should be type of array");
    }

    let currentValue;
    let previousValue = (initialValue != undefined) ? initialValue : "lol";
    for (let i = 0; i < array.length; i++) {
        currentValue = array[i];
        previousValue = callback(previousValue, currentValue, i, array);
    }
    return previousValue;
}

//processArray([0,1,2,3],callbackImpl,"");

/*-------------------------------------------- Linear unfold ------------------------------------------
    Implement linear unfold function that returns a sequence that contains the elements generated by the given computation:
    F(callback, initialValue)
    callback: A function that takes the current state and returns a tuple consisting
    of the next element of the sequence and the next state value.
    Callback accepts current value and produces new state and element.
    Unfold stops upon falsy value returned by callback.
    initialValue: The initial state value.
*/

function callbackImpl2(state) {
    let random = state * Math.floor(Math.random() * 9);
    let newState = random;
    if (random == 0)
        newState = null;

    let value = Math.floor(Math.random() * 100);
    return {
        value: value,
        state: newState
    }
}


function UnfoldValue(callback, initialValue) {
    if (typeof callback !== "function") {
        throw new Error("'callback' parameter should be type of function");
    }

    let values = [];
    let currState = initialValue;
    do {
        let callbackResult = callbackImpl2(currState);
        currState = callbackResult.state;
        values.push(callbackResult.value)
    } while (currState)
    return values;
}

//console.log(UnfoldValue(callbackImpl2, 3));


/*--------------------------------------------- Map ------------------------------------
Implement a function that creates new array with the results of
calling a provided function on every element in this array.
 Does ES5 has built-in alternative?
 */


function MapArray(array, callback) {
    if (typeof callback !== "function") {
        throw new Error("'callback' parameter should be type of function");
    }
    if (!Array.isArray(array)) {
        throw new Error("'array' parameter should be type of array");
    }


    let result = [];
    for (let i = 0; i < array.length; i++) {
        let callbackResult = callback(array[i], i, array);
        result.push(callbackResult);
    }
    return result;
}

//console.log(MapArray([1,2,3,4,5,6,7],(value)=> value*2));

/*-----------------------------------------------Filter-------------------------------------
Implement a function that filters array based on callback result.
Does ES5 has built-in alternative
 */

function FilterArray(array, callback) {
    if (typeof callback !== "function") {
        throw new Error("'callback' parameter should be type of function");
    }
    if (!Array.isArray(array)) {
        throw new Error("'array' parameter should be type of array");
    }

    let result = [];
    for (let i = 0; i < array.length; i++) {
        if (callback(array[i], i, array))
            result.push(array[i]);
    }
    return result;
}

//console.log(FilterArray([1,2,3,4,5,6,7],(value)=> value % 2 == 0));

/*---------------------------------------Average of even numbers ---------------------------------------
Given array of numbers, find average of even ones using functions implemented for previous problems
. Example: [1,23,2,6,12, 0] -> (2 + 6 + 12 + 0) / 4 = 5
 */

function averageCallback(previousValue, currentValue, i, array) {
    return ((currentValue / array.length) + previousValue);
}

let testarg = [1, 23, 2, 6, 12, 0];
processArray(FilterArray(testarg,(value)=> value % 2 == 0),averageCallback,0)
//console.log(processArray(FilterArray(testarg,(value)=> value % 2 == 0),averageCallback,0));

/*---------------------------------------Sum of random numbers-------------------------------------------
Get the sum of 10 random numbers using functions implemented for previous problems.
 */

function SumCallback(previousValue, currentValue, i, array) {
    return (currentValue + previousValue);
}


function UnfoldCallback(state) {
    let newState = state - 1;
    if (newState = 0)
        newState = false;

    let value = Math.random() * 100;

    return {
        value: value,
        state: newState
    }
}

let temp = UnfoldValue(UnfoldCallback, 10);
processArray(temp,SumCallback,0)
//console.log(processArray(temp,SumCallback,0));

/*----------------------------------------------First------------------------------------------------------
Implement a function that returns the first element in array that satisfies given condition
*/

let temp0 = [1, 23, 2, 6, 12, 0];
let temp1 = FilterArray(temp0, (value) => value % 3 == 0);
let f = (value, index, array) => {
    return index === 0
};
//temp1 = FilterArray(temp,(value)=>value % 3 == 0);
temp1 = FilterArray(temp1, f);
//console.log(temp1);

/*-------------------------------------------Lazy evaluation-----------------------------------------------
Implement a function that takes list of parameters and makes any given function lazy.
 */
function LazyEvaluation(fn, ...args) {
    if(fn.length < args.length)
        throw new Error("Not enought arguments");
    return () => fn(...args);
}


function testfun(arg1, arg2, arg3, arg4) {
    console.log("a1 " + arg1);
    console.log("a2 " + arg2);
    console.log("a3 " + arg3);
    console.log("a4 " + arg4);
    return "чпок";
}

let lazy = LazyEvaluation(testfun, 1, 2, 3, 4 );
//console.log(lazy);
///console.log(lazy());


/*---------------------------------------------Memoization---------------------------------------------------
    Implement a function that for any given function F produces
    function G that caches its previous calling results.
    Function F accept single explicit parameter.
    Implicit parameters should not be taken into account.
    Watch out for NaN, undefined and circular references.
*/

function MemFunction(fn) {
    var cache = {};
    return (...args) => {
        // what if argument is an object? Any abject will be converted to "[object Object]"
        //let key = args.toString();
        let key = JSON.stringify(args);
        if (key in cache) {
            return cache[key];
        }
        cache[key] = fn(...args);
        return cache[key];
    }

}

function sum(a, b, c) {
    return a + b + c;
}
/*
let memSum = MemFunction(sum);
sum(1,2,3);
memSum(1,2,3);
memSum(1,2,3);
*/