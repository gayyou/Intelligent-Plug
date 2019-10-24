// pages/log/log.js
import * as Utils from '../../utils/indexUtil.js';
import * as infoUtil from '../../utils/infoUtil.js';
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    portIndex: -1,
    logs: [
      {
        // deviceName: '打印机',
        // deviceTime: ['2018-10-18', '20:22:30'],
        // deviceReason: '长得壮的撒噶啥',
      },
    ],
    portArr: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    // this.setData({
    //   portIndex: parseInt(options.index)
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    // let jsonObj = {
    //   index: app.currentPort
    // }
    // postReq = new infoUtil.PostRequest('/actiondevice/querydevicelog', jsonObj);
    // postReq.sendRequest((res) => {
    //   switch (res.data.status) {
    //     case 2000: {
    //       this.setData({
    //         logs: res.data.deviceLogList
    //       })
    //       break;
    //     }
    //   }
    // })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.pageInit();
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
    const that = this;
    console.log("123")
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
      if (res.data.status == 2000) {
        let list = res.data.data.deviceLogList;
        for (let i = 0; i < list.length; i++) {
          let timeArr = list[i].deviceTime.split(' ');
          let name = list[i].deviceName;
          let reason = list[i].deviceReason;
          infoArr.push({
            deviceName: name,
            deviceTime: timeArr,
            deviceReason: reason,
          })
        }

        that.setData({
          logs: infoArr
        })
      }
    })
    
  }
})