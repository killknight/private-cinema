export default callback => {
  // 记录socket 重连次数
  let socketOpenIndex = 0
  uni.onSocketOpen(()=>{
    console.log('WebSocket 连接已打开！');
    // 更新socketIsClose状态为false（未关闭）
    if (uni.imObservableData) {
      uni.imObservableData.socketIsClose = false;
    }
    // 记录socket连接次数
    socketOpenIndex++
    callback(true,socketOpenIndex)
  });
  uni.onSocketClose(()=>{
    console.log('WebSocket 已关闭！');
    // 更新socketIsClose状态为true（已关闭）
    if (uni.imObservableData) {
      uni.imObservableData.socketIsClose = true;
    }
    callback(false,socketOpenIndex)
  });
}