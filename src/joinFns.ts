type Identifier = {
    index: number
}

type Status = {
    isPending: boolean,
    isCompleted: boolean,
    isError: boolean,
    executionMessage?: any,
};

type JoinProps = {
    execute: () => Promise<void>,
    abort: () => void
    status: Status
}

export const joinFns = ({
    fns,
    args_shared,
    timeout
}: {
    fns: ((signal: AbortSignal, args_shared?: any) => void)[],
    args_shared?: {},
    timeout?: number
}): JoinProps => {

    let status: Status = {
        isPending: true,
        isCompleted: false,
        isError: false,
        executionMessage: undefined
    }

    let resultExecution: (Status & Identifier)[] = fns.map((_, index) => ({ index, isPending: true, isCompleted: false, isError: false }));

    let abortMessage: string;
    let abortContoller = new AbortController();
    let signalGlobal = abortContoller.signal;

    if (timeout) {
        setTimeout(() => { abortContoller.abort() }, timeout);
    }


    const wrapFn = (fn: (signal: AbortSignal, args_shared?: any) => void, indexFn: number) =>
        new Promise<void>(async (resolve, reject) => {
            console.log(`-------------------- Executing middleware ${indexFn + 1} of ${fns.length} -----------------------------`);

            const middleware = resultExecution.find(md => md.index == indexFn) as (Status & Identifier);

            if (signalGlobal.aborted) throw Error(abortMessage); // before started
            const aborHandler = () => reject(abortMessage); // when abrort signal is executed
            signalGlobal.addEventListener("abort", aborHandler); // abort handler

            try {
                //manage async and async functions
                const isFn = typeof fn === "function";
                const fnPromise = isFn ? fn : () => fn;

                await fnPromise(signalGlobal, args_shared);
                resolve()
            }
            catch (error) {
                middleware.isError = true;
                middleware.executionMessage = error;
                signalGlobal.removeEventListener("abort", aborHandler); // remove abort handler
                reject();
            }
            finally {
                middleware.isPending = false;
                middleware.isCompleted = true;
            }
        });


    const execute = async () => {
        try {
            const wrappedFns = fns.map((fn, indexFn) => wrapFn(fn, indexFn));
            await Promise.allSettled(wrappedFns);
        }
        catch (error) {
            status.isError = true;
            status.executionMessage = error;
        }
        finally {
            status.isCompleted = true;
            status.isPending = false;
        }
    }

    const abort = (message?: string) => {
        abortMessage = message || "Operation was cancelled";
        status.isCompleted = true;
        status.isPending = false;
        status.isError = false;
        status.executionMessage = abortMessage;

        abortContoller.abort();
    }

    return {
        execute,
        abort,
        status
    };
}