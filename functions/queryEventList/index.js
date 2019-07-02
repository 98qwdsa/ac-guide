// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParam(data) {
  let {
    _id,
    code,
    power,
    role = 'employee'
  } = data;

  const res = {
    code: '0000',
    msg: [],
    data: null
  }

  // if (Object.keys(data).length === 0) {
  //   role = 'employee';
  // }
  if (_id === undefined) {

  } else {
    if (typeof(_id) != 'string' || _id === '') {
      res.code = '1001';
      res.msg.push('_id:string');
    } else {
      code = undefined;
      power = undefined;
      role = undefined;
      return returnRes();
    }
  }
  if (code === undefined) {

  } else {
    if (typeof(code) != 'string' || code === '') {
      res.code = '1001';
      res.msg.push('code:string');
    } else {
      power = undefined;
      role = undefined;
      return returnRes();
    }
  }


  if (power === undefined) {

  } else {
    if (typeof(power) != 'string' || power === '') {
      res.code = '1001';
      res.msg.push('power:string');
    } else {
      role = undefined;
      return returnRes();
    }
  }

  if (role === undefined) {
    role = 'employee';
  } else {
    if (typeof(role) != 'string' || role === '') {
      res.code = '1001';
      res.msg.push('role:string');
    } else {
      return returnRes();
    }
  }

  function returnRes() {
    if (res.code === '1000') {
      res.msg = 'param ' + res.msg.join(',') + ' required';
    }

    if (res.code === '1001') {
      res.msg = 'param ' + res.msg.join(',') + ' wrong';
    }
    if (res.code === '0000') {
      res.msg = 'param format ok';
      res.data = {
        _id,
        code,
        power,
        role
      }
    }
    return res;
  }


}

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

async function getEventList(user, param) {
  const DB = cloud.database();
  const COLION = DB.collection('event_list')
  const _ = DB.command;
  if (param._id) {
    return await exec({
      _id: param._id
    });
  }
  if (param.code) {
    return await exec({
      code: param.code
    });
  }
  if (param.power) {
    if (user.power.indexOf(param.power) > -1) {
      return await exec();
    } else {
      return {
        code: '2002',
        msg: '',
        data: null
      }
    }

  }
  if (param.role) {
    if (user.role.indexOf(param.role) > -1) {
      return await exec({
        role: _.in(user.role),
        disabled: false
      });
    } else {
      return {
        code: '2002',
        msg: '',
        data: null
      }
    }
  }
  async function exec(filter = undefined) {
    try {
      const res = await COLION.where(filter).get();
      if (res.data.length < 1) {
        return {
          code: '2003',
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

}
/**
 * power:
 * role:
 * code:
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const param = checkParam(event);
  if (param.code !== '0000') {
    return param;
  }
  const userRole = await getUserRole();
  if (userRole.code !== '0000') {
    return userRole;
  }
  const eventList = await getEventList(userRole.data, param.data);
  return eventList;
}