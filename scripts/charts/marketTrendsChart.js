import { getSingleHistoricalAsset } from '../api/assetsHistoryAPI.js';
import { addAssets } from '../api/assetsAPI.js';
function splitData(rawData) {
    let categoryData = []; // Dates/Times
    let values = []; // Open, Close, Low, High values
    let dataToProcess = JSON.parse(JSON.stringify(rawData)); // Deep copy to avoid modifying original

    for (let i = 0; i < dataToProcess.length; i++) {
        categoryData.push(dataToProcess[i].splice(0, 1)[0]); // Extract date/time
        values.push(dataToProcess[i]); // Remaining values are OHLC
    }
    // console.log('Splitting data:', values);

    return { categoryData, values };
}


// Function to filter data for specific ranges relative to a reference end date
function filterDataByRange(data, days, referenceEndDate) {
    const endDate = new Date(referenceEndDate);
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - days);

    return data.filter(item => {
        const itemDate = new Date(item[0]);
        return itemDate >= startDate && itemDate <= endDate;
    });
}
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('CompTrendSearch').addEventListener('keydown', async function (event) {
        if (event.key === 'Enter') {
            const currentDate = document.getElementById('date-picker').value;

            const selector = document.getElementById('time-range-selector');
            const buttons = selector.querySelectorAll('button');
            buttons.forEach(btn => btn.classList.remove('btn-active')); // 移除所有active
            const targetButton = selector.querySelector('button[data-range="3M"]');
            if (targetButton) {
                targetButton.classList.add('btn-active');
            }
            await addAssets({
                symbol: event.target.value,
            }).then(() => { 
                refreshMarketTrendsData(currentDate, event.target.value);

            }).catch((error) => {
                console.error('Failed to add asset:', error);
            })

            // refreshMarketTrendsData(currentDate, event.target.value);
            event.target.value = ''; // 清空输入框

        }
    });

});



export async function refreshMarketTrendsData(currentEndDate, symbol) {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date(currentEndDate);
            date.setDate(date.getDate() - 90);
            const result = date.toISOString().split("T")[0];
            const payload = {
                symbol: symbol,
                start: result,
                end: currentEndDate
            };

            const marketTrendsData = await getSingleHistoricalAsset(payload);
            const transformed = marketTrendsData.data.map(item => {
                const dateOnly = item.date.split(' ')[0];
                return [
                    dateOnly,
                    parseFloat(item.open),
                    parseFloat(item.close),
                    parseFloat(item.low),
                    parseFloat(item.high)
                ];
            });

            const marketTrendsDataFormat = {
                '1D': filterDataByRange(transformed, 1, currentEndDate),
                '1W': filterDataByRange(transformed, 7, currentEndDate),
                '1M': filterDataByRange(transformed, 30, currentEndDate),
                '3M': filterDataByRange(transformed, 90, currentEndDate)
            };
            if (!window.dashboardData) {
                window.dashboardData = {}; // 先初始化对象
            }

            window.dashboardData.marketTrendsData = marketTrendsDataFormat;
            window.dashboardData.symbol = symbol; // Store the symbol for later use


            updateMarketChart(marketTrendsDataFormat, '3M', symbol); // Default to 1D view
            resolve(marketTrendsDataFormat);
        } catch (error) {
            console.error('Failed to refresh market trends data:', error);
            reject(error);
        }
    });

}


export function updateMarketChart(marketTrendsData, range, symbol = "AAPL") {
    const upColor = '#00da3c'; // Up color (green)
    const downColor = '#ec0000'; // Down color (red)
    const data = splitData(marketTrendsData[range]);
    const marketTrendsChart = echarts.init(document.getElementById('market-trends-chart'));

    if (data.values.length === 0) {
        marketTrendsChart.clear();
        marketTrendsChart.setOption({
            graphic: [{
                type: 'text',
                left: 'center',
                top: 'middle',
                style: {
                    text: 'No data available for this range',
                    textAlign: 'center',
                    fontSize: 20,
                    fill: '#888'
                }
            }]
        });
        return;
    }

    const marketTrendsOption = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        title: {
            text: `${symbol.toUpperCase()}`,
            left: 'left', // Center the title
            textStyle: { fontSize: 20, fontWeight: 'bold' } // Adjust title font size and weight
        },
        legend: { // Add legend for Candlestick and MAs
            data: ['Candlestick'],
            top: 0, // Position legend at the top
            selectedMode: 'multiple', // Allow multiple selection
            itemGap: 10, // Adjust legend item spacing
            textStyle: { fontSize: 12 } // Adjust legend font size
        },
        grid: { left: '10%', right: '10%', bottom: '15%' },
        xAxis: {
            type: 'category',
            data: data.categoryData,
            axisLabel: {
                formatter: function (value) {
                    // Format date to YYYY/MM/DD, similar to the image
                    return value.split(' ')[0].replace(/-/g, '/');
                },
                fontSize: 10 // Adjust X-axis label font size
            }
        },
        yAxis: { scale: true, splitArea: { show: true }, axisLabel: { fontSize: 10 } }, // Adjust Y-axis label font size
        dataZoom: [{ type: 'inside', start: 0, end: 100 }, { show: true, type: 'slider', top: '90%', start: 0, end: 100 }],
        series: [
            { name: 'Candlestick', type: 'candlestick', data: data.values, itemStyle: { color: upColor, color0: downColor, borderColor: upColor, borderColor0: downColor } },
        ]
    };

    marketTrendsChart.setOption(marketTrendsOption, true);
}