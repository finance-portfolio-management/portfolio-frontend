import { fetchData } from './api/testFetch.js';
import { renderChart } from './charts/testChart.js';

let chartInstance = null;

async function loadAndRenderChart() {
  const data = await fetchData();

  // Reuse or reinitialize the chart
  if (!chartInstance) {
    chartInstance = echarts.init(document.getElementById('main'));
  }

  renderChart(chartInstance, data);
}

// Load on first visit
loadAndRenderChart();

// Refresh on button click
document.getElementById('refreshBtn').addEventListener('click', () => {
  loadAndRenderChart();
});
