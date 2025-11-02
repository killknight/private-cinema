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
    
    // 收集图片的fileID，只收集有效的cloud://格式的路径
    if (cinemaData) {
      // 收集公众号二维码和logo图片
      if (cinemaData.wechatQrCode && cinemaData.wechatQrCode.startsWith('cloud://')) fileIds.push(cinemaData.wechatQrCode);
      if (cinemaData.logoImage && cinemaData.logoImage.startsWith('cloud://')) fileIds.push(cinemaData.logoImage);
      // 收集影院介绍图片
      if (cinemaData.cinemaIntroImage && cinemaData.cinemaIntroImage.startsWith('cloud://')) fileIds.push(cinemaData.cinemaIntroImage);
      
      // 收集环境图片
      if (cinemaData.environments && cinemaData.environments.length > 0) {
        cinemaData.environments.forEach(env => {
          if (env.image && env.image.startsWith('cloud://')) fileIds.push(env.image);
        });
      }
    }
    
    // 收集服务团队头像的fileID
    if (staffRes.data && staffRes.data.length > 0) {
      staffRes.data.forEach(staff => {
        if (staff.avatar && staff.avatar.startsWith('cloud://')) fileIds.push(staff.avatar);
      });
    }
    
    // 收集包厢图片的fileID
    if (roomsRes.data && roomsRes.data.length > 0) {
      roomsRes.data.forEach(room => {
        if (room.cover && room.cover.startsWith('cloud://')) fileIds.push(room.cover);
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
            } else {
              console.warn(`获取文件URL失败，fileID: ${file.fileID}, 错误信息: ${file.message}`);
            }
          });
        }
      } catch (err) {
        console.error('获取临时链接失败:', err);
        // 继续执行，不中断流程，缺少部分图片URL不应该阻止整体响应
      }
    }
    
    // 转换环境图片URL并确保包含name字段：保留源fileID并添加新的URL字段
    const environmentData = (cinemaData && cinemaData.environments) ? [...cinemaData.environments] : [];
    environmentData.forEach(env => {
      if (env.image) {
        // 只对存在于fileIdMap中的cloud://格式路径进行转换为临时URL
        // 保留源image字段（fileID），添加新的image_url字段
        if (fileIdMap[env.image]) {
          env.image_url = fileIdMap[env.image];
        }
        // 对于本地临时路径，保持不变
      }
      // 确保每个环境图片都有name字段，默认为空字符串
      if (!env.hasOwnProperty('name')) {
        env.name = '';
      }
    });
    
    // 转换服务团队头像URL并映射字段：保留源avatar字段（fileID），添加新的avatar_url字段
    let staffData = staffRes.data || [];
    staffData = staffData.map(staff => ({
      _id: staff._id,
      name: staff.name,
      position: staff.position,
      description: staff.bio, // 将bio字段映射为description
      avatar: staff.avatar, // 保留原始fileID
      // 只对存在于fileIdMap中的cloud://格式路径添加URL字段
      avatar_url: staff.avatar && fileIdMap[staff.avatar] ? fileIdMap[staff.avatar] : null
    }));
    
    // 转换包厢图片URL并确保字段名正确：保留源cover字段（fileID），添加新的cover_url和image_url字段
    const roomsData = roomsRes.data || [];
    roomsData.forEach(room => {
      if (room.cover && fileIdMap[room.cover]) {
        // 保留原始fileID
        // 添加新的URL字段
        room.cover_url = fileIdMap[room.cover];
        room.image_url = room.cover_url; // 同时添加image_url字段以兼容前端
        // 为了保持向后兼容，仍设置image字段为fileID
        if (!room.image) {
          room.image = room.cover;
        }
      }
      // 对于本地临时路径，保持不变
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
    
    // 转换主要图片fileID为临时URL供前端展示
    // 保留源fileID字段，添加新的URL字段（在源字段后加_url）
    if (cinemaInfo.wechatQrCode && fileIdMap[cinemaInfo.wechatQrCode]) {
      cinemaInfo.wechatQrCode_url = fileIdMap[cinemaInfo.wechatQrCode];
    }
    if (cinemaInfo.logoImage && fileIdMap[cinemaInfo.logoImage]) {
      cinemaInfo.logoImage_url = fileIdMap[cinemaInfo.logoImage];
    }
    if (cinemaInfo.cinemaIntroImage && fileIdMap[cinemaInfo.cinemaIntroImage]) {
      cinemaInfo.cinemaIntroImage_url = fileIdMap[cinemaInfo.cinemaIntroImage];
    }
    
    // 设置默认值
    if (!cinemaInfo.cinemaName) cinemaInfo.cinemaName = "星展影院";
    if (!cinemaInfo.openTime) cinemaInfo.openTime = "10:00";
    if (!cinemaInfo.closeTime) cinemaInfo.closeTime = "24:00";
    if (!cinemaInfo.address) cinemaInfo.address = "北京市朝阳区建国路88号";
    if (!cinemaInfo.phone) cinemaInfo.phone = "400-123-4567";
    // 图片字段默认空值，避免使用不存在的默认图片
    if (!cinemaInfo.wechatQrCode) cinemaInfo.wechatQrCode = '';
    if (!cinemaInfo.logoImage) cinemaInfo.logoImage = '';
    if (!cinemaInfo.cinemaIntroImage) cinemaInfo.cinemaIntroImage = '';
    if (!cinemaInfo.latitude) cinemaInfo.latitude = 39.908823;
    if (!cinemaInfo.longitude) cinemaInfo.longitude = 116.466544;
    
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