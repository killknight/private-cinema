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

// 更新用户管理员权限函数
async function updateUserRole(event, context) {
  const { userId, isAdmin } = event;
  
  // 验证参数
  if (!userId || typeof isAdmin !== 'boolean') {
    return {
      code: 400,
      msg: '参数错误'
    };
  }
  
  // 验证当前用户是否有权限设置管理员（需要是管理员）
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
  
  // 更新用户管理员权限
  const updateData = {
    isAdmin: isAdmin
  };
  
  // 如果要设置为管理员，更新role字段
  if (isAdmin) {
    updateData.role = db.command.addToSet('admin');
  } else {
    // 如果要取消管理员，从role中移除admin
    updateData.role = db.command.pull('admin');
  }
  
  const updateRes = await db.collection('uni-id-users')
    .doc(userId)
    .update(updateData);
  
  if (updateRes.updated === 1) {
    return {
      code: 0,
      msg: isAdmin ? '设置管理员成功' : '取消管理员成功'
    };
  } else {
    return {
      code: 404,
      msg: '用户不存在'
    };
  }
}