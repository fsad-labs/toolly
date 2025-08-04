
export const retryFn = async (fn: () => Promise<any>, retry = 3, delay = 500): Promise<any> => {
    try {
        return await fn();
    }
    catch (err) {
        if (retry <= 0) throw err;
        await new Promise(r => setTimeout(r, delay));
        return retryFn(fn, retry - 1, delay);
    }
}