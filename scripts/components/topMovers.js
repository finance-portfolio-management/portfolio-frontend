export function renderTopMovers(data) {
    const topGainersList = document.getElementById('top-gainers-list');
    const topLosersList = document.getElementById('top-losers-list');

    topGainersList.innerHTML = ''; // Clear existing content
    topLosersList.innerHTML = ''; // Clear existing content

    data.topGainers.forEach(item => {
        const changePrice = Math.abs(parseFloat(item.currentPrice) / (1 + parseFloat(item.growthRate) / 100) - parseFloat(item.currentPrice));

        const itemHtml = `
                      <div class="flex items-center justify-between">
                          <div class="flex flex-col items-start">
                              <span class="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-1 text-sm">${item.symbol}</span>
                              <div>
                                  <p class="font-semibold text-gray-700 text-sm">${item.name}</p>
                                  <p class="text-xs text-gray-500">${parseFloat(item.currentPrice).toFixed(2)}</p>
                              </div>
                          </div>
                          <div class="text-right">
                              <p class="font-semibold text-green-600 text-sm">${changePrice.toFixed(2)} (${parseFloat(item.growthRate).toFixed(2)}%)</p>
                              <div class="h-1.5 w-16 bg-green-200 rounded-full mt-0.5"><div class="h-1.5 bg-green-500 rounded-full" style="width: 80%"></div></div>
                          </div>
                      </div>
                  `;
        topGainersList.insertAdjacentHTML('beforeend', itemHtml);
    });

    data.topLosers.forEach(item => {
        // console.log(item);
        const changePrice = Math.abs(parseFloat(item.currentPrice) / (1 + parseFloat(item.growthRate) / 100) - parseFloat(item.currentPrice));

        const itemHtml = `
                      <div class="flex items-center justify-between">
                          <div class="flex flex-col items-start">
                              <span class="font-bold text-red-600 bg-red-100 px-2 py-1 rounded mb-1 text-sm">${item.symbol}</span>
                              <div>
                                  <p class="font-semibold text-gray-700 text-sm">${item.name}</p>
                                  <p class="text-xs text-gray-500">${parseFloat(item.currentPrice).toFixed(2)}</p>
                              </div>
                          </div>
                          <div class="text-right">
                              <p class="font-semibold text-red-600 text-sm">${changePrice.toFixed(2)} (${parseFloat(item.growthRate).toFixed(2)}%)</p>
                              <div class="h-1.5 w-16 bg-red-200 rounded-full mt-0.5"><div class="h-1.5 bg-red-500 rounded-full" style="width: 80%"></div></div>
                          </div>
                      </div>
                  `;
        topLosersList.insertAdjacentHTML('beforeend', itemHtml);
    });
}