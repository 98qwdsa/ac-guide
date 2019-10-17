// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParam(data) {
  let {
    code,
    _id
  } = data;

  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string');
  } else {
    if (typeof(code) != 'string' || code === '') {
      res.code = '1001';
      res.msg.push('code:string');
    }
  }

  if (_id === undefined) {

  } else {
    if (typeof(_id) != 'string' || _id === '') {
      res.code = '1001';
      res.msg.push('_id:string');
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(',') + ' required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(',') + ' wrong';
  }
  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      code,
      _id
    }
  }
  return res;
}
// 权限验证
async function checkPermission() {
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (!curUserInfo.result.data.power.includes('event_admin')) {
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

async function getEventStepList(data) {
  let DB = cloud.database().collection(data.code + '_event_steps')
  if (data._id) {
    DB = DB.doc(data._id)
  }
  try {
    const res = await DB.get();
    // if (data._id) {
    //   return {
    //     code: '0000',
    //     msg: '',
    //     data: res.data
    //   }
    // }
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
// 云函数入口函数
/**
 * code:
 */
exports.main = async(event, context) => {
  const param = checkParam(event);
  if (param.code !== '0000') {
    return param;
  }

  const permission = await checkPermission();
  if (param.code != '0000') {
    return permission;
  }

  return await getEventStepList(param.data)
}