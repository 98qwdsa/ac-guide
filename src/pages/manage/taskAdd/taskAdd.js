const service = require('../service.js');
let detail = {role:[]};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    eventDetail: {
      role:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      eventDetail:detail
    });
  },
  submit: function(e){
    console.log('form发生了submit事件，携带的数据:', e.detail.value);
    let eventDetail = e.detail.value;

    // service.addEvent(eventDetail).then(()=>{
    //   wx.navigateTo("../taskManage/taskManage");
    // });
  },
  changeRole: function (roles){
    detail.role = roles;
  }






  // loadData(code) {
  //   wx.showLoading({
  //     mask: true
  //   })
  //   Promise.all([this.getEventDetail(code), this.getEventSteps(code)]).then(data => {
  //     wx.hideLoading();
  //     this.setData({
  //       code,
  //       ['eventDetail']: {
  //         ...data[0],
  //         steps: data[1],
  //       }
  //     })
  //   });
  // },
  // getEventDetail(code) {
  //   return new Promise((reslove, reject) => {
  //     service.getEventDetail(code).then(data => {
  //       reslove(data[0]);
  //     });
  //   })
  // },
  // getEventSteps(code) {
  //   return new Promise((reslove, reject) => {
  //     service.getEventSteps(code).then(data => {
  //       reslove(data);
  //     })
  //   })
  // },
  // deleteStep(e) {
  //   const data = e.target.dataset;
  //   const newEventList = [...this.data.eventDetail.steps]
  //   newEventList.splice(data.index, 1);
  //   wx.showLoading({
  //     mask: true
  //   })
  //   service.deleteEventStep(code, data._id).then(data => {
  //     wx.hideLoading();
  //     this.setData({
  //       ['eventDetail.steps']: newEventList
  //     })
  //   })
  // },
  // submit(e) {
  //   console.log(e);
  // },
  // eventTrigger(e) {
  //   wx.showLoading({
  //     mask: true
  //   })
  //   const data = e.target.dataset;
  //   service.eventTrigger(data).then(res => {
  //     wx.hideLoading();
  //     if (res.updated > 0) {
  //       this.setData({
  //         ['eventDetail.disabled']: !data.disabled
  //       })
  //     }
  //   })
  // },
  
})