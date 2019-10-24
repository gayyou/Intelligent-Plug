// pages/timeTask/timeTask.js
import * as infoUtil from '../../utils/infoUtil.js';
import * as util from '../../utils/util';

const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    taskList: [
      {
        port: "1",
        time: "19:00",
        info: "",
        active: true
      }
    ],
    isShow: false,
    display: {
      id: '',
      active: false
    },
    portArr: []
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
    let postReq = new infoUtil.PostRequest('/querydevice/queryindex');
    postReq.sendRequest( (res) => {
      switch(res.data.status) {
        case '2000': {
          let portArr = res.data.data.user.indexPrivilegeMap,
              i;
          let arr = [];
          let keys = Object.keys(portArr);
          for (let i = 0; i < keys.length; i++) {
            arr.push(keys[i])
          }

          this.setData({
            portArr: arr
          })
          break;
        }
      }
    }, (error) => {
      console.log(error)
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("请求端口")
    let head = null;
    const that = this;
    let header;
    if (app.sessionID.length != 0) {
      header = { 'x-auth-token': app.sessionID };
    }
    wx.request({
      url: app.globalUrlBase.url + '/actiondevice/listtiming',
      header: header,
      method: 'get',
      success(res) {
        if (res.data.status == 2000) {
          let list = [];
          let resList = res.data.data.timingList;
          // that.data.portArr = [];

          for (let i = 0; i < resList.length; i++) {
            let timeTemp = resList[i].time.split(' ')[1].split(':')[0] + ':' + resList[i].time.split(' ')[1].split(':')[1];
            list.push({
              port: resList[i].index,
              time: timeTemp,
              id: resList[i].id,
              active: resList[i].key == 1 ? true : false
            })
            // that.data.portArr.push(resList[i]);
          }

          that.setData({
            taskList: list,
            // portArr: that.data.portArr
          })
        }
      }
    })
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
  switchAutoClose(event) {
    let index = event.currentTarget.dataset.index;
    if (typeof index == "undefined") return ;
    index = parseInt(index);
    this.data.taskList[index].active = !this.data.taskList[index].active
    this.setData({
      taskList: this.data.taskList
    })
  },
  autoClose() {
    console.log("123")
    this.setData({
      "display.active": !this.data.display.active
    })
  },
  changeSubmit(event) {
    const that = this;
    let button = event.target.dataset.button;
    if (button == 0) {
      this.setData({
        isShow: false
      })
    } else {
      let jsonObj,
          postReq;
      let time = this.getHour();
      let date = '';
      console.log("time", time, this.data.display.time)
      date = time > this.data.display.time ? this.getTomorrow() : this.getToday();

      jsonObj = {
        index: parseInt(this.data.display.port),
        key: this.data.display.active ? 1 : 0,
        time: date + " " + this.data.display.time + ":00"
      }
      postReq = new infoUtil.PostRequest('/actiondevice/timing', jsonObj);
      postReq.sendRequest((res) => {
        wx.showToast({
          title: '增加成功',
        })
        that.setData({
          isShow: false
        });
        setTimeout(() => {
          that.onShow();
        }, 100)
        
        // switch(res.data.status) {
        //   case '2000': {
        //     wx.showToast({
        //       title: '增加成功',
        //     })
        //     that.setData({
        //       isShow: false
        //     });
            
        //     break;
        //   }
        //   default: {
            
        //   }
        // }
      }, () => {

      })
    }
  },
  choiceTask(event) {
    let index = parseInt(event.currentTarget.dataset.index);
    this.setData({
      display: this.data.taskList[index],
      isShow: true
    })
  },
  deletePort() {
    const that = this;
    let jsonObj,
        postReq;
    jsonObj = {
      "timing": {
        "id": parseInt(this.data.display.id)
      }
    }
    postReq = new infoUtil.PostRequest('/actiondevice/deltiming', jsonObj);
    postReq.sendRequest((res) => {
      switch(res.data.status) {
        case '2000': {
          wx.showToast({
            title: '删除成功',
          })
          that.setData({
            isShow: false
          });
          that.onShow();
          break;
        }
        default: {
          
        }
      }
    }, () => {

    })
  },
  changeTime(event) {
    const that = this;
    this.setData({
      "display.time": event.detail.value
    });
    let list = this.data.taskList;

    for (let i = 0; i < list.length; i++) {
      if (list[i].id == this.data.display.id) {
        list[i].time = event.detail.value
      }
    }
    this.setData({
      taskList: list
    })
  },
  changePort(event) {
    this.setData({
      "display.port": this.data.portArr[event.detail.value]
    });

    let list = this.data.taskList;

    for (let i = 0; i < list.length; i++) {
      if (list[i].id == this.data.display.id) {
        list[i].port = event.detail.value
      }
    }

    this.setData({
      taskList: list
    })
  },
  getTomorrow() {
    var day3 = new Date();
    day3.setTime(day3.getTime() + 24 * 60 * 60 * 1000);

    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    var s3 = [day3.getFullYear(), day3.getMonth() + 1, day3.getDate()].map(formatNumber).join('-');
    
    return s3;
  },
  getToday() {
    var day3 = new Date();
    day3.setTime(day3.getTime());

    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    var s3 = [day3.getFullYear(), day3.getMonth() + 1, day3.getDate()].map(formatNumber).join('-');

    return s3;
  },
  getHour() {
    var myDate = new Date();
    let h =myDate.getHours();
    let min = myDate.getMinutes();

    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }

    return formatNumber(h) + ':' + formatNumber(min);
  },
  addTask() {
    this.setData({
      isShow: true,
      display: {
        port: "",
        time: "00:00",
        info: "",
        active: false
      }
    });
  }
})