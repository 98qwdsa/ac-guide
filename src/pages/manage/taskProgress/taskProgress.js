// src/pages/manage/taskProgress/taskProgress.js
const service = require('../service.js');
const reloadTrigger = getApp().globalData.managerHomeTaskManagerTaskProgess
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
    if (reloadTrigger.left === false) {
      return;
    }
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
  },
  loadAllUserForEvent(event_code) {
    if (reloadTrigger.mid === false) {
      return;
    }
    wx.showLoading({
      mask: true,
    })
    service.getQueryAllUserEventDetail({
      code: event_code
    }).then(allUser => {
      wx.hideLoading();
      reloadTrigger.mid = false
      this.setData({
        allUserList: allUser.data
      });
      allUser.data.forEach((e, key) => {
        this.loadUserObserver(e.open_id).then(followerList => {
          let newallUserList = [...this.data.allUserList]

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
    if (reloadTrigger.right === false) {
      return;
    }
    wx.showLoading({
      mask: true,
    })
    service.getQueryObserverEventDetail({
      code: event_code
    }).then(observer => {
      this.setData({
        attenUserList: observer.data
      });
      wx.hideLoading();
      reloadTrigger.right = false;
      let _this = this;
      let newAttenUserList = [];
      let i = 0;

      function getObserver(i, newAttenUserList) {
        let user = observer.data[i]
        if (user) {
          _this.loadUserObserver(user.open_id).then(followerList => {
            newAttenUserList.push({
              ...user,
              followerList: followerList.map(e => e.name)
            })
            i++;
            getObserver(i, newAttenUserList);
          })
        } else {
          i = 0;
          _this.setData({
            attenUserList: newAttenUserList
          })
        }
      }
      getObserver(i, newAttenUserList);

    }, (e) => {
      console.log(e);
    })
  },
  addObserverForUser(e) {
    wx.navigateTo({
      url: '../addObserver/addObserver?code=' + this.data.event_code +
        '&observed=' + e.currentTarget.dataset.observed,
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
      });
    })
  },
  // cancelObserverForMyself(e) {
  //   wx.showLoading({
  //     title: '取消关注中...',
  //     mask: true
  //   })
  //   let data = {
  //     code: this.data.event_code,
  //     observer_open_id: 'OPENID',
  //     observed_open_id: e.currentTarget.dataset.observed,
  //     action: 'cancel'
  //   };
  //   service.editObserverForUser(data).then(() => {
  //     wx.hideLoading();
  //     let index = undefined;
  //     let newAttenUserList = this.data.attenUserList;
  //     try {
  //       newAttenUserList.forEach((item, key) => {
  //         if (item.open_id === e.currentTarget.dataSet.item.open_id) {
  //           index = key;
  //           throw new Error(key)
  //         }
  //       })
  //     } catch (e) {}
  //     if (index != undefined) {
  //       newAttenUserList.splice(index, 1);
  //       this.setData({
  //         attenUserList: newAttenUserList
  //       })
  //     }
  //   })
  //   this.allUserLoad = true;
  // },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (reloadTrigger.mid === true && this.data.currentTab === 'tabmiddle') {
      this.loadMyObserver(this.data.event_code);
    }
    if (reloadTrigger.right === true && this.data.currentTab === 'tabright') {
      this.loadAllUserForEvent(this.data.event_code);
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