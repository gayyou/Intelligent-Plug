// pages/index/index.js
import * as Utils from '../../utils/indexUtil.js';
import * as infoUtil from '../../utils/infoUtil.js';
const yearBase = 1990;
const app = getApp();


Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentName: '',
    timeArr: [],
    dataArr: [],
    section: {
      left: true,
      direction: '<'
    },
    power: {
      active: false
    },
    ports: [

    ],
    currentPort: 1,
    /**
     * 解释一下这个getData的机制
     * 1.由于这个是三级联动，则第一个需要选择模式，模式有三个，由mode控制，
     * 2.当选定mode时候，第二个选择器则会更新timeMode的对应mode下标的数组。进行更新
     * 3.第二个选择的话，则是method的事情，method代表着timeMode中某个数组所选择的下标，
     * （目前可供选择的只有查看过去数据），根据method下标进行判断方式
     */
    getData: {
      choiceLayer: false,
      initValue: [],
      mode: 0,
      method: 0,
      modeName: ['过去', '实时更新', '预测'],
      timeMode: [
        ['按日', '按月', '按周'],
        ['查看电压', '查看电流', '查看功率'],
        ['查看当天']
      ],
      time: '',
      // tempTime的作用则是来更新日期选择器的三级联动
      timeSelect: [
        {
          active: true,
          choicedTime: '',
          tempTime: '',
          years: [],
          months: [],
          days:[],
        },
        {
          active: false,
          choicedTime: '',
          tempTime: '',
          years: [],
          months: [],
        },
        {
          active: false,
          choicedTime: '一周前',
          tempTime: '一周前',
          weeks: ['一周前', '两周前', '三周前']
        }
      ]
    },
    addPort: {
      active: false,
      uid: '',
    },
    powerEc: {
      lazyload: true
    },
    currentChart: null,
    currentDataMode: '查看电压',
    currentMode: 1, // 0代表查看过去  1.实时更新  2为预测未来
    socket: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 当页面加载完毕的时候，率先初始化日期选择器
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let chart = Utils.powerEchartInit;
    Utils.dateChoiceInit.call(this);
    // 初始化页面数据
    this.initPage();
    if (app.sessionID.length == 0) {
      wx.navigateTo({
        url: '../login/login',
      })
    }
    this.ecComponent = this.selectComponent('#powerEchart');
    this.setData({
      currentChart: chart,
    })
    this.ecComponent.init(chart);
    
    // this.init();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!this.data.socket) return ;
    let socket = new infoUtil.Socket('/message');
    // socket.onMessageReady(this, Utils.realDataHandle);
    
    socket.connectSocket({
      index: parseInt(this.data.currentPort)
    }, this, Utils.realDataHandle);
    this.setData({
      socket
    });
    if (this.data.getData.mode != 1) {
      socket.cancelCallback();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.data.socket.closeSocket();
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
  /***
   * 切换侧边栏的开关
   */
  switchPanel() {
    if (this.data.section.left) {
      this.setData({
        'section.left': false,
        'section.direction': '>'
      })
    } else {
      this.setData({
        'section.left': true,
        'section.direction': '<'
      })
    }
    setTimeout(() => {
      this.ecComponent.init(this.data.currentChart);
      setTimeout(() => {
        this.searchData(this.data.currentMode)
      }, 1)
    }, 300);
    
  },
  /**
   * 切换电源开关
   */
  switchPower() {
    const that = this;
    const index = this.data.currentPort;
    if (this.data.power.active) {
      wx.showModal({
        content: '是否关闭该用电器',
        showCancel: true,
        success: (res) => {
          if (res.confirm) {
            let jsonObj,
                postReq;
            jsonObj = {
              index: index,
              key: 0 //1代表启动，0代表关闭
            }
            postReq = new infoUtil.PostRequest('/actiondevice/controller', jsonObj);
            postReq.sendRequest((res) => {
              console.log(res.data.status)
              switch(res.data.status) {
                case '2000': {
                  wx.showToast({
                    title: '正在关闭用电器...',
                  })
                  // that.setData({
                  //   'power.active': false
                  // });
                  break;
                }
                default: {
                  
                }
              }
            }, () => {

            })
          }
        }
      });
      
    } else {
      wx.showModal({
        content: '是否开启该用电器',
        success(res) {
          if (res.confirm) {
            let jsonObj,
                postReq;
            jsonObj = {
              index: index,
              key: 1 //1代表启动，0代表关闭
            };
            postReq = new infoUtil.PostRequest('/actiondevice/controller', jsonObj);
            postReq.sendRequest((res) => {
              console.log(res);
              switch(res.data.status) {
                case '2000': {
                  wx.showToast({
                    title: '正在开启用电器...',
                  })
                  // that.setData({
                  //   'power.active': true,
                  // })
                  break;
                }
              }
            }, () => {

            })
          }
        }
      })
    }
    },
    
  /**
   * 缺少向websocket传输当前端口号。
   */
  switchPort(event) {
    let i,
        datas = this.data.ports, 
        len = datas.length, 
        index = event.currentTarget.dataset.index;

    for (let j = 0; j < this.data.ports.length; j++) {
      this.data.ports[j].active = false;
    }
    
    for (i = 0; i < len; i++) {
      if (datas[i].index == index) {
        datas[i].active = true;
        this.setData({
          ports: datas,
          currentPort: index,
          currentName: datas[i].name
        })
        break;
      }
    }

    app.currentPort = index;

    this.setData({
      currentPort: index
    })

    // 然后发送请求实时更新数据的信息过去
    console.log(this.data)
    switch(this.data.currentMode) {
      case 1: {
        // 实时更新
        this.searchData(1)
        break;
      }
      case 2: {
        // 查看过去数据
        // console.log(this.data);
        // // 实时更新
        // if (this.data.socket != null) {
        //   this.data.socket.sendMessage({
        //     index
        //   })
        // } else {
        //   let socket = new infoUtil.Socket('message');
        //   this.setData({
        //     socket
        //   });
        //   socket.connectSocket({
        //     index
        //   })
        // }
        this.searchData(2)
        break;
      }
      case 3: {
        // 预测未来
        this.searchData(3)
        break;
      }
    }
  },
  /**
   * 跳转到账号设置页面
   */
  toUserOption() {
    wx.navigateTo({
      url: '../changeInfo/changeInfo',
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  toPortOption() {
    wx.navigateTo({
      url: '../option/option?index=' + this.data.currentPort + '&name=' + this.data.currentName,
      success(res) {
        console.log(res);
      },
      fail(res) {
        console.log(res)
      }
    })
  },
  /**
   * 查询日期的选择器的选择更改监听函数，主要用于日期选择器中更改年/月后监听
   * 这里不能用来setData，因为毕竟不是最终结果，这只是每次改动，并且未点击确定
   */
  bindChangeDate(e) {
    const val = e.detail.value;
    let timeArr, choiceTime;
    timeArr = Utils.dateChoiceRenew.call(this, val[0] + yearBase, val[1] + 1);
    choiceTime = Utils.formatTime(val[0] + yearBase, val[1] + 1, val[2] + 1);
    this.setData({
      'getData.timeSelect[0].months': timeArr[0],
      'getData.timeSelect[0].days': timeArr[1],
      'getData.timeSelect[0].tempTime': choiceTime,
    })
  },

  bindChangeMonth(e) {
    const val = e.detail.value;
    let timeArr, choiceTime;
    timeArr = Utils.dateChoiceRenew.call(this, val[0] + yearBase, val[1] + 1);
    choiceTime = (val[0] + yearBase) + '-' + Utils.formatNumber(val[1] + 1);
    this.setData({
      'getData.timeSelect[1].months': timeArr[0],
      'getData.timeSelect[1].tempTime': choiceTime,
    })
    
  },

  bindChangeWeek(e) {
    const val = e.detail.value;
    let choiceTime = this.data.getData.timeSelect[2].weeks[val[0]];
    this.setData({
      'getData.timeSelect[2].tempTime': choiceTime,
    })
  },
  /**
   * 日期选择器选择
   */
  selectButton(event) {
    let button = event.target.dataset.id,
        option = this.data.getData;
    this.setData({
      isChoice: true
    })
    switch(button) {
      case 'cancel': {
        // 取消无任何操作
        this.setData({
          isChoice: false
        })
        break;
      }
      case 'comfirm': {
        let method = option.method;
        switch(method) {
          case 0: {
            option.time = option.timeSelect[0].tempTime;
            option.timeSelect[0].choicedTime = option.timeSelect[0].tempTime;
            break;
          }
          case 1: {
            option.time = option.timeSelect[1].tempTime;
            option.timeSelect[1].choicedTime = option.timeSelect[1].tempTime;
            break;
          }
          case 2: {
            option.time = option.timeSelect[2].tempTime;
            option.timeSelect[2].choicedTime = option.timeSelect[2].tempTime;
            break;
          }
        }
        this.setData({
          'getData.time': option.time
        });
        this.setData({
          isChoice: false
        })
        setTimeout(() => {
          this.searchData(1);
        }, 0)
        break;
      }
    }
    this.setData({
      'getData.choiceLayer': false
    });
  },
  /**
   * 展示时间选择框
   * 根据method进行展示不同的picker
   * 0.根据日期
   * 1.根据月份
   * 2.根据周
   */
  showSelect() {
    let option = this.data.getData,
        method = option.method,
        timeSelect = option.timeSelect;
    this.setData({
      isChoice: true
    })
    if (option.mode != 0) {
      return;
    }
    timeSelect[0].active = false;
    timeSelect[1].active = false;
    timeSelect[2].active = false;
    switch(method) {
      case 0: {
        timeSelect[0].active = true;
        break;
      }
      case 1: {
        timeSelect[1].active = true;
        break;
      }
      case 2: {
        timeSelect[2].active = true;
        break;
      }
    }
    this.setData({
      'getData.choiceLayer': true,
      'getData.timeSelect': timeSelect
    })
  },
  changeMethod(event) {
    const that = this;
    let data = this.data.getData;
    this.setData({
      isChoice: true
    })
    if (data.mode != 3) {
      // 当不为预测部分的时候这个功能才有效
      wx.showActionSheet({
        itemList: data.timeMode[data.mode],
        success: (res) => {
          this.setData({
            isChoice: false
          })
          let index = res.tapIndex;
          if (data.mode == 0) {
            this.setData({
              'getData.method': index,
              'getData.time': data.mode == 0 ? data.timeSelect[index].choicedTime : ''
            });
            setTimeout(() => {
              this.searchData(1)
            }, 1)
          } else {
            let arr = ['查看电压', '查看电流', '查看功率'];
            let timeArr = [], dataArr = [];
            if (index == this.data.getData.method) {
              timeArr = this.data.timeArr;
              dataArr = this.data.dataArr;
            }
            this.setData({
              timeArr,
              dataArr,
              currentDataMode: arr[index],
              'getData.method': index,
            })
          }
        },
        complete() {
          that.setData({
            isChoice: false
          })
        }
      })
    } else {
      setTimeout(() => {
        this.searchData(3)
      }, 1)
    }

  },
  changeMode(event) {
    const that = this;
    this.setData({
      isChoice: true
    })
    wx.showActionSheet({
      itemList: this.data.getData.modeName,
      success: (res) => {
        let index = res.tapIndex;
        // switch(index) {
        //   case 0: {
        //     this.setData({
        //       'getData.time': '',
        //     });
        //     that.ecComponent.init(Utils.powerEchartInit);
        //     console.log('达到这一步了，我这是过去的')
        //     break;
        //   }
        //   case 1: {
        //     this.setData({
        //       'getData.time': this.data.getData.timeSelect[this.data.getData.method].choicedTime
        //     });
        //     that.ecComponent.init(Utils.realTimeEchartInit);
        //     break;
        //   }
        //   case 2: {
        //     this.setData({
        //       'getData.time': this.data.getData.timeSelect[this.data.getData.method].choicedTime
        //     });
        //     that.ecComponent.init(Utils.powerEchartInit);
        //     break;
        //   }
        // }
        if (index != 0) {
          
        } else {
          
        }
        this.setData({
          'getData.mode': index,
          isChoice: false
        });
        switch(index) {
          case 0: {
            console.log('查看过去')
            this.setData({
              'getData.time': this.data.getData.timeSelect[this.data.getData.method].choicedTime,
              currentChart: Utils.powerEchartInit,
              currentMode: index + 1
            });
            that.ecComponent.init(Utils.powerEchartInit);
            that.searchData(1);
            
            break;
          }
          case 1: {
            console.log('实时更新')
            this.setData({
              'getData.time': '',
              currentChart: Utils.realTimeEchartInit,
              currentMode: index + 1
            });
            that.ecComponent.init(Utils.realTimeEchartInit);
            that.searchData(2);
            break;
          }
          case 2: {
            this.setData({
              'getData.time': '',
              currentChart: Utils.powerEchartInit,
              currentMode: index + 1
            });
            that.ecComponent.init(Utils.powerEchartInit);
            that.searchData(3);
            break;
          }
        }
      },
      complete() {
        that.setData({
          isChoice: false
        })
      }
    })
  },
  /**
   * 添加端口页面的按钮点击事件
   */
  addPortBtn(event) {
    let mode = event.target.dataset.mode;
    if (mode == 1) {
      // 请求增加端口
      let newPortID = this.data.addPort.uid,
          jsonObj = {
            uuid: newPortID
          },
        PostReq = new infoUtil.PostRequest('/actiondevice/adddevice', jsonObj);
          
      PostReq.sendRequest( (res) => {
        switch(res.data.status) {
          case '2000': {
            let portArr = [];
            
            for (let item in res.data.data.user.indexPrivilegeMap) {
              portArr.push({
                status: '未知',
                active: true,
                name: '',
                index: item,
                
              })
            }

            this.setData({
              ports: portArr
            })
            console.log(this)
                // data = res.data.data.user.indexPrivilegeMap;
                // len = res.data.data.user.indexPrivilegeMap.length;
            // for (i = 0; i < len; i++) {
            //   portArr.push(data[i])
            // }
            // console.log(res)
            break;
          }
        }
        this.setData({
          'addPort.active': false,
          isChoice: false
        })
      }, () => {

      });
    } else {
      this.setData({
        'addPort.active': false,
        isChoice: false
      })
    }
  },
  openAddPort() {
    this.setData({
      'addPort.active': true,
      isChoice: true
    })
  },
  inputUID(event) {
    this.setData({
      'addPort.uid': event.detail.value
    })
  },
  /**
   * 获得该用户的所有端口，用get请求
   */
  initPage() {
    let socket,
    postReq = new infoUtil.PostRequest('/querydevice/queryindex');
    postReq.sendRequest( (res) => {
      let isHaveDev = false;
      switch(res.data.status) {
        case '2000': {
          let portArr = res.data.data.user.indexPrivilegeMap,
              i;
          let arr = [];
          for (let item in portArr) {
            isHaveDev = true;
            let name = ''
            // name = res.data.data.device.name;
            arr.push({
              status: '未知',
              active: false,
              name: name,
              index: item
            })
          }
          
          if (isHaveDev) {
            setTimeout(() => {
              let newPorts = this.data.ports;
              newPorts[0].active = true;
              this.searchData(1);
              this.setData({
                currentPort: newPorts[0].index,
                currentName: newPorts[0].name,
                ports: newPorts
              })
              app.currentPort = newPorts[0].index;
            }, 1)
          }

          this.setData({
            ports: arr
          })
        
          // for (i = 0; i < portArr.length; i++) {
          //   this.data.ports.push(new infoUtil.Port(portArr[i]));
          // }
          break;
        }
      }
    }, (error) => {
      console.log(error)
    });
    socket = new infoUtil.Socket('/message');
    // socket.onMessageReady(this, Utils.realDataHandle);
    
    socket.connectSocket({
      index: parseInt(this.data.currentPort)
    }, this, Utils.realDataHandle);
    this.setData({
      socket
    });
    socket.cancelCallback(this);
  },
  // init() {
  //   this.ecComponent.init((canvas, width, height) => {
  //     // 获取组件的 canvas、width、height 后的回调函数
  //     // 在这里初始化图表
  //     const chart = echarts.init(canvas, null, {
  //       width: width,
  //       height: height
  //     });
  //     setOption(chart);

  //     // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
  //     this.chart = chart;

  //     this.setData({
  //       isLoaded: true,
  //       isDisposed: false
  //     });

  //     // 注意这里一定要返回 chart 实例，否则会影响事件处理等
  //     return chart;
  //   });
  // }
  /**
   * 更新echarts表格内的数据，
   * mode：
   * 1. 查看过去
   * 2. 实时更新
   * 3. 预测当天数据
   */
  searchData(mode) {
    let jsonObj,
        postReq,
        data = this.data;
    let time = data.getData.time
    switch(mode) {
      case 1: {
        let key;
        if (this.data.socket != null) {
          this.data.socket.cancelCallback(this)
          this.data.socket.sendMessage({
            index: parseInt(this.data.currentPort)
          });
        }
        switch(data.getData.timeMode[0][data.getData.method]) {
          case '按日': {
            key = 3;
            break;
          }
          case '按周': {
            console.log('time',time)
            switch(time) {
              case '一周前': {
                time = Utils.GetDateStr(-7)
                break;
              }
              case '两周前': {
                time = Utils.GetDateStr(-14)
                break;
              }
              case '三周前': {
                time = Utils.GetDateStr(-21)
                break;
              }
            }
            
            key = 4;
            break;
          }
          case '按月': {
            time += '-01'
            key = 5;
            break;
          }
          default: {
            console.log('mode没有处理好')
            return ;
          }
        }
        jsonObj = {
          "index": data.currentPort,
          "key": key, // 3天 4周 5月
          "time": time + ' 00:00:00' // 时间
        };
        postReq = new infoUtil.PostRequest('/querydevice/pastpowersum', jsonObj);
        postReq.sendRequest((res) => {
          switch(res.data.status) {
            case '2000': {
              console.log(res.data.data.powerSumList[0])
              if (res.data.data.powerSumList.length == 0) {
                wx.showToast({
                  title: '返回数据为空',
                })
                return ;
              }
              Utils.powerDateRenew(res.data.data);
              break;
            }
          }
        }, () => {

        })
        break;
      }
      case 2: {
        if (this.data.socket == null) {
          let socket = new infoUtil.Socket('/message');
          // socket.onMessageReady(this, Utils.realDataHandle);
          
          socket.connectSocket({
            index: parseInt(this.data.currentPort)
          }, this, Utils.realDataHandle);
          this.setData({
            socket
          });
        } else {
          this.data.socket.openCallback()
          this.data.socket.sendMessage({
            index: parseInt(this.data.currentPort)
          })
        }
        
        break;
      }
      case 3: {
        if (this.data.socket != null) {
          this.data.socket.cancelCallback(this)
          this.data.socket.sendMessage({
            index: parseInt(this.data.currentPort)
          });
          // this.setData({
          //   socket: null
          // })
        }
        jsonObj = {
          "index": this.data.currentPort, // 串口号
          "time": Utils.getCurrentTime()     // 当前日期
        };
        postReq = new infoUtil.PostRequest('/predicted/nowpowersum', jsonObj);
        postReq.sendRequest((res) => {
          switch(res.data.status) {
            case '2000': {
              console.log(123, res.data.data);
              
              // 预测数据
              let data = {};
              data.powerSumList = [res.data.data.powerSum]
              Utils.powerDateRenew(data)
              // Utils.predictDataRenew(res.data.data);
              break;
            }
          }
        }, () => {

        });
        break;
      }
    }
  }
});
