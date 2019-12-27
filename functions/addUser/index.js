// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'demo-5c0mj'
});
const DB = cloud.database();
const CLION = DB.collection('user');
//检查参数格式
function checkParamFormat(data) {
  let {
    name,
    power,
    role,
    modify_openid = cloud.getWXContext().OPENID,
    action,
  } = data;
  const res = {
    code: '0000',
    msg: [],
    data: {}
  }
  if (name === undefined) {
    res.code = '1000'
    res.msg.push('name:string')
  } else {
    if (typeof(name) !== 'string' || name === '') {
      res.code = '1001'
      res.msg.push('name:string')
    }
  }
  if (role === undefined) {
    role = ['Participant'];
  } else {
    if (!(role instanceof Array)) {
      res.code = '1001';
      res.msg.push('role:Array')
    }
  }

  if (power === undefined) {
    power = [];
  } else {
    if (!(power instanceof Array)) {
      res.code = '1001';
      res.msg.push('power:Array')
    }
  }

  if (action && action != 'adminAddUser') {
    res.code = '1001'
    res.msg.push('action:string')
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
      name,
      power,
      role,
      modify_openid,
      action
    }
  }
  return res;
}

//检查用户是否有admin权限
async function checkUserInfo(name) {
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        name
      }
    })
    if (curUserInfo.result.code !== '0000') {
      return {
        code: '2010',
        msg: curUserInfo.result,
        data: null
      }
    }

    return {
      code: '0000',
      msg: '',
      data: curUserInfo.result.data
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}
/**
 * name
 * [action:adminAddUser]
 * 
 */

// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext();
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }

  const userInfo = await checkUserInfo(param.data.name);
  try {
    let data = {
      name: param.data.name,
      open_id: wxContext.OPENID,
      power: param.data.power,
      modify_openid: param.data.modify_openid,
      role: param.data.role,
      create_date: new Date().getTime()
    }

    if (param.data.action === 'adminAddUser') {
      data.open_id = ''
    }

    if (userInfo.code === '0000' && userInfo.data._id) {
      const res = await CLION.doc(userInfo.data._id).update({
        data: {
          open_id: wxContext.OPENID
        }
      });

      if (res.errMsg !== "document.update:ok") {
        return {
          code: '2000',
          msg: res.errMsg,
          data: ''
        };
      }
      return {
        code: '0000',
        msg: 'add user success',
        data: {
          ...userInfo.data,
          open_id: wxContext.OPENID

        }
      }
    } else {
      const res = await CLION.add({
        data
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
        data: {
          _id: res._id,
          ...data
        }
      }
    }

  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
}