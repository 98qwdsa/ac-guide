const conf = require('./conf.js');
//app.js
App({
  onLaunch: function() {
    wx.hideTabBar()
    wx.cloud.init({
      env: conf.cloud_env_code
    });
  },
  globalData: {
    userInfo: {
      open_id: undefined
    },
    'managerHomeTaskManagerTaskAddTaskStep': {
      roles: [],
      verifiers: [],
      step:{
        index: 0,
        name: '',
        tips: [],
        verifiers: []
      }
    },
    'managerHomeTaskManagerTaskProgess': {
      left: true,
      mid: true,
      right: true
    },
    'managerHomeRoleManage': {
      Publisher: true,
      Observer: true,
      Participant: true,
      user: [{
        name: '',
        id: ''
      }]
      // userName: '',
      // userId: ''
    },
    'managerHomePersonManageAddUser': {
      userName: ''
    },
    'managerHomePersonManageEditUser': {
      _id: '',
      name: '',
      power: [],
      role: []
    },
    'homeEventListObserverEvent': {
      myDataload: true,
      userDataLoad: true
    },
    'managerHomeTaskManageTaskAdd': {
      load: true
    }
  }
})