<template>
	<view class="cinema-intro">
		<!-- 主要内容区域 -->
		<scroll-view class="content" scroll-y>
			<!-- 我们的故事 -->
			<!-- 			
			<view class="section story">
				<view class="section-header">
					<view class="section-title">我们的故事</view>
				</view>
				<view class="story-content">
					<text v-if="!cinemaInfo" class="story-text">加载中...</text>
					<template v-else>
						<text v-for="(paragraph, index) in cinemaInfo.story" :key="index" class="story-text">{{ paragraph }}</text>
					</template>
				</view>
			</view>
			-->

			<!-- 环境与设施 -->
			<view class="section environment">
				<view class="section-header">
					<view class="section-title">环境与设施</view>
				</view>
				<view class="swiper-container">
					<swiper ref="envSwiper" class="env-swiper" circular autoplay interval="4000" duration="500" :indicator-dots="true" :indicator-active-color="'#ffffff'" :indicator-color="'rgba(255, 255, 255, 0.5)'" indicator-dots-class="custom-indicators" @change="onSwiperChange">
						<swiper-item v-for="(env, idx) in environmentImages" :key="env._id || idx">
							<view class="swiper-item-wrapper">
								<image class="env-img" :src="env.image" mode="aspectFill" />
								<view class="swiper-text-overlay">
									<text class="swiper-text">{{ env.name || (idx === 0 ? '豪华接待大厅' : `环境 ${idx + 1}`) }}</text>
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
			</view>
			<!-- 员工介绍 -->
			<view class="section staff">
				<view class="section-header">
					<view class="section-title">专业团队</view>
					<text class="more-btn" @click="toTeamPage" v-if="staffList.length > 3">查看更多 〉</text>
				</view>
				<view class="staff-grid">
					<view class="staff-card" v-for="staff in staffList.slice(0, 4)" :key="staff._id" @click="toEmployeeDetails(staff._id)">
						<image class="staff-avatar" :src="staff.avatar" mode="aspectFill" />
						<view class="staff-info">
							<text class="staff-name">{{ staff.name }}</text>
							<text class="staff-position">{{ staff.position }}</text>
							<text class="staff-desc">{{ staff.description }}</text>
						</view>
					</view>
				</view>
			</view>
			<image src="/static/uni-center/cinema-intro.jpg" class="image-style" mode="aspectFill"></image>
			<!-- 包厢类型 -->
		<!-- <view class="section rooms">
			<view class="section-header">
				<view class="section-title">包厢类型</view>
				<text class="more-btn" @click="toRoomsPage" v-if="roomTypes.length > 4">查看更多 〉</text>
			</view>
			<view class="room-list">
				<view class="room-card" v-for="room in roomTypes.slice(0, 4)" :key="room._id">
						<image class="room-image" :src="room.image" mode="aspectFill" />
						<view class="room-content">
							<view class="room-header">
								<text class="room-name">{{ room.name }}</text>
								<text class="room-capacity">👥 {{ room.capacity }}人</text>
							</view>
							<text class="room-desc">{{ room.description }}</text>
							<view class="room-tags">
								<text v-for="tag in room.tags" :key="tag" class="room-tag">{{ tag }}</text>
							</view>
						</view>
					</view>
				</view>
			</view> -->

			<!-- 设备配置 -->
			<!-- <view class="section equipment">
				<view class="section-header">
					<view class="section-title">设备配置</view>
				</view>
				<view class="equipment-list">
					<view class="equipment-item" v-for="item in equipmentList" :key="item.id">
						<text class="equipment-icon">{{ item.icon }}</text>
						<view class="equipment-info">
							<text class="equipment-title">{{ item.title }}</text>
							<text class="equipment-desc">{{ item.description }}</text>
						</view>
					</view>
				</view>
			</view> -->

			<!-- 服务亮点 -->
			<!-- <view class="section services">
				<view class="section-header">
					<view class="section-title">服务亮点</view>
				</view>
				<view class="service-grid">
					<view class="service-card" v-for="service in serviceList" :key="service.id">
						<text class="service-icon">{{ service.icon }}</text>
						<view class="service-content">
							<text class="service-title">{{ service.title }}</text>
							<text class="service-desc">{{ service.description }}</text>
						</view>
					</view>
				</view>
			</view> -->
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: 0,
				cinemaInfo: null,
				environmentImages: [
					{ image: '/static/banner/bj1.jpg', name: '豪华接待大厅' },
					{ image: '/static/banner/bj2.jpg', name: '精品包厢环境' },
					{ image: '/static/banner/bj3.jpg', name: '专业影音设备' }
				],
				staffList: [],
				roomTypes: [],
				equipmentList: [],
				serviceList: [],
				swiperCurrent: 0
			}
		},
		onLoad() {
			const info = uni.getSystemInfoSync();
			this.statusBarHeight = (info.statusBarHeight || 0);
			this.loadCinemaInfo();
			// 设置导航颜色
			uni.setTabBarStyle({
				backgroundColor: '#492445'
			})
			uni.setNavigationBarColor({
				backgroundColor: '#492445',
				frontColor: '#ffffff',
				animation: {
					duration: 400,
					timingFunc: "easeIn",
				}
			})
		},
		methods: {
			async loadCinemaInfo() {
				try {
					const { result } = await uniCloud.callFunction({
						name: 'getCinemaInfo'
					});
					
					if (result.code === 200) {
						// 处理返回的数据
						this.cinemaInfo = result.data.cinemaInfo || null;
						this.environmentImages = result.data.environmentImages || [];
						this.staffList = result.data.staffList || [];
						this.roomTypes = result.data.roomTypes || [];
						this.equipmentList = result.data.equipmentList || [];
						this.serviceList = result.data.serviceList || [];
					} else {
						uni.showToast({
							title: result.message || '获取影院信息失败',
							icon: 'none'
						});
					}
				} catch (error) {
					console.error('调用云函数失败:', error);
					uni.showToast({
						title: '网络错误，请稍后重试',
						icon: 'none'
					});
				}
			},
			toTeamPage() {
				// 跳转到团队页面
				uni.navigateTo({ url: '/pages/our-team/our-team' });
			},
			toRoomsPage() {
				// 跳转到包厢列表页面
				uni.navigateTo({ url: '/pages/all-private-boxes/all-private-boxes' });
			},
			toEmployeeDetails(employeeId) {
				// 跳转到员工详情页面
				uni.navigateTo({ url: `/pages/employee-details/employee-details?id=${employeeId}` });
			},
			// 轮播图控制
			prevSwiper() {
				const swiper = this.$refs.envSwiper;
				if (swiper) {
					swiper.slidePrev();
				}
			},
			nextSwiper() {
				const swiper = this.$refs.envSwiper;
				if (swiper) {
					swiper.slideNext();
				}
			},
			onSwiperChange(e) {
				this.swiperCurrent = e.detail.current;
			}
		},
	}
</script>

<style lang="less" scoped>
.cinema-intro {
	background: #492445;
	min-height: 100vh;
	color: #e7e9f0;
}
.image-style {
	width: 750rpx;
	height: 4300rpx;
}
.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12rpx 24rpx 20rpx 24rpx;
	box-sizing: border-box;
	border-bottom: 1rpx solid rgba(255,255,255,0.1);
}
.brand {
	display: flex;
	align-items: center;
}
.brand-icon { color: #8b5cf6; margin-right: 12rpx; }
.brand-name { font-weight: 700; font-size: 36rpx; }

.content {
	height: calc(100vh - 20rpx);
}

.section {
	margin: 40rpx 24rpx;
}

/* 通用标题样式 */
.section-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #ffffff;
	margin-bottom: 0;
}

/* 带查看更多的标题容器 */
.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
	width: 100%;
}

.section-header .section-title {
	flex: 1;
	margin-bottom: 0;
}

/* 查看更多按钮 */
.more-btn {
	font-size: 24rpx;
	color: #8b5cf6;
	white-space: nowrap;
	margin-left: 10rpx;
}

/* 我们的故事 */
.story-content {
	/* padding: 40rpx 32rpx; */
}
.story-text {
	display: block;
	font-size: 28rpx;
	line-height: 1.8;
	color: #c9d1ee;
	margin-bottom: 24rpx;
}
.story-text:last-child {
	margin-bottom: 0;
}

/* 环境与设施 */
.swiper-container {
	position: relative;
	border-radius: 20rpx;
	overflow: hidden;
}

.env-swiper {
	height: 400rpx;
}

.swiper-item-wrapper {
	position: relative;
	width: 100%;
	height: 100%;
}

/* 文字提示层 */
.swiper-text-overlay {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 100%;
	padding: 30rpx 0 50rpx;
	z-index: 10;
	text-align: center;
}

.swiper-text {
	display: inline-block;
	text-align: center;
	font-size: 24rpx;
	color: #ffffff;
	font-weight: 500;
	background-color: rgba(0, 0, 0, 0.4);
	padding: 10rpx 30rpx;
	border-radius: 30rpx;
	z-index: 11;
}

/* 左右箭头 */
.swiper-arrow {
	position: absolute;
	top: 50%;
	transform: translateY(-50%);
	width: 60rpx;
	height: 60rpx;
	background: rgba(0, 0, 0, 0.3);
	color: #ffffff;
	font-size: 48rpx;
	text-align: center;
	line-height: 60rpx;
	border-radius: 50%;
	cursor: pointer;
	touch-action: manipulation;
}

.swiper-arrow-left {
	left: 20rpx;
}

.swiper-arrow-right {
	right: 20rpx;
}

/* 自定义轮播提示点样式 */
.custom-indicators {
	bottom: 20rpx !important;
}

.custom-indicators .uni-swiper-dot {
	width: 16rpx;
	height: 16rpx;
	border-radius: 50%;
	background-color: rgba(255, 255, 255, 0.5);
	margin: 0 12rpx !important;
}

.custom-indicators .uni-swiper-dot-active {
	background-color: #ffffff;
	width: 16rpx;
	height: 16rpx;
}
.env-img {
	width: 100%;
	height: 100%;
}

/* 员工介绍 */
.staff-grid {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.staff-card {
	display: flex;
	background: #381535;
	border-radius: 20rpx;
	padding: 32rpx;
	gap: 24rpx;
	align-items: center;
}
.staff-avatar {
	width: 180rpx;
	height: 180rpx;
	border-radius: 90rpx;
}
.staff-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.staff-name {
	font-size: 32rpx;
	font-weight: 700;
	color: #ffffff;
	margin-bottom: 8rpx;
}
.staff-position {
	font-size: 24rpx;
	color: #8b5cf6;
	margin-bottom: 12rpx;
}
.staff-desc {
		font-size: 26rpx;
		color: #9aa3c7;
		line-height: 1.6;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		text-overflow: ellipsis;
	}

/* 包厢类型 */
.room-list {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}
.room-card {
	background: #171b2b;
	border-radius: 20rpx;
	overflow: hidden;
}
.room-image {
	width: 100%;
	height: 300rpx;
}
.room-content {
	padding: 18rpx 24rpx;
}
.room-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30rpx;
}
.room-name {
	font-size: 32rpx;
	font-weight: 700;
	color: #ffffff;
}
.room-capacity {
	font-size: 24rpx;
	color: #8b5cf6;
}
.room-desc {
	font-size: 26rpx;
	color: #9aa3c7;
	line-height: 1.6;
	margin-bottom: 20rpx;
}
.room-tags {
	display: flex;
	gap: 12rpx;
	flex-wrap: wrap;
	margin-top: 24rpx;
}
.room-tag {
	background: #22273b;
	color: #aeb6d6;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	font-size: 22rpx;
}

/* 设备配置 */
.equipment-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.equipment-item {
	display: flex;
	align-items: center;
	border-radius: 20rpx;
	padding: 12rpx 0rpx;
	gap: 24rpx;
}
.equipment-icon {
	font-size: 48rpx;
	width: 80rpx;
	height: 80rpx;
	background: rgba(139,92,246,0.15);
	border-radius: 999rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #b197ff;
}
.equipment-info {
	flex: 1;
}
.equipment-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
	display: block;
	margin-bottom: 8rpx;
}
.equipment-desc {
	font-size: 24rpx;
	color: #9aa3c7;
	line-height: 1.5;
}

/* 服务亮点 */
.service-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 24rpx;
}
.service-card {
	background: #171b2b;
	border-radius: 20rpx;
	padding: 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
}
.service-icon {
	font-size: 48rpx;
	margin-bottom: 16rpx;
}
.service-title {
	font-size: 28rpx;
	font-weight: 700;
	color: #ffffff;
	display: block;
	margin-bottom: 8rpx;
}
.service-desc {
	font-size: 24rpx;
	color: #9aa3c7;
	line-height: 1.5;
}
</style>
