const cloud = require('../service/cloud.js');
module.exports = {
  adminLogin(user, pwd) {
    return cloud.call('adminLogin', {
      user,
      pwd
    })
  },
  getUserList(name = undefined) {
    return cloud.call('adminQueryUser', {
      name
    })
  },
  queryUser(_id) {
    return cloud.call('checkUserInfo', {
      _id
    })
  },
  getPowerRoleList() {
    return cloud.call('getPowerRole');
  },
  deleteUser(_id) {

  },
  editUser(data) {
    return cloud.call('adminEditUser', data);
  }
}