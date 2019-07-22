// pages/pageIndex/pageIndex.js
import * as Utils from '../../utils/util2.js';
import * as echarts from '../../ec-canvas/echarts';
const app = getApp();
let yearBase = 1990;
let years = [];
let currentDataModeArr = ['查看电流', '查看电压', '查看功率'],
  weeks = ['前第一周 ', '前第二周', '前第三周'];
const date = new Date();
let choiceDate = Utils.getCurrentTime(date),
  choiceWeek = weeks[0],
  choiceMonth = date.getFullYear() + '-' + (date.getMonth() + 1);
/* 控制用电器开关的动画 */

Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 2,
    status: 0,  // 默认关闭
    indexName: '',
    statusActive: '',
    readMode: '',
    /* 切换实时数据和用电量查询的model */
    modeArray: [{
      name: '实时数据',
      className: 'mode-choiced'
    },
    {
      name: '用电量查询',
      className: ''
    }],
    mainArr: [{
      style: 'diplay: block'
    },
    {
      style: 'display: none'
    }],
    layerSelectArr: [{
      style: 'display: block'
    },
    {
      style: 'display: none'
    },
    {
      style: 'display: none'
    }],
    switchTranstion: '',
    timeMode: 'day',
    layerStyle: 'display: none',
    /* 时间容器 */
    years: [],
    months: [],
    days: [],
    weeks: weeks,
    /* 查询的日期 */
    choiceDate: choiceDate,
    choiceWeek: choiceWeek,
    choiceMonth: choiceMonth,
    timeChoiceMode: '按日期查询',
    choicedTime: choiceDate,
    /* 数据图表的对象容器 */
    /* 用电量echarts表格 */
    powerEc: {
      lazyload: true
    },
    currentEc: {
      lazyload: true
    },
    /* 实时更新echarts表格 */
    currentDataMode: '查看电流',
    currentEchart: null,
    timeArr: [],
    dataArr: [],
    isShowModel: false,
    chartsShow: 'isDisplay'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    const that = this;
    /* 更新所有需要当前时间的部件 */
    for (let i = yearBase; i <= date.getFullYear(); i++) {
      years.push(i);
    }
    this.setData({
      choiceDate: choiceDate,
      choiceWeek: choiceWeek,
      choiceMonth: choiceMonth,
      years: years
    });
    /* 初始化时间选择器 */
    Utils.dateChoiceInit.call(this);
    /* 初始化实时数据的图标 */
    that.ecComponent = that.selectComponent('#current-charts');
    that.ecComponent.init(Utils.initChart.bind(that))
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const that = this;
    Utils.webSocketUtil.connectSocket();
    wx.onSocketOpen(function () {
      wx.hideLoading();
      Utils.webSocketUtil.sendSocketMessage('"index":' + that.data.index);
    });
    wx.onSocketMessage(function (res) {
      let response = JSON.parse(res.data);
      switch (response.status) {
        case '2000': {
          console.log(response.data)
          Utils.realDataHandle.call(that, response.data);
          if (that.data.isShowModel == false) {
            Utils.longTimeStandby.call(that, response.data.longAwaitList);
          }
          break;
        }
        case '5001': {
          break;
        }
      }

    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    Utils.webSocketUtil.closeSocket();
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 用电器开关进行切换的函数
   * 0代表断电
   * 1代表正常工作
   * 2代表故障
   * 3代表待机
   */
  switchStatus: function (event) {
    let status = event.currentTarget.dataset.status,
      content,
      index = this.data.index,
      key;
    if (status == 0 || status == 3) {
      content = '开启用电器';
      key = 1;
    } else if (status == 1 || status == 2) {
      content = '关闭用电器';
      key = 0;
    }
    wx.showModal({
      content: content,
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: app.globalUrlBase.url + '/device/controller',
            method: 'POST',
            dataType: 'json',
            data: {
              index: index,
              key: key
            },
            success: function (res) {
              switch (res.stauts) {
                case '2000': {
                  // Utils.switchStatus.call(this, status);
                  break;
                }
                case '4001': {
                  break;
                }
                case '5000': {
                  break;
                }
              }
            }
          });
        } else if (res.cancel) {

        }
      }
    })


  },

  /**
   * 切换查看数据模式的点击事件的函数
   */
  switchMode: function (event) {
    const that = this;
    let modeArr = this.data.modeArray,
      mainArr = this.data.mainArr;
    // console.log(typeof event.target.dataset.id)
    switch (event.target.dataset.id) {
      case 0: {
        modeArr[0].className = 'mode-choiced';
        modeArr[1].className = '';
        mainArr[0].style = 'display: block';
        mainArr[1].style = 'display: none';
        break;
      }
      case 1: {
        modeArr[0].className = '';
        modeArr[1].className = 'mode-choiced';
        mainArr[0].style = 'display: none';
        mainArr[1].style = 'display: block';
        /* 用电量查询页面的echarts表格的初始化 */
        setTimeout(function () {
          that.ecComponent = that.selectComponent('#powerEchart');
          that.ecComponent.init(Utils.powerEchartInit.bind(that))
        }, 10)
        break;
      }
    }
    this.setData({
      modeArray: modeArr,
      mainArr: mainArr
    })
  },

  /**
   * 时间选择器按钮
   */
  choiceTime: function () {
    let mode = this.data.timeMode,
      SelectStyleArr = this.data.layerSelectArr;
    for (let i = 0; i < 3; i++) {
      SelectStyleArr[i].style = 'display: none';
    }
    switch (mode) {
      case 'day': {
        SelectStyleArr[0].style = 'display: block';
        break;
      }
      case 'week': {
        SelectStyleArr[2].style = 'display: block';
        break;
      }
      case 'month': {
        SelectStyleArr[1].style = 'display: block';
        break;
      }
    }
    this.setData({
      layerStyle: 'display: block',
      layerSelectArr: SelectStyleArr,
      chartsShow: 'isNone'
    })
  },

  /**
   * 查询日期的选择器的选择更改监听函数，主要用于日期选择器中更改年/月后监听
   * 这里不能用来setData，因为毕竟不是最终结果，这只是每次改动，并且未点击确定
   */
  bindChangeDate: function (e) {
    const val = e.detail.value;
    Utils.dateChoiceRenew.call(this, val[0] + yearBase, val[1] + 1);
    choiceDate = Utils.formatTime(val[0] + yearBase, val[1] + 1, val[2] + 1);
  },

  bindChangeMonth: function (e) {
    const val = e.detail.value;
    Utils.dateChoiceRenew.call(this, val[0] + yearBase, val[1] + 1);
    choiceMonth = (val[0] + yearBase) + '-' + Utils.formatNumber(val[1] + 1);
  },

  bindChangeWeek: function (e) {
    const val = e.detail.value;

    choiceWeek = weeks[val[0]];
  },
  /**
   * 时间选择器选择结束后按取消或者确定,
   * 先判断是哪一种类型的，按周按月或者按日期
   * 然后直接修改显示区域的choiceTime
   * choiceWeek是在bindChange系列函数中修改过后选择的值
   */
  timeChoiced: function (event) {
    let newChoice;
    if (event.target.dataset.id == 'comfirm') {
      switch (this.data.timeMode) {
        case 'week': {
          newChoice = choiceWeek;
          break;
        }
        case 'month': {
          newChoice = choiceMonth;
          break;
        }
        case 'day': {
          newChoice = choiceDate;
          break;
        }
      }
      this.setData({
        choicedTime: newChoice,
        choiceDate: choiceDate,
        choiceMonth: choiceMonth,
        choiceWeek: choiceWeek
      });
    }
    this.setData({
      layerStyle: 'display: none',
      chartsShow: 'isDisplay'
    })
  },

  /**
   * 修改查询时间的模式：按周、按月、按日期
   */
  changeMode: function () {
    const that = this;
    let choiceArr = ['按月查询', '按周查询', '按日期查询'],
      mode = '',
      timeSelect = null;
    that.setData({
      chartsShow: 'isNone'
    })
    /* 这是选择时间的系统下面弹出的选择框，选择后会改变选择结果的data-mode属性，然后时间选择框的模式是根据data-mode来进行转换的 */
    wx.showActionSheet({
      itemList: choiceArr,
      success: function (res) {
        switch (res.tapIndex) {
          case 0: {
            mode = 'month';
            timeSelect = that.data.choiceMonth;
            break;
          }
          case 1: {
            mode = 'week';
            timeSelect = that.data.choiceWeek;
            break;
          }
          case 2: {
            mode = 'day';
            timeSelect = that.data.choiceDate;
            break;
          }
        }
        that.setData({
          timeMode: mode,
          timeChoiceMode: choiceArr[res.tapIndex],
          choicedTime: timeSelect,
          chartsShow: 'isDisplay'
        })
      },
      complete: function () {
        that.setData({
          chartsShow: 'isDisplay'
        })
      }
    })
  },

  /**
   * 修改查看实时更新的模式：电流、电压、功率
   * 
   */
  changeCurrentMode: function () {
    const that = this;
    let mode;
    wx.showActionSheet({
      itemList: currentDataModeArr,
      success: function (res) {
        switch (res.tapIndex) {
          case 0: {
            // 查看电流
            mode = '查看电流';
            break;
          }
          case 1: {
            // 查看电压
            mode = '查看电压';
            break;
          }
          case 2: {
            // 查看功率
            mode = '查看功率';
            break;
          }
        }
        that.setData({
          currentDataMode: mode,
          // currentEc: {
          //   onInit: Utils.initChart.bind(that)
          // }
        })
        /* 更新echarts组件的option */
        that.ecComponent = that.selectComponent('#current-charts');
        that.ecComponent.init(Utils.initChart.bind(that))
      }
    })
  },

  /**
   * request请求，请求查看用电量的请求
   */
  searchButton: function () {
    let choicedTime = this.data.choicedTime,
      timeMode = this.data.timeMode,
      jsonObj = {},
      that = this,
      startTime;
    /* 调用格式化传输时候的日期 */
    startTime = Utils.formatSendTime(choicedTime, timeMode);
    switch (timeMode) {
      case 'day': {
        jsonObj.key = 3;
        break;
      }
      case 'week': {
        jsonObj.key = 4;
        break;
      }
      case 'month': {
        jsonObj.key = 5;
        break;
      }
    }
    wx.showLoading({
      title: '正在加载中...',
      mask: true,
    })
    jsonObj.index = that.data.index;
    jsonObj.time = startTime;
    wx.request({
      url: app.globalUrlBase.url + '/device/pastpowersum',
      dataType: 'json',
      method: 'POST',
      data: JSON.stringify(jsonObj),
      success: function (res) {
        wx.hideLoading();
        switch (res.data.status) {
          case '2000': {
            Utils.powerDateRenew.call(that, res.data.data);
            // 数据显示
            break;
          }
          case '4001': {
            break;
          }
          case '5000': {
            break;
          }
        }
      }
    })
  },

  /**
   * 预测当天的数据
   */
  predictPower: function () {
    const that = this;
    let jsonObj = {};
    jsonObj.index = that.data.index;
    jsonObj.time = Utils.getCurrentTime();
    wx.showLoading({
      title: '正在加载',
      mask: true
    })
    wx.request({
      url: app.globalUrlBase.url + '/predicted/nowpowersum',
      dataType: 'json',
      method: 'POST',
      data: JSON.stringify(jsonObj),
      success: function (res) {
        wx.hideLoading();
        switch (res.data.status) {
          case '2000': {
            Utils.predictDataRenew.call(that, res.data.data);
            // 数据显示
            break;
          }
          case '4001': {
            break;
          }
          case '5000': {
            break;
          }
        }
      }
    })
  }
})