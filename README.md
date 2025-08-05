# toolly

A lightweight wrappers around funtions or promises that simplifies:
- Retry funtions
- Concat or joins functions 

## Install

```bash
npm i @fsad-labs/tooly
```
## Usage
## API Reference

#### # retryFn

##### Description

Retry executing your functions as many times as you want before displaying the error to the user.

```bash
  await retryFn({
    fn: function1, // your function
    retry: 3,
    delay: 1000, // milliseconds
    fnError: (err: any) => { // CUSTOM MANAGE }
  })
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `fn` | `function` | **Required**. Your function that will be wrapped to be executes |
| `retry` | `number` | **optional**. number of attempts **by default** 3 times |
| `delay` | `number` | **optional**. ms to wait before continue with the next execution  **by default** 500 ms|
| `fnError` | `function` | **optional**. async function to catch the error and customize it. **Must return a value** |

| Result (object) | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`success`|`boolean`| status of the execution
|`message`|`string`| message of the error **Customizable**
|`code`|`string`| code error "RETRY_ERROR" **Customizable**
|`originalError`|`any`| original error caught

#### # joinFns

##### Description

Join your functions in a container, share args and control the execution.

```bash

    const fn1 = async (shared) => { //TODO }
    const fn2 = async (shared) => { //TODO }

    await joinFns({
        fns: [fn1, fn2, ...],
        args_shared: {
            arsg1: "A",
            arsg2: "B",
            arsg3: "C",
        },
    })
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `fns` | `functions` | **Required**. Array of functions that will be wrapped to be executes |
| `args_shared` | `number` | **optional**. args to be passed into all functions |

| Result (object) | Type     | Description                |
| :-------- | :------- | :------------------------- |
|`isCompleted`|`boolean`| status of the container, true when all functions were executed
|`isError`|`boolean`| status error, true if joinFns throw error
|`message`|`string`| original message error caught
|`originalError`|`any`| original error caught


## Usage/Examples

#### # retryFn
```javascript
const { retryFn } = require('@fsad-labs/toolly');

const fn1 = async () => {
    //TODO
    throw { code: "NETWORK", message: "cancel" }
}

const fn2 = async () => {
    try {
        //TODO
        throw new Error("Something was wrong in test2");
    }
    catch (e) {
        throw e;
    }
}

const fn3 = () => async () => {
    //TODO
    throw new Error("Something was wrong in test3");
}

const result = await retryFn({
        fn: fn1,
        retry: 4, // four times
        delay: 1000, // 1 second
        fnError: async (e) => {
            // "Error callback executed";
            await new Promise(resolve => setTimeout(resolve, 1000));
            return { customProp: true };
        }
    });

```

#### # joinFns
```javascript

const { joinFns } = require('@fsad-labs/toolly');

const fn1 = async (arg_shared) => { 
    //TODO
};

const fn2 = async (arg_shared) => {
    //TODO
    throw Error("Don't start middleware 3");
};

const fn3 = async (arg_shared) => {
    //TODO
    throw { code:"01" message: "Don't start middleware 3" } ;
};

const run = joinFns({
        fns: [fn1, fn2, fn3],
        args_shared: {
            arsg1: "A",
            arsg2: "B",
            arsg3: "C",
        }
    });

// EXECUTE
run.execute();

// CHECK
run.status;

```
## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
This project is licensed under the [MIT License](LICENSE) © [fullstack-ad](https://github.com/fullstack-ad)