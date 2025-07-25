export async function getSingleHistoricalAsset(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!payload || !payload.symbol || !payload.start || !payload.end || !payload.interval) {
                throw new Error('Invalid payload: symbol, start, end, and interval are required');
            }

            const response = await fetch(
                `http://localhost:3000/api/assets/${payload.symbol}/historical?start=${payload.start}&end=${payload.end}&interval=${payload.interval}`,
                {
                    method: 'get'
                });


            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error);
            }


            resolve(data);

        } catch (error) {
            console.error('Failed to get historical asset:', error);
            resolve(error);
        }
    });
}