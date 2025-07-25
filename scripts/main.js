// Gauge Chart
const gauge = echarts.init(document.getElementById('gaugeChart'));
gauge.setOption({
  series: [{
    type: 'gauge',
    progress: { show: true },
    axisLine: { lineStyle: { width: 6 } },
    detail: { formatter: '+2.55%' },
    data: [{ value: 2.55 }]
  }]
});

// Pie Chart
const pie = echarts.init(document.getElementById('pieChart'));
pie.setOption({
  series: [{
    type: 'pie',
    radius: '60%',
    label: { show: false },
    data: [
      { value: 420, name: 'Stocks' },
      { value: 320, name: 'Funds' },
      { value: 370, name: 'Bonds' },
      { value: 123, name: 'Cash' },
      { value: 5, name: 'Others' }
    ]
  }]
});

// Line Chart
const line = echarts.init(document.getElementById('lineChart'));
line.setOption({
  xAxis: {
    type: 'category',
    data: ['07/01', '07/05', '07/10', '07/15', '07/20', '07/24']
  },
  yAxis: { type: 'value' },
  series: [{
    data: [100, 120, 150, 130, 140, 160],
    type: 'line',
    smooth: true
  }]
});

// Toggle investment list
document.querySelectorAll('.toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    target.style.display = target.style.display === 'block' ? 'none' : 'block';
  });
});
