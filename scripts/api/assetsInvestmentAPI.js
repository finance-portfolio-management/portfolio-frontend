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
function transformInvestmentData(rawData) {
    // color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']
      
    const categories = {
        'stock': { category: 'Stocks', color: 'blue', items: [] },
        'fund': { category: 'Funds', color: 'green', items: [] },
        'bond': { category: 'Bonds', color: 'orange', items: [] },
        'cash': { category: 'Cash', color: 'red', items: [] },
        'other': { category: 'Others', color: 'cyan', items: [] }
    };

    if (!rawData || !rawData.data || !rawData.data.holdings) {
        return [];
    }
    // console.log('Raw Investment Data:', rawData);
    rawData.data.holdings.forEach(item => {
        const categoryName = item.name.toLowerCase();
        if (categories[categoryName]) {
            categories[categoryName].items.push({
                name: item.symbol,
                value: parseFloat(item.marketValue),
                id: `${categoryName}-${item.symbol.toLowerCase()}`,
                currentPrice: parseFloat(item.latestPrice),
                ownedShares: parseFloat(item.quantity),
            });
        } else {
            console.warn(`Unknown category: ${item.name}. Item not added to transformed data.`, item);
        }
    });
    // console.log('Transformed Investment Data:', categories);
    categories['cash'].items.push(
        {name: 'USD', value: 10000, id: 'cash-usd', currentPrice: 100, ownedShares: 100}
    )
    // Filter out empty categories and return the array of category objects
    return Object.values(categories);
}

function processedInvestmentDatafun(rawInvestmentListData) {
    // Calculate total investment value for accurate percentages
    let totalInvestmentValue = 0;

    rawInvestmentListData.forEach(group => {
        group.items.forEach(item => {
            totalInvestmentValue += item.value;
        });
    });

    const processedInvestmentData = rawInvestmentListData.map(group => {

        let categoryValue = 0;
        group.items.forEach(item => {
            categoryValue += item.value;
        });
        const categoryPercentage = (categoryValue / totalInvestmentValue) * 100;

        const itemsWithPercentage = group.items.map(item => {
            
            const itemPercentage = (item.value / totalInvestmentValue) * 100;
            return { ...item, percentage: itemPercentage };
        });

        return {
            ...group,
            categoryValue: categoryValue,
            categoryPercentage: categoryPercentage,
            items: itemsWithPercentage
        };
    });
    // console.log('Processed Investment Data:', processedInvestmentData);
    return {
        processedData: processedInvestmentData,
        totalAssetValue: totalInvestmentValue
    };
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
            const transformedData = transformInvestmentData(data);
            const res = processedInvestmentDatafun(transformedData);

            resolve(res);

        } catch (error) {
            console.error('Failed to get assets:', error);
            resolve(error);
        }
    });
}
