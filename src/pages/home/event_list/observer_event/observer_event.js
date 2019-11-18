// src/pages/home/event_list/observer_event/observer_event.js
const APP = getApp();
const service = require('../../service.js');
let event_code = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  loadUserForEvent(event_code) {
    let reloadTrigger = getApp().globalData.homeEventListObserverEvent;
    if (reloadTrigger.load === false){
      return;
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getQueryObserverEventDetail({
      code: event_code
    }).then(observer => {
      let newObserver = observer.data;
      newObserver.forEach(function(item,index){
        if (item.name === APP.globalData.userInfo.name){
          item.name = '我自己'
        }
      })
      this.setData({
        observerEvent: newObserver
      })
      wx.hideLoading();
      reloadTrigger.load = false;
      if (this.data.observerEvent.length){
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
  eventDetail(e){
    if (APP.globalData.userInfo._id === e.currentTarget.dataset.userid){
      wx.navigateTo({
        url: '../participant_detail/participant_detail?code=' + event_code
      })
    }
  },
  cancelObserver(e){
    let _this = this;
    wx.showModal({
      title: '提示',
      content: '是否取消关注',
      success(res){
        if(res.confirm){
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
        }else if(res.cancel){

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
    this.loadUserForEvent(event_code);
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
    reloadTrigger.load = true;
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