export async function safeQuery(promise, retries = 2) {
    for (let i = 0; i <= retries; i++) {
        try {
            const result = await promise;
            if (result.error) throw result.error;
            return result.data;
        } catch (err) {
            if (i === retries) throw err;
            await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
    }
}
