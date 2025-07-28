document.addEventListener('DOMContentLoaded', function () {
  // --- Set Date Picker to Today's Date ---
  const datePicker = document.getElementById('date-picker');
  if (datePicker) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    const dd = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${yyyy}-${mm}-${dd}`; // Format as YYYY-MM-DD
  }

  // --- ECharts Initialization ---

  // 1. Growth Rate Gauge
  const growthRateChart = echarts.init(document.getElementById('growth-rate-chart'));
  const growthRateOption = {
    title: { // Main title for the entire chart
      text: 'Growth Rate',
      left: 'left', // Title aligned to the left
      top: 'top',   // Title aligned to the top
      textStyle: {
        color: '#333', // Title text color
        fontSize: 14, // Adjust font size
        fontWeight: 'bold'
      }
    },
    series: [{
      type: 'gauge',
      center: ['50%', '60%'], // Gauge center position
      radius: '95%', // Gauge size
      startAngle: 200, // Start angle of the gauge arc
      endAngle: -20, // End angle of the gauge arc
      min: -10, // Allow negative growth
      max: 10,
      splitNumber: 5, // Simplified number of scale marks
      progress: { show: true, width: 8 }, // Simplified progress bar width
      pointer: { show: false }, // Hide pointer
      axisLine: { lineStyle: { width: 8 } }, // Simplified axis line width
      axisTick: { show: false }, // Hide ticks
      splitLine: { show: false }, // Hide split lines
      axisLabel: { distance: -5, color: '#999', fontSize: 10 }, // Adjust label distance and font size
      anchor: { show: false }, // Hide anchor point
      detail: {
        valueAnimation: true, // Value change animation
        fontSize: 16,
        fontWeight: 'bold',
        offsetCenter: [0, '0%'], // Detail text position
        formatter: function (value) {
          return 'Growth Rate\n' + value.toFixed(1) + '%'; // Format displayed value
        }
      },
      data: [{ value: 0 }] // Initial value for the gauge (will be updated by fetched data)
    }]
  };
  growthRateChart.setOption(growthRateOption);

  // 2. Asset Distribution Pie Chart (Nightingale Chart)
  const assetDistributionChart = echarts.init(document.getElementById('asset-distribution-chart'));
  // assetDistributionOption is dynamically set in renderInvestmentList

  // --- Helper functions for Market Trends Chart ---
  // Helper function to split raw candlestick data into categories and values
  function splitData(rawData) {
    let categoryData = []; // Dates/Times
    let values = []; // Open, Close, Low, High values
    let dataToProcess = JSON.parse(JSON.stringify(rawData)); // Deep copy to avoid modifying original
    for (let i = 0; i < dataToProcess.length; i++) {
      categoryData.push(dataToProcess[i].splice(0, 1)[0]); // Extract date/time
      values.push(dataToProcess[i]); // Remaining values are OHLC
    }
    return { categoryData, values };
  }

  // Helper function to calculate Simple Moving Average (SMA)
  function calculateMA(dayCount, data) {
    let result = [];
    for (let i = 0; i < data.values.length; i++) {
      if (i < dayCount - 1) { // Need 'dayCount' data points to start calculation
        result.push(NaN); // Not enough data for initial period
        continue;
      }
      let sum = 0;
      for (let j = 0; j < dayCount; j++) {
        sum += data.values[i - j][1]; // Use closing price (index 1) for MA calculation
      }
      result.push(+(sum / dayCount).toFixed(2));
    }
    return result;
  }

  // 3. Market Trends Candlestick Chart (Shanghai Index, 2015)
  const marketTrendsChart = echarts.init(document.getElementById('market-trends-chart'));
  const upColor = '#00da3c'; // Up color (green)
  const downColor = '#ec0000'; // Down color (red)

  // Generate mock daily data for a given period
  function generateDailyData(startDate, endDate, startPrice, volatility) {
    let data = [];
    let currentDate = new Date(startDate);
    let currentPrice = startPrice;
    const dailyDrift = volatility * 0.05; // Small daily drift to create a trend

    while (currentDate <= endDate) {
      // Skip weekends (Saturday and Sunday)
      if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
        // Introduce a slight random drift to currentPrice for a more realistic trend
        currentPrice += (Math.random() - 0.5) * dailyDrift;

        let open = +(currentPrice + (Math.random() - 0.5) * volatility * 0.2).toFixed(2); // Smaller opening jump
        let close = +(open + (Math.random() - 0.5) * volatility * 0.5).toFixed(2); // Larger daily movement
        let high = Math.max(open, close) + Math.random() * volatility * 0.1;
        let low = Math.min(open, close) - Math.random() * volatility * 0.1;

        // Ensure low is not negative
        low = Math.max(0, low);

        data.push([
          currentDate.toISOString().split('T')[0], // YYYY-MM-DD
          +open.toFixed(2),
          +close.toFixed(2),
          +low.toFixed(2),
          +high.toFixed(2)
        ]);
        currentPrice = close; // Next day's base price is today's close
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return data;
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

  function updateMarketChart(marketTrendsData, range) {
    const data = splitData(marketTrendsData[range]);
    const ma5Data = calculateMA(5, data);
    const ma10Data = calculateMA(10, data);
    const ma20Data = calculateMA(20, data);
    const ma30Data = calculateMA(30, data);

    const marketTrendsOption = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { // Add legend for Candlestick and MAs
        data: ['Candlestick', 'MA5', 'MA10', 'MA20', 'MA30'],
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
        { name: 'MA5', type: 'line', data: ma5Data, smooth: true, lineStyle: { opacity: 0.8, width: 1, color: '#5470C6' } }, // Blue
        { name: 'MA10', type: 'line', data: ma10Data, smooth: true, lineStyle: { opacity: 0.8, width: 1, color: '#91CC75' } }, // Green
        { name: 'MA20', type: 'line', data: ma20Data, smooth: true, lineStyle: { opacity: 0.8, width: 1, color: '#FAC858' } }, // Orange
        { name: 'MA30', type: 'line', data: ma30Data, smooth: true, lineStyle: { opacity: 0.8, width: 1, color: '#EE6666' } }  // Red
      ]
    };
    marketTrendsChart.setOption(marketTrendsOption, true);
  }

  // Event listener for time range selector buttons
  const timeRangeSelector = document.getElementById('time-range-selector');
  timeRangeSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      // Remove active class from all buttons
      timeRangeSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('btn-active'));
      // Add active class to the clicked button
      e.target.classList.add('btn-active');
      // This will be updated to use fetched data after fetchDashboardData resolves
      // For now, it relies on a global 'dashboardData' or similar if it's already set.
      // It will be properly handled in the main fetchDashboardData().then() block.
    }
  });

  // Render Investment List
  function renderInvestmentList(data) {
    const investmentListContainer = document.getElementById('investment-list');
    investmentListContainer.innerHTML = ''; // Clear existing content

    const pieChartData = []; // Data for ECharts pie chart

    data.forEach((group, index) => {
      const sectionContainer = document.createElement('div');
      const checkboxId = `collapsible-${group.category.toLowerCase().replace(/\s/g, '-')}`;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = checkboxId;
      checkbox.className = 'collapsible-checkbox';
      sectionContainer.appendChild(checkbox);

      const headerLabel = document.createElement('label');
      headerLabel.htmlFor = checkboxId;
      headerLabel.className = `p-3 rounded-lg flex justify-between items-center cursor-pointer bg-${group.color}-100 collapsible-header`;
      headerLabel.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-${group.color}-500"></span>
                            <span class="font-bold text-gray-800 text-sm">${group.category}</span>
                            <span class="text-xs text-gray-600">¥${group.categoryValue.toFixed(2)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-700 text-sm">${group.categoryPercentage.toFixed(2)}%</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 transition-transform chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    `;
      sectionContainer.appendChild(headerLabel);

      const content = document.createElement('div');
      content.className = 'collapsible-content';
      group.items.forEach(item => {
        const itemEl = document.createElement('div');
        itemEl.className = 'investment-item';
        itemEl.innerHTML = `
                            <span class="font-medium text-gray-700 text-sm">${item.name}</span>
                            <span class="text-xs text-gray-500">¥${item.value.toFixed(2)} (${item.percentage.toFixed(2)}%)</span>
                        `;
        content.appendChild(itemEl);
      });
      sectionContainer.appendChild(content);

      checkbox.addEventListener('change', () => {
        const chevron = headerLabel.querySelector('.chevron');
        if (checkbox.checked) {
          content.style.maxHeight = content.scrollHeight + 'px';
          chevron.classList.add('chevron-rotated');
        } else {
          content.style.maxHeight = '0px';
          chevron.classList.remove('chevron-rotated');
        }
      });

      // Keep the first category open by default
      if (index === 0) {
        checkbox.checked = true;
        setTimeout(() => {
          content.style.maxHeight = content.scrollHeight + 'px';
          headerLabel.querySelector('.chevron').classList.add('chevron-rotated');
        }, 0);
      }

      investmentListContainer.appendChild(sectionContainer);

      // Prepare data for ECharts pie chart
      pieChartData.push({
        value: group.categoryValue,
        name: group.category
      });
    });

    // Update ECharts Asset Distribution Pie Chart
    const assetDistributionOption = {
      tooltip: { trigger: 'item', formatter: '{a} <br/>{b}: {c} ({d}%)' },
      legend: { orient: 'vertical', left: 'right', top: 'center', data: data.map(g => g.category), itemGap: 5, textStyle: { fontSize: 12 } },
      series: [{
        name: 'Asset Distribution',
        type: 'pie',
        radius: [20, 100],
        center: ['35%', '50%'],
        roseType: 'radius',
        avoidLabelOverlap: false,
        label: { show: false, position: 'center' },
        emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: pieChartData
      }],
      color: ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE']
    };
    assetDistributionChart.setOption(assetDistributionOption, true); // true for merging options
  }

  // Render Top Movers (Gainers and Losers)
  function renderTopMovers(data) {
    const topGainersList = document.getElementById('top-gainers-list');
    const topLosersList = document.getElementById('top-losers-list');

    topGainersList.innerHTML = ''; // Clear existing content
    topLosersList.innerHTML = ''; // Clear existing content

    data.gainers.forEach(item => {
      const itemHtml = `
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col items-start">
                                <span class="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded mb-1 text-sm">${item.symbol}</span>
                                <div>
                                    <p class="font-semibold text-gray-700 text-sm">${item.name}</p>
                                    <p class="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-green-600 text-sm">${item.change.toFixed(2)} (${item.percentageChange.toFixed(2)}%)</p>
                                <div class="h-1.5 w-16 bg-green-200 rounded-full mt-0.5"><div class="h-1.5 bg-green-500 rounded-full" style="width: ${item.progress}%"></div></div>
                            </div>
                        </div>
                    `;
      topGainersList.insertAdjacentHTML('beforeend', itemHtml);
    });

    data.losers.forEach(item => {
      const itemHtml = `
                        <div class="flex items-center justify-between">
                            <div class="flex flex-col items-start">
                                <span class="font-bold text-red-600 bg-red-100 px-2 py-1 rounded mb-1 text-sm">${item.symbol}</span>
                                <div>
                                    <p class="font-semibold text-gray-700 text-sm">${item.name}</p>
                                    <p class="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold text-red-600 text-sm">${item.change.toFixed(2)} (${item.percentageChange.toFixed(2)}%)</p>
                                <div class="h-1.5 w-16 bg-red-200 rounded-full mt-0.5"><div class="h-1.5 bg-red-500 rounded-full" style="width: ${item.progress}%"></div></div>
                            </div>
                        </div>
                    `;
      topLosersList.insertAdjacentHTML('beforeend', itemHtml);
    });
  }

  // Simulate fetching all dashboard data from the server
  async function fetchDashboardData() {
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mock data for Net Worth and Cumulative Income
    const netWorthValue = 1234567.89;
    const cumulativeIncomeValue = 5678.9;
    const growthRateValue = 2.5; // Example growth rate

    // Mock data for Investment List (raw data, will be processed)
    const rawInvestmentListData = [
      {
        category: 'Stocks', color: 'blue', items: [
          { name: 'AAPL', value: 300000.00 },
          { name: 'GOOG', value: 250000.00 },
          { name: 'MSFT', value: 150000.00 },
          { name: 'AMZN', value: 40740.00 }
        ]
      },
      {
        category: 'Funds', color: 'cyan', items: [
          { name: 'VTI', value: 150000.00 },
          { name: 'VXUS', value: 120370.00 },
          { name: 'BNDX', value: 100000.00 }
        ]
      },
      {
        category: 'Bonds', color: 'green', items: [
          { name: 'BND', value: 150000.00 },
          { name: 'AGG', value: 120370.00 },
          { name: 'TLT', value: 100000.00 }
        ]
      },
      {
        category: 'Cash', color: 'yellow', items: [
          { name: 'USD Savings', value: 80000.00 },
          { name: 'EUR Current', value: 43450.00 }
        ]
      },
      {
        category: 'Others', color: 'red', items: [
          { name: 'Real Estate', value: 30000.00 },
          { name: 'Crypto', value: 20000.00 },
          { name: 'Commodities', value: 11720.00 }
        ]
      }
    ];

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

    // Mock data for Top Movers
    const topMoversData = {
      gainers: [
        { symbol: 'BE', name: 'Bloom Energy Co...', price: 33.00, change: 6.17, percentageChange: 22.90, progress: 80 },
        { symbol: 'WST', name: 'West Pharmaceu...', price: 279.10, change: 51.79, percentageChange: 22.76, progress: 75 },
        { symbol: 'ICLR', name: 'ICON Public Limi...', price: 165.01, change: 27.12, percentageChange: 19.67, progress: 65 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 1200.50, change: 50.25, percentageChange: 4.37, progress: 90 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 300.75, change: 15.10, percentageChange: 5.28, progress: 85 }
      ],
      losers: [
        { symbol: 'SIGI', name: 'Selective Insuran...', price: 25.27, change: -7.16, percentageChange: -22.06, progress: 80 },
        { symbol: 'LKQ', name: 'LKQ Corporation', price: 31.73, change: -6.88, percentageChange: -17.82, progress: 70 },
        { symbol: 'MOH', name: 'Molina Healthcar...', price: 158.22, change: -32.03, percentageChange: -16.83, progress: 60 },
        { symbol: 'ZM', name: 'Zoom Video Comm...', price: 65.10, change: -5.20, percentageChange: -7.39, progress: 40 },
        { symbol: 'PTON', name: 'Peloton Interactiv...', price: 4.50, change: -0.80, percentageChange: -15.09, progress: 55 }
      ]
    };

    // Market Trends data (already generated by functions, just need to include it)
    const sh2015FullData = generateDailyData(new Date('2015-02-01'), new Date('2015-12-31'), 3200, 50);
    const referenceDateForMock = new Date('2015-12-02');
    const marketTrendsData = {
      '1D': filterDataByRange(sh2015FullData, 1, referenceDateForMock),
      '1W': filterDataByRange(sh2015FullData, 7, referenceDateForMock),
      '1M': filterDataByRange(sh2015FullData, 30, referenceDateForMock),
      '3M': filterDataByRange(sh2015FullData, 90, referenceDateForMock)
    };

    return {
      netWorth: netWorthValue,
      cumulativeIncome: cumulativeIncomeValue,
      growthRate: growthRateValue,
      investmentData: processedInvestmentData,
      marketTrendsData: marketTrendsData,
      topMoversData: topMoversData
    };
  }

  // Main execution flow
  fetchDashboardData().then(data => {
    // Store fetched data globally or pass it around
    window.dashboardData = data; // Storing for easier access in event listeners

    // Update Net Worth and Cumulative Income display
    document.getElementById('net-worth-value').textContent = `¥${data.netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('cumulative-income-value').textContent = `+ ¥${data.cumulativeIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    // Update Growth Rate Chart
    growthRateChart.setOption({ series: [{ data: [{ value: data.growthRate }] }] });

    // Render Investment List and update Asset Distribution Chart
    renderInvestmentList(data.investmentData);

    // Update Market Trends Chart (initial load with 1D data)
    updateMarketChart(data.marketTrendsData, '1D'); // Pass marketTrendsData here

    // Render Top Movers
    renderTopMovers(data.topMoversData);

    // Event listener for time range selector buttons (updated to use fetched data)
    timeRangeSelector.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        timeRangeSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('btn-active'));
        e.target.classList.add('btn-active');
        updateMarketChart(window.dashboardData.marketTrendsData, e.target.dataset.range); // Use globally stored data
      }
    });

  }).catch(error => {
    console.error('Failed to fetch dashboard data:', error);
    // Display a user-friendly error message on the page
    document.getElementById('net-worth-value').textContent = 'Error loading data';
    document.getElementById('cumulative-income-value').textContent = 'Error loading data';
    document.getElementById('top-gainers-list').innerHTML = '<p class="text-red-500 text-sm">Failed to load top gainers.</p>';
    document.getElementById('top-losers-list').innerHTML = '<p class="text-red-500 text-sm">Failed to load top losers.</p>';
    document.getElementById('investment-list').innerHTML = '<p class="text-red-500 text-sm px-2">Failed to load investment list.</p>';
  });

  // Adjust chart sizes on window resize for responsiveness
  window.addEventListener('resize', function () {
    growthRateChart.resize();
    assetDistributionChart.resize();
    marketTrendsChart.resize();
  });
});