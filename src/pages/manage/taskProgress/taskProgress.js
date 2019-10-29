// src/pages/manage/taskProgress/taskProgress.js
const service = require('../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: "tableft",
    allUserList:[{
    }],
    addFollower: true,
    attenUserList: [{
        user: '张瑶Andy',
        progress: 75,
        cancel: true,
        add: true,
        followerName: ['杰尼龟', '皮卡丘', '哆啦A梦']
      },
      {
        user: '颜文妆',
        progress: 25,
        cancel: true,
        add: true,
        followerName: ['大白', '皮卡丘']
      }
    ],
    stepList: [],
    event_code: '',
    curStep: 0,
    eventDetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: options.eventname
    });
    this.data.event_code = options.code;
    this.loadMyData(options.code || 'entry');
  },
  switchTab(e) {
    let currentTab = e.currentTarget.id;
    let event_code = this.data.event_code;
    this.setData({
      currentTab
    });
    if (currentTab == "tableft"){
      this.setData({
        stepList: [],
        eventDetail:{}
      });
      this.loadMyData(event_code || 'entry');
    } else if (currentTab == "tabmiddle"){
      this.setData({
        attenUserList: []
      });
      this.loadObserver(event_code);
    } else if (currentTab == "tabright"){
      this.setData({
        allUserList: []
      });
      this.loadAllUser(event_code);
    }
  },
  loadMyData(event_code) {
    wx.showLoading({
      mask: true,
    })
    service.getSelfEventStep(event_code).then(data => {
      console.log(data);
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
      //this.initSwiperHeight();

      wx.hideLoading();
    },(e) => {
      wx.showToast({
        title: e,
        icon: 'success',
        duration: 2000
      })
    })
  },
  loadAllUser(event_code) {
    let data = {
      code: event_code
    };
    wx.showLoading({
      mask: true,
    })
    service.getQueryAllUserEventDetail(data).then(allUser => {
      console.log("所有参与者", allUser);
      this.setData({
        allUserList: allUser.data
      });
      wx.hideLoading();
    }, (e) => {
      wx.showToast({
        title: e,
        icon: 'success',
        duration: 2000
      })
    })
  },
  loadObserver(event_code) {
    let data = {
      code: event_code
    };
    wx.showLoading({
      mask: true,
    })
    service.getQueryObserverEventDetail(data).then(observer => {
      console.log("我关注的", observer);
      wx.hideLoading();
    }, (e) => {
      wx.showToast({
        title: e,
        icon: 'success',
        duration: 2000
      })
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