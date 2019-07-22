import * as echarts from '../ec-canvas/echarts';
// const app = getApp();
let yearBase = 1990;
let utilCurrentEchart = null;
let utilPowerEchart = null;
const app = getApp();
function getCurrentTime() {
  let date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return [year, month, day].map(formatNumber).join('-');
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 将时间规范化
 */
function formatTime(year, month, day) {
  return [year, month, day].map(formatNumber).join('-');
}


/**
 * @author zwb
 * @decription 根据选择的结果对日历选择器进行更新。
 */
function dateChoiceRenew(year, month) {
  const date = new Date(year, month, 0);
  const currentTime = new Date();
  let days = [], months = [];
  if (year == currentTime.getFullYear()) {
    for (let i = 1; i <= currentTime.getMonth() + 1; i++) {
      months.push(i);
    }
  } else {
    for (let i = 1; i <= 12; i++) {
      months.push(i);
    }
  }
  if (year == currentTime.getFullYear() && month == currentTime.getMonth() + 1) {
    for (let i = 1; i <= currentTime.getDate(); i++) {
      days.push(i);
    }
  } else {
    for (let i = 1; i <= date.getDate(); i++) {
      days.push(i);
    }
  }
  this.setData({
    months: months,
    days: days
  });
}

/**
 * 日期初始化函数
 */
function dateChoiceInit() {
  const currentTime = new Date();
  let year = currentTime.getFullYear(),
    month = currentTime.getMonth() + 1,
    day = currentTime.getDate();
  dateChoiceRenew.bind(this, year, month)();
  this.setData({
    value: [year - yearBase, month - 1, day - 1]
  })
}

/**
 * 切换用电器开关的函数
 * 这个是请求完成并确定修改后调用的函数，主要是执行动画效果函数
 */
function switchStatus(status) {
  let newTranstion;
  /* 切换动画效果 */
  if (status == 1 || status == 2) {
    newTranstion = 'switch-controll-active';
    this.setData({
      status: 1,
      switchTranstion: newTranstion,
      statusActive: 'switch-active'
    })
  } else if (status == 0 || status == 3) {
    newTranstion = '';
    this.setData({
      status: 0,
      switchTranstion: newTranstion,
      statusActive: ''
    })
  }
}

/**
 * websocket的工具对象
 * socketStatus是珍格格socket的状态，是否开启
 */
const webSocketUtil = {
  /* socket的状态，默认没有开，在连接后就开启 */
  socketStatus: false,
  connectSocket: function () {
    wx.showLoading({
      title: '正在连接...',
    })
    const socketTask = wx.connectSocket({
      url: app.globalUrlBase.wss + '/message',
      success: function () {
        console.log('websocket开启成功');
      }
    })
  },
  sendSocketMessage: function (jsonObj) {
    // 给websocket发送请求
    let datas = jsonObj;
    wx.sendSocketMessage({
      data: datas,
      success: function () {
      }
    })
  },
  closeSocket: function () {
    wx.closeSocket({
      success: function () {
        console.log('socket已经关闭')
      }
    })
  }
}

/**
 * 接收到socket发过来的数据，
 * 进行处理的函数
 * 主要处理项为以下：
 * 1.对状态进行更新
 * 2.对数据进行更新
 * 3.实时监控是否存在长时间待机的用电器
 */
function realDataHandle(data) {
  const that = this;
  let status;
  renewEcharts.call(that, data);
  switch (data.status) {
    case 0: {
      status = '断电';
      break;
    }
    case 1: {
      status = '待机';
      break;
    }
    case 2: {
      status = '工作';
      break;
    }
    case 3: {
      status = '故障';
      break;
    }
  }
  that.setData({
    applianceStatus: status,
    status: data.status,
    indexName: data.device.name
  });
  // 更新用电器状态
  switchStatus.call(that, data.status);
}

/**
 * 规范化发送的时间
 */
function formatSendTime(choiceTime, timeMode) {
  let formatStartTime;
  switch (timeMode) {
    case 'day': {
      formatStartTime = choiceTime + ' 00:00:00';
      break;
    }
    case 'week': {
      switch (choiceTime[2]) {
        case '一': {
          formatStartTime = getDateStr(-7);
          break;
        }
        case '二': {
          formatStartTime = getDateStr(-14);
          break;
        }
        case '三': {
          formatStartTime = getDateStr(-21);
          break;
        }
      }
      break;
    }
    case 'month': {
      formatStartTime = choiceTime + '-01 00:00:00';
      break;
    }
  }
  return formatStartTime;
}

/**
 * 获取几天前的日期
 */
function getDateStr(addDayCount) {
  var date = new Date();
  date.setDate(date.getDate() + addDayCount);//获取AddDayCount天后的日期   
  let year = date.getFullYear(),
    month = date.getMonth() + 1,
    day = date.getDate();
  return formatNumber(year) + "-" + formatNumber(month) + "-" + formatNumber(day) + ' 00:00:00';
}

/* 实时更新数据的echarts表格的模板 */
let realEchartsOption = {
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
      data: null   // 这里需要指向一个数组
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
      data: null  // 指向数组
    }
  ]
};

/**
 * 查询用电量的
 */
let powerEchartOption = {
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


/**
 * 初始化echart表格函数,
 * 必须用bind函数绑定作用域对象。
 * 思路：
 * 1.util文件的echartOption模板
 * 2.获取this.data中当前是查看什么数据
 * 3.初始化这个模板并且将this.data中的模板进行指向修改后的模板。
 * 4.实时更新的时候，直接调用currentEc这个对象，因为这个函数的返回值就是初始化后的echart对象
 */
function initChart(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  let option = realEchartsOption,
    name = this.data.currentDataMode[2] + this.data.currentDataMode[3];
  /* 初始化option选项 */
  option.legend.data[0] = name;
  option.series[0].name = name;
  // console.log(this.data)
  if (utilCurrentEchart != null) {
    utilCurrentEchart.hideLoading();  // 将之前的showLoading去掉
  }
  
  utilCurrentEchart = chart;  // ranhou
  realEchartsOption.series[0].data = [];
  realEchartsOption.xAxis[0].data = [];
  // console.log(this.data)
  // this.currentEchartsOption = option;
  // this.setData({
  //   currentEchartsOption: option
  // })
  
  chart.showLoading();
  // chart.setOption(option);
  return chart;
}

/**
 * 对用电量查询的echarts表格进行初始化
 */
function powerEchartInit(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  let option = powerEchartOption;
  utilPowerEchart = chart;
  // chart.showLoading();
  chart.setOption(option);
  return chart;
}

/**
 * 用电量查询更新函数
 * 1.
 */
function powerDateRenew(data) {
  const that = this;
  console.log(data)
  let max = 0,
    dataArr = [],
    timeArr = [];
  for (let i = 0; i < data.powerSumList.length; i++) {
    if (data.powerSumList[i].powerSum != null) {
      dataArr.push(data.powerSumList[i].powerSum);
      timeArr.push(data.powerSumList[i].time);
      if (max < data.powerSumList[i].powerSum) {
        max = data.powerSumList[i].powerSum;
      }
    } else {
      dataArr.push(0);
      timeArr.push(data.powerSumList[i].time);
    }

  }
  powerEchartOption.xAxis[0].data = timeArr;
  powerEchartOption.series[0].data = dataArr;
  powerEchartOption.yAxis[0].max = (max * 1.5);
  utilPowerEchart.setOption(powerEchartOption);
}

/**
 * 预测部分的echarts更新函数
 */
function predictDataRenew(data) {
  const that = this;
  let dataArr = [],
      timeArr = [];
  dataArr.push(data.powerSum.powerSum);
  timeArr.push(data.powerSum.time);
  powerEchartOption.yAxis[0].max = (data.powerSum.powerSum * 1.5);
  powerEchartOption.xAxis[0].data = timeArr;
  powerEchartOption.series[0].data = dataArr;
  utilPowerEchart.setOption(powerEchartOption);
}


/**
 * 实时更新echarts表格
 */
function renewEcharts(data) {
  if (utilCurrentEchart == null) {
    setTimeout(renewEcharts.bind(this, data), 200);
    return;
  }
  console.log(data);
  let currentData = this.data;
  let option = realEchartsOption,
    timeArr = currentData.timeArr,
    dataArr = currentData.dataArr,
    dataType,
    unit,
    max = 0;
  if (timeArr.length >= 7 || dataArr.length >= 7) {
    timeArr.shift();
    dataArr.shift();
  }
  switch (this.data.currentDataMode) {
    case '查看电流': {
      dataType = 'current';
      unit = '/A';
      break;
    }
    case '查看电压': {
      dataType = 'voltage';
      unit = '/V';
      break;
    }
    case '查看功率': {
      dataType = 'power';
      unit = '/W';
      break;
    }
  }
  dataArr.push(data.device[dataType]);
  timeArr.push(data.device.date.split(' ')[1]);
  for (let i = 0; i < dataArr.length; i++) {
    if (max < dataArr[i]) {
      max = dataArr[i];
    }
  }
  max = Math.ceil(max * 2);
  option.yAxis[0].max = max;
  option.yAxis[0].name = unit;
  if (option.xAxis[0].data.length >= 4) {
    option.xAxis[0].data.shift();
    option.series[0].data.shift();
  }
  console.log(data.device[dataType])
  option.xAxis[0].data.push(data.device.date.split(' ')[1]);

  option.series[0].data.push(data.device[dataType]);
  this.data.timeArr = timeArr;
  this.data.dataArr = dataArr;
  // console.log()
  // this.data.currentEc.onInit.setOption(option);
  utilCurrentEchart.hideLoading();
  utilCurrentEchart.setOption(option);
}

/**
 * 长时间待机时候进行处理，作为一个回调函数
 * 无论点击cancel还是comfirm都会进行数组的出队列操作和回调
 * 分开回调的原因是返回时候会有延时，如果直接回调就不会看到成功的提示
 */
function longTimeStandby(standbyArr) {
  const that = this;
  // console.log(this.data);
  if (standbyArr.length == 0) {
    this.data.isShowModel = false;
    /* 这里要有开启socket发送数据后可以调用这个函数的操作 */
    return;
  }
  /* 这里要有阻止socket调用这个函数的操作 */

  this.data.isShowModel = true;
  wx.showModal({
    content: '接口' + standbyArr[0] + '长时间待机，是否将其关闭？',
    success: function (res) {
      let jsonObj = {
        index: standbyArr[0],
      }
      if (res.confirm) {
        jsonObj.key = 0;
        wx.request({
          url: app.globalUrlBase.url + '/device/controller',
          method: 'POST',
          dataType: 'json',
          data: jsonObj,
          success: function (res) {
            let content = '';
            switch (res.data.status) {
              case '2000': {
                content = '接口' + standbyArr[0] + '已经成功关闭';
                break;
              }
              case '4001': {
                content = '接口' + standbyArr[0] + '关闭失败';
                break;
              }
              case '5001': {
                content = '服务器发生未知错误';
                break;
              }
            }
            wx.showToast({
              title: '关闭成功',
              complete: function () {
                standbyArr.shift();
                longTimeStandby.call(that, standbyArr);
              }
            });
          }
        })
      } else if (res.cancel) {
        jsonObj.key = 1;
        wx.request({
          url: app.globalUrlBase.url + '/device/controller',
          method: 'POST',
          dataType: 'json',
          data: jsonObj,
          success: function (res) {
            let content = '';
            switch (res.data.status) {
              case '2000': {
                // content = '接口' + standbyArr[0] + '已经成功关闭';
                break;
              }
              case '4001': {
                // content = '接口' + standbyArr[0] + '关闭失败';
                break;
              }
              case '5001': {
                content = '服务器发生未知错误';
                break;
              }
            }
          }
        })
        // console.log('选择取消')
        standbyArr.shift();
        longTimeStandby.call(that, standbyArr);
      }
    }
  })
}

module.exports = {
  formatTime: formatTime,
  getCurrentTime: getCurrentTime,
  formatNumber: formatNumber,
  dateChoiceInit: dateChoiceInit,
  dateChoiceRenew: dateChoiceRenew,
  webSocketUtil: webSocketUtil,
  formatSendTime: formatSendTime,
  realDataHandle: realDataHandle,
  initChart: initChart,
  renewEcharts: renewEcharts,
  longTimeStandby: longTimeStandby,
  switchStatus: switchStatus,
  powerEchartInit: powerEchartInit,
  powerDateRenew: powerDateRenew,
  predictDataRenew: predictDataRenew,
}