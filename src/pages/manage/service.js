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
  addUser(name,power,role) {
    return cloud.call('addUser', {
      name,
      power,
      role,
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

}