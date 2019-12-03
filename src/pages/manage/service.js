const cloud = require('../../service/cloud.js');

module.exports = {
  checkUserInfo() {
    return cloud.call('checkUserInfo');
  },
  addEvent(data) {
    return cloud.call('adminAddEvent', {
      ...data
    });
  },
  getEventList() {
    return cloud.call('queryEventList', {
      power: 'event_admin'
    });
  },
  getSelfEventStep(code) {
    return cloud.call('queryUserEventDetail', {
      code
    });
  },
  queryUser(_id) {
    return cloud.call('checkUserInfo', {
      _id
    })
  },
  getQueryObserverEventDetail(data) {
    return cloud.call('queryObserverEventDetail', {
      ...data
    });
  },
  editObserverForUser(data) {
    return cloud.call('editObserver', {
      ...data
    })
  },
  nextStep(code, step_Uid) {
    return cloud.call('employeeAddStep', {
      code,
      step_Uid,
      status_code: 50
    })
  },
  // getAllObserver(){
  //   return cloud.call('queryAllObserver', {
  //   })
  // },
  getUserObserver(data) {
    return cloud.call('queryUserObserver', {
      ...data
    })
  },
  getUserList(data) {
    return cloud.call('adminQueryUser', {
      ...data
    })
  },
  addUser(name) {
    return cloud.call('addUser', {
      name,
      action: 'adminAddUser'
    })
  },
  editUser(data) {
    return cloud.call('adminEditUser', {
      ...data
    })
  },
  getPowerRole(types, open_id = undefined) {
    return cloud.call('getPowerRole', {
      open_id,
      types
    })
  }

  // getEventDetail(code) {
  //   return cloud.call('queryEventList', {
  //     code
  //   });
  // },
  // getEventSteps(code) {
  //   return cloud.call('adminQueryEventSteps', {
  //     code
  //   });
  // },

  // eventTrigger(data) {
  //   return cloud.call('adminDisableEvent', {
  //     code: data.code,
  //     disabled: !data.disabled
  //   });
  // },
  // addSteps(code, param) {
  //   return cloud.call('adminEditEventStep', {
  //     code,
  //     param,
  //     action: 'add'
  //   })
  // },
  // deleteEventStep(code, _id) {
  //   return cloud.call('adminEditEventStep', {
  //     _id,
  //     code,
  //     action: 'remove'
  //   })
  // },
}