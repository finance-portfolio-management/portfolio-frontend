export async function buyAsset(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!payload || !payload.symbol) {
                throw new Error('Symbol is required to add an asset');
            }

            const response = await fetch('http://localhost:3000/api/buy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });



            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error);
            }


            resolve(data);

        } catch (error) {
            console.error('Failed to buy assets:', error);
            resolve(error);
        }
    });
}



export async function sellAsset(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!payload || !payload.symbol) {
                throw new Error('Symbol is required to sell an asset');
            }

            const response = await fetch('http://localhost:3000/api/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });



            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error);
            }


            resolve(data);

        } catch (error) {
            console.error('Failed to sell assets:', error);
            resolve(error);
        }
    });
}


export async function getHoldings(targetDate) {
    return new Promise(async (resolve, reject) => {
        try {

            const response = await fetch(`http://localhost:3000/api/holdings?targetDate=${targetDate}`, {
                method: 'GET'
            });


            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.error);
            }


            resolve(data);

        } catch (error) {
            console.error('Failed to get assets:', error);
            resolve(error);
        }
    });
}
