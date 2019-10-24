// pages/option/option.js
const app = getApp();
import * as Utils from '../../utils/indexUtil.js';
import * as infoUtil from '../../utils/infoUtil.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    port: {
      index: '',
      name: '',
      workPower: '',
      standbyPower: '',
      autoStatus: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      'port.index': options.index,
      'port.name': options.name
    })
    this.initPage(options.index, options.name)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.initPage(this.data.port.index, this.data.port.name);
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
  /**
   * 设置自动关闭的按钮
   */
  autoClose() {
    let status = this.data.port.autoStatus;
    this.setData({
      'port.autoStatus': !status,
    })
  },
  /**
   * 输入集中处理事件
   */
  optionInput(event) {
    let name = event.target.dataset.name,
        value = event.detail.value;
    switch(name) {
      case 'name': {
        this.setData({
          'port.name': value,
        })
        break;
      }
      case 'workPower': {
        this.setData({
          'port.workPower': value,
        })
        break;
      }
      case 'standbyPower': {
        this.setData({
          'port.standbyPower': value,
        })
        break;
      }
    }
  },
  changeSubmit(event) {
    const port = this.data.port;
    let button = event.target.dataset.button;
    if (button == 0) {
      wx.switchTab({
        url: '../index/index',
      })
    } else if (button == 1) {
      let nameObj = {
        index: parseInt(port.index),
        name: port.name
      };
      let postReqName = new infoUtil.PostRequest('/actiondevice/updatedevicename', nameObj);
      postReqName.sendRequest((res) => {
        wx.showToast({
          title: '修改成功',
        });
        wx.switchTab({
          url: '../index/index',
        })
      })
      // let jsonObj = {
      //   index: port.index,
      //   deviceInfo: {
      //     deviceIndex: parseInt(port.index),
      //     deviceWorkPower: parseFloat(port.workPower),
      //     deviceStandbyPower: parseFloat(port.standbyPower),
      //     autoClose: port.autoStatus ? 1 : 0,
      //   },
      // },
      // postReq = new infoUtil.PostRequest('/actiondevice/updatedeviceinfo', jsonObj);
      // postReq.sendRequest((res) => {
      //   switch (res.data.status) {
      //     case '2000': {
      //       wx.showToast({
      //         title: '修改成功',
      //       });
      //       setTimeout(() => {
      //         wx.switchTab({
      //           url: '../index/index',
      //         })
      //       }, 1000);
      //       break;
      //     }
      //   }
      // }, (error) => {

      // })
    }
  },
  deletePort() {
    const port = this.data.port;
    wx.showModal({
      content: '是否删除该设备',
      showCancel: true,
      success(res) {
        if (res.confirm) {
          let jsonObj = {
            "index": port.index,
          },
          postReq = new infoUtil.PostRequest('/actiondevice/deldevice', jsonObj);
          postReq.sendRequest((res) => {
            switch(res.data.status) {
              case 2000: {
                wx.showToast({
                  title: '删除成功',
                });
                setTimeout(() => {
                  wx.switchTab({
                    url: '../index/index',
                  })
                }, 1000);
                break;
             }
             default: {
                wx.showToast({
                  title: '删除失败',
                });
             }
            }
          }, () => {

          })
        }
      },
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  initPage(index, name) {
    console.log(index)
    let jsonObj = {
          index: parseInt(index),
        },
        PostReq = new infoUtil.PostRequest('/actiondevice/querydeviceinfo', jsonObj);
    const that = this;
    PostReq.sendRequest( (res) => {
      switch(res.data.status) {
        case '2000': {
          let data = res.data.data.deviceInfo;
          that.setData({
            'port.name': name,
            // 'port.workPower': data.deviceWorkPower,
            // 'port.standbyPower': data.deviceStandbyPower,
            'port.autoStatus': data.autoClose == 1 ? true : false,
          });
          break;
        }
      }
    }, () => {

    })
  }
})