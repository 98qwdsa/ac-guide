// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

async function getUserRole() {
  try {
    const res = await cloud.callFunction({
      name: 'checkUserInfo'
    })
    if (res.result.code !== '0000') {
      return {
        code: '2000',
        msg: res.result.msg,
        data: null
      }
    }
    return {
      code: '0000',
      msg: res.result.msg,
      data: res.result.data
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}

async function getEventList(roles) {
  const DB = cloud.database();
  const COLION = DB.collection('event_list')
  const _ = DB.command;
  try {
    const res = await COLION.where({
      roles: _.in([roles]),
      disabled: false
    }).get();

    if (res.data.length < 1) {
      return {
        code: '2001',
        msg: 'there is no event for you',
        data: null
      }
    }

    return {
      code: '0000',
      msg: res.errMsg,
      data: res.data
    }
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}
/**
 * 
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const userRole = await getUserRole();
  if (userRole.code !== '0000') {
    return userRole;
  }
  const eventList = await getEventList(userRole.data.role);
  return eventList;
}