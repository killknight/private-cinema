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
    
    let employeeData = employeeRes.data;
    
    // 收集需要转换的fileID
    const fileIds = [];
    
    // 添加头像fileID
    if (employeeData.avatar) {
      fileIds.push(employeeData.avatar);
    }
    
    // 添加成就图片fileID
    if (employeeData.achievements && Array.isArray(employeeData.achievements)) {
      employeeData.achievements.forEach(achievement => {
        if (achievement.image) {
          fileIds.push(achievement.image);
        }
      });
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
    
    // 转换成就图片URL
    if (employeeData.achievements && Array.isArray(employeeData.achievements)) {
      employeeData.achievements = employeeData.achievements.map(achievement => {
        if (achievement.image && fileIdMap[achievement.image]) {
          return {
            ...achievement,
            image: fileIdMap[achievement.image]
          };
        }
        return achievement;
      });
    } else {
      // 如果没有成就数据，提供默认数据
      employeeData.achievements = [
        {
          image: '/static/banner/bj1.jpg',
          title: '参加国际电影节',
          description: '2023年参加戛纳电影节，与国际导演交流学习'
        }
      ];
    }
    
    // 转换生活照URL
    if (employeeData.lifeMoments && Array.isArray(employeeData.lifeMoments)) {
      employeeData.lifeMoments = employeeData.lifeMoments.map(moment => {
        return moment && fileIdMap[moment] ? fileIdMap[moment] : moment;
      });
    } else {
      // 如果没有生活照数据，提供默认数据
      employeeData.lifeMoments = [
        '/static/banner/bj1.jpg',
        '/static/banner/bj2.jpg',
        '/static/banner/bj3.jpg',
        '/static/bx.jpg',
        '/static/logo.png',
        '/static/banner/bj1.jpg'
      ];
    }
    
    // 确保兴趣爱好字段存在
    if (!employeeData.interests) {
      employeeData.interests = ['电影收藏', '徒步旅行', '咖啡品鉴', '摄影'];
    }
    
    // 确保个人简介字段存在
    if (!employeeData.bio) {
      employeeData.bio = '作为一名资深电影爱好者，我从小就对光影世界充满好奇。毕业后投身影院行业，从基层做起，积累了十年的管理经验。2018年创立星辰影院，希望打造一个真正以观众体验为中心的私人观影空间。\n\n工作之余，我喜欢收藏经典电影周边，徒步旅行，以及和团队一起探索新的电影技术。\n\n我相信，只有真正热爱的人，才能为观众带来最纯粹的观影享受。';
    }
    
    // 确保name和position字段存在
    if (!employeeData.name) {
      employeeData.name = '员工姓名';
    }
    if (!employeeData.position) {
      employeeData.position = '职位名称';
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