// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParamFormat(param) {
  const {
    _id,
    data
  } = param;

  const res = {
    code: '0000',
    msg: [],
    data: null
  }

  if (_id === undefined) {
    res.code = '1000';
    res.msg.push('_id:string')
  } else {
    if (typeof(_id) != 'string') {
      res.code = '1001';
      res.msg.push('_id:string')
    }
  }
  if (data === undefined) {
    res.code = '1000';
    res.msg.push('data:object')
  } else {
    if (data['name'] === undefined && data['phone'] === undefined && data['role'] === undefined && data['power'] === undefined) {
      res.code = '1002';
      res.msg = 'should set one of them:data.name:string, data.phone:strig, data.role:array ,data.power:arraye';
    } else {
      if (data.name && typeof(data.name) != 'string') {
        res.code = '1001';
        res.msg.push('data.name:string')
      }

      // if (data.phone && typeof(data.phone) != 'string') {
      //   res.code = '1001';
      //   res.msg.push('data.phone:string')
      // }

      if (data.role && (!(data.role instanceof Array))) {
        res.code = '1001';
        res.msg.push('data.role:array')
      }

      if (data.power && (!(data.power instanceof Array))) {
        res.code = '1001';
        res.msg.push('data.power:string')
      }
    }

  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(' ') + ' required'
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(' ') + ' wrong'
  }

  if (res.code === '0000') {
    res.msg = '',
      res.data = {
        _id,
        data
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
    if (curUserInfo.result.data.power.indexOf('admin') < -1) {
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

// 跟新用户信息
async function updateUserInfo(data) {
  try {
    const res = await cloud.database().collection('user').doc(data._id).update({
      data: data.data
    });
    if (res.stats.updated < 1) {
      return {
        code: '2001',
        msg: 'no record updated',
        data: res.stats
      }
    }
    return {
      code: '0000',
      msg: res.errMsg,
      data: res.stats
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
 *  _id:'',
 *  data:{
 *    name:'',
 *    role:[],
 *    power:[]
 *  }
 * }
 * 
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }

  const permission = await checkPermission();
  if (permission.code != '0000') {
    return permission;
  }

  return await updateUserInfo(param.data);
}