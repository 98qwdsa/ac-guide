// src/pages/home/event_list/observer_event/observer_event.js
const APP = getApp();
const service = require('../../service.js');
let event_code = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myEventSteps: null,
    observerEvent: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.name,
    })
    event_code = options.code;
  },
  loadMyEventDetail() {
    let reloadTrigger = getApp().globalData.homeEventListObserverEvent;
    if (reloadTrigger.myDataload === false) {
      return;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    let eventDetail = new Promise((resolve, reject) => {
      service.getSelfEventStep(event_code).then(myEventDetail => {
        resolve(myEventDetail);
      })
    }); 
    let observerList = new Promise((resolve, reject) => {
      this.loadUserObserver(APP.globalData.userInfo.open_id).then(followerList => {
        resolve(followerList);
      })
    }); 
    Promise.all([eventDetail, observerList]).then(values =>{
      let newEventSteps = {
        name: '我自己',
        event_steps: values[0],
        followerList: values[1].map(e => e.name)
      }
      this.setData({
        myEventSteps: newEventSteps
      })
      wx.hideLoading();
      reloadTrigger.myDataload = false;
    })
  },
  loadUserForEvent() {
    let reloadTrigger = getApp().globalData.homeEventListObserverEvent;
    if (reloadTrigger.userDataLoad === false) {
      return;
    }
    service.getQueryObserverEventDetail({
      code: event_code
    }).then(observer => {
      this.setData({
        observerEvent: observer.data
      })
      reloadTrigger.userDataLoad = false;
      if (this.data.observerEvent.length) {
        this.loadfollowerList('observerEvent');
      }
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
    const userList = [...this.data.observerEvent]
    userList.forEach((e, key) => {
      this.loadUserObserver(e.open_id).then(followerList => {
        let newUserList = [...this.data.observerEvent]
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
  eventDetail(e) {
    wx.navigateTo({
      url: '../participant_event/participant_event?code=' + event_code
    })
  },
  cancelObserver(e) {
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
            let newObserverEvent = [..._this.data.observerEvent];
            for (let i in newObserverEvent) {
              if (e.currentTarget.dataset.observed === newObserverEvent[i]['open_id']) {
                newObserverEvent.splice(i, 1);
              }
            }
            _this.setData({
              observerEvent: newObserverEvent
            })
          })
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
    this.loadMyEventDetail();
    this.loadUserForEvent();
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
    let reloadTrigger = getApp().globalData.homeEventListObserverEvent;
    reloadTrigger.myDataload = true;
    reloadTrigger.userDataLoad = true;
    event_code = '';
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