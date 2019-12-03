// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

function checkParamFormat(param) {
  const actionSet = new Set(['edit', 'delete', 'addRole', 'removeRole'])
  const {
    _id,
    data,
    action = 'edit',
  } = param;

  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (typeof(action) !== 'string' || !actionSet.has(action)) {
    res.code = '1003';
    res.msg.push('action:string must be one of [edit|delete|addRole|removeRole]')
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

  if (data === undefined && action !== 'delete') {
    res.code = '1000';
    res.msg.push('data:object')
  } else {
    if (action === 'edit') {
      if (data['name'] === undefined && data['role'] === undefined && data['power'] === undefined) {
        res.code = '1002';
        res.msg = 'should set one of them:data.name:string,data.role:array,data.power:arraye';
      } else {
        if (data.name && typeof(data.name) != 'string') {
          res.code = '1001';
          res.msg.push('data.name:string')
        }
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

    if (action === 'addRole') {
      if (!data.role || !(data.role instanceof Array)) {
        res.code = '1001';
        res.msg.push('data.role:array')
      }
    }
    if (action === 'removeRole') {
      if (!data.role || typeof(data.role) !== 'string') {
        res.code = '1001';
        res.msg.push('data.role:string')
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
    let param = {
      _id
    }
    if (action === 'edit') {
      param['data'] = data;
    }

    if (action === 'addRole' || action === 'removeRole') {
      param['data'] = {
        role: data.role
      }
    }

    res.msg = '';
    res.data = {
      ...param,
      action
    };
  }
  return res;
}
// 权限验证
async function checkPermission() {
  const wxContext = cloud.getWXContext();
  //角色验证
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        open_id: wxContext.OPENID
      }
    })
    if (!curUserInfo.result.data.power.includes('account_admin')) {
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
  const DB = cloud.database();
  const record = DB.collection('user').doc(data._id)
  const _ = DB.command
  let res;
  try {
    if (data.action === 'delete') {
      res = await record.remove();
    } else {
      let userInfo = {};
      if (data.action === 'edit') {
        userInfo = {
          data: data.data
        };
      }
      if (data.action === 'addRole') {
        userInfo = {
          data: {
            role: _.push(data.data.role)
          }
        };
      }
      if (data.action === 'removeRole') {
        userInfo = {
          data: {
            role: _.pull(data.data.role)
          }
        };
      }
      res = await record.update(userInfo)
    }

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
 *  },
 *  action:'' [edit|delete|addRole|removeRole]
 * }
 * 
 */
// 云函数入口函数
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code != '0000') {
    return param;
  }
  // 验证 role 和 power 值得合法性
  const permission = await checkPermission();
  if (permission.code != '0000') {
    return permission;
  }

  return await updateUserInfo(param.data);
}