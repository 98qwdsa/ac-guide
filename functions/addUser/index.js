// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();
const CLION = cloud.database().collection('user');

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  try {
    const res = await CLION.add({
      data: {
        name: event.name,
        event_attended: [],
        open_id: wxContext.OPENID,
        phone: event.phone,
        role: 'employee'
      }
    });

    if (!res._id) {
      return {
        code: '2000',
        msg: res.errMsg,
        data: ''
      };
    }
    return {
      code: '0000',
      msg: 'add user success',
      data: res._id
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}