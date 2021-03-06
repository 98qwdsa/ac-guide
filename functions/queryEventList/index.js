// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

function checkParam(data) {
  let {
    _id,
    code,
    power,
    currentDate,
    role = "Participant"
  } = data;

  const res = {
    code: '0000',
    msg: [],
    data: null
  }

  // if (Object.keys(data).length === 0) {
  //   role = 'Participant';
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
    role = 'Participant';
  } else {
    if (typeof(role) != 'string' || role === '') {
      res.code = '1001';
      res.msg.push('role:string');
    } else {
      return returnRes();
    }
  }
  if (currentDate === undefined){
    res.code = '1000';
    res.msg.push('currentDate:string');
  }else{
    if (typeof (currentDate) != 'string' || currentDate === ''){
      res.code = '1001';
      res.msg.push('currentDate:string');
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
        currentDate,
        role
      }
    }
    return res;
  }
}

async function getUserRole() {
  const wxContext = cloud.getWXContext();
  try {
    const res = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        open_id: wxContext.OPENID
      }
    })
    if (res.result.code !== '0000') {
      return {
        code: '2000',
        msg: res.result,
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
  // 根据_id查询
  if (param._id) {
    return await exec({
      _id: param._id
    });
  }
  // 根据 code 查询
  if (param.code) {
    return await exec({
      code: param.code
    });
  }
  // 根据权限查询
  if (param.power) {
    if (user.power.includes(param.power)) {
      // 权限过滤暂时没有
      return await exec({});
    } else {
      return {
        code: '2002',
        msg: `no records for ${param.power} power`,
        data: null
      }
    }

  }
  //根据角色查询
  if (param.role) {
    if (user.role.includes(param.role)) {
      return await exec({
        role: _.in(user.role),
        disabled: false
      });
    } else {
      return {
        code: '2002',
        msg: `no records for ${param.role} role`,
        data: null
      }
    }
  }
  async function exec(filter = {}) {
    try {
      const res = await COLION.where({
        ...filter,
        due_date: _.gte(param.currentDate),
        start_date: _.lte(param.currentDate)
      }).get();
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