// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init();
const md5 = require('md5');

function checkParam(data) {
  let {
    user,
    pwd
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (user === undefined) {
    res.code = '1000';
    res.msg.push('user:string');
  } else {
    if (typeof(user) != 'string' || user === '') {
      res.code = '1001';
      res.msg.push('user:string');
    }
  }

  if (pwd === undefined) {
    res.code = '1000';
    res.msg.push('pwd:string');
  } else {
    if (typeof(pwd) != 'string' || pwd === '') {
      res.code = '1001';
      res.msg.push('pwd:string');
    } else {
      pwd = md5(pwd);
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(' ') + ' is required';
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(' ') + ' is wrong';
  }

  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      user,
      pwd
    }
  }
  return res;
}

async function checkPermission() {
  try {
    const res = await cloud.callFunction({
      name: "checkUserInfo"
    });
    if (res.result.code === '0000' && res.result.data.power && res.result.data.power.indexOf('admin') > -1) {
      return {
        code: '0000',
        msg: '',
        data: null
      }
    }
    return {
      code: '2000',
      msg: 'permission denied',
      data: null
    }
    //console.log(res);
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}

async function checkUserPwd(open_id, user, pwd) {
  const DB = cloud.database();
  const _ = DB.command;
  try {
    const res = await DB.collection('power').where({
      code: 'admin',
      users: _.in([open_id])
    }).get();
    if (res.data.length) {
      const data = res.data[0];
      if (user === data.user || md5(md5(data.pwd)) === pwd) {
        return {
          code: '0000',
          msg: '',
          data: true
        }
      } else {
        return {
          code: '2001',
          msg: 'Error in account or password',
          data: null
        }
      }
    }
    return {
      code: '2002',
      msg: 'permission denied',
      data: null
    }
    console.log(res);
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
 *  user:
 *  pwd:
 * }
 * 
 */

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  const params = checkParam(event);
  if (params.code != '0000') {
    return params;
  }

  const permission = await checkPermission();

  if (permission.code != '0000') {
    return permission;
  }

  return await checkUserPwd(wxContext.OPENID, params.data.user, params.data.pwd);
}