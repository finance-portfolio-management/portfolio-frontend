export function renderChart(chart, data) {
    const option = {
      xAxis: { type: 'category', data: data.labels },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: data.values }]
    };
  
    chart.setOption(option);
  }
  