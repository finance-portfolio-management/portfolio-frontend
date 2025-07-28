import { updateMarketChart, refreshMarketTrendsData } from "./charts/marketTrendsChart.js";
import { getTopGainersAndLosers } from "./api/assetsOverallAPI.js";
import { renderTopMovers } from "./components/topMovers.js";

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('date-picker').addEventListener('change', (e) => {
    let tempSymbol = "AAPL";
    if (window.dashboardData) {
      tempSymbol = window.dashboardData.symbol || "AAPL"; // Use stored symbol or default to AAPL
    }
    const selector = document.getElementById('time-range-selector');
    const buttons = selector.querySelectorAll('button');
    buttons.forEach(btn => btn.classList.remove('btn-active'));
    const targetButton = selector.querySelector('button[data-range="3M"]');
    if (targetButton) {
      targetButton.classList.add('btn-active');
    }
    refreshMarketTrendsData(e.target.value, tempSymbol);
  });

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
  // 3. Market Trends Candlestick Chart 


  // Event listener for time range selector buttons
  const timeRangeSelector = document.getElementById('time-range-selector');
  timeRangeSelector.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      // Remove active class from all buttons
      timeRangeSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('btn-active'));
      // Add active class to the clicked button
      e.target.classList.add('btn-active');
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


  // Simulate fetching all dashboard data from the server
  async function fetchDashboardData() {
    const marketTrendsRep = await refreshMarketTrendsData(datePicker.value, 'AAPL'); // Fetch market trends data for the selected date
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

    const topMoversData = await getTopGainersAndLosers(); // Fetch top gainers and losers from AP

    return {
      symbol: 'AAPL',
      netWorth: netWorthValue,
      cumulativeIncome: cumulativeIncomeValue,
      growthRate: growthRateValue,
      investmentData: processedInvestmentData,
      marketTrendsData: marketTrendsRep,
      topMoversData: topMoversData.data
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
    updateMarketChart(data.marketTrendsData, '3M'); // Pass marketTrendsData here

    // Render Top Movers
    renderTopMovers(data.topMoversData);

    // Event listener for time range selector buttons (updated to use fetched data)
    timeRangeSelector.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        updateMarketChart(window.dashboardData.marketTrendsData, e.target.dataset.range, window.dashboardData.symbol); // Use globally stored data
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

});