// main.js
import { updateMarketChart, refreshMarketTrendsData } from "./charts/marketTrendsChart.js";
import { getTopGainersAndLosers } from "./api/assetsOverallAPI.js";
import { renderTopMovers } from "./components/topMovers.js";
import { addAssets } from "./api/assetsAPI.js";
import { getHoldings } from "./api/assetsInvestmentAPI.js";
// These are now imported directly in the HTML, so no need to import them here.
import "./components/buyInvestment.js";
import "./components/sellInvestment.js"
import "./components/InvestmentRiskInfo.js"

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('date-picker').addEventListener('change', async (e) => {
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
    const res = await getHoldings(datePicker.value); // Refresh holdings after purchase
    window.renderInvestmentList(res); // Call the global function to update the investment list
  });

  // --- Set Date Picker to Today's Date ---
  const datePicker = document.getElementById('date-picker');
  if (datePicker) {
    // const today = new Date();
    // const yyyy = today.getFullYear();
    // const mm = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so add 1
    // const dd = String(today.getDate()).padStart(2, '0');
    datePicker.value = '2025-07-30'; // Format as YYYY-MM-DD
    datePicker.setAttribute('max', '2025-07-30'); // Set max to today
    datePicker.setAttribute('min', '2025-01-01'); // Set min to a reasonable date
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
      min: -100, // Allow negative growth
      max: 100,
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
        fontSize: 12,
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
  window.renderInvestmentList = function (data) { // Made global for access from sellInvestment.js
    // console.log(data)
    document.getElementById('net-worth-value').textContent = `$${data.totalAssetValue.toFixed(2)}`;
    let cumulativeIncome = 0;
    let growthRate = 0;
    if (window.dashboardData && window.dashboardData.firstDayAssetValue) {
      cumulativeIncome = data.totalAssetValue - window.dashboardData.firstDayAssetValue;
      growthRate = ((data.totalAssetValue - window.dashboardData.firstDayAssetValue) / window.dashboardData.firstDayAssetValue) * 100;
    }

    if (cumulativeIncome > 0) {
      document.getElementById('cumulative-income-value')
        .classList.replace('bg-red-400', 'bg-blue-400');
    } else {
      document.getElementById('cumulative-income-value')
        .classList.replace('bg-blue-400', 'bg-red-400');
    }
    document.getElementById('cumulative-income-value').textContent = `$${cumulativeIncome.toFixed(2)}`;
    console.log(growthRate)
    growthRateChart.setOption({ series: [{ data: [{ value: growthRate }] }] });


    data = data.processedData; // Use processed data from API response

    const investmentListContainer = document.getElementById('investment-list');
    investmentListContainer.innerHTML = ''; // Clear existing content

    const pieChartData = []; // Data for ECharts pie chart

    data.forEach((group, groupIndex) => { // Added groupIndex
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
                            <span class="text-xs text-gray-600">$${group.categoryValue.toFixed(2)}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-gray-700 text-sm">${group.categoryPercentage.toFixed(2)}%</span>
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-500 transition-transform chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                        </div>
                    `;
      sectionContainer.appendChild(headerLabel);

      const content = document.createElement('div');
      content.className = 'collapsible-content';
      group.items.forEach((item, itemIndex) => { // Added itemIndex
        // Create the swipe container
        const swipeContainer = document.createElement('div');
        // Apply border-bottom to swipe-container instead of item-content
        swipeContainer.className = 'swipe-container relative overflow-hidden';
        swipeContainer.dataset.groupIndex = groupIndex; // Store indices for deletion
        swipeContainer.dataset.itemIndex = itemIndex;
        swipeContainer.dataset.symbol = item.name; // Store symbol for sell modal
        swipeContainer.dataset.value = item.value; // Store current value for sell modal

        // Create the content div (original investment-item)
        const itemContentDiv = document.createElement('div');
        itemContentDiv.className = 'investment-item-content transition-transform duration-300 ease-in-out flex justify-between items-center p-2 bg-white rounded-md';
        if (item.name.toLowerCase() === 'usd') {
          itemContentDiv.innerHTML = `
                            <span class="font-medium text-gray-700 text-sm">${item.name}</span>
          <span class="text-xs text-gray-500">$${item.value.toFixed(2)}</span>

                        `;
        } else {
          itemContentDiv.innerHTML = `
          <span class="font-medium text-gray-700 text-sm">${item.name}</span>
          <span class="text-xs text-gray-500">$${item.value.toFixed(2)} (${item.ownedShares.toFixed(4)} shares)</span>
      `;
        }


        // Create the sell button (formerly delete)
        const sellBtn = document.createElement('button');
        sellBtn.className = 'sell-btn absolute right-0 top-0 h-full bg-red-600 text-white px-4 py-2 rounded-r-md flex items-center justify-content-center transform translate-x-full transition-transform duration-300 ease-in-out';
        sellBtn.textContent = 'Sell';

        swipeContainer.appendChild(itemContentDiv);
        swipeContainer.appendChild(sellBtn);

        content.appendChild(swipeContainer); // Append the swipeContainer to the collapsible content

        // --- Swipe and Right-Click Logic for each item ---
        let startX = 0;
        let currentX = 0;
        let isSwiping = false;
        const swipeThreshold = 50; // Pixels to trigger swipe

        // Prevent default right-click menu and show sell button
        itemContentDiv.addEventListener('contextmenu', (e) => {
          e.preventDefault(); // Prevent default context menu
          // Close any other open swipe items
          document.querySelectorAll('.swipe-container.swiped').forEach(openItem => {
            if (openItem !== swipeContainer) {
              openItem.classList.remove('swiped');
              openItem.querySelector('.investment-item-content').style.transform = `translateX(0px)`;
            }
          });
          swipeContainer.classList.toggle('swiped');
        });

        // Click listener for the sell button
        sellBtn.addEventListener('click', () => {
          const targetGroupIndex = parseInt(swipeContainer.dataset.groupIndex);
          const targetItemIndex = parseInt(swipeContainer.dataset.itemIndex);
          const selectedItem = window.dashboardData.investmentData.processedData[targetGroupIndex].items[targetItemIndex];

          // Open the sell modal with item data
          window.openSellInvestmentModal(selectedItem, targetGroupIndex, targetItemIndex); // Call global function

          // Close the swiped state after clicking sell
          swipeContainer.classList.remove('swiped');
          itemContentDiv.style.transform = `translateX(0px)`;
        });
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

      checkbox.checked = true;
      setTimeout(() => {
        content.style.maxHeight = content.scrollHeight + 'px';
        headerLabel.querySelector('.chevron').classList.add('chevron-rotated');
      }, 0);

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
      // rgb(207 250 254 rgb(220 252 231rgb(219 234 254)
    };
    assetDistributionChart.setOption(assetDistributionOption, true); // true for merging options
  }


  // Simulate fetching all dashboard data from the server
  async function fetchDashboardData() {
    await addAssets({ symbol: "AAPL" });

    const marketTrendsRep = await refreshMarketTrendsData(datePicker.value, 'AAPL'); // Fetch market trends data for the selected date

    // const growthRateValue = 2.5; // Example growth rate

    // Mock data for Investment List (raw data, will be processed)
    const processedInvestmentData = await getHoldings(datePicker.value);

    const { totalAssetValue } = await getHoldings("2025-07-01")


    const topMoversData = await getTopGainersAndLosers(); // Fetch top gainers and losers from API

    return {
      symbol: 'AAPL',
      // netWorth: netWorthValue,
      // cumulativeIncome: cumulativeIncomeValue,
      // growthRate: growthRateValue,
      investmentData: processedInvestmentData,
      marketTrendsData: marketTrendsRep,
      topMoversData: topMoversData.data,
      firstDayAssetValue: totalAssetValue // Store the first day asset value for calculations
    };
  }

  // Main execution flow
  fetchDashboardData().then(data => {
    // Store fetched data globally or pass it around
    window.dashboardData = data; // Storing for easier access in event listeners

    // Update Net Worth and Cumulative Income display

    // Update Growth Rate Chart
    growthRateChart.setOption({ series: [{ data: [{ value: data.growthRate }] }] });

    // Render Investment List and update Asset Distribution Chart
    window.renderInvestmentList(data.investmentData); // Call the global render function

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

  // Event listener for the "Buy" button to open the modal
  document.getElementById('add-investment-btn').addEventListener('click', window.openAddInvestmentModal);

});
