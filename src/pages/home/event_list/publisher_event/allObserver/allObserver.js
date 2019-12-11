// src/pages/manage/home/taskManage/taskProgress/allObserver/allObserver.js
const service = require('../../../service.js');
const reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: 'tableft',
    userList: [],
    observerList: []
  },
  event_code: '',
  observer_open_id: '',
  observed_open_id: '',

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.event_code = options.code;
    this.observed_open_id = options.observed;
    this.loadAllObserver();
    this.loadUserObserver();
  },
  switchTap(e) {
    let currentTab = e.currentTarget.id;
    this.setData({
      currentTab
    })
  },
  loadAllObserver() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    service.getAllObserver().then(res => {
      this.setData({
        userList: res
      });
      wx.hideLoading();
    }, error => {
      wx.showToast({
        title: '无观察者用户',
        icon: 'none',
        duration: 2000
      })
    });
  },
  loadUserObserver() {
    service.getUserObserver({
      code: this.event_code,
      observered_open_id: this.observed_open_id
    }).then(observerList => {
      this.setData({
        observerList
      });
      wx.hideLoading();
    }, (error) => {
      if (error.code === '2001') {
        wx.showToast({
          title: '没有关注的用户',
          icon: 'none',
          duration: 2000
        })
      }
    });
  },
  addObserve(e) {
    let observer = e.currentTarget.dataset.observer;
    let data = {
      code: this.event_code,
      observer_open_id: observer.open_id,
      observed_open_id: this.observed_open_id,
      action: 'observe'
    };
    wx.showModal({
      title: '提示',
      content: '是否添加关注',
      success:(res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '添加关注中...',
            mask: true
          })
          service.editObserverForUser(data).then(() => {
            this.setData({
              observerList: [...this.data.observerList, {
                name: observer.name,
                open_id: observer.open_id
              }]
            })
            reloadTrigger.mid = true;
            reloadTrigger.right = true;
            wx.hideLoading();
          });
        }
      }
    })
  },
  cancleObserve(e) {
    let data = {
      code: this.event_code,
      observer_open_id: e.currentTarget.dataset.item.open_id,
      observed_open_id: this.observed_open_id,
      action: 'cancel'
    };
    wx.showModal({
      title: '提示',
      content: '是否取消关注',
      success:(res)=> {
        if (res.confirm) {
          wx.showLoading({
            title: '取消关注中...',
            mask: true
          })
          service.editObserverForUser(data).then(() => {
            let index = undefined;
            let newObserverList = [...this.data.observerList];
            try {
              newObserverList.forEach((e, key) => {
                if (e.open_id === data.observer_open_id) {
                  index = key;
                  throw new Error(key)
                }
              })
            } catch (e) {}
            if (index != undefined) {
              newObserverList.splice(index, 1)
              this.setData({
                observerList: newObserverList
              })
            }
            reloadTrigger.mid = true;
            reloadTrigger.right = true;
            wx.hideLoading();
          });
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