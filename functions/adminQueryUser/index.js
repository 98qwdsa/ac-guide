// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

const DB = cloud.database();

function checkParamFormat(data) {
  let {
    name
  } = data;

  if (name !== undefined && typeof (name) != 'string') {
    return {
      code: '1001',
      msg: 'param name:string wrong',
      data: null
    }
  }

  return {
    code: '0000',
    msg: 'param format ok',
    data: {
      name
    }
  }
}
// 权限验证
async function checkPermission() {
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (curUserInfo.result.data.power.indexOf('admin') > -1) {
      return {
        code: '2000',
        msg: 'permission denied',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
      data: null
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}

//获取用户列表
async function getUserList(name = null) {
  const param = name === null ? null : {
    name
  }
  try {
    const res = await DB.collection('user').where(param).get();
    if (res.data.length < 1) {
      return {
        code: '2001',
        msg: 'there is no user',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
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
 * {
 *  name:string
 * }
 * 
 */
// 云函数入口函数
exports.main = async (event, context) => {
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }

  const permission = await checkPermission();
  if (param.code != '0000') {
    return param;
  }

  return await getUserList(param.data.name);
}