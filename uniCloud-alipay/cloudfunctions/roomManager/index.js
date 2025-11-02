'use strict';

const db = uniCloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { action, ...params } = event;
  
  try {
    // 根据action参数执行不同的操作
    switch (action) {
      case 'getAllRooms':
        return await getAllRooms(params);
      case 'getRoomDetail':
        return await getRoomDetail(params);
      case 'updateRoom':
        return await updateRoom(params);
      case 'deleteRoom':
        return await deleteRoom(params);
      default:
        return {
          code: 400,
          message: '未知操作类型'
        };
    }
  } catch (error) {
    console.error('操作失败:', error);
    return {
      code: 500,
      message: '服务器内部错误',
      error: error.message
    };
  }
};

// 获取所有包厢列表
async function getAllRooms({ tag, limit = 10, offset = 0, searchText = '' }) {
  try {
    // 构建查询
    let query = db.collection('rooms').orderBy('sort', 'asc');
    
    // 如果有标签筛选
    if (tag && tag !== '全部包厢') {
      query = query.where({
        tags: _.all([tag])
      });
    }
    
    // 如果有搜索文本
    if (searchText) {
      query = query.where({
        name: db.RegExp({
          regexp: searchText,
          options: 'i'
        })
      });
    }
    
    // 获取总数量
    const countResult = await query.count();
    const total = countResult.total;
    
    // 获取分页数据
    const roomsRes = await query.skip(offset).limit(limit).get();
    
    // 提取所有需要转换的fileID
    const fileIds = [];
    if (roomsRes.data && roomsRes.data.length > 0) {
      roomsRes.data.forEach(room => {
        if (room.cover) fileIds.push(room.cover);
      });
    }
    
    // 构建fileID到URL的映射
    const fileIdMap = {};
    if (fileIds.length > 0) {
      try {
        const result = await uniCloud.getTempFileURL({
          fileList: fileIds
        });
        
        if (result.fileList && result.fileList.length > 0) {
          result.fileList.forEach(file => {
            if (file.status === 0) {
              fileIdMap[file.fileID] = file.tempFileURL;
            }
          });
        }
      } catch (err) {
        console.error('获取临时链接失败:', err);
      }
    }
    
    // 转换包厢图片URL并确保字段名正确
    const roomsData = roomsRes.data || [];
    roomsData.forEach(room => {
      if (room.cover && fileIdMap[room.cover]) {
        room.cover = fileIdMap[room.cover];
        room.image = room.cover;
      }
    });
    
    // 获取所有可用标签
    const allRooms = await db.collection('rooms').get();
    const tagSet = new Set();
    allRooms.data.forEach(room => {
      if (room.tags && room.tags.length > 0) {
        room.tags.forEach(tag => tagSet.add(tag));
      }
    });
    const allTags = Array.from(tagSet);
    
    return {
      code: 200,
      message: '获取成功',
      data: {
        rooms: roomsData,
        total: total,
        tags: allTags,
        hasMore: offset + limit < total
      }
    };
  } catch (error) {
    console.error('获取包厢列表失败:', error);
    throw error;
  }
}

// 获取单个包厢详情
async function getRoomDetail({ _id }) {
  try {
    if (!_id) {
      return {
        code: 400,
        message: '缺少包厢ID'
      };
    }
    
    // 查询包厢详情
  const result = await db.collection('rooms').doc(_id).get();
  
  // 判断是否是集合类型的返回（包含data数组）
  let roomData;
  if (result.data && Array.isArray(result.data)) {
    // 如果是集合，返回第一条数据
    if (result.data.length === 0) {
      return {
        code: 404,
        message: '包厢不存在'
      };
    }
    roomData = result.data[0];
  } else if (!result.data) {
    return {
      code: 404,
      message: '包厢不存在'
    };
  } else {
    // 正常的单个文档返回
    roomData = result.data;
  }
    
    // 如果有cover字段，转换为临时URL
    if (roomData.cover) {
      try {
        const urlResult = await uniCloud.getTempFileURL({
          fileList: [roomData.cover]
        });
        
        if (urlResult.fileList && urlResult.fileList.length > 0 && urlResult.fileList[0].status === 0) {
          roomData.cover_url = urlResult.fileList[0].tempFileURL;
        }
      } catch (err) {
        console.error('获取封面URL失败:', err);
      }
    }
    
    return {
      code: 200,
      message: '获取成功',
      data: roomData
    };
  } catch (error) {
    console.error('获取包厢详情失败:', error);
    throw error;
  }
}

// 更新或添加包厢
async function updateRoom({ roomInfo, type, _id }) {
  try {
    // 验证参数
    if (!roomInfo) {
      return {
        code: 400,
        message: '缺少包厢信息'
      };
    }
    
    // 基本字段验证
    if (!roomInfo.name || roomInfo.name.trim() === '') {
      return {
        code: 400,
        message: '包厢名称不能为空'
      };
    }
    
    if (roomInfo.price <= 0) {
      return {
        code: 400,
        message: '价格必须大于0'
      };
    }
    
    if (!roomInfo.cover) {
      return {
        code: 400,
        message: '请上传包厢封面图片'
      };
    }
    
    // 准备数据
    const roomData = {
      name: roomInfo.name.trim(),
      capacity: roomInfo.capacity || 1,
      price: roomInfo.price,
      priceUnit: roomInfo.priceUnit || '',
      description: roomInfo.description || '',
      tags: roomInfo.tags || [],
      hot: !!roomInfo.hot,
      themed: !!roomInfo.themed,
      sort: roomInfo.sort !== undefined ? roomInfo.sort : 999,
      cover: roomInfo.cover
    };
    
    // 添加创建/更新时间
    if (type === 'add') {
      roomData.createTime = new Date();
      roomData.updateTime = new Date();
      // 添加操作
      const addResult = await db.collection('rooms').add(roomData);
      return {
        code: 200,
        message: '添加成功',
        data: {
          _id: addResult.id
        }
      };
    } else if (type === 'edit') {
      if (!_id) {
        return {
          code: 400,
          message: '编辑操作缺少包厢ID'
        };
      }
      
      // 检查包厢是否存在
      const existingRoom = await db.collection('rooms').doc(_id).get();
      if (!existingRoom.data) {
        return {
          code: 404,
          message: '包厢不存在'
        };
      }
      
      roomData.updateTime = new Date();
      // 编辑操作
      await db.collection('rooms').doc(_id).update(roomData);
      return {
        code: 200,
        message: '更新成功'
      };
    } else {
      return {
        code: 400,
        message: '无效的操作类型'
      };
    }
  } catch (error) {
    console.error('保存包厢信息失败:', error);
    throw error;
  }
}

// 删除包厢
async function deleteRoom({ _id }) {
  try {
    if (!_id) {
      return {
        code: 400,
        message: '缺少包厢ID'
      };
    }
    
    // 检查包厢是否存在
    const room = await db.collection('rooms').doc(_id).get();
    if (!room.data) {
      return {
        code: 404,
        message: '包厢不存在'
      };
    }
    
    // 删除包厢记录
    await db.collection('rooms').doc(_id).remove();
    
    // 如果有封面图片，删除图片
    if (room.data.cover && room.data.cover.startsWith('cloud://')) {
      try {
        await uniCloud.deleteFile({
          fileList: [room.data.cover]
        });
      } catch (err) {
        console.error('删除封面图片失败:', err);
        // 图片删除失败不影响包厢删除操作
      }
    }
    
    return {
      code: 200,
      message: '删除成功'
    };
  } catch (error) {
    console.error('删除包厢失败:', error);
    throw error;
  }
}