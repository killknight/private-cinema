'use strict';

const db = uniCloud.database();
const _ = db.command;
const BANNER_COLLECTION = 'opendb-banner';

exports.main = async (event, context) => {
  const { action, data } = event;
  
  try {
    switch (action) {
      case 'list':
        return await getBannerList();
      case 'detail':
        return await getBannerDetail(data.id);
      case 'add':
        return await addBanner(data);
      case 'update':
        return await updateBanner(data.id, data);
      case 'delete':
        return await deleteBanner(data.id);
      default:
        return {
          code: 400,
          message: '不支持的操作'
        };
    }
  } catch (error) {
    console.error('Banner操作错误:', error);
    return {
      code: 500,
      message: '操作失败: ' + error.message
    };
  }
};

// 将fileID转换为临时URL
async function getTempFileURL(fileIDs) {
  if (!fileIDs || fileIDs.length === 0) {
    return {};
  }
  
  try {
    const result = await uniCloud.getTempFileURL({
      fileList: fileIDs
    });
    
    const urlMap = {};
    if (result.fileList) {
      result.fileList.forEach(item => {
        if (item.status === 0) {
          urlMap[item.fileID] = item.tempFileURL;
        }
      });
    }
    return urlMap;
  } catch (error) {
    console.error('获取临时URL失败:', error);
    return {};
  }
}

// 获取Banner列表
async function getBannerList() {
  const result = await db.collection(BANNER_COLLECTION)
    .orderBy('sort', 'asc')
    .get();
    
  let banners = result.data || [];
  
  // 收集所有需要转换的fileID
  const fileIDs = [];
  banners.forEach(item => {
    if (item.bannerfile) {
      const fileID = typeof item.bannerfile === 'string' ? item.bannerfile : (item.bannerfile.fileID || '');
      if (fileID && fileID.startsWith('cloud://')) {
        fileIDs.push(fileID);
      }
    }
  });
  
  // 批量获取临时URL
  const urlMap = await getTempFileURL(fileIDs);
  
  // 转换bannerfile字段为imageUrl供前端使用
  banners = banners.map(item => {
    let imageUrl = '';
    if (item.bannerfile) {
      if (typeof item.bannerfile === 'string') {
        // 如果是字符串格式的fileID
        imageUrl = item.bannerfile.startsWith('cloud://') ? 
          (urlMap[item.bannerfile] || item.bannerfile) : 
          item.bannerfile;
      } else if (item.bannerfile.tempFileURL) {
        // 如果已经有临时URL
        imageUrl = item.bannerfile.tempFileURL;
      } else if (item.bannerfile.url) {
        // 如果有url字段
        imageUrl = item.bannerfile.url;
      } else if (item.bannerfile.fileID) {
        // 如果有fileID字段
        imageUrl = item.bannerfile.fileID.startsWith('cloud://') ? 
          (urlMap[item.bannerfile.fileID] || item.bannerfile.fileID) : 
          item.bannerfile.fileID;
      }
    }
    
    return {
      ...item,
      imageUrl: imageUrl,
      open_url: item.open_url || ''
    };
  });
  
  return {
    code: 200,
    data: banners,
    message: '获取成功'
  };
}

// 获取Banner详情
async function getBannerDetail(id) {
  const result = await db.collection(BANNER_COLLECTION)
    .doc(id)
    .get();
    
  // 处理result.data可能是数组的情况
  if (!result.data || (Array.isArray(result.data) && result.data.length === 0)) {
    return {      
      code: 404,
      message: 'Banner不存在'
    };
  }
  
  // 从数组中获取第一个元素，如果是对象则直接使用
  const item = Array.isArray(result.data) ? result.data[0] : result.data;
  let imageUrl = '';
  
  // 处理图片URL转换
  if (item && item.bannerfile) {
    if (typeof item.bannerfile === 'string') {
      // 如果是字符串格式的fileID
      if (item.bannerfile.startsWith('cloud://')) {
        const urlMap = await getTempFileURL([item.bannerfile]);
        imageUrl = urlMap[item.bannerfile] || item.bannerfile;
      } else {
        imageUrl = item.bannerfile;
      }
    } else if (item.bannerfile.tempFileURL) {
      // 如果已经有临时URL
      imageUrl = item.bannerfile.tempFileURL;
    } else if (item.bannerfile.url) {
      // 如果有url字段
      imageUrl = item.bannerfile.url;
    } else if (item.bannerfile.fileID) {
      // 如果有fileID字段
      if (item.bannerfile.fileID.startsWith('cloud://')) {
        const urlMap = await getTempFileURL([item.bannerfile.fileID]);
        imageUrl = urlMap[item.bannerfile.fileID] || item.bannerfile.fileID;
      } else {
        imageUrl = item.bannerfile.fileID;
      }
    }
  }
  
  // 返回完整的banner数据，确保所有字段都存在
  const banner = {
    _id: item._id || '',
    bannerfile: item.bannerfile,
    title: item.title || '',
    open_url: item.open_url || '',
    description: item.description || '',
    sort: item.sort || 0,
    status: item.status !== undefined ? item.status : true,
    imageUrl: imageUrl
  };
  
  return {
    code: 200,
    data: banner,
    message: '获取成功'
  };
}

// 添加Banner
async function addBanner(data) {
  // 获取当前最大排序值
  const maxSortResult = await db.collection(BANNER_COLLECTION)
    .orderBy('sort', 'desc')
    .limit(1)
    .get();
  
  const maxSort = maxSortResult.data.length > 0 ? maxSortResult.data[0].sort : 0;
  
  const bannerData = {
    bannerfile: data.imageUrl, // 保存为bannerfile字段
    title: data.title || '',
    open_url: data.linkUrl || '', // 转换为open_url
    description: data.description || '',
    sort: maxSort + 1,
    status: true, // 默认启用
    create_time: new Date(),
    update_time: new Date()
  };
  
  const result = await db.collection(BANNER_COLLECTION).add(bannerData);
  
  return {
    code: 200,
    data: {
      _id: result._id
    },
    message: '添加成功'
  };
}

// 更新Banner
async function updateBanner(id, data) {
  const updateData = {
    update_time: new Date()
  };
  
  // 只更新有变化的字段
  if (data.title !== undefined) updateData.title = data.title;
  if (data.linkUrl !== undefined) updateData.open_url = data.linkUrl;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.bannerfile = data.imageUrl;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.sort !== undefined) updateData.sort = data.sort;
  
  await db.collection(BANNER_COLLECTION)
    .doc(id)
    .update(updateData);
  
  return {
    code: 200,
    message: '更新成功'
  };
}

// 删除Banner
async function deleteBanner(id) {
  await db.collection(BANNER_COLLECTION)
    .doc(id)
    .remove();
  
  return {
    code: 200,
    message: '删除成功'
  };
}