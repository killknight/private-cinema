'use strict';
const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, data } = event;
  const auth = context.auth;
  
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
    const res = await db.collection('im-quick-replies')
      .where({
        status: true
      })
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
    const res = await db.collection('im-quick-replies')
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
    
    const { _id, ...updateData } = data;
    // updateData.update_by = auth.uid;
		const updateDate = data;
		delete updateDate._id;
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