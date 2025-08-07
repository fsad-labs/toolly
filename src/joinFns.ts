type Identifier = {
    index: number
}

type Status = {
    isCompleted: boolean,
    isError: boolean,
    message?: any,
    originalError?: any,
};

type Middleware = (Status & Identifier);

type JoinProps = {
    execute: () => Promise<void>,
    status: Status
}

type FnType = (shared?: any) => void | Promise<void>;

export const joinFns = ({
    fns,
    args_shared
}: {
    fns: FnType[],
    args_shared?: {},
}): JoinProps => {

    let status: Status & { fnsStatus: any[] } = {
        isCompleted: false,
        isError: false,
        message: "All functions executed",
        fnsStatus: [],
    }

    let resultExecution: Middleware[] = fns.map((_, index) => ({
        index,
        isCompleted: false,
        isError: false,
        message: "",
        originalError: undefined,
    }));

    status.fnsStatus = resultExecution;

    let abortMessage: string = "Operation was cancelled";
    const executionErrorMessage: string = "An error occurred during execution";

    const wrapFn = (fn: FnType, indexFn: number) =>
        new Promise<string>(async (resolve, reject) => {
            const middleware = resultExecution.find(md => md.index == indexFn)!;

            (async () => {
                try {
                    const fnResult = fn(args_shared);
                    await Promise.resolve(fnResult);

                    middleware.isCompleted = true;

                    resolve(JSON.stringify(middleware));
                } catch (error: any) {
                    middleware.isError = true;
                    middleware.message = error?.message || executionErrorMessage;
                    middleware.originalError = error;

                    reject(JSON.stringify(middleware));
                }
            })();
        });



    const execute = async () => {
        try {
            const wrappedFns = fns.map((fn, indexFn) => wrapFn(fn, indexFn));
            const result = await Promise.allSettled(wrappedFns);

            const results = result.map((r: PromiseSettledResult<string>) => r.status === "fulfilled" ? JSON.parse(r.value as string) : JSON.parse(r.reason as string));

            status.fnsStatus = results;

            status.isCompleted = true;
        }
        catch (error: any) {
            status.isError = true;
            status.message = error?.message || "An error occurred during execution";
            status.originalError = error;
        }
    }

    return {
        execute,
        status
    };
}