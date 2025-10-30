'use strict';

exports.main = async (event, context) => {
  try {
    // 获取数据库实例
    const db = uniCloud.database();
    
    // 并行查询所有需要的数据
    const [cinemaInfoRes, staffRes, roomsRes] = await Promise.all([
      db.collection('cinema_info').get(), // 改为获取所有数据，因为数据可能在数组中
      db.collection('team_members').where({ type: 'service' }).orderBy('order', 'asc').get(),
      db.collection('rooms').orderBy('order', 'asc').get()
    ]);
    
    // 提取所有需要转换的fileID
    const fileIds = [];
    
    // 处理cinemaInfo数据结构，可能在data[0]或者data['0']中
    let cinemaData = null;
    if (cinemaInfoRes && cinemaInfoRes.data) {
      if (Array.isArray(cinemaInfoRes.data) && cinemaInfoRes.data.length > 0) {
        cinemaData = cinemaInfoRes.data[0];
      } else if (cinemaInfoRes.data['0']) {
        cinemaData = cinemaInfoRes.data['0'];
      } else {
        cinemaData = cinemaInfoRes.data;
      }
    }
    
    // 收集环境图片的fileID
    if (cinemaData && cinemaData.environments && cinemaData.environments.length > 0) {
      cinemaData.environments.forEach(env => {
        if (env.image) fileIds.push(env.image);
      });
    }
    
    // 收集服务团队头像的fileID
    if (staffRes.data && staffRes.data.length > 0) {
      staffRes.data.forEach(staff => {
        if (staff.avatar) fileIds.push(staff.avatar);
      });
    }
    
    // 收集包厢图片的fileID
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
    
    // 转换环境图片URL
    const environmentData = (cinemaData && cinemaData.environments) ? [...cinemaData.environments] : [];
    environmentData.forEach(env => {
      if (env.image) {
        if (fileIdMap[env.image]) {
          env.image = fileIdMap[env.image];
        }
      }
    });
    
    // 转换服务团队头像URL并映射字段
    let staffData = staffRes.data || [];
    staffData = staffData.map(staff => ({
      _id: staff._id,
      name: staff.name,
      position: staff.position,
      description: staff.bio, // 将bio字段映射为description
      avatar: staff.avatar && fileIdMap[staff.avatar] ? fileIdMap[staff.avatar] : staff.avatar
    }));
    
    // 转换包厢图片URL并确保字段名正确
    const roomsData = roomsRes.data || [];
    roomsData.forEach(room => {
      if (room.cover && fileIdMap[room.cover]) {
        // 为了兼容前端，同时设置cover和image字段
        room.cover = fileIdMap[room.cover];
        room.image = room.cover; // 确保前端可以通过image字段访问
      }
    });
    
    // 处理cinemaInfo数据，确保返回正确的结构
    let cinemaInfo = {};
    if (cinemaData) {
      cinemaInfo = {...cinemaData};
      
      // 确保story字段存在且为数组
      if (!cinemaInfo.story) {
        cinemaInfo.story = [];
      } else if (typeof cinemaInfo.story === 'object' && !Array.isArray(cinemaInfo.story)) {
        // 如果story是对象但不是数组，转换为数组
        const storyArray = [];
        let hasContent = false;
        
        // 尝试按数字索引顺序获取内容
        for (let i = 0; ; i++) {
          if (cinemaInfo.story.hasOwnProperty(i)) {
            storyArray.push(cinemaInfo.story[i]);
            hasContent = true;
          } else {
            break;
          }
        }
        
        // 如果没有按数字索引的内容，尝试使用Object.values
        if (!hasContent) {
          storyArray.push(...Object.values(cinemaInfo.story));
        }
        
        cinemaInfo.story = storyArray;
      }
      
      // 确保equipment字段存在且为数组
      if (!cinemaInfo.equipment) {
        cinemaInfo.equipment = [];
      } else if (typeof cinemaInfo.equipment === 'object' && !Array.isArray(cinemaInfo.equipment)) {
        // 如果equipment是对象但不是数组，尝试转换为数组
        const equipmentArray = [];
        let hasContent = false;
        
        // 尝试按数字索引顺序获取内容
        for (let i = 0; ; i++) {
          if (cinemaInfo.equipment.hasOwnProperty(i)) {
            equipmentArray.push(cinemaInfo.equipment[i]);
            hasContent = true;
          } else {
            break;
          }
        }
        
        // 如果没有按数字索引的内容，尝试使用Object.values
        if (!hasContent) {
          equipmentArray.push(...Object.values(cinemaInfo.equipment));
        }
        
        cinemaInfo.equipment = equipmentArray;
      }
      
      // 确保services字段存在且为数组
      if (!cinemaInfo.services) {
        cinemaInfo.services = [];
      } else if (typeof cinemaInfo.services === 'object' && !Array.isArray(cinemaInfo.services)) {
        // 如果services是对象但不是数组，尝试转换为数组
        const servicesArray = [];
        let hasContent = false;
        
        // 尝试按数字索引顺序获取内容
        for (let i = 0; ; i++) {
          if (cinemaInfo.services.hasOwnProperty(i)) {
            servicesArray.push(cinemaInfo.services[i]);
            hasContent = true;
          } else {
            break;
          }
        }
        
        // 如果没有按数字索引的内容，尝试使用Object.values
        if (!hasContent) {
          servicesArray.push(...Object.values(cinemaInfo.services));
        }
        
        cinemaInfo.services = servicesArray;
      }
      
      // 确保environments字段存在且为数组
      if (!cinemaInfo.environments) {
        cinemaInfo.environments = [];
      } else if (typeof cinemaInfo.environments === 'object' && !Array.isArray(cinemaInfo.environments)) {
        // 如果environments是对象但不是数组，尝试转换为数组
        const environmentsArray = [];
        let hasContent = false;
        
        // 尝试按数字索引顺序获取内容
        for (let i = 0; ; i++) {
          if (cinemaInfo.environments.hasOwnProperty(i)) {
            environmentsArray.push(cinemaInfo.environments[i]);
            hasContent = true;
          } else {
            break;
          }
        }
        
        // 如果没有按数字索引的内容，尝试使用Object.values
        if (!hasContent) {
          environmentsArray.push(...Object.values(cinemaInfo.environments));
        }
        
        cinemaInfo.environments = environmentsArray;
      }
    }
    
    // 组织返回数据
    return {
      code: 200,
      data: {
        cinemaInfo: cinemaInfo,
        environmentImages: environmentData,
        staffList: staffData,
        roomTypes: roomsData,
        // 从cinemaInfo中提取设备配置和服务亮点数据
        equipmentList: cinemaInfo.equipment || [],
        serviceList: cinemaInfo.services || []
      },
      message: '获取影院信息成功'
    };
  } catch (error) {
    console.error('获取影院信息失败:', error);
    return {
      code: 500,
      data: null,
      message: '获取影院信息失败：' + error.message
    };
  }
};