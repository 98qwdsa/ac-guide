// src/pages/manage/taskProgress/taskProgress.js
const service = require('../../service.js');
let event_code = ''
const APP = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    tabs: [],
    currentTab: 0,
    allUserList: [],
    myObserverList: [],
    stepList: [],
    curStep: 0,
    eventDetail: {},
    observerList: [],
    showMyevent: true
  },
  userList: [],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.name
    });
    event_code = options.code;
    this.initTabs(options).then(data => {
    })
  },
  initTabs(data) {
    return new Promise((reslove, reject) => {
      service.getPowerRole(['role']).then(data => {
        let tabs = data.role.filter(e => {
          if (APP.globalData.userInfo.role.includes(e.code)) {
            return { ...e
            }
          }
        })
        let showMyevent = false
        if (tabs.length === 1 && tabs[0].code === 'Participant') {
          showMyevent = true
        }
        this.setData({
          tabs,
          showMyevent,
          currentTab: data.currentTab || 0
        })
        this.switchTab(0)
      })
    })
  },
  switchTab(e) {
    let currentTab = e
    if (typeof(e) === 'object') {
      currentTab = e.currentTarget.id;
    }

    this.setData({
      currentTab
    });
    if (currentTab == 0) {
      this.loadMyData();
    } else if (currentTab == 1) {
      this.loadMyObserver();
    } else if (currentTab == 2) {
      this.loadAllUserForEvent();
    }
  },
  loadMyData() {
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    if (reloadTrigger.left === false) {
      return;
    }
    wx.showLoading({
      mask: true,
    })
    service.getSelfEventStep(event_code).then(data => {
      const stepList = [...data.steps];
      let curStep = 0;
      let eventFinished = false;
      stepList.forEach((e, k) => {
        if (e.user_step && e.user_step.status_code === 100) {
          curStep = k + 1;
          if (curStep == stepList.length) {
            eventFinished = true;
            curStep--;
          }
        }
      });
      this.setData({
        stepList,
        curStep,
        eventFinished,
        eventDetail: data.detail
      });
      wx.hideLoading();
      reloadTrigger.left = false;
    }, (e) => {

    })
  },
  nextStep: function(e) {
    wx.showLoading({
      mask: true
    })
    const dataSet = e.detail;
    service.nextStep(event_code, dataSet._id, dataSet.lastStep).then(data => {
      wx.hideLoading();
      wx.showToast({
        icon: 'success',
        duration: 1200
      })
      if (data) {
        const stepList = [...this.data.stepList]

        let eventFinished = false;
        let curStep = this.data.curStep;

        stepList[curStep].user_step = data;
        curStep += 1;
        if (curStep == stepList.length) {
          eventFinished = true;
        }
        this.setData({
          eventFinished,
          curStep,
          stepList
        })
      }
    })
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    reloadTrigger.right = true;
    reloadTrigger.mid = true;
  },
  loadAllUserForEvent() {
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    if (reloadTrigger.right === false) {
      return;
    }
    wx.showLoading({
      mask: true,
    })
    service.getQueryAllUserEventDetail({
      code: event_code
    }).then(allUser => {
      wx.hideLoading();
      reloadTrigger.right = false
      this.setData({
        allUserList: allUser.data
      });
      if (this.data.allUserList.length) {
        this.loadfollowerList('allUserList');
      }
    }, (error) => {
      if (error.code === '2000') {
        wx.showToast({
          title: '角色不匹配',
          icon: 'none',
          duration: 2000
        })
      } else if (error.code === '2001' || error.code === '2002' || error.code === '2003') {
        wx.showToast({
          title: '该事件还没有参与者',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  loadMyObserver() {
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    if (reloadTrigger.mid === false) {
      return;
    }
    wx.showLoading({
      mask: true,
    })
    service.getQueryObserverEventDetail({
      code: event_code
    }).then(observer => {
      this.setData({
        myObserverList: observer.data
      });
      wx.hideLoading();
      reloadTrigger.mid = false;
      if (this.data.myObserverList.length) {
        this.loadfollowerList('myObserverList');
      }
    }, (error) => {
      if (error.code === '2001') {
        wx.showToast({
          title: '角色不匹配',
          icon: 'none',
          duration: 2000
        })
      } else if (error.code === '2000') {
        wx.showToast({
          title: '没有关注的用户',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  addObserverForUser(e) {
    wx.navigateTo({
      url: 'allObserver/allObserver?code=' + event_code +
        '&observed=' + e.currentTarget.dataset.observed,
    })
  },
  loadUserObserver(observed_open_id) {
    return new Promise((reslove, reject) => {
      service.getUserObserver({
        code: event_code,
        observered_open_id: observed_open_id
      }).then(observerList => {
        reslove(observerList);
      });
    })
  },
  loadfollowerList(userListType) {
    const userList = [...this.data[userListType]]
    userList.forEach((e, key) => {
      this.loadUserObserver(e.open_id).then(followerList => {
        let newUserList = [...this.data[userListType]]
        newUserList.splice(key, 1, {
          ...newUserList[key],
          followerList: followerList.map(e => e.name)
        })
        this.setData({
          [userListType]: newUserList
        })
      }, (error) => {
        if (error.code === '2001') {
          wx.showToast({
            title: '没有关注的用户',
            icon: 'none',
            duration: 2000
          })
        }
      })
    });
  },
  cancelObserverForMyself(e) {
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否取消关注',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '取消关注中...',
            mask: true
          })
          let data = {
            code: event_code,
            observed_open_id: e.currentTarget.dataset.observed,
            action: 'cancel'
          };
          service.editObserverForUser(data).then(() => {
            wx.hideLoading();
            let newObserverList = _this.data.myObserverList;
            for (let i in newObserverList) {
              if (e.currentTarget.dataset.observed === newObserverList[i]['open_id']) {
                newObserverList.splice(i, 1)
              }
            }
            _this.setData({
              myObserverList: newObserverList,
            })
          })
          let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
          reloadTrigger.right = true;
          reloadTrigger.mid = true;
        } else if (res.cancel) {

        }
      }
    })




  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    if (reloadTrigger.mid === true && this.data.currentTab === '1' &&
      this.data.myObserverList.length) {
      this.loadfollowerList('myObserverList');
    }
    if (reloadTrigger.right === true && this.data.currentTab === '2' &&
      this.data.allUserList.length) {
      this.loadfollowerList('allUserList');
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    reloadTrigger.left = true;
    reloadTrigger.mid = true;
    reloadTrigger.right = true;
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})