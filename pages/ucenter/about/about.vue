<template>
  <view class="about-container">
    <!-- 顶部横幅 -->
    <view class="hero-section">
      <view class="hero-bg"></view>
      <view class="hero-content">
          <view class="logo">
            <image :src="cinemaInfo.logoImage_url || '/static/app/icon/logo.png'" mode="aspectFill" style="width: 100%; height: 100%;"></image>
          </view>
          <text class="hero-title">{{ cinemaInfo.cinemaName }}</text>
          <text class="hero-subtitle">沉浸式观影体验 · 尊贵私享空间</text>
        </view>
    </view>
    
    <!-- 品牌故事  -->
    <!-- <view class="story-section">
      <view class="section-title">品牌故事</view>
      <view class="story-content">
        <text class="story-text">星辰私人影院创立于2018年，致力于为都市精英打造高品质的私人观影空间。我们引进全球顶级影音设备，提供千部高清影片选择，让您在舒适私密的环境中享受电影艺术的魅力。</text>
        <text class="story-text">我们相信，每一次观影都是一次心灵的旅程。在这里，您可以远离喧嚣，与家人朋友共度美好时光，创造难忘的回忆。</text>
      </view>
    </view> -->
    
    <!-- 核心优势 -->
    <!-- <view class="features-section">
      <view class="section-title">核心优势</view>
      <view class="features-grid">
        <view class="feature-card" hover-class="feature-card-hover">
          <view class="feature-icon">
            <uni-icons type="star-filled" size="36" color="#ffd700"></uni-icons>
          </view>
          <view class="feature-title">顶级设备</view>
          <view class="feature-desc">4K超高清投影系统，专业环绕音响</view>
        </view>
        <view class="feature-card" hover-class="feature-card-hover">
          <view class="feature-icon">
            <uni-icons type="home" size="36" color="#4a9eff"></uni-icons>
          </view>
          <view class="feature-title">私密空间</view>
          <view class="feature-desc">独立包间设计，完全私密的观影环境</view>
        </view>
        <view class="feature-card" hover-class="feature-card-hover">
          <view class="feature-icon">
            <uni-icons type="film" size="36" color="#ff6b6b"></uni-icons>
          </view>
          <view class="feature-title">海量影片</view>
          <view class="feature-desc">千部高清影片，实时更新最新大片</view>
        </view>
        <view class="feature-card" hover-class="feature-card-hover">
          <view class="feature-icon">
            <uni-icons type="coffee" size="36" color="#a8e6cf"></uni-icons>
          </view>
          <view class="feature-title">贴心服务</view>
          <view class="feature-desc">免费零食饮料，专业管家服务</view>
        </view>
      </view>
    </view> -->
    
    <!-- 联系方式 -->
    <view class="contact-section">
      <view class="section-title">联系我们</view>
      <view class="contact-content">
        <!-- 联系电话 -->
        <view class="contact-item">
          <view class="contact-icon">
            <uni-icons type="phone" size="28" color="#4a9eff"></uni-icons>
          </view>
          <view class="contact-info">
            <view class="contact-label">预约电话</view>
            <view class="contact-value">{{ cinemaInfo.phone }}</view>
          </view>
          <view class="contact-action">
            <button class="call-btn" @tap="makePhoneCall(cinemaInfo.phone)">
              <uni-icons type="phone" size="24" color="#ffffff"></uni-icons>
              <text>立即拨打</text>
            </button>
          </view>
        </view>
        
        <!-- 影院地址 -->
        <view class="contact-item">
          <view class="contact-icon">
            <uni-icons type="location" size="28" color="#ff6b6b"></uni-icons>
          </view>
          <view class="contact-info">
            <view class="contact-label">影院地址</view>
            <view class="contact-value">{{ cinemaInfo.address }}</view>
          </view>
        </view>
        
        <!-- 营业时间 -->
        <view class="contact-item">
          <view class="contact-icon">
            <image src="/static/uni-center/time.webp" style="width: 40rpx; height: 40rpx;"></image>
          </view>
          <view class="contact-info">
            <view class="contact-label">营业时间</view>
            <view class="contact-value">周一至周日: {{ cinemaInfo.openTime }} - {{ cinemaInfo.closeTime }}</view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 公众号 -->
    <view class="wechat-section">
      <view class="wechat-content">
        <view class="wechat-info">
          <view class="section-title-small">关注公众号</view>
          <view class="wechat-desc">获取最新优惠活动和影片资讯</view>
          <view class="wechat-name">{{ cinemaInfo.cinemaName }}</view>
        </view>
        <view class="qr-container">
          <image :src="cinemaInfo.wechatQrCode_url || '/static/app/icon/logo.png'" mode="aspectFit" class="qr-image"></image>
          <text class="qr-text">扫码关注公众号</text>
        </view>
      </view>
    </view>
    
    <!-- 底部版权 -->
    <view class="footer">
      <view class="copyright">© 2025 星辰私人影院 版权所有</view>
      <!-- <view class="license">京ICP备12345678号-1</view> -->
    </view>
  </view>
</template>

<script>
export default {
  name: 'AboutUs',
  data() {
    return {
      navBarHeight: 0,
      cinemaInfo: {
        cinemaName: '',
        phone: '',
        address: '',
        openTime: '',
        closeTime: '',
        wechatQrCode: '',
        logoImage: ''
      },
      isLoading: false
    };
  },
  onLoad() {
    // 设置导航栏标题和背景
    uni.setNavigationBarTitle({
      title: '关于我们'
    });
    // 设置导航栏背景色
    uni.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#0f1320'
    });
    
    // 获取影院信息
    this.getCinemaInfo();
  },
  methods: {
    // 获取影院信息
    async getCinemaInfo() {
      this.isLoading = true;
      try {
        const res = await uniCloud.callFunction({
          name: 'getCinemaInfo'
        });
        
        // 确保cinemaInfo存在
        if (res.result && res.result.code === 200 && res.result.data && res.result.data.cinemaInfo) {
          const info = res.result.data.cinemaInfo;
          this.cinemaInfo = {
            cinemaName: info.cinemaName || '',
            phone: info.phone || '',
            address: info.address || '',
            openTime: info.openTime || '',
            closeTime: info.closeTime || '',
            wechatQrCode: info.wechatQrCode || '',
						 wechatQrCode_url: info.wechatQrCode_url || '',
            logoImage: info.logoImage || '',
						logoImage_url: info.logoImage_url || ''
          };
        } else {
          // 返回格式不符合预期时使用默认值
          console.warn('获取的影院信息格式不正确');
          throw new Error('数据格式错误');
        }
      } catch (error) {
        console.error('获取影院信息失败:', error);
        // 出错时设置默认值，确保页面显示正常
        this.cinemaInfo = {
          cinemaName: '星辰私人影院',
          phone: '400-123-4567',
          address: '北京市朝阳区建国路88号现代城SOHO A座2308室',
          openTime: '14:00',
          closeTime: '凌晨2:00',
          wechatQrCode: '',
          logoImage: ''
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    // 拨打电话
    makePhoneCall(phoneNumber) {
      // 移除电话号码中的非数字字符
      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      
      uni.makePhoneCall({
        phoneNumber: cleanNumber,
        success: () => {
          console.log('拨打电话成功');
        },
        fail: () => {
          console.log('拨打电话失败');
        }
      });
    }
  }
};
</script>

<style scoped>
/* 主题色变量 */
:root {
  --primary-bg: #0f1320;
  --secondary-bg: #1a1f36;
  --tertiary-bg: #232841;
  --card-bg: #1e2540;
  --border-color: #3a405a;
  --text-primary: #ffffff;
  --text-secondary: #a0a5ba;
  --text-tertiary: #70758a;
  --accent-color: #4a9eff;
  --accent-hover: #3586e9;
  --gold-accent: #ffd700;
  --gradient-start: #1a1f36;
  --gradient-end: #0f1320;
}

/* 全局样式 */
.about-container {
  background-color: var(--primary-bg);
  min-height: 100vh;
  color: var(--text-primary);
  padding-bottom: 40rpx;
}

/* 顶部横幅 */
.hero-section {
  width: 100%;
  height: 400rpx;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1f36 0%, #0f1320 100%);
  z-index: 1;
}

/* 添加装饰效果 */
.hero-bg::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(74, 158, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0.3;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 170rpx;
  height: 170rpx;
  border-radius: 50%;
  background-color: var(--tertiary-bg);
  padding: 0rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 0 30rpx rgba(74, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
	overflow: hidden;
}

.hero-title {
  font-size: 48rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  display: block;
  letter-spacing: 2rpx;
}

.hero-subtitle {
  font-size: 28rpx;
  color: var(--text-secondary);
  display: block;
  opacity: 0.9;
}

/* 通用标题样式 */
.section-title {
  font-size: 36rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 30rpx;
  padding-left: 30rpx;
  position: relative;
  display: inline-block;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10rpx;
  left: 30rpx;
  width: 80rpx;
  height: 6rpx;
  background: linear-gradient(90deg, var(--accent-color), transparent);
  border-radius: 3rpx;
}

.section-title-small {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 16rpx;
}

/* 品牌故事 */
.story-section {
  background-color: var(--secondary-bg);
  margin: 0 30rpx 40rpx;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.story-content {
  padding-top: 20rpx;
}

.story-text {
  font-size: 28rpx;
  color: var(--text-secondary);
  line-height: 48rpx;
  display: block;
  margin-bottom: 20rpx;
  text-align: justify;
}

/* 核心优势 */
.features-section {
  margin: 0 30rpx 40rpx;
  padding: 40rpx;
  background-color: var(--secondary-bg);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30rpx;
  margin-top: 20rpx;
}

.feature-card {
  background-color: var(--card-bg);
  padding: 30rpx;
  border-radius: 16rpx;
  text-align: center;
  transition: all 0.3s ease;
  border: 1rpx solid var(--border-color);
}

.feature-card-hover {
  transform: translateY(-6rpx);
  box-shadow: 0 8rpx 30rpx rgba(74, 158, 255, 0.2);
  border-color: var(--accent-color);
}

.feature-icon {
  width: 100rpx;
  height: 100rpx;
  background-color: var(--tertiary-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.feature-title {
  font-size: 32rpx;
  font-weight: bold;
  color: var(--text-primary);
  margin-bottom: 10rpx;
}

.feature-desc {
  font-size: 24rpx;
  color: var(--text-secondary);
  line-height: 36rpx;
}

/* 联系方式 */
.contact-section {
  margin: 0 30rpx 40rpx;
  padding: 40rpx;
  background-color: var(--secondary-bg);
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}

.contact-content {
  margin-top: 20rpx;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  padding: 30rpx 0;
  border-bottom: 1rpx solid var(--border-color);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: var(--tertiary-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.2);
}

.time-icon {
  font-size: 40rpx;
}

.contact-info {
  flex: 1;
}

.contact-label {
  font-size: 28rpx;
  color: var(--text-tertiary);
  margin-bottom: 10rpx;
  display: block;
}

.contact-value {
  font-size: 32rpx;
  color: var(--text-primary);
  line-height: 48rpx;
  display: block;
}

.contact-action {
  display: flex;
  align-items: center;
}

.call-btn {
  background-color: var(--tertiary-bg);
  color: var(--accent-color);
  border: 1rpx solid var(--accent-color);
  padding: 0rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.2);
	height: 80rpx;
}

.call-btn:active {
  background-color: var(--accent-color);
  color: white;
  transform: scale(0.95);
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.3);
}

/* 公众号 */
.wechat-section {
  margin: 0 30rpx 40rpx;
  padding: 40rpx;
  background: linear-gradient(135deg, var(--secondary-bg), var(--primary-bg));
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
  border: 1rpx solid var(--border-color);
}

.wechat-content {
  display: flex;
  align-items: center;
  gap: 40rpx;
}

.wechat-info {
  flex: 1;
}

.wechat-desc {
  font-size: 26rpx;
  color: var(--text-secondary);
  margin-bottom: 10rpx;
}

.wechat-name {
  font-size: 30rpx;
  color: var(--accent-color);
  font-weight: bold;
}

.qr-container {
  width: 200rpx;
  height: 240rpx;
  background-color: white;
  padding: 0rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.qr-image {
  width: 185rpx;
  height: 185rpx;
  margin-bottom: 0rpx;
}

.qr-text {
  font-size: 20rpx;
  color: #333333;
  text-align: center;
  margin-top: 5rpx;
}

/* 底部版权 */
.footer {
  text-align: center;
  padding: 30rpx;
  margin-top: 20rpx;
}

.copyright {
  font-size: 24rpx;
  color: var(--text-tertiary);
  margin-bottom: 10rpx;
}

.license {
  font-size: 22rpx;
  color: var(--text-tertiary);
  opacity: 0.8;
}
</style>