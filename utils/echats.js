// 得到实时更新数据的表格模板
function realEchartsOption() {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#283b56'
        }
      }
    },
    legend: {
      data: []  // 这里需要修改
    },
    // dataZoom: {
    //   show: false,
    //   start: 0,
    //   end: 0  // 这里需要修改
    // },
    xAxis: [
      {
        type: 'category',
        boundaryGap: true,
        data: []   // 这里需要指向一个数组
      }
    ],
    yAxis: [
      {
        type: 'value',
        scale: true,
        name: '',
        max: 10,   // 这里需要指向一个最大值
        min: 0,
        boundaryGap: [0.2, 0.2]
      }
    ],
    series: [
      {
        name: '',
        type: 'line',
        symbolSize: 10,
        lineStyle: {
          normal: {
            width: 4,
            shadowColor: 'rgba(0,0,0,0.4)',
            shadowBlur: 10,
            shadowOffsetY: 10
          }
        },
        data: []  // 指向数组
      }
    ]
  };
}

// 查询用电量的模板
function powerEchartOption() {
  return {
    grid: {
      bottom: 60
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        animation: false,
        label: {
          backgroundColor: '#505765'
        }
      }
    },
    legend: {
      data: ['用电量'],
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        start: 65,
        end: 85
      },
      {
        type: 'inside',
        realtime: true,
        start: 65,
        end: 85
      }
    ],
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        data: [],
      }
    ],
    yAxis: [
      {
        name: 'kw/h',
        type: 'value',
        max: 0
      }
    ],
    series: [
      {
        name: '用电量',
        type: 'line',
        animation: false,
        areaStyle: {
        },
        lineStyle: {
          width: 1
        },
        /* 重点标出哪个区域的用电量是最的，可以注释掉不用 */
        // markArea: {
        //   silent: true,
        //   data: [[{
        //     xAxis: ''
        //   }, {
        //     xAxis: ''
        //   }]]
        // },
        data: []
      }
    ]
  };
}

module.exports = {
  realEchartsOption,
  powerEchartOption,
}