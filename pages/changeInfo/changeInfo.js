// pages/changeInfo/changeInfo.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {
      account: '',
      name: '',
      oldPassword: '',
      newPassword: '',
    },
    password: {
      oldIsShow: false,
      newIsShow: false,
    },
    show: '../../images/icons/password_out.png',
    hidden: '../../images/icons/password_hidden.png'
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
  changeSubmit(event) {
    let target = event.target,
        data = this.data.user;
    if (target.dataset.button == 0) {
      wx.navigateBack({
        delta: 1
      })
    } else {
      if (data.oldPassword.length != 0 || data.newPassword.length != 0) {
        if (data.oldPassword.length < 6 || data.newPassword.length < 6) {
          wx.showModal({
            content: '密码长度不能少于6',
            showCancel: false
          })
          return;
        }
      }
    }
  },
  switchPasswordMode(event) {
    let id = event.target.dataset.id;
    if (id == 1) {
      let show = this.data.password.oldIsShow;
      this.setData({
        'password.oldIsShow': !show,
      })
    } else {
      let show = this.data.password.newIsShow;
      this.setData({
        'password.newIsShow': !show
      })
    }
  },
  /**
   * 初始化页面
   */
  initPage() {
    
  }
})