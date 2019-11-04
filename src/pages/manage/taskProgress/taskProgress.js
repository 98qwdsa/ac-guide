// src/pages/manage/taskProgress/taskProgress.js
const service = require('../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentTab: "tableft",
    allUserList: [],
    attenUserList: [],
    stepList: [],
    event_code: '',
    curStep: 0,
    eventDetail: {},
    observerList: []
  },
  entryLoad: true,
  myAttenLoad: true,
  allUserLoad: true,

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
    if (currentTab == "tableft" && this.entryLoad) {
      this.loadMyData(event_code || 'entry');
      this.entryLoad = false;
    } else if (currentTab == "tabmiddle" && this.myAttenLoad) {
      this.loadMyObserver(event_code);
      this.myAttenLoad = false;
    } else if (currentTab == "tabright" && this.allUserLoad) {
      this.loadAllUserForEvent(event_code);
      this.allUserLoad = false;
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
      wx.hideLoading();
    }, (e) => {
      wx.showToast({
        title: e,
        icon: 'success',
        duration: 2000
      })
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
    this.allUserLoad = true;
  },
  loadAllUserForEvent(event_code) {
    wx.showLoading({
      mask: true,
    })
    service.getQueryAllUserEventDetail({
      code: event_code
    }).then(allUser => {
      const _this = this;
      //this.loadUserObserver(allUser.data[0].open_id);
      wx.hideLoading();
      _this.setData({
        allUserList: allUser.data
      });
      allUser.data.forEach((e, key) => {
        this.loadUserObserver(e.open_id).then(followerList => {
          let newallUserList = [...allUser.data]

          newallUserList.splice(key, 1, {
            ...newallUserList[key],
            followerList: followerList.map(e => e.name)
          })
          this.setData({
            allUserList: newallUserList
          })
        })
      })
      // let newallUserList = [];
      // let i = 0;
      // function getObserver(i, newallUserList) {
      //   let user = allUser.data[i]
      //   if (user) {
      //     _this.loadUserObserver(user.open_id).then(followerList => {
      //       newallUserList.push({
      //         ...user,
      //         followerList: followerList.map(e => e.name)
      //       })
      //       i++;
      //       getObserver(i, newallUserList);
      //     })
      //   } else {
      //     i = 0;
      //     _this.setData({
      //       allUserList: newallUserList
      //     });
      //   }
      // }
      // getObserver(i, newallUserList);

    }, (e) => {})
  },
  loadMyObserver(event_code) {
    let data = {
      code: event_code
    };
    wx.showLoading({
      mask: true,
    })
    service.getQueryObserverEventDetail(data).then(observer => {
      console.log("我关注的", observer);
      this.setData({
        attenUserList: observer.data
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
  addObserverForUser(e) {
    wx.navigateTo({
      url: '../addObserver/addObserver?code=' + this.data.event_code +
        '&&observed=' + e.currentTarget.dataset.observed,
    })

    this.myAttenLoad = true;
  },
  loadUserObserver(observed_open_id) {
    return new Promise((reslove, reject) => {
      service.getUserObserver({
        code: this.data.event_code,
        observered_open_id: observed_open_id
      }).then(observerList => {
        reslove(observerList);
        // this.setData({
        //   observerList
        // });
      });
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