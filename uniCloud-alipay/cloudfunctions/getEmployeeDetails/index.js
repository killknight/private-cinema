'use strict';

exports.main = async (event, context) => {
  try {
    // 获取数据库实例
    const db = uniCloud.database();
    const _ = db.command;
    
    // 获取员工ID参数
    const { employeeId } = event;
    
    if (!employeeId) {
      return {
        code: 400,
        message: '缺少员工ID参数'
      };
    }
    
    // 查询员工信息
    const employeeRes = await db.collection('team_members').doc(employeeId).get();
    
    if (!employeeRes.data) {
      return {
        code: 404,
        message: '未找到员工信息'
      };
    }
    
    // 判断是数组还是对象，根据情况处理
    let employeeData = null;
    if (Array.isArray(employeeRes.data) && employeeRes.data.length > 0) {
      employeeData = employeeRes.data[0];
    } else if (employeeRes.data['0']) {
      employeeData = employeeRes.data['0'];
    } else {
      employeeData = employeeRes.data;
    }
    
    // 收集需要转换的fileID
    const fileIds = [];
    
    // 添加头像fileID
    if (employeeData.avatar) {
      fileIds.push(employeeData.avatar);
    }
    
    // 添加生活照fileID
    if (employeeData.lifeMoments && Array.isArray(employeeData.lifeMoments)) {
      employeeData.lifeMoments.forEach(moment => {
        if (moment) {
          fileIds.push(moment);
        }
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
    
    // 转换头像URL
    if (employeeData.avatar && fileIdMap[employeeData.avatar]) {
      employeeData.avatar = fileIdMap[employeeData.avatar];
    }
    
    // 转换生活照URL
    if (employeeData.lifeMoments && Array.isArray(employeeData.lifeMoments)) {
      employeeData.lifeMoments = employeeData.lifeMoments.map(moment => {
        return moment && fileIdMap[moment] ? fileIdMap[moment] : moment;
      });
    }
    
    return {
      code: 200,
      data: employeeData,
      message: '获取员工信息成功'
    };
  } catch (error) {
    console.error('获取员工信息失败:', error);
    return {
      code: 500,
      data: null,
      message: '获取员工信息失败：' + error.message
    };
  }
};