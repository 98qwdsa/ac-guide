// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init();

function checkParamFormat(data) {
  const wxContext = cloud.getWXContext();
  let {
    code,
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
  if (code === undefined) {
    res.code = '1000';
    res.msg.push('code:string')
  } else {
    if (typeof(code) != 'string') {
      res.code = '1001';
      res.msg.push('code:string')
    }
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
    let newPage = {};
    for (let i in defaultPageConf) {
      if (page[i] != undefined) {
        newPage[i] = page[i]
      }
    }
    res.data = {
      code,
      open_id,
      page: newPage
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
    if (curUserInfo.result.data.role.indexOf('HR') > -1) {
      return {
        msg: 'role mismatch Function: queryObserverEventDetail',
        code: '2000',
        data: null
      }
    }
    return {
      msg: '',
      code: '0000',
      data: null
    }
  } catch (e) {
    return {
      cpde: '3000',
      msg: e,
      daa: null
    }
  }
}
// 获取事件下的所有用户
async function getEventUserOpenId(data) {
  const DB = cloud.database();
  const _ = DB.command;
  const COLION = DB.collection(data.code + '_event_user');
  const limit = data.page.size > 20 ? 20 : data.page.size;
  const skip = data.page.current_num * limit;
  let records = {}
  try {
    records = await COLION.skip(skip).limit(limit).get();
    if (records.data.length > 0) {
      const userIds = [];
      records.data.forEach(e => {
        if (e.user_open_id) {
          userIds.push(e.user_open_id);
        }
      })
      records = {
        code: '0000',
        msg: '',
        data: userIds
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
    count = await COLION.where().count()
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
        open_ids: records.data,
        count: count.data
      }
    }
  }
}
//获取用户的事件详情
async function getUserEventDetail(param, data) {
  try {
    const userEventDetailList = await cloud.callFunction({
      name: 'queryMultipleUserEventDetail',
      data: {
        code: param.code,
        user_open_id_list: data.open_ids,
      }
    });
    if (userEventDetailList.result.length < 1) {
      return {
        code: '2003',
        msg: 'there is no uers in this event',
        data: null
      }
    }
    return {
      code: '0000',
      msg: '',
      data: {
        data: userEventDetailList.result,
        page_info: {
          ...param.page,
          count: data.count
        }
      }
    };
  } catch (e) {
    return {
      code: '3003',
      msg: e,
      data: null
    }
  }
}
// 云函数入口函数
/**
 *  {
 *    code:'',// 事件code
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

  const user_open_id = await getEventUserOpenId(param.data);
  if (user_open_id.code != '0000') {
    return user_open_id;
  }
  return await getUserEventDetail(param.data, user_open_id.data)
}