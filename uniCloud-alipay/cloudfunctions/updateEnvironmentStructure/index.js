'use strict';

exports.main = async (event, context) => {
  try {
    // 获取数据库实例
    const db = uniCloud.database();
    const _ = db.command;
    
    // 1. 查询现有的cinema_info数据
    const cinemaInfoRes = await db.collection('cinema_info').get();
    
    if (!cinemaInfoRes.data || cinemaInfoRes.data.length === 0) {
      return {
        code: 404,
        message: '未找到cinema_info数据'
      };
    }
    
    // 处理可能的不同数据结构
    let cinemaData = null;
    if (Array.isArray(cinemaInfoRes.data) && cinemaInfoRes.data.length > 0) {
      cinemaData = cinemaInfoRes.data[0];
    } else if (cinemaInfoRes.data['0']) {
      cinemaData = cinemaInfoRes.data['0'];
    } else {
      cinemaData = cinemaInfoRes.data;
    }
    
    // 2. 检查并更新environments数组
    if (cinemaData.environments) {
      let environmentsArray = [];
      
      // 确保environments是数组
      if (Array.isArray(cinemaData.environments)) {
        environmentsArray = cinemaData.environments;
      } else if (typeof cinemaData.environments === 'object') {
        // 如果是对象，尝试转换为数组
        for (let i = 0; ; i++) {
          if (cinemaData.environments.hasOwnProperty(i)) {
            environmentsArray.push(cinemaData.environments[i]);
          } else {
            break;
          }
        }
        
        // 如果没有按数字索引的内容，尝试使用Object.values
        if (environmentsArray.length === 0) {
          environmentsArray = Object.values(cinemaData.environments);
        }
      }
      
      // 为每个环境图片添加name字段（如果不存在）
      const updatedEnvironments = environmentsArray.map((env, index) => {
        // 如果没有name字段，根据索引提供默认名称
        if (!env.name) {
          const defaultNames = [
            '豪华接待大厅',
            '舒适观影区',
            '高级休息区',
            'VIP包厢',
            '休闲吧台',
            '专业音响设备',
            '智能控制系统',
            '顶级投影设备'
          ];
          
          // 使用默认名称数组或简单编号
          return {
            ...env,
            name: defaultNames[index] || `环境 ${index + 1}`
          };
        }
        return env;
      });
      
      // 3. 更新数据库
      await db.collection('cinema_info').doc(cinemaData._id).update({
        environments: updatedEnvironments
      });
      
      return {
        code: 200,
        message: '数据库结构更新成功',
        data: {
          updatedCount: updatedEnvironments.length,
          environments: updatedEnvironments
        }
      };
    } else {
      return {
        code: 400,
        message: 'cinema_info中没有environments字段'
      };
    }
  } catch (error) {
    console.error('更新数据库结构失败:', error);
    return {
      code: 500,
      message: '更新数据库结构失败：' + error.message
    };
  }
};