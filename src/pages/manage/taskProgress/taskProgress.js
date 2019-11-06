// src/pages/manage/taskProgress/taskProgress.js
const service = require('../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: "tableft",
    allUserList: [],
    myObserverList: [],
    stepList: [],
    event_code: '',
    curStep: 0,
    eventDetail: {},
    observerList: []
  },
  userList: [],
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.eventname
    });
    this.data.event_code = options.code;
    this.loadMyData(options.code);
  },
  switchTab(e) {
    let currentTab = e.currentTarget.id;
    let event_code = this.data.event_code;

    this.setData({
      currentTab
    });
    if (currentTab == "tableft") {
      this.loadMyData(event_code);
    } else if (currentTab == "tabmiddle") {
      this.loadMyObserver(event_code);
    } else if (currentTab == "tabright") {
      this.loadAllUserForEvent(event_code);
    }
  },
  loadMyData(event_code) {
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
        event_code,
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
    const dataSet = e.detail.currentTarget.dataset;
    service.nextStep(this.data.event_code, dataSet.uid).then(data => {
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
    reloadTrigger.right === true;
    reloadTrigger.mid = true;
  },
  loadAllUserForEvent(event_code) {
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
      if(this.data.allUserList.length){
        this.loadfollowerList('allUserList');
      }
    }, (e) => {})
  },
  loadMyObserver(event_code) {
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
      if(this.data.myObserverList.length){
        this.loadfollowerList('myObserverList');
      }
    }, (e) => {
      console.log(e);
    })
  },
  addObserverForUser(e) {
    wx.navigateTo({
      url: '../addObserver/addObserver?code=' + this.data.event_code +
        '&observed=' + e.currentTarget.dataset.observed,
    })
  },
  loadUserObserver(observed_open_id) {
    return new Promise((reslove, reject) => {
      service.getUserObserver({
        code: this.data.event_code,
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
        })
      });
  },
  cancelObserverForMyself(e) {
    wx.showLoading({
      title: '取消关注中...',
      mask: true
    })
    let data = {
      code: this.data.event_code,
      observed_open_id: e.currentTarget.dataset.observed,
      action: 'cancel'
    };
    service.editObserverForUser(data).then(() => {
      wx.hideLoading();
      let newObserverList = this.data.myObserverList;
      for (let i in newObserverList) {
        if (e.currentTarget.dataset.observed === newObserverList[i]['open_id']) {
          newObserverList.splice(i, 1)
        }
      }
      this.setData({
        myObserverList: newObserverList
      })
    })
    let reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
    reloadTrigger.right = true;
    reloadTrigger.mid = true;
    
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
    if (reloadTrigger.mid === true && this.data.currentTab === 'tabmiddle'
        && this.data.myObserverList.length) {
      this.loadfollowerList('myObserverList');
    }
    if (reloadTrigger.right === true && this.data.currentTab === 'tabright'
        && this.data.allUserList.length) {
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