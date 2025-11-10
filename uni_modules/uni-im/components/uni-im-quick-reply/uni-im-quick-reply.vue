<template>
  <view class="uni-im-quick-reply" :class="{ 'show': show }">
    <view class="quick-reply-mask" @click="hide"></view>
    <view class="quick-reply-content">
      <view class="quick-reply-header">
        <text class="quick-reply-title">快捷回复</text>
        <text class="quick-reply-close" @click="hide">✕</text>
      </view>
      <scroll-view class="quick-reply-list" scroll-y>
        <view 
          v-for="(reply, index) in quickReplyList" 
          :key="index" 
          class="quick-reply-item"
          @click="selectReply(reply)"
        >
          <text class="quick-reply-text">{{ reply }}</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'uni-im-quick-reply',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'select'],
  watch: {
    show(newVal) {
      // 监听显示状态变化，确保动画效果正常触发
      if (newVal) {
        this.$nextTick(() => {
          // 强制重绘以确保动画正常播放
          const container = uni.createSelectorQuery().in(this).select('.uni-im-quick-reply');
          container.fields({ size: true }, () => {}).exec();
        });
        // 当组件显示时获取快捷回复数据
        this.fetchQuickReplies();
      }
    }
  },
  data() {
    return {
      // 快捷回复内容数组
      quickReplyList: [],
      // 默认的快捷回复内容，当云函数调用失败时使用
      defaultQuickReplies: [
        '您好，欢迎使用在线客服！',
        '请问有什么可以帮助您的？',
        '好的，请稍等片刻',
        '感谢您的咨询，祝您生活愉快！'
      ]
    };
  },
  mounted() {
    // 组件挂载时如果是显示状态，获取数据
    if (this.show) {
      this.fetchQuickReplies();
    }
  },
  methods: {
    hide() {
      this.$emit('close');
    },
    selectReply(reply) {
      this.$emit('select', reply);
      this.hide();
    },
    // 从云函数获取快捷回复数据
    async fetchQuickReplies() {
      try {
        const res = await uniCloud.callFunction({
          name: 'quickReplyManager',
          data: {
            action: 'getReplies'
          }
        });
        
        if (res.result && res.result.code === 200 && res.result.data) {
          this.quickReplyList = res.result.data;
        } else {
          // 如果获取失败，使用默认数据
          console.warn('获取快捷回复失败，使用默认数据:', res.result?.message);
          this.quickReplyList = this.defaultQuickReplies;
        }
      } catch (error) {
        // 捕获异常，使用默认数据
        console.error('调用云函数失败:', error);
        this.quickReplyList = this.defaultQuickReplies;
      }
    }
  }
};
</script>

<style lang="scss">
.uni-im-quick-reply {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
  /* #ifdef H5 */
  display: flex;
  /* #endif */
  
  &.show {
    opacity: 1;
    pointer-events: auto;
  }
  
  .quick-reply-mask {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &.show .quick-reply-mask {
    opacity: 1;
  }
  
  .quick-reply-content {
    position: relative;
    width: 100%;
    max-height: 70vh;
    background-color: #fff;
    border-radius: 20rpx 20rpx 0 0;
    overflow: hidden;
    transform: translateY(100%);
    transition: transform 0.3s ease;
  }
  
  &.show .quick-reply-content {
    transform: translateY(0);
  }
  
  .quick-reply-header {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30rpx 30rpx;
    border-bottom: 1rpx solid #e5e5e5;
    position: relative;
  }
  
  .quick-reply-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
  }
  
  .quick-reply-close {
    font-size: 36rpx;
    color: #999;
    position: absolute;
    right: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 60rpx;
    height: 60rpx;
    text-align: center;
    line-height: 60rpx;
  }
  
  .quick-reply-list {
    max-height: calc(70vh - 80rpx);
    
    .quick-reply-item {
      padding: 30rpx;
      border-bottom: 1rpx solid #f5f5f5;
      
      .quick-reply-text {
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
        word-break: break-all;
      }
      
      &:active {
        background-color: #f8f8f8;
      }
    }
  }
}

/* #ifdef H5 */
@media screen and (min-device-width: 768px) {
  .uni-im-quick-reply {
    justify-content: center;
    align-items: center;
    
    &.show .quick-reply-content {
      transform: translateY(0);
    }
    
    .quick-reply-content {
      transform: translateY(50px);
      max-width: 600rpx;
      max-height: 80vh;
      border-radius: 20rpx;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.15);
      
      .quick-reply-list {
        max-height: calc(80vh - 80rpx);
      }
    }
  }
}
/* #endif */
</style>