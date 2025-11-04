'use strict';

exports.main = async (event, context) => {
  try {
    const { action } = event;
    
    // 根据action参数决定执行哪个功能
    switch (action) {
      case 'getUserList':
        return await getUserList(event, context);
      case 'updateUserRole':
        return await updateUserRole(event, context);
      default:
        return {
          code: 400,
          msg: '无效的action参数'
        };
    }
  } catch (error) {
    console.error('处理请求失败:', error);
    return {
      code: 500,
      msg: '服务器内部错误'
    };
  }
};

// 获取用户列表函数
async function getUserList(event, context) {
  const { page = 1, pageSize = 10, keyword = '' } = event;
  
  // 验证参数
  if (!page || !pageSize || page < 1 || pageSize < 1 || pageSize > 100) {
    return {
      code: 400,
      msg: '参数错误'
    };
  }
  
  // 计算跳过的记录数
  const skip = (page - 1) * pageSize;
  
  // 从数据库获取用户列表
  const db = uniCloud.database();
  const _ = db.command;
  
  // 构建查询条件
  let queryCondition = {};
  
  // 如果有关键字，添加昵称查询条件
  if (keyword && keyword.trim()) {
    queryCondition = {
      nickname: db.RegExp({
        regexp: keyword.trim(),
        options: 'i' // 不区分大小写
      })
    };
  }
  
  // 查询用户数据，只返回需要的字段
  const userQuery = db.collection('uni-id-users')
    .where(queryCondition)
    .field({
      _id: true,
      nickname: true,
      avatar_file: true,
      role: true,
      isAdmin: true,
      create_time: true
    })
    // 首先按isAdmin降序排序（管理员在前），然后按创建时间降序排序
    .orderBy('isAdmin', 'desc')
    .orderBy('create_time', 'desc')
    .skip(skip)
    .limit(pageSize);
  
  const userRes = await userQuery.get();
  const users = userRes.data || [];
  
  // 提取所有非空头像的fileID
  const avatarFileIds = users
    .filter(user => user.avatar_file && user.avatar_file.url && typeof user.avatar_file.url === 'string' && user.avatar_file.url.includes('cloud://'))
    .map(user => user.avatar_file.url);
  
  // 批量获取临时URL
  let tempUrls = {};
  if (avatarFileIds.length > 0) {
    try {
      const { fileList } = await uniCloud.getTempFileURL({
        fileList: avatarFileIds
      });
      
      // 创建fileID到临时URL的映射
      tempUrls = fileList.reduce((acc, file) => {
        acc[file.fileID] = file.tempFileURL;
        return acc;
      }, {});
    } catch (error) {
      console.error('获取临时头像URL失败:', error);
    }
  }
  
  // 处理用户数据，替换头像为临时URL
  const processedUsers = users.map(user => ({
    ...user,
    isAdmin: user.isAdmin || (user.role && user.role.includes('admin')) || false,
    isCustomerService: user.isCustomerService || (user.role && user.role.includes('customerService')) || false,
    // 将avatar_file.url映射到avatar字段供前端使用
    avatar: user.avatar_file && user.avatar_file.url && tempUrls[user.avatar_file.url] ? tempUrls[user.avatar_file.url] : (user.avatar_file && user.avatar_file.url ? user.avatar_file.url : '')
  }));
  
  // 再次确认排序，确保管理员排在前面
  processedUsers.sort((a, b) => {
    // 先按isAdmin降序排序
    if (a.isAdmin !== b.isAdmin) {
      return a.isAdmin ? -1 : 1;
    }
    // 再按创建时间降序排序
    return (b.create_time || 0) - (a.create_time || 0);
  });
  
  return {
    code: 0,
    msg: '获取成功',
    data: processedUsers
  };
}

// 更新用户权限函数（支持管理员和客服权限）
async function updateUserRole(event, context) {
  const { userId, isAdmin, isCustomerService } = event;
  
  // 验证参数
  if (!userId || (typeof isAdmin !== 'boolean' && typeof isCustomerService !== 'boolean')) {
    return {
      code: 400,
      msg: '参数错误'
    };
  }
  
  // 验证当前用户是否有权限设置（需要是管理员）
  const { OPENID } = context;
  const db = uniCloud.database();
  
  // 查询当前用户信息
  const currentUser = await db.collection('uni-id-users')
    .where({
      openid: OPENID
    })
    .field({
      isAdmin: true,
      role: true
    })
    .get();
  
  const currentUserInfo = currentUser.data && currentUser.data[0];
  if (!currentUserInfo || !(currentUserInfo.isAdmin || (currentUserInfo.role && currentUserInfo.role.includes('admin')))) {
    return {
      code: 403,
      msg: '权限不足'
    };
  }
  
  // 更新用户权限
  const updateData = {};
  
  // 处理管理员权限
  if (typeof isAdmin === 'boolean') {
    updateData.isAdmin = isAdmin;
    if (isAdmin) {
      updateData.role = db.command.addToSet('admin');
    } else {
      // 如果要取消管理员，从role中移除admin
      updateData.role = db.command.pull('admin');
    }
  }
  
  // 处理客服权限
  if (typeof isCustomerService === 'boolean') {
    updateData.isCustomerService = isCustomerService;
    
    // 需要先获取当前用户的role字段，避免覆盖之前的操作
    if (typeof updateData.role === 'undefined') {
      const userRes = await db.collection('uni-id-users').doc(userId).field({ role: true }).get();
      const user = userRes.data && userRes.data[0];
      updateData.role = user ? user.role || [] : [];
    }
    
    // 使用命令更新客服角色
    if (isCustomerService) {
      updateData.role = db.command.addToSet('customerService');
    } else {
      updateData.role = db.command.pull('customerService');
    }
  }
  
  const updateRes = await db.collection('uni-id-users')
    .doc(userId)
    .update(updateData);
  
  if (updateRes.updated === 1) {
    // 根据操作类型返回相应的成功消息
    let successMsg = '';
    if (typeof isAdmin === 'boolean' && typeof isCustomerService === 'boolean') {
      // 同时更新了管理员和客服权限
      successMsg = (isAdmin ? '设置管理员成功' : '取消管理员成功') + '，' + (isCustomerService ? '设置客服成功' : '取消客服成功');
    } else if (typeof isAdmin === 'boolean') {
      // 只更新了管理员权限
      successMsg = isAdmin ? '设置管理员成功' : '取消管理员成功';
    } else if (typeof isCustomerService === 'boolean') {
      // 只更新了客服权限
      successMsg = isCustomerService ? '设置客服成功' : '取消客服成功';
    }
    
    return {
      code: 0,
      msg: successMsg
    };
  } else {
    return {
      code: 404,
      msg: '用户不存在'
    };
  }
}