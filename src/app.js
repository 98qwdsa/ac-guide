const conf = require('./conf.js');
//app.js
App({
  onLaunch: function() {
    wx.hideTabBar();
    wx.cloud.init({
      env: conf.cloud_env_code
    });
  },
  globalData: {
    userInfo: null,
    'managerHomeTaskManagerTaskAdd': {
      roles: '',
      stepIndex: 0,
      stepName: '',
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
    'managerHomeTaskManageTaskAdd':{
      load: true
    }
  }
})