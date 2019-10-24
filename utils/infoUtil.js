// 得到app对象
const app = getApp();
/**
 * super类，创建的时候会保存一些内部值，为以下
 * 1. baseUrl、url：保存着请求地址，一般baseUrl是不变的
 * 2. method：初始化为空
 * 3. data：初始化为空
 * 以及对这些值的set方法
 */
class Request {
  constructor() {
    // if (new.target === 'Request') {
    //   throw (new Error('super Class can not be construct!'));
    //   return null;
    // }
    this.baseUrl = app.globalUrlBase.url;
    this.data = {};
  }

  set setData(jsonObj) {
    this.data = jsonObj;
  }

  set setUrl(url) {
    this.url = url;
  }

  set setBaseUrl(baseUrl) {
    this.baseUrl = baseUrl;
  }

  sendRequest(success, fail) {
    const that = this;
    let header;
    // if (app.sessionID.length == 0 && this.login == false) {
    //   wx.navigateTo({
    //     url: '../login/login',
    //   })
    // }
    // console.log(app.sessionID);
    console.log(app.sessionID);
    if (app.sessionID.length != 0) {
      header = { 'x-auth-token': app.sessionID };
    } else {
      
    }
    wx.request({
      url: that.baseUrl + that.url,
      header: header,
      data: that.data,
      method: that.method,
      success: success,
      fail: fail,
    });
  }
}

class PostRequest extends Request {
  constructor(url, jsonObj = {}, login = false) {
    super();
    this.url = url;
    this.data = jsonObj;
    this.method = 'post';
    this.login = login;
  }
}

class GetRequest extends Request {
  constructor(url, jsonObj = {}) {
    super();
    this.url = url;
    this.data = null;
    this.method = 'get';
  }
}

class Socket {
  constructor(url) {
    const that = this;
    this.socketTask = null;
    this.url = app.globalUrlBase.wss + url;
    this.isOpen = false;
    this.isCallback = true;
    // this.socketTask = 
  }

  connectSocket(jsonObj = {}, other, fn) {
    const that = this;

    this.socketTask = wx.connectSocket({
      url: that.url + '?x-auth-token=' + app.sessionID,
      success: function () {
        wx.hideLoading();
        console.log('socket已经开启了');
        setTimeout(() => {
          that.socketTask.onOpen(() => {
            that.isOpen = true;
            console.log('发送数据', jsonObj)
            that.socketTask.send({
              data: JSON.stringify(jsonObj),
              success(res) {
                console.log(res);
              }
            })
          })
          that.socketTask.onMessage((res) => {
            res = JSON.parse(res.data);
            console.log(res)
            // if (res.data.status == 2 || res.data.status == 1) {
            //   if (other.data.power.active == false) {
            //     other.setData({
            //       'power.active': true,
            //     })
            //   }
            // }
            // if (res.data.status == 0 || res.data.status == 3) {
            //   if (other.data.power.active == true) {
            //     other.setData({
            //       'power.active': false,
            //     })
            //   }
            // }
            if (res.data.device.stop == 1) {
              other.setData({
                'power.active': true
              })
            } else {
              other.setData({
                'power.active': false
              })
            }

            let keys = Object.keys(res.data.deviceStatus);

            for (let j = 0; j < keys.length; j++) {
              for (let i = 0; i < other.data.ports.length; i++) {
                if (other.data.ports[i].index == keys[j]) {
                  switch(res.data.deviceStatus[keys[j]]) {
                    case 0: {
                      other.data.ports[i].status = '断电';
                      break;
                    }
                    case 1: {
                      other.data.ports[i].status = '待机';
                      break;
                    }
                    case 2: {
                      other.data.ports[i].status = '工作';
                      break;
                    }
                    case 3: {
                      other.data.ports[i].status = '故障';
                      break;
                    }
                  }
                }
              }
            }
            
            other.setData({
              ports: other.data.ports
            })

            if (that.isCallback == true) {
              fn.call(other, res);
            }

            for (let i = 0; i < other.data.ports.length; i++) {
              if (other.data.ports[i].index == res.data.device.index) {
                other.data.ports[i].name = res.data.device.name
                other.setData({
                  ports: other.data.ports,
                  currentName: other.data.ports[i].name
                })
              }
            }
          });
        }, 0)
        
        
      }
    });
  }

  cancelCallback(that) {
    this.isCallback = false;
  }

  openCallback() {
    this.isCallback = true;
  }

  sendMessage(jsonObj = {}) {
    if (this.isOpen == false) {
      // 还没开启
      return ;
    }
    console.log('发送数据', jsonObj)
    this.socketTask.send({
      data: JSON.stringify(jsonObj),
      success(res) {
        console.log(res);
      }
    })
    // wx.sendSocketMessage()
  }

  closeSocket() {
    // if (this.isOpen == false) {
    //   // 还没开启
    //   return ;
    // }
    wx.closeSocket({
      success: function () {
        console.log('socket已经关闭')
      }
    })
  }

  onMessageReady(that, fn) {
    
  }
}


/**
 * 本地保存登陆账号模式，保存数据的对象
 */
class LoginStorage {
  constructor() {
  }
  setStorage(account, password) {
    wx.setStorage({
      key: 'account',
      data: account,
    });
    wx.setStorage({
      key: 'password',
      data: password,
    })
  }
  getStorage() {
    let account, password;
    wx.getStorage({
      key: 'account',
      success: function (res) {
        account = res;
      },
    })
    wx.getStorage({
      key: 'password',
      success: function (res) {
        password = res;
      },
    })
    return [account, password];
  }
}

/**
 * 端口对象
 */
class Port {
  constructor(index, name = '', active = false, status = '') {
    this.name = name;
    this.active = active;
    this.status = status;
    this.index = index;
  }

  getPort() {
    return {
      name: this.name,
      active: this.active,
      status: this.status,
      index: this.index
    }
  }
}

module.exports = {
  GetRequest,
  PostRequest,
  LoginStorage,
  Port,
  Socket,
}
