// 云函数入口文件
const cloud = require('wx-server-sdk')
const typeEmu = ['power', 'role']

cloud.init({
  env: 'demo-5c0mj'
})
const DB = cloud.database();

function checkParams(data) {
  let {
    open_id = cloud.getWXContext().OPENID,
      types = []
  } = data
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (open_id === undefined) {
    res.code = '1001';
    res.msg.push('_id:string, open_id:string');
  }

  if (!(types instanceof Array)) {
    res.code = '1001';
    res.msg.push('type:array');
  } else {
    try {
      types.forEach(e => {
        if (!typeEmu.includes(e)) {
          throw new Error();
        }
      })
    } catch (e) {
      res.code = '1001';
      res.msg.push('types\'s value must be one of power|role');
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
      open_id,
      types
    }
  }
  return res;



}

async function checkPermision(data) {
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
      data: {
        open_id: data.open_id
      }
    })
    if (curUserInfo.result.code !== '0000') {
      return {
        code: '2000',
        msg: res.result,
        data: null
      }
    }

    if (!curUserInfo.result.data.power.includes('event_admin') && !curUserInfo.result.data.power.includes('account_admin')) {
      return {
        code: '2003',
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
      code: '3002',
      msg: e,
      data: null
    }
  }
}
async function getPowerList() {
  try {
    const res = await DB.collection('power').get();
    if (res.data.length) {
      const powers = [];
      res.data.forEach(e => {
        powers.push({
          code: e.code,
          label: e.label
        });
      });
      return {
        code: '0000',
        msg: '',
        data: powers
      }
    } else {
      return {
        code: '2001',
        msg: null,
        data: null
      }
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      data: null
    }
  }
}
async function getRole() {
  try {
    const res = await DB.collection('role').get();
    if (res.data.length) {
      const role = [];
      res.data.forEach(e => {
        role.push({
          code: e.code,
          label: e.label,
          tab_label: e.tab_label,
        });
      });
      return {
        code: '0000',
        msg: '',
        data: role
      }
    } else {
      return {
        code: '2002',
        msg: null,
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
}
/**
 * open_id
 * types:['pwoer'|'role']
 * 
 * **/
// 云函数入口函数
exports.main = async(event, context) => {
  const params = checkParams(event);
  if (params.code != '0000') {
    return params;
  }

  const permission = await checkPermision(params.data);
  if (permission.code !== '0000') {
    return permission;
  }
  let data = {}
  if (params.data.types.includes('power')) {
    const power = await getPowerList();
    if (power.code != '0000') {
      return power;
    }
    data['power'] = power.data
  }
  if (params.data.types.includes('role')) {
    const role = await getRole();
    if (role.code != '0000') {
      return role;
    }
    data['role'] = role.data
  }

  return {
    code: '0000',
    msg: '',
    data
  }
}