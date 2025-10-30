const db = uniCloud.database()

// 1- team_data - 存储团队基本信息
// 2- team_members - 存储团队成员信息，包括核心团队和服务团队
// 3- company_cultures - 存储企业文化信息
// 4- join_info - 存储加入我们信息
// 5- all_team_data - 备用的全部数据集合

exports.main = async (event, context) => {
  try {
    // 从数据库获取团队数据
    // 1. 获取团队基本信息
    const teamInfoResult = await db.collection('team_data').doc('team_info').get();
    const teamInfo = teamInfoResult.data || {};
    
    // 2. 获取核心团队成员
    const coreMembersResult = await db.collection('team_members')
      .where({ type: 'core' })
      .orderBy('order', 'asc')
      .get();
    const coreMembers = coreMembersResult.data || [];
    
    // 3. 获取服务团队成员
    const serviceMembersResult = await db.collection('team_members')
      .where({ type: 'service' })
      .orderBy('order', 'asc')
      .get();
    const serviceMembers = serviceMembersResult.data || [];
    
    // 4. 获取企业文化
    const culturesResult = await db.collection('company_cultures')
      .orderBy('order', 'asc')
      .get();
    const cultures = culturesResult.data || [];
    
    // 5. 获取加入我们信息
    const joinInfoResult = await db.collection('join_info').doc('main').get();
    const joinInfo = joinInfoResult.data || {
      title: '加入我们',
      description: '我们正在寻找热爱电影与服务的你，一起创造更多美好回忆',
      buttonText: '查看职位'
    };
    
    // 数据预处理，确保每个文档都有必要字段
    const processMember = (member) => ({
      id: member._id || member.id,
      name: member.name || '未知',
      position: member.position || '',
      bio: member.bio || '',
      avatar: member.avatar || '', // 这里保留fileID，后面统一处理转换为URL
      socialIcons: member.socialIcons || []
    });
    
    const processCulture = (culture) => ({
      id: culture._id || culture.id,
      icon: culture.icon || '',
      title: culture.title || '',
      description: culture.description || ''
    });
    
    // 提取所有成员的avatar fileID，用于批量获取临时链接
    const allMemberAvatars = [
      ...coreMembers.filter(m => m.avatar).map(m => m.avatar),
      ...serviceMembers.filter(m => m.avatar).map(m => m.avatar)
    ];
    
    // 如果有头像，批量获取临时链接
    let fileIDMap = {};
    if (allMemberAvatars.length > 0) {
      try {
        const result = await uniCloud.getTempFileURL({ 
          fileList: allMemberAvatars 
        });
        // 构建fileID到URL的映射
        fileIDMap = result.fileList.reduce((map, file) => {
          if (file.status === 0) {
            map[file.fileID] = file.tempFileURL;
          }
          return map;
        }, {});
      } catch (fileError) {
        console.error('获取临时文件链接失败:', fileError);
      }
    }
    
    // 转换成员数据中的avatar字段，从fileID转为URL
    const convertMemberAvatar = (member) => ({
      ...member,
      avatar: fileIDMap[member.avatar] || member.avatar // 如果无法获取URL，保留原fileID作为回退
    });
    
    // 处理数据并返回
    return {
      code: 0,
      message: '获取团队数据成功',
      data: {
        teamInfo: {
          title: teamInfo.title || '遇见星辰团队',
          description: teamInfo.description || '我们是一群热爱电影与服务的专业人士，致力于为您打造极致观影体验'
        },
        coreMembers: coreMembers.map(processMember).map(convertMemberAvatar),
        serviceMembers: serviceMembers.map(processMember).map(convertMemberAvatar),
        cultures: cultures.map(processCulture),
        joinInfo: joinInfo
      }
    };
  } catch (error) {
    console.error('获取团队数据失败:', error);
    
    // 如果数据库查询失败，使用备用逻辑
    try {
      // 尝试使用单文档方式获取全部数据
      const allDataResult = await db.collection('all_team_data').doc('all_info').get();
      if (allDataResult.data) {
        const allData = { ...allDataResult.data };
        
        // 提取备用数据中所有成员的avatar fileID，用于批量获取临时链接
        const fallbackMemberAvatars = [
          ...(allData.coreMembers || []).filter(m => m.avatar).map(m => m.avatar),
          ...(allData.serviceMembers || []).filter(m => m.avatar).map(m => m.avatar)
        ];
        
        // 如果有头像，批量获取临时链接
        let fallbackFileIDMap = {};
        if (fallbackMemberAvatars.length > 0) {
          try {
            const result = await uniCloud.getTempFileURL({ 
              fileList: fallbackMemberAvatars 
            });
            // 构建fileID到URL的映射
            fallbackFileIDMap = result.fileList.reduce((map, file) => {
              if (file.code === 0) {
                map[file.fileID] = file.tempFileURL;
              }
              return map;
            }, {});
          } catch (fileError) {
            console.error('获取备用数据临时文件链接失败:', fileError);
          }
        }
        
        // 转换备用数据中的头像URL
        const convertFallbackAvatar = (member) => ({
          ...member,
          avatar: fallbackFileIDMap[member.avatar] || member.avatar
        });
        
        // 更新核心团队和服务团队的头像URL
        if (allData.coreMembers && Array.isArray(allData.coreMembers)) {
          allData.coreMembers = allData.coreMembers.map(convertFallbackAvatar);
        }
        if (allData.serviceMembers && Array.isArray(allData.serviceMembers)) {
          allData.serviceMembers = allData.serviceMembers.map(convertFallbackAvatar);
        }
        
        return {
          code: 0,
          message: '获取团队数据成功（备用方式）',
          data: allData
        };
      }
    } catch (fallbackError) {
      console.error('备用数据获取也失败:', fallbackError);
    }
    
    // 所有获取方式都失败时返回错误
    return {
      code: -1,
      message: error.message || '获取团队数据失败，请检查数据库连接',
      data: null,
      error: error.toString()
    };
  }
};