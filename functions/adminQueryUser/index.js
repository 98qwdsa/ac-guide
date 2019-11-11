// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParamFormat(data) {
  let {
    name,
    page
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
    res.msg = 'param ' + res.msg.join(' ') + ' is wrong';
  }

  if (res.code === '0000') {
    res.msg = 'param format ok';
    res.data = {
      name,
      page: {
        ...defaultPageConf,
        ...page
      }
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
  const param = data.name ? {
    name: data.name
  } : {};
  let records = {}
  const DB = cloud.database();
  const COLION = DB.collection('user').where(param);
<<<<<<< HEAD
  
=======

>>>>>>> 9b262834bc1502562212142367e400476af88362
  const limit = data.page.size > 20 ? 20 : data.page.size;
  const skip = data.page.current_num * limit;
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
 *  name:string
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