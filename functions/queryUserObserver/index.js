// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function checkParamFormat(data) {
  const wxContext = cloud.getWXContext();
  let {
    code,
    observered_open_id
  } = data
  //初始化页面信息
  // const defaultPageConf = {
  //   size: 10,
  //   current_num: 0
  // }
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string')
  } else {
    if (typeof(code) != 'string') {
      res.code = '1001';
      res.msg.push('code:string')
    }
  }
  if (observered_open_id === undefined) {
    res.code = '1000';
    res.msg.push('observered_open_id:string')
  } else {
    if (typeof(observered_open_id) != 'string') {
      res.code = '1001';
      res.msg.push('observered_open_id:string')
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
      code,
      observered_open_id
    }
  }
  return res;
}

//角色验证
async function checkRole() {
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo'
    })
    if (curUserInfo.result.data.role.includes('HR') ||
      curUserInfo.result.data.role.includes('PM')) {
      return {
        msg: '',
        code: '0000',
        data: null
      }
    }
    return {
      msg: 'role mismatch Function: queryUserObserver',
      code: '3000',
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

//获取用户的所有关注者
async function getUserObserver(data) {
  const DB = cloud.database();
  const _ = DB.command;
  const COLION = DB.collection(`${data.code}_event_observeds`);
  const res = await COLION.where({
    observed_open_id: data.observered_open_id
  }).get();
  // if (res.data.length < 1) {
  //   return {
  //     code: '2001',
  //     msg: 'no records',
  //     data: null
  //   }
  // }
  let list = [];
  for (let e of res.data[0].observer_open_id) {
    const name = await getUserName(e)
    list.push({
      name,
      open_id: e
    })
  }

  async function getUserName(open_id) {
    try {
      const userInfo = await cloud.callFunction({
        name: 'checkUserInfo',
        data: {
          open_id
        }
      })
      return userInfo.result.data ? userInfo.result.data.name : ''
    } catch (e) {
      return {
        code: '3000',
        msg: e,
        daa: null
      }
    }
  }
  return {
    code: '0000',
    msg: '',
    data: list
  }
}
/**
 * @input
 * {
 *  code:'', //event code,
 *  observered_open_id:''
 * }
 * 
 * @output
 * {
 *  code:'',
 *  msg:'',
 *  data: [{
 *  name:'',
 *  open_id:''
 * }]
 * }
 * 
 */

// 云函数入口函数
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code !== '0000') {
    return param;
  }
  const role = await checkRole();
  if (role.code !== '0000') {
    return role;
  }
  return await getUserObserver(param.data);
}