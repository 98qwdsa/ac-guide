const cloud = require('../../service/cloud.js');

module.exports = {
  addEvent(data) {
    return cloud.call('adminAddEvent', {
      ...data
    });
  },
  getEventList() {
    return cloud.call('queryEventList', {
      power: 'admin'
    });
  },
  getEventDetail(code) {
    return cloud.call('queryEventList', {
      code
    });
  },
  getEventSteps(code) {
    return cloud.call('adminQueryEventSteps', {
      code
    });
  },
  getEventStepDetail(code, _id) {
    return cloud.call('adminQueryEventSteps', {
      code,
      _id
    });
  },
  eventTrigger(data) {
    return cloud.call('adminDisableEvent', {
      code: data.code,
      disabled: !data.disabled
    });
  },
  addSteps(code, param) {
    return cloud.call('adminEditEventStep', {
      code,
      param,
      action: 'add'
    })
  },
  deleteEventStep(code, _id) {
    return cloud.call('adminEditEventStep', {
      _id,
      code,
      action: 'remove'
    })
  },
}