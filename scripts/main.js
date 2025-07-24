import { fetchData } from './api/testFetch.js';
import { renderChart } from './charts/testChart.js';
import { addAssets } from './api/assetsAPI.js';

// let chartInstance = null;

// async function loadAndRenderChart() {
//   const data = await fetchData();

//   // Reuse or reinitialize the chart
//   if (!chartInstance) {
//     chartInstance = echarts.init(document.getElementById('main'));
//   }

//   renderChart(chartInstance, data);
// }

// // Load on first visit
// loadAndRenderChart();

// Refresh on button click

async function addAndLoadData() {
  const data = await addAssets();
  console.log('Assets added:', data);

}
document.getElementById('refreshBtn').addEventListener('click', () => {
  addAndLoadData();
});
