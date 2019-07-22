import * as echarts from '../ec-canvas/echarts';
import * as model from './echats.js';
import { realEchartsOption, powerEchartOption } from './echats'

let realTimeModel = null,
    realTimeChart = null,
    powerChart = null,
    powerModel = null;
/**
 * 得到当前时间
 */
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
/**
 * 将时间规范化
 */
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
  return [months, days];
}

/**
 * 日期初始化函数
 */
function dateChoiceInit() {
  const currentTime = new Date();
  let year = currentTime.getFullYear(),
      month = currentTime.getMonth() + 1,
      day = currentTime.getDate(),
      timeArr,
      years = [];
  for (let i = 1990; i <= year; i++) {
    years.push(i);
  }
  timeArr = dateChoiceRenew.bind(this, year, month)();
  this.setData({
    'getData.timeSelect[0].years': years,
    'getData.timeSelect[0].months': timeArr[0],
    'getData.timeSelect[0].days': timeArr[1],
    'getData.timeSelect[0].choicedTime': formatTime(year, month, day),
    'getData.timeSelect[0].tempTime': formatTime(year, month, day),
    'getData.timeSelect[1].years': years,
    'getData.timeSelect[1].months': timeArr[0],
    'getData.timeSelect[1].choicedTime': formatNumber(year) + '-' + formatNumber(month),
    'getData.timeSelect[1].tempTime': formatNumber(year) + '-' + formatNumber(month),
    'getData.time': formatTime(year, month, day),
  })
  /**
   * 分开setData的原因是上面的更新日期同时更新这个value，则是同步进行的，即只不会初始化日期选择器
   */
  this.setData({
    'getData.initValue': [year - 1990, month - 1, day - 1]
  })
}

/**
 * 改变echarts的格式
 * 1. 实时更新数据，其中需要更改的有查看电流、电压、功率三者之一
 * 2. 查看过去用电量
 * 3. 预测未来用电量
 */
// function changeEcharts(mode) {
//   switch(mode) {
//     case 1: {
//       currentModel = model.realEchartsOption;
//       break;
//     }
//     case 2: {
//       currentModel = model.powerEchartOption;
//       break;
//     }
//     case 3: {
//       currentModel = model.powerEchartOption;
//       break;
//     }
//     echartInit();
//   }
// }

function realTimeEchartInit(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  let option = model.realEchartsOption();
  // name 是什么
  // console.log(option)
  option.legend.data[0] = '123';
  option.series[0].name = '123123';
  option.series[0].data = [];
  option.xAxis[0].data = [];
  if (realTimeChart != null) {
    realTimeChart.hideLoading();  // 将之前的showLoading去掉
  }
  realTimeModel = option;
  realTimeChart = chart;
  chart.setOption(option);
  return chart;
}

/**
 * 初始化用电量echart表格
 */
function powerEchartInit(canvas, width, height) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);
  let option = model.powerEchartOption();
  powerChart = chart;
  if (powerChart != null) {
    powerChart.hideLoading();  // 将之前的showLoading去掉
  }
  powerModel = option;
  powerChart = chart;
  // utilPowerEchart = chart;
  // chart.showLoading();
  chart.setOption(option);
  return chart;
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
  if (realTimeChart != null) {
    realTimeChart.showLoading();  // 将之前的showLoading去掉
  }
  renewEcharts.call(that, data);
  // switch (data.status) {
  //   case 0: {
  //     status = '断电';
  //     break;
  //   }
  //   case 1: {
  //     status = '待机';
  //     break;
  //   }
  //   case 2: {
  //     status = '工作';
  //     break;
  //   }
  //   case 3: {
  //     status = '故障';
  //     break;
  //   }
  // }
  // that.setData({
  //   'power.active': false,
  // });
  // 更新用电器状态
  // switchStatus.call(that, data.status);
}



/**
 * 实时更新echarts表格
 */
function renewEcharts(data) {
  // if (realTimeEchart == null) {
  //   setTimeout(realTimeEchart.bind(this, data), 200);
  //   return;
  // }
  data = data.data
  let currentData = this.data;
  let option = realTimeModel,
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
  max = Math.ceil(max);
  console.log(option.yAxis)
  option.yAxis[0].max = max * 1.3;
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
  console.log(realTimeChart)
  realTimeChart.hideLoading();
  realTimeChart.setOption(option);
}

/**
 * 用电量查询更新函数
 * 1.
 */
function powerDateRenew(data) {
  const that = this;

  console.log('data', data)
  let option = powerModel, 
    max = 0,
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
  option.xAxis[0].data = timeArr;
  option.series[0].data = dataArr;
  
  max = Math.round(max * 100) / 100

  option.yAxis[0].max = (max * 1.5);
  powerChart.setOption(option);
}

function GetDateStr(AddDayCount) { 
  var dd = new Date();
  dd.setDate(dd.getDate()+AddDayCount);//获取AddDayCount天后的日期
  var y = dd.getFullYear(); 
  var m = (dd.getMonth()+1)<10?"0"+(dd.getMonth()+1):(dd.getMonth()+1);//获取当前月份的日期，不足10补0
  var d = dd.getDate()<10?"0"+dd.getDate():dd.getDate();//获取当前几号，不足10补0
  return y+"-"+m+"-"+d; 
}

module.exports = {
  GetDateStr,
  dateChoiceInit,
  dateChoiceRenew,
  getCurrentTime,
  formatTime,
  formatNumber,
  realDataHandle,
  realTimeEchartInit,
  powerEchartInit,
  powerDateRenew,
}