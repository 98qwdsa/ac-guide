// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

function checkParamFormat(data) {
  const wxContext = cloud.getWXContext();
  let {
    open_id,
    page
  } = data
  // 初始化页面信息
  const defaultPageConf = {
    size: 10,
    current_num: 0
  }
  const res = {
    code: '0000',
    msg: [],
    data: null
  }
  if (open_id === undefined) {
    open_id = wxContext.OPENID;
  } else {
    if (typeof(open_id) != 'string') {
      res.code = '1001';
      res.msg.push('open_id:string')
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
          res.msg.push('page.size:string')
        } else if (page.size > 20) {
          page.size = 20;
        }
      }
      if (page['current_num'] === undefined) {
        page.current_num = defaultPageConf.current_num
      } else {
        if (typeof(page.current_num) != 'number') {
          res.code = '1001';
          res.msg.push('page.current_num:string')
        }
      }
    } else {
      res.code = '1001';
      res.msg.push('page:object')
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
      page: {
        ...defaultPageConf,
        ...page
      }
    }
  }
  return res;
}

//角色验证
async function checkRole() {
  try {
    const curUserInfo = await cloud.callFunction({
      name: 'checkUserInfo',
    })
    if (curUserInfo.result.data.role.includes('HR')) {
      return {
        msg: '',
        code: '0000',
        data: null
      }
    }
    return {
      msg: 'role mismatch Function: queryAllObserver',
      code: '2000',
      data: null
    }
  } catch (e) {
    return {
      code: '3000',
      msg: e,
      daa: null
    }
  }
}

// 获取所有的观察者
async function getUserOpenId(data) {
  const DB = cloud.database();
  const _ = DB.command;
  const COLION = DB.collection('user');

  const limit = data.page.size > 20 ? 20 : data.page.size;
  const skip = data.page.current_num * limit;
  let records = {}
  try {
    const res = await COLION.skip(skip).limit(limit).where({
      role: _.in(['HR', 'PM'])
    }).get();
    if (res.data.length > 0) {
      records = {
        code: '0000',
        msg: '',
        data: res.data
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

  if (records.code === '0000') {
    return {
      code: '0000',
      msg: '',
      data: records.data
    }
  }
}



// 云函数入口函数
/**
 *  {
 *    open_id:'', //用户open_id  默认为当前访问用的open_id
 *    page:{
 *      size:'', 每页数据量
 *      current_num:'' 当前加载的页数
 *    }
 *  }
 **/
exports.main = async(event, context) => {
  const param = checkParamFormat(event);
  if (param.code !== '0000') {
    return param;
  }
  // 角色验证
  const role = await checkRole();
  if (role.code !== '0000') {
    return role
  }
  return await getUserOpenId(param.data)
}