// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const DB = cloud.database();
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
          label: e.label
        });
      });
      return {
        code: '0000',
        msg: '',
        data: role
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
      code: '3001',
      msg: e,
      data: null
    }
  }
}
// 云函数入口函数
exports.main = async(event, context) => {
  const power = await getPowerList();
  if (power.code != '0000') {
    return power;
  }
  const role = await getRole();
  if (role.code != '0000') {
    return role;
  }

  return {
    code: '0000',
    msg: '',
    data: {
      power: power.data,
      role: role.data
    }
  }
}