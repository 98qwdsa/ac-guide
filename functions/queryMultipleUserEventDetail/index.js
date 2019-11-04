// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParamFormat(data) {
  const {
    code,
    user_open_id_list
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
    if (typeof(code) != 'string') {
      res.code = '1000';
      res.msg.push('code:string');
    }
  }

  if (user_open_id_list === undefined) {
    res.code = '1000';
    res.msg.push('user_open_id_list:string');
  } else {
    if (!(user_open_id_list instanceof Array) || user_open_id_list.length < 1) {
      res.code = '1000';
      res.msg.push('user_open_id_list:string');
    }
  }
  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(',') + ' required'
  }

  if (res.code === '1001') {
    res.msg = 'param ' + res.msg.join(',') + ' wrong'
  }
  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      user_open_id_list,
      code
    }
  }
  return res
}

async function getUserSteps(code, open_id) {
  try {
    const res = await cloud.callFunction({
      name: 'queryUserEventDetail',
      data: {
        code,
        open_id
      }
    });
    return res.result;
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}

async function getUserInfo(open_id) {
  try {
    const userInfo = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        open_id
      }
    });
    return userInfo.result;
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}

//角色验证
async function checkRole() {
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (curUserInfo.result.code != '0000') {
      return curUserInfo.result
    }
    if (curUserInfo.result.data.role.includes('HR') || curUserInfo.result.data.role.includes('PM')) {
      return {
        code: '0000',
        msg: '',
        data: null
      }
    }
    return {
      code: '2000',
      msg: 'role mismatch Function: queryMultipleUserEventDetail',
      data: null
    }

  } catch (e) {
    return {
      code: '3002',
      msg: e,
      data: null
    }
  }
}

async function mergeUserEventDetail(data) {
  const userListDetail = [];
  for (let i of data.user_open_id_list) {
    const event_steps = await getUserSteps(data.code, i);
    const userInfo = await getUserInfo(i);
    if (event_steps.code === '0000' && userInfo.code === '0000') {
      userListDetail.push({
        ...userInfo.data,
        event_steps: event_steps.data
      });
    }
  }
  return userListDetail;
}
/**
 * {
 *  user_open_id_list:[],
 *  code:''
 * }
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const checkParam = await checkParamFormat(event);
  if (checkParam.code !== '0000') {
    return checkParam;
  }
  const role = await checkRole();
  if (role.code != '0000') {
    return role;
  }
  return await mergeUserEventDetail(checkParam.data);
}