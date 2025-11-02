'use strict';

exports.main = async (event, context) => {
  try {
    // 获取数据库实例
    const db = uniCloud.database();
    const collection = db.collection('cinema_info');
    
    // 获取请求参数
    const { cinemaInfo = {} } = event;
    
    // 处理图片上传：前端已直接上传文件到云存储，云函数接收的是真实的cloud://格式fileID
const imageTypes = ['wechatQrCode', 'logoImage', 'cinemaIntroImage'];

// 处理主要图片：验证fileID格式，确保是有效的cloud://格式路径
for (const imageType of imageTypes) {
  const fileID = cinemaInfo[imageType];
  if (fileID && typeof fileID === 'string' && !fileID.startsWith('cloud://')) {
    console.log(`警告: ${imageType}不是有效的cloud://格式路径`);
    cinemaInfo[imageType] = ''; // 非有效路径设为空字符串
  }
}
    
    // 处理环境图片：验证fileID格式，确保是有效的cloud://格式路径
if (cinemaInfo.environments && Array.isArray(cinemaInfo.environments)) {
  for (let i = 0; i < cinemaInfo.environments.length; i++) {
    const env = cinemaInfo.environments[i];
    if (env && env.image && typeof env.image === 'string' && !env.image.startsWith('cloud://')) {
      console.log(`警告: 环境图片${i}不是有效的cloud://格式路径`);
      env.image = ''; // 非有效路径设为空字符串
    }
  }
}
    
    // 确保必填字段类型正确
    if (!Array.isArray(cinemaInfo.tags)) {
      cinemaInfo.tags = [];
    }
    if (!Array.isArray(cinemaInfo.story)) {
      cinemaInfo.story = [];
    }
    if (!Array.isArray(cinemaInfo.equipment)) {
      cinemaInfo.equipment = [];
    }
    if (!Array.isArray(cinemaInfo.services)) {
      cinemaInfo.services = [];
    }
    if (!Array.isArray(cinemaInfo.environments)) {
      cinemaInfo.environments = [];
    }
    
    // 设置更新时间
    cinemaInfo.updateTime = Date.now();
    
    // 查询是否已有影院信息记录
    const res = await collection.get();
    let result;
    
    if (res.data && res.data.length > 0) {
      // 更新现有记录
      result = await collection.doc(res.data[0]._id).update(cinemaInfo);
    } else {
      // 创建新记录，设置创建时间
      cinemaInfo.createTime = Date.now();
      result = await collection.add(cinemaInfo);
    }
    
    // 获取更新后的数据
    const updatedRes = await collection.get();
    let updatedData = updatedRes.data && updatedRes.data.length > 0 ? updatedRes.data[0] : null;
    
    // 处理环境图片URL：前端已直接上传文件到云存储并获取了真实的fileID
    // 无需转换，直接保留前端传来的fileID
    if (updatedData && updatedData.environments && updatedData.environments.length > 0) {
      console.log('环境图片数据:', JSON.stringify(updatedData.environments));
    }
    
    // 处理主要图片URL：前端已直接上传文件到云存储并获取了真实的fileID
    // 无需转换，直接保留前端传来的fileID
    if (updatedData && imageTypes) {
      console.log('主要图片数据类型检查:');
      imageTypes.forEach(type => {
        if (updatedData[type]) {
          console.log(`${type}:`, typeof updatedData[type]);
        }
      });
    }
    
    return {
      code: 200,
      data: updatedData,
      message: '更新影院信息成功'
    };
  } catch (error) {
    console.error('更新影院信息失败:', error);
    return {
      code: 500,
      data: null,
      message: '更新影院信息失败：' + error.message
    };
  }
};