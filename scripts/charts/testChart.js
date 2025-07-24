import { fetchData } from '../api/testFetch.js';

async function renderChart() {
  const data = await fetchData();

  const chart = echarts.init(document.getElementById('main'));
  const option = {
    xAxis: {
      type: 'category',
      data: data.labels
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.values,
      type: 'bar'
    }]
  };
  chart.setOption(option);
}

renderChart();