// pages/login/login.js
import * as infoUtil from '../../utils/infoUtil.js';
const app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    mode: {
      login: true,
      regist: false,
    },
    login: {
      passwordMode: {
        active: true,
        account: '',
        password: '',
      },
      phoneMode: {
        active: false,
        account: '',
        idenCode: '',
        codeMes: '获取验证码'
      },
    },
    regist: {
      account: '',
      password: '',
      idenCode: '',
      codeMes: '获取验证码'
    }
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
    const that = this;
    wx.getStorage({
      key: 'account',
      success: function(res) {
        that.setData({
          'login.passwordMode.account': res.data,
          'login.phoneMode.account': res.data
        });
      },
    });
    wx.getStorage({
      key: 'password',
      success: function (res) {
        that.setData({
          'login.passwordMode.password': res.data,
        });
      },
    });
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
   * 切换登录或者注册
   * 1. login 切换为登陆
   * 2. regist 切换为注册
   */
  switchMode(event) {
    let mode = event.target.dataset.id;
    if (mode == '1') {
      this.setData({
        mode: {
          login: true,
          regist: false,
        }
      })
    } else {
      this.setData({
        mode: {
          login: false,
          regist: true,
        }
      })
    }
  },
  setFromData(event) {
    let mode = event.target.dataset.mode,
        name = event.target.dataset.name,
        value = event.detail.value;
    switch(mode) {
      case '1': {
        if (name == 'account') {
          this.setData({
            'login.phoneMode.account': value
          })
        } else {
          this.setData({
            'login.phoneMode.idenCode': value
          })
        }
        break;
      }
      case '2': {
        if (name == 'account') {
          this.setData({
            'login.passwordMode.account': value
          })
        } else {
          this.setData({
            'login.passwordMode.password': value
          })
        }
        break;
      }
      case '3': {
        switch(name) {
          case 'account': {
            this.setData({
              'regist.account': value
            })
            break;
          }
          case 'password': {
            this.setData({
              'regist.password': value
            })
            break;
          }
          case 'code': {
            this.setData({
              'regist.idenCode': value
            })
            break;
          }
        }
        break;
      }
    }
  },
  switchLoginMode(event) {
    let mode = event.target.dataset.mode;
    if (mode == '1') {
      this.setData({
        'login.passwordMode.active': true,
        'login.phoneMode.active': false,
      })
    } else {
      this.setData({
        'login.passwordMode.active': false,
        'login.phoneMode.active': true,
      })
    }
  },
  submitCodeLogin() {
    let data = this.data.login.phoneMode,
        jsonObj,
        postReq;
    switch(0) {
      case data.account.length: {
        wx.showModal({
          content: '请输入账号',
          showCancel: false
        })
        return;
      }
      case data.idenCode.length: {
        wx.showModal({
          content: '请输入验证码',
          showCancel: false
        })
        return;
      }
    }
    jsonObj = {
      checkCodeKey: data.idenCode,
      user: {
        userPhone: data.account
      }
    }
    postReq = new infoUtil.PostRequest('/user/loginsms', jsonObj, true);
    postReq.sendRequest((res) => {
      console.log(res)
      switch (res.data.status) {
        case '2000': {
          // wx.setStorage({
          //   key: 'cookie',
          //   data: res.header['Set-Cookie'],
          // });

          app.sessionID = res.header['x-auth-token'];

          wx.setStorage({
            key: 'account',
            data: data.account,
          })
          
          wx.switchTab({
            url: '../index/index'
          })
          break;
        }
      }
    }, () => {

    })
  },
  submitPasswordLogin() {
    let data = this.data.login.passwordMode,
        jsonObj,
        postReq;
    switch (0) {
      case data.account.length: {
        wx.showModal({
          content: '请输入账号',
          showCancel: false
        })
        return;
      }
      case data.password.length: {
        wx.showModal({
          content: '请输入密码',
          showCancel: false
        })
        return;
      }
    }
    jsonObj = {
      user: {
        userPhone: data.account,
        userPassword: data.password
      },
      checkCodeKey: data.idenCode
    }
    postReq = new infoUtil.PostRequest('/user/loginnormal', jsonObj, true);
    postReq.sendRequest((res) => {
      switch(res.data.status) {
        case '2000': {
          // wx.setStorage({
          //   key: 'cookie',
          //   data: res.header['Set-Cookie'],
          // });
          app.sessionID = res.header['x-auth-token'];

          wx.setStorage({
            key: 'account',
            data: data.account,
          })
          wx.setStorage({
            key: 'password',
            data: data.password,
          })

          wx.switchTab({
            url: '../index/index'
          })
          break;
        }
        case '4022': {
          wx.showModal({
            content: '密码错误',
            showCancel: false,
          })
          break;
        }
        
        case '4023': {
          wx.showModal({
            content: '账号未注册',
            showCancel: false
          })
          break;
        }
        default: {
          wx.showModal({
            content: '请检查账号或者密码',
            showCancel: false
          })
          break;
        }
      }
    }, () => {

    });
  },
  submitRegist() {
    let data = this.data.regist,
        jsonObj,
        postReq;
    switch(0) {
      case data.account.length: {
        wx.showModal({
          content: '账号长度不能为0',
          showCancel: false
        })
        return ;
      }
      case data.password.length: {
        wx.showModal({
          content: '密码长度不能为0',
          showCancel: false
        })
        return ;
      }
      case data.idenCode.length: {
        wx.showModal({
          content: '请输入验证码',
          showCancel: false
        })
        return ;
      }
    }
    jsonObj = {
      checkCodeKey: data.idenCode,
      user: {
        userPhone: data.account,
        userPassword: data.password
      }
    }
    postReq = new infoUtil.PostRequest('/user/register', jsonObj, true);
    postReq.sendRequest((res) => {
      switch(res.data.status) {
        case '2000': {
          wx.showToast({
            title: '注册成功',
          });
          this.setData({
            login: true,
            regist: false
          })
          break;
        }
        case '4021': {
          wx.showModal({
            content: '该账号已经注册',
            showCancel: false,
          })
          break;
        }
        case 4024: {
          wx.showModal({
            content: '验证码过时',
            showCancel: false,
          })
          break;
        }
        default: {
          wx.showModal({
            content: '注册失败',
            showCancel: false,
          })
        }
      }
    }, () => {
       
    })
  },
  /**
   * 获取验证码函数
   * mode的值
   * 1. 登陆验证码
   * 2. 注册验证码
   */
  getIdenCode(event) {
    let mode = event.target.dataset.mode,
        postReq,
        jsonObj;
    switch(mode) {
      case '1': {
        let login = this.data.login;
        console.log(this)
        if (login.phoneMode.account.length != 11) {
          wx.showModal({
            content: '请输入正确的手机号码',
            showCancel: false,
          })
        }
        jsonObj = {
          checkCodeKey: 'LOGIN',
          user: {
            userPhone: login.phoneMode.account,
          }
        }
        postReq = new infoUtil.PostRequest('/user/sendcheckcode', jsonObj, true);
        postReq.sendRequest((res) => {
          switch(res.data.status) {
            case '2000': {
              let timeID,
                numbers = 60;
              timeID = setInterval(() => {
                numbers += 's';
                this.setData({
                  'login.phoneMode.codeMes': numbers,
                });
                numbers = (parseInt(numbers)) - 1;
                if (numbers <= 0) {
                  clearInterval(timeID);
                  this.setData({
                    'login.phoneMode.codeMes': '获取验证码',
                  });
                }
              }, 1000);
              break;
            }
            case 4024: {
              wx.showModal({
                content: '未发验证码或者验证码过时',
                showCancel: false,
              })
              this.setData({
                'login.phoneMode.codeMes': '获取验证码',
              });
              break;
            }
            case '5000': {

              break;
            }
          }
        }, () => {

        })
        break;
      }
      case '2': {
        let regist = this.data.regist,
            jsonObj,
            postReq;
        // console.log(regist)
        if (regist.account.length != 11) {
          wx.showModal({
            content: '请输入正确的手机号码',
            showCancel: false,
          })
        }
        jsonObj = {
          checkCodeKey: 'REGISTER',
          user: {
            userPhone: regist.account,
          }
        }
        postReq = new infoUtil.PostRequest('/user/sendcheckcode', jsonObj, true);
        postReq.sendRequest((res) => {
          switch(res.data.status) {
            case '2000': {
              let timeID,
                numbers = 60;
                timeID = setInterval(() => {
                numbers += 's';
                this.setData({
                  'regist.codeMes': numbers,
                });
                numbers = (parseInt(numbers)) - 1;
                if (numbers <= 0) {
                  clearInterval(timeID);
                  this.setData({
                    'regist.codeMes': '获取验证码',
                  });
                }
              }, 1000);
              break;
            }
            case 4024: {
              
              break;
            }
            case '5000': {
              
              break;
            }
          }
        }, () => {

        })
        break;
      }
    }
  },
  touristMode() {
    let data = this.data.login.passwordMode;
    let jsonObj = {
      user: {
        userPhone: "13570200438",
        userPassword: "11111111"
      },
      checkCodeKey: ""
    };
    let postReq = new infoUtil.PostRequest('/user/loginnormal', jsonObj, true);
    postReq.sendRequest((res) => {
      switch (res.data.status) {
        case '2000': {
          // wx.setStorage({
          //   key: 'cookie',
          //   data: res.header['Set-Cookie'],
          // });
          app.sessionID = res.header['x-auth-token'];

          wx.setStorage({
            key: 'account',
            data: data.account,
          })
          wx.setStorage({
            key: 'password',
            data: data.password,
          })

          wx.switchTab({
            url: '../index/index'
          })
          break;
        }
        case '4022': {
          wx.showModal({
            content: '密码错误',
            showCancel: false,
          })
          break;
        }

        case '4023': {
          wx.showModal({
            content: '账号未注册',
            showCancel: false
          })
          break;
        }
        default: {
          wx.showModal({
            content: '请检查账号或者密码',
            showCancel: false
          })
          break;
        }
      }
    }, () => {

    });
  }
})