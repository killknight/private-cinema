// teamManager 云函数 - 员工管理模块
'use strict';

const db = uniCloud.database();
const _ = db.command;
const teamMembersCollection = db.collection('team_members');
const fs = require('fs');
const path = require('path');

/**
 * 员工管理云函数
 * @param {Object} event - 事件参数
 * @param {string} event.action - 操作类型: getAllMembers, getMemberById, createMember, updateMember, deleteMember
 * @param {Object} event.data - 操作数据
 * @returns {Object} 返回结果
 */
exports.main = async (event, context) => {
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'getAllMembers':
        return await getAllMembers(data);
      case 'getMemberById':
        return await getMemberById(data);
      case 'createMember':
        return await createMember(data);
      case 'updateMember':
        return await updateMember(data);
      case 'deleteMember':
        return await deleteMember(data);
      default:
        return {
          code: 400,
          message: '无效的操作类型'
        };
    }
  } catch (error) {
    console.error('员工管理云函数错误:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

/**
 * 获取所有员工列表
 * @param {Object} data - 查询参数
 * @param {string} data.searchText - 搜索文本
 * @param {number} data.limit - 返回数量限制
 * @returns {Object} 员工列表
 */
async function getAllMembers(data = {}) {
  const { searchText = '', limit = 100 } = data;
  
  let query = teamMembersCollection;
  
  // 如果有搜索文本，添加搜索条件
  if (searchText) {
    query = query.where(_.or([
      { name: db.RegExp({ regexp: searchText, options: 'i' }) },
      { position: db.RegExp({ regexp: searchText, options: 'i' }) }
    ]));
  }
  
  // 按order字段排序
  query = query.orderBy('order', 'asc');
  
  const result = await query.limit(limit).get();
  
  return {
    code: 200,
    data: {
      members: result.data
    },
    message: '获取员工列表成功'
  };
}

/**
 * 根据ID获取员工详情
 * @param {Object} data - 查询参数
 * @param {string} data._id - 员工ID
 * @returns {Object} 员工详情
 */
async function getMemberById(data) {
  if (!data._id) {
    return {
      code: 400,
      message: '员工ID不能为空'
    };
  }
  
  const result = await teamMembersCollection.doc(data._id).get();
  
  if (!result.data) {
    return {
      code: 404,
      message: '员工不存在'
    };
  }
  
  return {
    code: 200,
    data: result.data[0],
    message: '获取员工详情成功'
  };
}

/**
 * 创建新员工
 * @param {Object} data - 员工数据
 * @returns {Object} 创建结果
 */
async function createMember(data) {
  // 基础字段验证
  if (!data.name || !data.position || !data.phone) {
    return {
      code: 400,
      message: '姓名、职位和联系电话为必填项'
    };
  }
  
  // 准备员工数据
  const memberData = {
    name: data.name,
    position: data.position,
    phone: data.phone,
    email: data.email || '',
    avatar: data.avatar || '',
    bio: data.description || '',
    socialIcons: data.socialIcons || [],
    type: data.type || 'service',
    order: data.order || 999,
    createTime: db.serverDate(),
    updateTime: db.serverDate(),
    lifeMoments: [],
    interests: []
  };
  
  const result = await teamMembersCollection.add(memberData);
  
  return {
    code: 200,
    data: {
      _id: result.id
    },
    message: '创建员工成功'
  };
}

/**
 * 更新员工信息
 * @param {Object} data - 员工数据
 * @returns {Object} 更新结果
 */
async function updateMember(data) {
  if (!data._id) {
    return {
      code: 400,
      message: '员工ID不能为空'
    };
  }
  
  // 检查员工是否存在
  const memberInfo = await teamMembersCollection.doc(data._id).get();
  if (!memberInfo.data) {
    return {
      code: 404,
      message: '员工不存在'
    };
  }
  
  // 准备更新数据
  const updateData = {
    updateTime: db.serverDate()
  };
  
  // 只更新提供的字段
  if (data.name !== undefined) updateData.name = data.name;
  if (data.position !== undefined) updateData.position = data.position;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.avatar !== undefined) updateData.avatar = data.avatar;
  if (data.description !== undefined) updateData.bio = data.description;
  if (data.socialIcons !== undefined) updateData.socialIcons = data.socialIcons;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.order !== undefined) updateData.order = data.order;
  
  await teamMembersCollection.doc(data._id).update(updateData);
  
  return {
    code: 200,
    message: '更新员工信息成功'
  };
}

/**
 * 删除员工
 * @param {Object} data - 删除参数
 * @param {string} data._id - 员工ID
 * @returns {Object} 删除结果
 */
async function deleteMember(data) {
  if (!data._id) {
    return {
      code: 400,
      message: '员工ID不能为空'
    };
  }
  
  // 检查员工是否存在
  const memberInfo = await teamMembersCollection.doc(data._id).get();
  if (!memberInfo.data) {
    return {
      code: 404,
      message: '员工不存在'
    };
  }
  
  // 如果有头像文件，尝试删除头像文件
  if (memberInfo.data.avatar && memberInfo.data.avatar.includes('cloud://')) {
    try {
      // 从URL中提取文件ID
      const fileID = memberInfo.data.avatar;
      await uniCloud.deleteFile({
        fileList: [fileID]
      });
    } catch (error) {
      console.warn('删除头像文件失败，但继续删除员工记录:', error);
    }
  }
  
  // 删除员工记录
  await teamMembersCollection.doc(data._id).remove();
  
  return {
    code: 200,
    message: '删除员工成功'
  };
}