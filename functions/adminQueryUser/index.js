// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

function checkParamFormat(data) {
  const actionSet = new Set(['userInRole'])
  let {
    name,
    role,
    filterRoles,
    page,
    action
  } = data;

  //初始化页面信息
  const defaultPageConf = {
    size: 10,
    current_num: 0
  }

  const res = {
    code: '0000',
    msg: [],
    data: null
  }

  if (name !== undefined && typeof(name) != 'string') {
    res.code = '1001';
    res.msg.push('param name:string wrong');
  }

  if (role !== undefined && !(role instanceof Array)) {
    res.code = '1001';
    res.msg.push('param role:array wrong');
  }

  if (filterRoles !== undefined && !(filterRoles instanceof Array)) {
    res.code = '1001';
    res.msg.push('param filterRoles:array wrong');
  }

  if (action) {
    if (actionSet.has(action)) {
      if (name == undefined && typeof(name) != 'string') {
        res.code = '1001';
        res.msg.push('param name:string wrong');
      }

      if (role == undefined && !(role instanceof Array)) {
        res.code = '1001';
        res.msg.push('param role:array wrong');
      }
    } else {
      res.code = '1002';
      res.msg.push('param action:string must be one of [UserInRole]');
    }
  }

  if (page === undefined) {
    page = defaultPageConf;
  } else {
    if (typeof(page) === 'object') {
      if (page['size'] === undefined) {
        page.size = defaultPageConf.size
      } else {
        if (typeof(page.size) != 'number') {
          res.code = '1001';
          res.msg.push('page.size:string');
        } else if (page.size > 20) {
          page.size = 20;
        }
      }
      if (page['current_num'] === undefined) {
        page.current_num = defaultPageConf.current_num
      } else {
        if (typeof(page.current_num) != 'number') {
          res.code = '1001';
          res.msg.push('page.current_num:string');
        }
      }
    } else {
      res.code = '1001';
      res.msg.push('page.object');
    }
  }

  if (res.code === '1000') {
    res.msg = 'param ' + res.msg.join(' ') + ' is required';
  }

  if (res.code === '1001') {
    res.msg = res.msg.join(' ');
  }

  if (res.code === '0000') {
    res.msg = 'param format ok';
    let extendPram = {};
    if (name) {
      extendPram = {
        name
      }
    }
    if (filterRoles) {
      extendPram = {
        filterRoles
      }
    }
    if (role) {
      extendPram = {
        role
      }
    }
    if (action === 'userInRole') {
      extendPram = {
        role,
        name
      }
      
    }
    res.data = {
      page: {
        ...defaultPageConf,
        ...page
      },
      ...extendPram,
      action
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

//获取用户列表
async function getUserList(data) {
  const DB = cloud.database();
  const _ = DB.command;
  let param = {};
  if (data.name) {
    param = {
      name: data.name
    }
  } else if (data.filterRoles && data.filterRoles.length) {
    param = {
      role: _.nin(data.filterRoles)
    }
  } else if (data.role && data.role.length) {
    param = {
      role: _.in(data.role)
    }
  }
  if (data.action === 'userInRole') {
    param = _.and([{
      name: data.name
    }, {
      role: _.nin(data.role)
    }])
  }

  const COLION = DB.collection('user').where(param);
  const limit = data.page.size > 20 ? 20 : data.page.size;
  const skip = data.page.current_num * limit;

  let records = {}
  try {
    records = await COLION.skip(skip).limit(limit).get();
    if (records.data.length > 0) {
      const userList = [];
      records.data.forEach(e => {
        userList.push(e);
      })
      records = {
        code: '0000',
        msg: '',
        data: userList
      }
    } else {
      return {
        msg: 'there is no records of this event',
        code: '2001',
        data: null
      }
    }
  } catch (e) {
    return {
      code: '3001',
      msg: e,
      data: null
    }
  }
  let count = {}
  try {
    count = await COLION.count()
    if (count.errMsg === 'collection.count:ok') {
      count = {
        code: '0000',
        msg: '',
        data: count.total
      }
    } else {
      return {
        msg: 'there is no records of this event',
        code: '2002',
        data: null
      }
    }
  } catch (e) {
    return {
      code: '3002',
      msg: e,
      data: null
    }
  }

  if (records.code === '0000' && count.code === '0000') {
    return {
      code: '0000',
      msg: '',
      data: {
        data: records.data,
        count: count.data
      }
    }
  }


}
/**
 * {
 *  [name:string|role:[]|filterRoles:[]]
 *  action:[UserInRole]
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
  if (param.code != '0000') {
    return param;
  }

  return await getUserList(param.data);
}