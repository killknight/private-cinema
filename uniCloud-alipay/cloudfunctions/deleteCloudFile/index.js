'use strict';

exports.main = async (event, context) => {
  // 获取请求参数
  const { fileIDs, fileID } = event;
  let fileList = [];
  
  // 参数验证和处理
  if (fileIDs && Array.isArray(fileIDs) && fileIDs.length > 0) {
    // 如果提供了fileIDs数组，使用该数组
    fileList = fileIDs;
  } else if (fileID) {
    // 兼容单个fileID的情况
    fileList = [fileID];
  } else {
    return {
      code: 400,
      message: '缺少fileIDs数组或fileID参数'
    };
  }
  
  try {
    // 调用云存储API删除文件
    const result = await uniCloud.deleteFile({
      fileList: fileList
    });
    
    // 返回成功结果
    return {
      code: 200,
      message: `成功删除${fileList.length}个文件`,
      data: result,
      deletedFiles: fileList
    };
  } catch (error) {
    // 捕获错误并返回
    console.error('删除文件失败:', error);
    return {
      code: 500,
      message: '文件删除失败',
      error: error.message,
      filesToDelete: fileList
    };
  }
};