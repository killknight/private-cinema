<template>
	<view class="home dark">
		<!-- 顶部导航 -->
		<!-- <view class="nav" :style="{ paddingTop: (statusBarHeight + 6) + 'px' }">
			<view class="brand">
				<text class="brand-icon">◼︎</text>
				<text class="brand-name">星展影院</text>
			</view>
			<view class="nav-right">
				<text class="avatar">🟣</text>
			</view>
		</view> -->

		<!-- 顶部横幅与轮播占位 -->
		<view class="banner">
			<swiper class="banner-swiper" circular autoplay interval="4000" duration="500" :indicator-dots="false" @change="onBannerChange">
				<swiper-item v-for="(b,idx) in banners" :key="idx">
					<image class="banner-img" :src="b.url || bannerImage" mode="aspectFill" />
					<!-- <image class="banner-img" src="/static/bx.jpg" mode="aspectFill" /> -->
				</swiper-item>
			</swiper>
			<view class="banner-info">
				<view class="title">专属私密空间</view>
				<view class="subtitle">畅享极致观影体验</view>
			</view>
			<!-- 自定义指示点：右下角，偏大 -->
			<view class="dots-right" v-if="(banners && banners.length) || true">
				<view v-for="i in (banners && banners.length ? banners.length : 3)" :key="i" class="dot2" :class="{active: (i-1) === currentBanner}"></view>
			</view>
		</view>

		<!-- 核心功能入口 -->
		<view class="features">
			<view class="feature" v-for="f in features" :key="f.key" @click="onFeatureClick(f)">
				<!-- 使用每个功能对应的图标路径，并添加错误处理 -->
				<view class="f-icon">
					<image class="f-image" :src="f.icon" mode="scaleToFill" style="width: 45rpx; height: 45rpx;" @error="handleImageError($event, f)" />
				</view>
				<text class="f-text">{{ f.text }}</text>
			</view>
		</view>

		<!-- 营业信息与标签 -->
		<view class="status-card">
			<view class="row">
				<view class="dot online" v-if="isOpenNow"></view>
				<view class="dot offline" v-else></view>
				<text class="s-text">{{ isOpenNow ? '营业中' : '休息中' }} · 营业时间: {{ (business && business.openTime) || '10:00' }} - {{ (business && business.closeTime) || '24:00' }}</text>
			</view>
			<view class="tags">
				<text v-for="t in (business && business.tags ? business.tags : tags)" :key="t" class="tag">{{ t }}</text>
			</view>
		</view>

		<!-- 热门包厢 -->
		<view class="section hot">
			<view class="section-head">
				<text class="section-title">热门包厢</text>
				<text class="more" @click="toMore('hot')">查看全部 〉</text>
			</view>
			<view class="grid">
				<view class="card" v-for="room in hotRooms" :key="room.id" @click="toDetail(room)">
					<image class="cover" :src="room.cover" mode="aspectFill" />
					<view class="card-body">
						<view class="c-title">{{ room.name }}</view>
						<view class="c-meta"><text class="ico">👥</text>{{ room.capacity }} 人</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 主题包厢精选 -->
<!-- 		<view class="section">
			<view class="section-head">
				<text class="section-title">主题包厢精选</text>
				<text class="more" @click="toMore('themed')">查看全部 〉</text>
			</view>
			<view class="grid small">
				<view class="card mini" v-for="room in themedRooms" :key="room.id" @click="toDetail(room)">
					<image class="cover" :src="room.cover" mode="aspectFill" />
					<view class="mini-title">{{ room.name }}</view>
				</view>
			</view>
		</view> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bannerImage: '/static/banner/bj1.jpg',
				statusBarHeight: 0,
				currentBanner: 0,
				features: [
					{ key: 'intro', icon: '/static/tabbar/intro_active.png', text: '影院介绍' },
					{ key: 'vip', icon: '/static/tabbar/vip_active.png', text: '怎么去' },
					{ key: 'contact', icon: '/static/tabbar/contact_active.png', text: '联系客服' }
				],
				banners: [],
				business: null,
				tags: ['4K HDR','杜比视界','独立观影','私密空间','卫生保障'],
				hotRooms: [],
				themedRooms: [],
				loading: true,
				error: '',
				isOpenNow: false,
				customerServiceUids: []
			};
		},
		onLoad() {
			const info = uni.getSystemInfoSync();
			this.statusBarHeight = (info.statusBarHeight || 0);
			this.fetchHome();
		},
		onShow() {
			// 设置导航颜色
			uni.setTabBarStyle({
				backgroundColor: '#0f1320'
			})
			uni.setNavigationBarColor({
				backgroundColor: '#0f1320',
				frontColor: '#ffffff',
				animation: {
					duration: 400,
					timingFunc: "easeIn",
				}
			})
		},
		methods: {
			isWithin(open, close) {
				// open/close: 'HH:mm'
				const pad = (n) => (n < 10 ? '0' + n : '' + n)
				const now = new Date()
				const cur = parseInt(pad(now.getHours()) + pad(now.getMinutes()))
				const o = parseInt((open || '10:00').replace(':',''))
				const c = parseInt((close || '24:00').replace(':',''))
				if (o <= c) return cur >= o && cur <= c
				// 跨天营业，如 22:00-02:00
				return cur >= o || cur <= c
			},
			async fetchHome() {
				this.loading = true;
				this.error = '';
				try {
					// 从云函数获取首页数据
					const res = await uniCloud.callFunction({
						name: 'cinema-home',
						data: {}
					});
					const data = res?.result?.data || {};
					this.hotRooms = data.hotRooms || this.mockRooms(6);
					this.themedRooms = data.themedRooms || this.mockRooms(6);
					this.banners = data.banners || [];
					this.business = data.business || null;
					this.customerServiceUids = data.customerServiceUids || [];
					this.isOpenNow = this.isWithin(this.business.openTime, this.business.closeTime);
					uni.setNavigationBarTitle({
						title: this.business.cinemaName
					})
					// 在首页加载时就缓存客服ID
					this.cacheCustomerServiceId();
				} catch (e) {
					this.error = '加载失败，已为您展示示例数据';
					this.hotRooms = this.mockRooms(6);
					this.themedRooms = this.mockRooms(6);
					this.customerServiceUids = [];
					// 即使出错也尝试缓存默认客服ID
					// this.cacheCustomerServiceId();
				} finally {
					this.loading = false;
				}
			},
			// 缓存客服ID的方法
			cacheCustomerServiceId() {
				// 检查是否已有缓存，没有则缓存
				const cachedServiceId = uni.getStorageSync('cached_customer_service_id');
				if (!cachedServiceId) {
					const uids = this.customerServiceUids || [];
					let serviceId = ''; // 默认ID
					
					if (uids && uids.length > 0) {
						// 随机选择一个客服ID
						const randomIndex = Math.floor(Math.random() * uids.length);
						serviceId = uids[randomIndex];
					}
					
					// 缓存选择的客服ID
					uni.setStorageSync('cached_customer_service_id', serviceId);
					console.log('首页加载时缓存客服ID:', serviceId);
				} else {
					console.log('已存在客服ID缓存，无需重新缓存');
				}
			},
			mockRooms(n) {
				const arr = [];
				for (let i = 0; i < n; i++) {
					arr.push({
						id: 'm' + i,
						name: ['情侣主题房3','家庭欢聚房','漫威主题房','电竞观赛房','女神专享房','复古胶片房'][i % 6],
						capacity: [2,4,6,4,2,6][i % 6],
						cover: '/static/uni-center/headers.png'
					});
				}
				return arr;
			},
			onFeatureClick(f) {
				// 根据不同功能跳转到不同页面
				if (f.key === 'intro') {
					uni.switchTab({ url: '/pages/cinema-introduction/cinema-introduction' });
				} else if (f.key === 'vip') {
					// 打开地图，使用从云函数返回的店铺位置信息
					const shopLocation = {
						name: this.business.cinemaName,
						address: this.business.address,
						latitude: this.business.latitude,
						longitude: this.business.longitude
					};
					
					// 使用uni-app的打开地图功能
					uni.openLocation({
						latitude: shopLocation.latitude,
						longitude: shopLocation.longitude,
						name: shopLocation.name,
						address: shopLocation.address,
						scale: 18,
						fail: (err) => {
							console.error('打开地图失败:', err);
							uni.showToast({ 
								title: '无法打开地图，请检查是否有权限', 
								icon: 'none' 
							});
						}
					});
				} else if (f.key === 'contact') {
					// 联系客服功能 - 从uni-config-center获取客服ID
					this.getCustomerServiceId().then(customerServiceId => {
						if (customerServiceId) {
							uni.navigateTo({ url: '/uni_modules/uni-im/pages/chat/chat?user_id=' + customerServiceId });
						} else {
							// 如果获取不到客服ID，提示未获取到客服ID
							uni.showToast({
								title: '未获取到客服ID'
							})
							// uni.navigateTo({ url: '/uni_modules/uni-im/pages/chat/chat?user_id=_uni_starter_test_user_id' });
						}
					}).catch(err => {
						console.error('获取客服ID失败:', err);
						uni.showToast({
							title: '未获取到客服ID'
						})
						// 出错时使用默认ID
						// uni.navigateTo({ url: '/uni_modules/uni-im/pages/chat/chat?user_id=_uni_starter_test_user_id' });
					});
				}
			},
			toMore(key) {
				// 修改跳转路径，确保跳转到包厢列表页面而不是影院介绍页面
				uni.navigateTo({ url: '/pages/all-private-boxes/all-private-boxes?type=' + key });
			},
			toDetail(room) {
				uni.navigateTo({ url: '/pages/list/detail?roomId=' + room.id });
			},
			onBannerChange(e){
				this.currentBanner = e?.detail?.current || 0;
			},
			// 获取客服ID（直接从缓存中获取）
			getCustomerServiceId() {
				return new Promise((resolve) => {
					// 从本地缓存获取客服ID（已在fetchHome时缓存）
					const cachedServiceId = uni.getStorageSync('cached_customer_service_id');
					console.log('使用客服ID:', cachedServiceId);
					resolve(cachedServiceId);
				});
			},
			// 添加图片错误处理方法
			handleImageError(e, feature) {
				// 设置默认图标或其他处理
				e.target.src = '/static/bx.jpg'; // 使用默认图片作为备选
			}
		}
	}
</script>

<style lang="less" scoped>

.home {
	background: #0f1320;
	min-height: 100vh;
	color: #e7e9f0;
	padding-bottom: 24rpx;
	padding-top: 24rpx;
}

.nav {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12rpx 24rpx 20rpx 24rpx; /* 顶部留给 statusBarHeight，通过行内样式叠加 */
	box-sizing: border-box;
}
.brand {
	display: flex;
	align-items: center;
}
.brand-icon { color: #8b5cf6; margin-right: 12rpx; }
.brand-name { font-weight: 700; font-size: 36rpx; }
.avatar { font-size: 28rpx; }

.banner { position: relative; margin: 0 24rpx; }
.banner-swiper { width: 100%; height: 360rpx; border-radius: 20rpx; overflow: hidden; }
.banner-img {
	width: 100%;
	height: 360rpx;
	border-radius: 20rpx;
	filter: brightness(0.8);
}
.banner-info { position: absolute; left: 32rpx; bottom: 24rpx; }
.title { font-size: 44rpx; font-weight: 800; text-shadow: 0 2rpx 6rpx rgba(0,0,0,0.4); }
.subtitle { font-size: 26rpx; color: #b7bdd1; margin-top: 10rpx; }
/* 自定义右侧大号指示点 */
.dots-right { position: absolute; right: 24rpx; bottom: 24rpx; display: flex; align-items: center; }
.dot2 { width: 20rpx; height:20rpx; border-radius: 50%; background: rgba(255,255,255,0.35); margin-left: 12rpx; }
.dot2.active { width: 20rpx; height: 20rpx; border-radius: 50%; background: #ffffff; box-shadow: 0 2rpx 6rpx rgba(0,0,0,.35); }

.features {
	display: flex;
	justify-content: space-between;
	padding: 24rpx;
}
.feature {
	width: 32%;
	// background: #171b2b;
	background: #1e2440ab;
	border-radius: 20rpx;
	padding: 24rpx 0;
	display: flex;
	flex-direction: column;
	align-items: center;
}
.f-icon { margin-bottom: 12rpx; background: #9333ea33; width: 80rpx; height: 80rpx; border-radius: 999rpx; display:flex; align-items:center; justify-content:center; }
.f-text { font-size: 26rpx; color: #d6daf0; }

.status-card { margin: 0 24rpx; background: #1e2440ab; border-radius: 16rpx; padding: 28rpx 24rpx; box-shadow: none; border: 1rpx solid rgba(255,255,255,0.05); }
.row { display: flex; align-items: center; margin-bottom: 24rpx; }
.dot.online { width: 12rpx; height: 12rpx; background: #22c55e; border-radius: 50%; margin-right: 12rpx; box-shadow: none; animation: none; }
.dot.offline { width: 12rpx; height: 12rpx; background: #9ca3af; border-radius: 50%; margin-right: 12rpx; }
.s-text { color: #c9d1ee; font-size: 24rpx; font-weight: 400; }
.tags { margin-top: 12rpx; display: flex; flex-wrap: wrap; gap: 12rpx; }
.tag { background: rgba(139,92,246,0.15); color: #8b5cf6; padding: 8rpx 16rpx; border-radius: 999rpx; font-size: 22rpx; font-weight: 400; border: none; box-shadow: none; transition: none; }
.tag:active { transform: none; }

// 移除动画定义

.section { margin: 24rpx 0; }
.section.hot { margin-bottom: 44rpx; }
.section-head { padding: 0 24rpx; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
.section-title { font-weight: 700; font-size: 32rpx; }
.more { color: #8b5cf6; font-size: 24rpx; }

.grid { display: flex; flex-wrap: wrap; padding: 0 24rpx; justify-content: space-between; }
.grid .card { width: calc(50% - 16rpx); margin: 0 0 20rpx 0; background: #1e2440ab; border-radius: 22rpx; overflow: hidden; position: relative; border: 1rpx solid rgba(255,255,255,.06); box-shadow: 0 12rpx 32rpx rgba(0,0,0,.35); }
.grid.small { padding: 0 24rpx; justify-content: space-between; }
.grid.small .card { width: calc(33.333% - 12rpx); margin: 0 0 12rpx 0; }
.cover { width: 100%; height: 220rpx; display: block; }
.grid.small .cover { height: 120rpx; }
.card-body { padding: 18rpx; background: #1e2440ab; }
.c-title { font-size: 30rpx; font-weight: 800; margin-bottom: 8rpx; }
.c-meta { font-size: 24rpx; color: #9aa3c7; display:flex; align-items:center; }
.c-meta .ico { margin-right: 8rpx; }

.grid .mini { border-radius: 20rpx; overflow: hidden; position: relative; }
.mini-title { position: absolute; left: 12rpx; bottom: 12rpx; color: #fff; text-shadow: 0 2rpx 6rpx rgba(0,0,0,.6); font-size: 24rpx; }
</style>
