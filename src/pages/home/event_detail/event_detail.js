// src/pages/index/user_event_steps/user_event_steps.js
const service = require('../service.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepList: [],
    event_code: '',
    curStep: 0,
    eventDetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData(options.code || 'entry');
  },
  loadData(event_code) {
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
    })
  },
  // swiperChange(e) {
  //   this.setData({
  //     curIndex: e.detail.current
  //   })
  //   this.initSwiperHeight();
  // },
  // uploadAttachment(e) {
  //   const dataSet = e.currentTarget.dataset;
  //   service.uploadAttachments(this.data.event_code, dataSet.uid).then(data => {
  //     this.setData({
  //       ['stepList[' + this.data.curIndex + '].user_step']: data
  //     });
  //     this.initSwiperHeight()
  //   });
  // },
  nextStep(e) {
    wx.showLoading({
      mask: true
    })
    const dataSet = e.currentTarget.dataset;
    service.nextStep(this.data.event_code, dataSet.uid).then(data => {
      //wx.hideLoading();
      wx.showToast({
        icon: 'success',
        duration: 1200
      })
      if (data._id) {
        const stepList = [...this.data.stepList]

        let eventFinished = false;
        let curStep = this.data.curStep;

        stepList[curStep].user_step = data;
        if (stepList[curStep - 1]) {
          stepList[curStep - 1].user_step.currentStep = undefined;
        }
        curStep += 1;
        if (curStep == stepList.length) {
          eventFinished = true;
          curStep--;
        }
        this.setData({
          eventFinished,
          curStep,
          stepList
        })
      }
    })
  },
  initSwiperHeight() {
    // const query = wx.createSelectorQuery()
    // query.select('#swip_item_warp' + this.data.curIndex).boundingClientRect().exec(res => {
    //   this.setData({
    //     swiperHeight: res[0].height + 20
    //   })
    // })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

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

  }
})