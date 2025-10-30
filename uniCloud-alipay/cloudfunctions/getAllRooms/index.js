'use strict';

exports.main = async (event, context) => {
  try {
    // 获取数据库实例
    const db = uniCloud.database();
    
    // 获取筛选条件
    const { tag, limit = 10, offset = 0 } = event;
    
    // 构建查询
    let query = db.collection('rooms').orderBy('sort', 'asc');
    
    // 如果有标签筛选
    if (tag && tag !== '全部包厢') {
      query = query.where({
        tags: tag
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
            if (file.status === 0) { // 成功获取URL
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
        room.image = room.cover; // 确保前端可以通过image字段访问
      }
      
      // 添加价格信息（模拟数据，实际应该从数据库获取）
      if (room.capacity <= 2) {
        room.price = '268';
      } else if (room.capacity <= 4) {
        room.price = '368';
      } else {
        room.price = '468';
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
    console.error('获取包厢数据失败:', error);
    return {
      code: 500,
      message: '获取数据失败',
      error: error.message
    };
  }
};