<template>
	<view class="home" :class="[currentTheme, 'theme-' + currentTheme]" :style="{ '--cline': Math.min(features.length, 4) }">

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
					<!-- 未读消息数气泡提示，仅在联系客服功能且有未读消息时显示 -->
					<view class="badge" v-if="f.key === 'contact' && unreadMsgCount > 0 && !socketIsClose">
						{{ unreadMsgCount > 99 ? '99+' : unreadMsgCount }}
					</view>
					<view class="badge ws-badge" v-if="f.key === 'contact' && socketIsClose">
						链接断开
					</view>
				</view>
				<text class="f-text">{{ f.text }}</text>
			</view>
		</view>

		<!-- 营业信息与标签、联系方式 -->
		<view class="status-card">
			<view class="row">
				<view class="dot online" v-if="isOpenNow"></view>
				<view class="dot offline" v-else></view>
				<text class="s-text">{{ isOpenNow ? '营业中' : '休息中' }} · 营业时间: {{ (business && business.openTime) || '10:00' }} - {{ (business && business.closeTime) || '24:00' }}</text>
			</view>
			<view class="tags">
				<text v-for="t in (business && business.tags ? business.tags : tags)" :key="t" class="tag">{{ t }}</text>
			</view>
			<view class="contact-section" style="margin-top: 20rpx; padding-top: 20rpx; ">
				<view class="contact-info" @tap="makePhoneCall(business?.phone)">
					<view class="contact-icon">📞</view>
					<view class="contact-details">
						<text class="contact-label">联系电话</text>
						<text class="contact-value">付先生 {{ business?.phone }}</text>
					</view>
					<view class="contact-arrow">〉</view>
				</view>
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
import uniIm from '@/uni_modules/uni-im/sdk/index.js';

	export default {
		data() {
			return {
				// 主题相关
				currentTheme: 'dark', // 当前主题：dark 或 blue
				themes: {
					dark: {
						bgColor: '#0f1320',
						cardBgColor: '#1e2440ab',
						textColor: '#e7e9f0',
						secondaryTextColor: '#b7bdd1',
						accentColor: '#8b5cf6',
						accentBgColor: '#9333ea33',
						borderColor: 'rgba(255,255,255,0.05)',
						tabBarBg: '#0f1320',
						navBarBg: '#0f1320'
					},
					blue: {
						bgColor: '#FFFFFF', // 白色背景
						cardBgColor: '#F5F9FF', // 浅蓝色卡片背景，增强层次感
						textColor: '#1A1A1A', // 深灰色主文字，提高可读性
						secondaryTextColor: '#666666', // 灰色次要文字
						accentColor: '#409EFF', // 亮蓝色强调色，科技感十足
						accentBgColor: '#409EFF25', // 半透明亮蓝色背景
						borderColor: '#409EFF', // 蓝色边框，增强科技感
						tabBarBg: '#FFFFFF', // 与背景色一致
						navBarBg: '#FFFFFF' // 与背景色一致
					},
					pink: {
						bgColor: '#FFF5F7', // 浅粉色背景
						cardBgColor: '#FFEFF3', // 粉色卡片背景
						textColor: '#333333', // 深灰色主文字
						secondaryTextColor: '#666666', // 灰色次要文字
						accentColor: '#FF6B9D', // 粉色强调色
						accentBgColor: '#FF6B9D25', // 半透明粉色背景
						borderColor: 'rgba(255, 107, 157, 0.3)', // 粉色边框
						tabBarBg: '#FFFFFF', // 白色标签栏背景
						navBarBg: '#FFFFFF' // 白色导航栏背景
					}
				},
				// 其他数据
				statusBarHeight: 0,
				bannerImage: '/static/bx.jpg',
				currentBanner: 0,
				features: [
					{ key: 'vip', icon: '/static/tabbar/vip_active.png', text: '导航' },
					{ key: 'intro', icon: '/static/tabbar/intro_active.png', text: '影院介绍' },
					// { key: 'theme', icon: '/static/tabbar/contact_active.png', text: '切换主题' },
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
			this.setThemeColors();
		},
		// 组件卸载时移除事件监听
		beforeDestroy() {
			// 不需要再监听自定义事件
		},
		// 分享功能配置
		onShareAppMessage() {
			return {
				title: this.business?.cinemaName || '星展影院 - 专属私密空间',
				path: '/pages/home/home'
				// 不使用imageUrl，小程序会自动截取当前页面作为分享图片
			};
		},
		// 分享到朋友圈配置
		onShareTimeline() {
			return {
				title: this.business?.cinemaName || '星展影院 - 专属私密空间',
				query: 'from=timeline',
				// 不使用imageUrl，小程序会自动截取当前页面作为分享图片
			};
		},
		// 计算属性：获取未读消息数
		computed: {
			unreadMsgCount() {
				return uniIm?.conversation?.unreadCount() || 0;
			},
			socketIsClose(){
				return uniIm.socketIsClose;
			}
		},
		watch: {
			socketIsClose(newVal, oldVal) {
				if (newVal) {
					// 弹窗提示用户连接已断开
					// uni.showModal({
					// 	title: '提示',
					// 	content: '客服连接已断开，请退出重新打开小程序',
					// 	showCancel: false
					// })
					uni.showToast({
						title: '客服连接已断开，请退出重新打开小程序',
						icon: 'none'
					});
				}
			}
		},
		methods: {
			// 拨打电话
			makePhoneCall(phoneNumber) {
				uni.makePhoneCall({
					phoneNumber: phoneNumber,
					success: () => {
						console.log('拨打电话成功');
					},
					fail: (err) => {
						console.error('拨打电话失败:', err);
						uni.showToast({
							title: '拨打电话失败',
							icon: 'none'
						});
					}
				});
			},
			// 设置主题颜色
		setThemeColors() {
				const theme = this.themes[this.currentTheme];
				// 设置tabBar样式
				uni.setTabBarStyle({
					backgroundColor: theme.tabBarBg,
					color: this.currentTheme === 'dark' ? '#bfbfbf' : '#666666',
					selectedColor: theme.accentColor
				});
				// 设置导航栏颜色
				uni.setNavigationBarColor({
					frontColor: this.currentTheme === 'dark' ? '#ffffff' : '#1A1A1A',
					backgroundColor: theme.navBarBg
				});
				// 设置页面背景色（同时设置窗口背景色和页面根元素背景色）
				uni.setBackgroundColor({
					backgroundColor: theme.bgColor,
					backgroundColorTop: theme.bgColor, // 设置顶部背景色
					backgroundColorBottom: theme.bgColor // 设置底部背景色
				});
			},
			// 切换主题
			switchTheme() {
				// 循环切换主题：dark -> blue -> pink -> dark
				if (this.currentTheme === 'dark') {
					this.currentTheme = 'blue';
				} else if (this.currentTheme === 'blue') {
					this.currentTheme = 'pink';
				} else {
					this.currentTheme = 'dark';
				}
				this.setThemeColors();
				uni.showToast({
					title: `已切换到${this.currentTheme === 'dark' ? '深色' : this.currentTheme === 'blue' ? '蓝色' : '粉色'}主题`,
					icon: 'success'
				});
			},
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
				const uids = this.customerServiceUids || [];
				const cachedServiceId = uni.getStorageSync('cached_customer_service_id');
				
				// 检查条件：
				// 1. 如果没有缓存，需要缓存
				// 2. 如果有缓存但不在当前查询的客服ID列表中，需要更新缓存
				if (!cachedServiceId || (uids.length > 0 && !uids.includes(cachedServiceId))) {
					let serviceId = ''; // 默认ID
					
					if (uids && uids.length > 0) {
						// 随机选择一个客服ID
						const randomIndex = Math.floor(Math.random() * uids.length);
						serviceId = uids[randomIndex];
					}
					
					// 缓存选择的客服ID
					uni.setStorageSync('cached_customer_service_id', serviceId);
					console.log('缓存客服ID:', serviceId);
				} else {
					console.log('已存在有效客服ID缓存，无需更新');
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
				} else if (f.key === 'theme') {
					// 切换主题
					this.switchTheme();
				} else if (f.key === 'contact') {
					// 联系客服功能 - 从uni-config-center获取客服ID
					this.getCustomerServiceId().then(customerServiceId => {
						if (customerServiceId) {
							// 跳转到聊天页面
							uni.navigateTo({
								url: '/uni_modules/uni-im/pages/chat/chat?user_id=' + customerServiceId
							});
						} else {
							// 如果获取不到客服ID，提示未获取到客服ID
							uni.showToast({
								title: '未获取到客服ID'
							})}
					}).catch(err => {
						console.error('获取客服ID失败:', err);
						uni.showToast({
							title: '未获取到客服ID'
						})
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
			},
			
			
			

		}
	}
</script>

<style lang="less" scoped>
	/* 引入外部主题样式 */
	@import '../../themes/index.css';

	/* 公共样式 */
	.home {
		min-height: 100vh;
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
	.subtitle { font-size: 26rpx; margin-top: 10rpx; }
	/* 自定义右侧大号指示点 */
	.dots-right { position: absolute; right: 24rpx; bottom: 24rpx; display: flex; align-items: center; }
	.dot2 { width: 20rpx; height:20rpx; border-radius: 50%; background: rgba(255,255,255,0.35); margin-left: 12rpx; }
	.dot2.active { width: 20rpx; height: 20rpx; border-radius: 50%; background: #ffffff; box-shadow: 0 2rpx 6rpx rgba(0,0,0,.35); }

	.features { margin: 24rpx; display: flex; flex-wrap: wrap; gap: 16rpx; justify-content: center; }
	.features-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
	.feature { flex: 0 0 calc((100% - 55rpx * var(--cline)) / var(--cline)); border-radius: 16rpx; padding: 24rpx 20rpx; text-align: center; box-shadow: none; }
	.f-icon {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		margin: 0 auto 16rpx auto;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
	}
	.f-text { font-size: 26rpx; }

	.status-card { margin: 0 24rpx; border-radius: 16rpx; padding: 28rpx 24rpx; box-shadow: none; }
	.row { display: flex; align-items: center; margin-bottom: 24rpx; }
	.dot.online { width: 12rpx; height: 12rpx; background: #22c55e; border-radius: 50%; margin-right: 12rpx; box-shadow: none; animation: none; }
	.dot.offline { width: 12rpx; height: 12rpx; background: #9ca3af; border-radius: 50%; margin-right: 12rpx; }
	.s-text { font-size: 24rpx; font-weight: 400; }
	.tags { margin-top: 12rpx; display: flex; flex-wrap: wrap; gap: 12rpx; }
	.tag { padding: 8rpx 16rpx; border-radius: 999rpx; font-size: 22rpx; font-weight: 400; border: none; box-shadow: none; transition: none; }
	.tag:active { transform: none; }
	
	/* 联系方式样式 */
	.contact-section { border-top: 1rpx solid #f0f0f0; margin-top: 20rpx; padding-top: 20rpx; }
	.contact-info { display: flex; align-items: center; padding: 12rpx; background: #fafafa; border-radius: 12rpx; transition: background 0.2s; }
	.contact-info:active { background: #f0f0f0; }
	.contact-icon { font-size: 36rpx; margin-right: 16rpx; }
	.contact-details { flex: 1; }
	.contact-label { font-size: 22rpx; color: #666666; display: block; margin-bottom: 4rpx; }
	.contact-value { font-size: 26rpx; color: #333333; font-weight: 600; }
	.contact-arrow { font-size: 24rpx; color: #999999; }

	// 移除动画定义

	.section { margin: 24rpx 0; }
	.section.hot { margin-bottom: 44rpx; }
	.section-head { padding: 0 24rpx; display: flex; justify-content: space-between; align-items: center; margin-bottom: 24rpx; }
	.section-title { font-weight: 700; font-size: 32rpx; }
	.more { font-size: 24rpx; }

	.grid { display: flex; flex-wrap: wrap; padding: 0 24rpx; justify-content: space-between; }
	.grid .card { width: calc(50% - 16rpx); margin: 0 0 20rpx 0; border-radius: 22rpx; overflow: hidden; position: relative; box-shadow: 0 12rpx 32rpx rgba(0,0,0,.35); }
	.grid.small { padding: 0 24rpx; justify-content: space-between; }
	.grid.small .card { width: calc(33.333% - 12rpx); margin: 0 0 12rpx 0; }
	.cover { width: 100%; height: 220rpx; display: block; }
	.grid.small .cover { height: 120rpx; }
	.card-body { padding: 18rpx; }
	.c-title { font-size: 30rpx; font-weight: 800; margin-bottom: 8rpx; }
	.c-meta { font-size: 24rpx; display:flex; align-items:center; }
	.c-meta .ico { margin-right: 8rpx; }

	.grid .mini { border-radius: 20rpx; overflow: hidden; position: relative; }
	.mini-title { position: absolute; left: 12rpx; bottom: 12rpx; color: #fff; text-shadow: 0 2rpx 6rpx rgba(0,0,0,.6); font-size: 24rpx; }

	/* 全局样式重置 */
	page {
		min-height: 100vh;
		margin: 0;
		padding: 0;
		background-color: transparent; /* 设置为透明，让home容器的背景色显示 */
	}

	/* 主容器样式 */
	.home {
		min-height: 100vh;
		padding-bottom: 24rpx;
		padding-top: 24rpx;
		height: 100%;
		width: 100%;
		position: relative;
	}
</style>
