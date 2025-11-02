<template>
	<view class="center">
		<!-- 用户信息区域 - 炫酷设计 -->
		<view class="userInfo">
			<view class="user-info-container">
				<!-- 装饰元素 -->
				<view class="bg-particle particle-1"></view>
				<view class="bg-particle particle-2"></view>
				<view class="bg-particle particle-3"></view>
				
				<view class="avatar-section">
					<view class="avatar-container">
						<view class="avatar-glow"></view>
						<view class="avatar" @click="toUserInfo">
							<view v-if="hasLogin&&userInfo.avatar_file" class="avatar-image">
								<image :src="avatarUrl" mode="aspectFill"></image>
							</view>
							<view v-else class="default-avatar">
								<uni-icons type="person" size="64" color="#fff"></uni-icons>
							</view>
						</view>
					</view>
					<view class="user-info">
						<view class="name-container">
							<text class="user-name" @click="toUserInfo">{{hasLogin ? (userInfo.nickname||userInfo.username||userInfo.mobile||'未设置昵称') : '未登录'}}</text>
							<view class="name-animation"></view>
						</view>
						<view class="status-section">
							<view class="verified-badge" style="font-weight: normal; font-size: 12px;">
								<uni-icons type="phone" size="16" color="#fff"></uni-icons>
								<text style="font-weight: normal; font-size: 12px;line-height: 10rpx;">{{userInfo.mobile ? '已认证' : '未认证'}}</text>
							</view>
							<view class="online-status" style="font-weight: normal; font-size: 12px;">
								<view class="online-dot"></view>
								<text style="font-weight: normal; font-size: 12px;line-height: 10rpx;">{{hasLogin ? '在线' : '未登录'}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="actions-section">
					<view class="setting-button" @click="navigateTo('/pages/ucenter/settings/settings')">
						<uni-icons type="setting" size="40" color="#fff"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 菜单列表 - 取消分组 -->
		<view class="menu-container">
			<view class="menu-item" @click="navigateTo('/uni_modules/uni-id-pages/pages/userinfo/userinfo', true)">
				<view class="icon-container blue">
					<uni-icons type="person" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">个人中心</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view>

			<view v-if="uniIDHasRole('admin')" class="menu-item" @click="navigateTo('/uni_modules/uni-im/pages/userList/userList', true)">
				<view class="icon-container purple" style="background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);">
					<uni-icons type="contact" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">用户列表</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view>

			<view v-if="uniIDHasRole('admin')" class="menu-item" @click="navigateTo('/uni_modules/uni-im/pages/index/index', true)">
				<view class="icon-container green">
					<uni-icons type="chat" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">会话列表</text>
				<view class="notification-badge" v-if="unreadMsgCount > 0">{{ unreadMsgCount }}</view>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view>

			<view class="menu-item" @click="navigateTo('/pages/ucenter/about/about')">
				<view class="icon-container gray">
					<uni-icons type="info" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">关于我们</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view>
			<view v-if="uniIDHasRole('admin')" class="menu-item" @click="navigateTo('/sys_mgr/index')">
				<view class="icon-container gray">
					<uni-icons type="settings" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">系统管理</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view>
			
			<!-- <view class="menu-item" @click="navigateTo('/uni_modules/uni-im/pages/contacts/contacts')">
				<view class="icon-container gray">
					<uni-icons type="help" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">通讯录</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view> -->

			<!-- <view class="menu-item" @click="navigateTo('/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback')">
				<view class="icon-container gray">
					<uni-icons type="help" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title">帮助与反馈</text>
				<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
			</view> -->

			<!-- 退出登录 -->
			<view class="menu-item logout" @click="changeLoginState">
				<view class="icon-container red" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
					<uni-icons type="clear" size="30" color="#fff"></uni-icons>
				</view>
				<text class="menu-title logout">退出登录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { store, mutations } from '@/uni_modules/uni-id-pages/common/store.js'
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	export default {
		data() {
			return {
				avatarUrl: ''
			}
		},
		onLoad() {
			// 加载用户信息
			this.updateAvatarUrl()
		},
		onShow() {
			// 每次页面显示时更新用户信息
			this.updateAvatarUrl()
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
		computed: {
			userInfo() {
				return store.userInfo || { nickname: '未登录' }
			},
			hasLogin(){
				return store.hasLogin
			},
			unreadMsgCount(){
				return uniIm.conversation.unreadCount()
			},
			notificationUnreadCount(){
				return uniIm.notification.unreadCount()
			}
		},
		methods: {
			// 跳转到用户信息页面
			toUserInfo() {
				if (!this.hasLogin) {
					// 未登录则跳转到登录页面
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
					return
				}
				// 已登录则跳转到个人信息页面
				// uni.navigateTo({
				// 	url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				// })
			},

			// 通用导航方法
			navigateTo(url, flag) {
				if (flag && !this.hasLogin) {
					// 未登录则跳转到登录页面
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
					})
					return
				}
				uni.navigateTo({
					url: url,
					fail: () => {
						uni.switchTab({
							url:url,
							fail: (e) => {
								console.error(e);
							}
						})
					}
				});
			},

			// 更新头像URL
			updateAvatarUrl() {
				if (this.hasLogin && this.userInfo.avatar_file) {
					// 获取URL值
					let url = this.userInfo.avatar_file.url || this.userInfo.avatar_file.fileID
					
					// 检查URL是否以cloud://开头
					if (url && url.startsWith('cloud://') && typeof uniCloud !== 'undefined') {
						// 如果是cloud://开头的fileID，通过uniCloud获取临时访问链接
						try {
							uniCloud.getTempFileURL({
								fileList: [url],
								success: (res) => {
									if (res.fileList && res.fileList.length > 0 && res.fileList[0].tempFileURL) {
										this.avatarUrl = res.fileList[0].tempFileURL
									}
								},
								err: (err) => {
									console.error('获取临时文件URL失败:', err)
									// 失败时尝试直接使用
									this.avatarUrl = url
								}
							})
						} catch (e) {
							console.error('调用uniCloud API失败:', e)
							// 失败时尝试直接使用
							this.avatarUrl = url
						}
					} else {
						// 非cloud://开头或没有uniCloud环境，直接使用URL
						this.avatarUrl = url || ''
					}
				} else {
					this.avatarUrl = ''
				}
			},
			async changeLoginState(){
				if(this.hasLogin){
					await mutations.logout()
				}else{
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd',
					});
				}
			},
			// 退出登录
			logout() {
				uni.showModal({
					title: '退出登录',
					content: '确定要退出登录吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							// 实际项目中应调用登出API
							// 清空用户信息
							store.hasLogin = false
							store.userInfo = null
							this.avatarUrl = ''
							
							// 跳转到登录页面
							uni.navigateTo({
								url: '/uni_modules/uni-id-pages/pages/login/login-withoutpwd'
							})
						}
					}
				})
			}
		}
	}
	</script>

<style lang="scss" scoped>
	page {
		background-color: #0f1320;
	}

	.center {
		min-height: 100vh;
		background-color: #0f1320;
		padding-bottom: 60rpx;
	}

	/* 用户信息区域 - 炫酷设计 */
	.userInfo {
		background: linear-gradient(135deg, #0f1320 0%, #1a1f36 50%, #2d3a5d 100%);
		padding: 30rpx 40rpx; /* 减小内边距 */
		padding-top: 180rpx; /* 为状态栏留出空间，减小值 */
		padding-bottom: 50rpx; /* 减小底部内边距 */
		border-radius: 0 0 40rpx 40rpx;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.5);
		position: relative;
		overflow: hidden;
		margin-bottom: 20rpx; /* 增加与个人中心的距离 */
	}
	
	/* 背景粒子效果 */
	.bg-particle {
		position: absolute;
		border-radius: 50%;
		filter: blur(40rpx);
		opacity: 0.5;
	}
	
	.particle-1 {
		width: 300rpx;
		height: 300rpx;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		top: -100rpx;
		left: -50rpx;
		animation: float 8s ease-in-out infinite;
	}
	
	.particle-2 {
		width: 200rpx;
		height: 200rpx;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		top: 50%;
		right: -100rpx;
		animation: float 10s ease-in-out infinite 2s;
	}
	
	.particle-3 {
		width: 150rpx;
		height: 150rpx;
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		bottom: -50rpx;
		left: 30%;
		animation: float 7s ease-in-out infinite 1s;
	}
	
	@keyframes float {
		0%, 100% {
			transform: translate(0, 0) scale(1);
		}
		50% {
			transform: translate(40rpx, -40rpx) scale(1.1);
		}
	}

	.user-info-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.avatar-section {
		display: flex;
		align-items: center;
	}

	.avatar-container {
		position: relative;
		margin-right: 30rpx;
	}
	
	.avatar-glow {
		position: absolute;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea, #764ba2);
		filter: blur(30rpx);
		animation: glowPulse 3s ease-in-out infinite;
	}
	
	@keyframes glowPulse {
		0%, 100% {
			transform: scale(0.9);
			opacity: 0.7;
		}
		50% {
			transform: scale(1);
			opacity: 0.9;
		}
	}

	.avatar {
		width: 180rpx;
		height: 180rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #1a1f36, #2d3a5d);
		display: flex;
		align-items: center;
		justify-content: center;
		border: 4rpx solid rgba(255, 255, 255, 0.2);
		box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.3);
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}
	
	.avatar::before {
		content: '';
		position: absolute;
		width: 100%;
		height: 100%;
		background: linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.3) 50%, transparent 60%);
		transform: rotate(45deg) translateY(-100%);
		animation: shine 6s linear infinite;
	}
	
	@keyframes shine {
		0% {
			transform: rotate(45deg) translateY(-100%);
		}
		100% {
			transform: rotate(45deg) translateY(100%);
		}
	}

	.avatar:active {
		transform: scale(0.95);
		box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.2);
	}

	.avatar-image {
		width: 172rpx;
		height: 172rpx;
		border-radius: 50%;
		overflow: hidden;
		background-color: #1a1f36;
	}

	.avatar-image image {
		width: 100%;
		height: 100%;
	}

	.default-avatar {
		width: 172rpx;
		height: 172rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
		border-radius: 50%;
	}
	
	.default-avatar uni-icons {
		animation: bounce 3s ease-in-out infinite;
	}
	
	@keyframes bounce {
		0%, 20%, 50%, 80%, 100% {
			transform: translateY(0);
		}
		40% {
			transform: translateY(-20rpx);
		}
		60% {
			transform: translateY(-10rpx);
		}
	}

	.user-info {
		flex: 1;
		position: relative;
	}

	.name-container {
		position: relative;
		display: inline-block;
		margin-bottom: 16rpx;
	}

	.user-name {
		font-size: 48rpx;
		// font-weight: 700;
		color: #fff;
		display: block;
		text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3), 0 0 20rpx rgba(102, 126, 234, 0.5);
		position: relative;
		z-index: 2;
		transition: all 0.3s ease;
	}
	
	.user-name:active {
		transform: scale(0.98);
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2), 0 0 15rpx rgba(102, 126, 234, 0.4);
	}
	
	.name-animation {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 6rpx;
		width: 0;
		background: linear-gradient(90deg, #667eea, #764ba2);
		border-radius: 3rpx;
		animation: nameHighlight 2s ease-in-out infinite;
	}
	
	@keyframes nameHighlight {
		0% {
			width: 0;
			left: 0;
		}
		50% {
			width: 100%;
			left: 0;
		}
		100% {
			width: 0;
			left: 100%;
		}
	}

	.status-section {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.verified-badge {
		display: flex;
		align-items: center;
		gap: 8rpx;
		background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2));
		padding: 6rpx 20rpx;
		border-radius: 25rpx;
		backdrop-filter: blur(10rpx);
		border: 2rpx solid rgba(255, 215, 0, 0.3);
		/* 移除动画效果 */
	}
	
	@keyframes badgeFloat {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4rpx);
		}
	}

	.verified-badge text {
		font-size: 28rpx;
		color: #fff;
		font-weight: 600;
		text-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.2);
	}

	.online-status {
		display: flex;
		align-items: center;
		padding: 12rpx 16rpx;
		background: rgba(76, 175, 80, 0.15);
		border-radius: 25rpx;
		backdrop-filter: blur(10rpx);
		border: 2rpx solid rgba(76, 175, 80, 0.3);
	}

	.online-status text {
		font-size: 28rpx;
		color: #4caf50;
		font-weight: 500;
	}

	.online-dot {
		width: 18rpx;
		height: 18rpx;
		background-color: #4caf50;
		border-radius: 50%;
		margin-right: 10rpx;
		box-shadow: 0 0 16rpx #4caf50, 0 0 32rpx rgba(76, 175, 80, 0.3);
		animation: pulse 2s infinite; /* 只保留脉冲效果 */
	}
	
	@keyframes floatUpDown {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-6rpx);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.8;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.actions-section {
		display: flex;
		gap: 30rpx;
		align-items: center;
		margin-top: 50rpx;
	}

	.setting-button {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 20rpx;
		transition: all 0.3s ease;
		box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
		position: relative;
		animation: rotateIcon 10s linear infinite paused;
	}
	
	.setting-button::before {
		content: '';
		position: absolute;
		inset: -4rpx;
		background: linear-gradient(45deg, #667eea, #764ba2, #4facfe, #00f2fe);
		border-radius: 24rpx;
		z-index: -1;
		animation: rotateBorder 4s linear infinite;
		filter: blur(10rpx);
	}
	
	@keyframes rotateBorder {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
	
	@keyframes rotateIcon {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	.setting-button:active {
		transform: scale(0.95);
		box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.3);
		animation: rotateIcon 2s linear infinite;
	}
	
	.setting-button uni-icons {
		transition: transform 0.3s ease;
	}
	
	.setting-button:active uni-icons {
		transform: scale(1.1);
	}

	/* 菜单区域 */
	.menu-container {
		padding: 30rpx;
		margin-top: -20rpx;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 48rpx;
		position: relative;
		transition: background-color 0.2s ease;
		background-color: rgba(255, 255, 255, 0.05);
		margin-bottom: 20rpx;
		border-radius: 20rpx;
	}

	.menu-item:active {
		background-color: rgba(255, 255, 255, 0.08);
	}

	.menu-item:not(:last-child)::after {
		content: none;
	}

	.icon-container {
		width: 88rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 20rpx;
		margin-right: 30rpx;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
	}

	.icon-container.blue {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}

	.icon-container.purple {
		background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
	}

	.icon-container.green {
		background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
	}

	.icon-container.gray {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}

	.icon-container.red {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	}

	.menu-title {
		font-size: 36rpx;
		color: #fff;
		font-weight: 500;
		flex: 1;
		margin-right: 20rpx;
	}

	.menu-title.logout {
		color: #ff4757;
	}

	.notification-badge {
		background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
		color: #fff;
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 16rpx;
		min-width: 32rpx;
		text-align: center;
		font-weight: 500;
		box-shadow: 0 4rpx 12rpx rgba(245, 87, 108, 0.3);
		margin-right: 20rpx;
	}

	.menu-item.logout {
		background-color: rgba(245, 87, 108, 0.1);
		margin-top: 40rpx;
	}
</style>
