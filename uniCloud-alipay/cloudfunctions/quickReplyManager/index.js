'use strict';
const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, data } = event;
  const auth = context.auth;
  
  // 将event设置为全局变量，以便在各个函数中访问
  global.event = event;
  
  // 根据操作类型执行不同的逻辑
  switch (action) {
    case 'getReplies':
      return await getReplies();
    case 'createReply':
      return await createReply(data, auth);
    case 'updateReply':
      return await updateReply(data, auth);
    case 'deleteReply':
      return await deleteReply(data, auth);
    case 'getAllReplies':
      return await getAllReplies();
    default:
      return { code: 400, message: '不支持的操作类型' };
  }
};

// 获取所有启用的快捷回复（用于客服端显示）
async function getReplies() {
  try {
    // 获取type参数，默认为customerService
    const type = global.event?.type || 'customerService';
    
    // 构建查询条件
    const queryCondition = {
      status: true
    };
    
    // 如果指定了type，则添加类型筛选条件
    if (type) {
      queryCondition.type = type;
    }
    
    const res = await db.collection('im-quick-replies')
      .where(queryCondition)
      .orderBy('sort', 'asc')
      .get();
    
    // 只返回content字段用于显示
    const quickReplyList = res.data.map(item => item.content);
    
    return {
      code: 200,
      message: '获取成功',
      data: quickReplyList
    };
  } catch (error) {
    console.error('获取快捷回复失败:', error);
    return {
      code: 500,
      message: '获取快捷回复失败',
      error: error.message
    };
  }
}

// 获取所有快捷回复（用于管理界面）
async function getAllReplies() {
  try {
    // 获取type参数（从event中获取）
    const type = global.event?.type;
    
    // 构建查询条件
    const queryCondition = {};
    
    // 如果指定了type，则添加类型筛选条件
    if (type !== undefined && type !== null) {
      queryCondition.type = type;
    }
    
    const res = await db.collection('im-quick-replies')
      .where(queryCondition)
      .orderBy('sort', 'asc')
      .get();
    
    return {
      code: 200,
      message: '获取成功',
      data: res.data
    };
  } catch (error) {
    console.error('获取所有快捷回复失败:', error);
    return {
      code: 500,
      message: '获取所有快捷回复失败',
      error: error.message
    };
  }
}

// 创建快捷回复
async function createReply(data, auth) {
  try {
    // 检查权限
    // if (!auth) {
    //   return { code: 401, message: '请先登录' };
    // }
    
    const result = await db.collection('im-quick-replies').add({
      content: data.content,
      sort: data.sort || 0,
      status: data.status !== undefined ? data.status : true,
      type: data.type || 'customerService', // 添加type字段，默认为customerService
      // create_by: auth.uid,
      // update_by: auth.uid,
      create_date: new Date(),
      update_date: new Date()
    });
    
    return {
      code: 200,
      message: '创建成功',
      data: {
        _id: result.id
      }
    };
  } catch (error) {
    console.error('创建快捷回复失败:', error);
    return {
      code: 500,
      message: '创建快捷回复失败',
      error: error.message
    };
  }
}

// 更新快捷回复
async function updateReply(data, auth) {
  try {
    // 检查权限
    // if (!auth) {
    //   return { code: 401, message: '请先登录' };
    // }
    
    const { _id } = data;
    // updateData.update_by = auth.uid;
    
		const updateData = data;
    // 如果data中包含type字段，则更新它；如果没有，可以选择设置默认值
    if (updateData.type === undefined) {
      updateData.type = 'customerService'; // 默认为customerService
    }
    
    updateData.update_date = new Date();
    
    await db.collection('im-quick-replies')
      .doc(_id)
      .update(updateData);
    
    return {
      code: 200,
      message: '更新成功'
    };
  } catch (error) {
    console.error('更新快捷回复失败:', error);
    return {
      code: 500,
      message: '更新快捷回复失败',
      error: error.message
    };
  }
}

// 删除快捷回复
async function deleteReply(data, auth) {
  try {
    // 检查权限
    // if (!auth) {
    //   return { code: 401, message: '请先登录' };
    // }
    
    await db.collection('im-quick-replies')
      .doc(data._id)
      .remove();
    
    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除快捷回复失败:', error);
    return {
      code: 500,
      message: '删除快捷回复失败',
      error: error.message
    };
  }
}