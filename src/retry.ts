
export const retryFn = async (
    props: {
        fn: () => Promise<any>,
        retry?: number,
        delay?: number,
        fnError?: (err: any) => Promise<void>
    }
): Promise<any> => {

    const {
        fn,
        retry = 3,
        delay = 1000,
        fnError
    } = props;

    try {
        const result = await fn();
        return { success: true, result };
    }
    catch (err: any) {
        if (retry <= 0) {
            if (fnError) {
                return await fnError(err);
            } else {
                return {
                    success: false,
                    message: err?.message || "Max retries reached",
                    code: err?.code || "RETRY_ERROR",
                    originalError: err
                }
            }
        };
        await new Promise(r => setTimeout(r, delay));
        return retryFn({ fn, retry: retry - 1, delay, fnError });
    }
}