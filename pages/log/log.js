// pages/log/log.js
import * as Utils from '../../utils/indexUtil.js';
import * as infoUtil from '../../utils/infoUtil.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    logs: [
      {
        deviceName: '打印机',
        deviceTime: ['2018-10-18', '20:22:30'],
        deviceReason: '长得壮的撒噶啥',
      },
    ],
    portArr: [],
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

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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
  pageInit() {
    if (app.currentPort == null) {
      return ;
    }
    let jsonObj = {
      index: app.currentPort
    },
    i,
    postReq = new infoUtil.PostRequest('/actiondevice/querydevicelog', jsonObj);
    this.data.portArr = app.portArr;
    let infoArr = [];
    postReq.sendRequest((res) => {
      if (res.status == 2000) {
        for (let item in res.data.data.deviceLogList) {
          let timeArr = item.deviceTime.split(' ');
          item.deviceTime = timeArr
          infoArr.push(item)
        }
      }
    })
    
  }
})