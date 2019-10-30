const cloud = require('../../service/cloud.js');

module.exports = {
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
  getQueryAllUserEventDetail(data){
    return cloud.call('queryAllUserEventDetail',{
      ...data
    });
  },
  getQueryObserverEventDetail(data){
    return cloud.call('queryObserverEventDetail', {
      ...data
    });
  },
  editObserverEventDetail(data){
    return cloud.call('editObserver',{
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