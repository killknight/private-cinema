<template>
  <view class="container">
    <!-- 顶部标签栏 - 修复为横向滚动 -->
    <view class="tag-bar">
      <scroll-view 
        scroll-x 
        class="tag-scroll"
        show-scrollbar="false"
        :scroll-into-view="activeTagId"
        scroll-with-animation
      >
        <view 
          v-for="(tag, index) in tagList" 
          :key="tag"
          :id="`tag-${index}`"
          class="tag-item"
          :class="{ active: currentTag === tag }"
          @click="handleTagClick(tag, index)"
        >
          {{ tag }}
          <view class="active-indicator" v-if="currentTag === tag"></view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 包厢列表 -->
    <view class="room-list">
      <view v-for="room in roomList" :key="room._id" class="room-item">
        <image :src="room.cover" mode="aspectFill" class="room-image"></image>
        <view class="room-info">
          <view class="room-header">
              <text class="room-name">{{ room.name }}</text>
              <text class="room-price" v-if="room.price && room.priceUnit">¥{{ room.price }}/{{ room.priceUnit }}</text>
            </view>
          <view class="room-capacity">{{ room.capacity }}人</view>
          <text class="room-description">{{ room.description }}</text>
          <view class="room-tags">
            <view class="tag" v-for="item in room.tags" :key="item">{{ item }}</view>
          </view>
          <!-- 修改：将按钮改为文字形式 -->
          <view class="detail-link" @click="viewDetail(room._id)">
            查看详情 <uni-icons type="right" size="24" color="#8b5cf6"></uni-icons>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text v-if="loading">加载中...</text>
      <text v-else @click="loadMore">加载更多包厢</text>
    </view>
    <view class="no-more" v-else-if="roomList.length > 0">
      <text>没有更多了</text>
    </view>
    <view class="empty" v-else-if="!loading">
      <text>暂无包厢数据</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTag: '全部包厢',
      activeTagId: '',
      tagList: ['全部包厢', '浪漫', '私密', '情侣专享', '亲子', '家庭', '宽敞', '动漫', '超级英雄', '多人', '电竞', '游戏', '高清大屏', '少女风', '闺蜜', '网红打卡', '怀旧', '复古', '经典', '科幻', '太空', '星战', '海洋', '梦幻', '儿童友好'],
      roomList: [],
      page: 1,
      pageSize: 10,
      hasMore: true,
      loading: false
    };
  },
  onLoad(options) {
    // 处理查询参数
    if (options && options.type) {
      if (options.type === 'hot') {
        // 热门类型可以选择一个默认标签
        this.currentTag = '全部包厢';
      } else if (options.type === 'themed') {
        // 主题包厢类型，可以默认选择一个主题标签
        this.currentTag = '浪漫';
      }
    }
    this.loadRooms();
  },
  methods: {
    async loadRooms(refresh = false) {
      if (refresh) {
        this.page = 1;
        this.hasMore = true;
        this.roomList = [];
      }
      
      if (!this.hasMore || this.loading) return;
      
      this.loading = true;
      try {
        const res = await uniCloud.callFunction({
          name: 'getAllRooms',
          data: {
            tag: this.currentTag === '全部包厢' ? '' : this.currentTag,
            limit: this.pageSize,
            offset: (this.page - 1) * this.pageSize
          }
        });
        
        // 修改：检查code为200而不是0
        if (res.result.code === 200) {
          if (refresh) {
            this.roomList = res.result.data.rooms;
          } else {
            this.roomList = [...this.roomList, ...res.result.data.rooms];
          }
          this.hasMore = res.result.data.hasMore;
          this.page++;
        } else {
          console.log('请求成功但返回错误:', res.result.message);
          uni.showToast({ title: res.result.message || '加载失败', icon: 'none' });
        }
      } catch (error) {
        console.error('加载包厢失败', error);
        uni.showToast({ title: '加载失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    
    handleTagClick(tag, index) {
      if (this.currentTag === tag) return;
      this.currentTag = tag;
      this.activeTagId = `tag-${index}`;
      this.loadRooms(true);
    },
    
    loadMore() {
      if (!this.loading && this.hasMore) {
        this.loadRooms();
      }
    },
    
    viewDetail(roomId) {
      uni.navigateTo({
        url: `/pages/list/detail?id=${roomId}`
      });
    }
  }
};
</script>

<style scoped>
/* 重新设计颜色风格，基于背景色#0f1320 */
.container {
  background-color: #0f1320;
  min-height: 100vh;
}

/* 标签栏样式 */
.tag-bar {
  width: 100%;
  background-color: #0f1320;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.4);
}

.tag-scroll {
  white-space: nowrap;
  width: 100%;
}

.tag-item {
  display: inline-block;
  font-size: 32rpx;
  color: #8a94a6; /* 浅灰色文字 */
  padding: 24rpx 30rpx;
  position: relative;
  transition: color 0.3s;
}

.tag-item.active {
  color: #ffffff;
  font-weight: bold;
}

/* 激活状态下的下划线指示器 */
.active-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background: linear-gradient(90deg, #8b5cf6, #8d99ff); /* 蓝色渐变 */
  border-radius: 2rpx;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    width: 0;
  }
  to {
    width: 60rpx;
  }
}

/* 包厢列表样式 */
.room-list {
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.room-item {
  background-color: #1a1e30; /* 稍亮的深蓝黑色 */
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.5);
  transition: transform 0.3s, box-shadow 0.3s;
}

.room-item:active {
  transform: translateY(4rpx);
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.4);
}

.room-image {
  width: 100%;
  height: 400rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}

.room-info {
  padding: 30rpx;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.room-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.room-price {
  font-size: 32rpx;
  color: #8b5cf6;
  font-weight: bold;
}

.room-capacity {
  font-size: 28rpx;
  color: #8a94a6;
  margin-bottom: 20rpx;
}

.room-description {
  font-size: 28rpx;
  color: #c4c9d4;
  line-height: 1.6;
  margin-bottom: 25rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.room-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-bottom: 25rpx;
}

.tag {
  font-size: 24rpx;
  color: #8b5cf6;
  background-color: rgba(91, 108, 249, 0.15);
  padding: 8rpx 20rpx;
  border-radius: 15rpx;
}

/* 新增：文字形式的详情链接样式 */
.detail-link {
  display: flex;
  align-items: center;
  justify-content: left;
  font-size: 28rpx;
  color: #8b5cf6;
  font-weight: 500;
  padding: 0rpx 0;
  transition: color 0.3s;
}

.detail-link:active {
  color: #8d99ff;
}

.detail-link uni-icons {
  margin-left: 8rpx;
}

/* 加载状态样式 */
.load-more, .no-more, .empty {
  text-align: center;
  padding: 40rpx 0;
  color: #8a94a6;
  font-size: 28rpx;
}

.load-more text {
  padding: 15rpx 30rpx;
  background-color: #1a1e30;
  border-radius: 30rpx;
  display: inline-block;
  transition: background-color 0.3s;
}

.load-more text:active {
  background-color: #252a40;
}
</style>
