<template>
	<view class="center">
		<!-- 用户信息区域 -->
		<view class="userInfo">
			<view class="user-info-container">
				<view class="avatar-section">
					<view class="avatar" @click="toUserInfo">
						<view v-if="hasLogin&&userInfo.avatar_file&&userInfo.avatar_file.url" class="avatar-image">
							<image :src="userInfo.avatar_file.url" mode="aspectFill"></image>
						</view>
						<view v-else class="default-avatar">
							<uni-icons type="person" size="64" color="#fff"></uni-icons>
						</view>
					</view>
					<view class="user-info">
						<text class="user-name" @click="toUserInfo">{{userInfo.nickname||userInfo.username||userInfo.mobile||'123'}}</text>
						<view class="status-section">
							<view class="verified-badge">
								<text>已认证</text>
							</view>
							<view class="online-status">
								<view class="online-dot"></view>
								<text>在线</text>
							</view>
						</view>
					</view>
				</view>
				<view class="actions-section">
					<view class="action-icon" @click="navigateTo('/pages/ucenter/settings/settings')">
						<uni-icons type="setting" size="40" color="#fff"></uni-icons>
					</view>
					<view class="action-icon">
						<uni-icons type="more" size="40" color="#fff"></uni-icons>
					</view>
				</view>
			</view>
		</view>

		<!-- 菜单列表 -->
		<view class="menu-container">
			<!-- 主要功能区 -->
			<view class="menu-group">
				<view class="menu-item" @click="navigateTo('/pages/ucenter/profile/profile')">
					<view class="icon-container blue">
						<uni-icons type="person" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title">个人中心</text>
					<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
				</view>

				<view class="menu-item" @click="navigateTo('/uni_modules/uni-im/pages/userList/userList')">
					<view class="icon-container purple">
						<uni-icons type="users" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title">用户列表</text>
					<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
				</view>

				<view class="menu-item" @click="navigateTo('/pages/online-customer-service/online-customer-service')">
					<view class="icon-container green">
						<uni-icons type="chat" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title">会话列表</text>
					<view class="arrow-with-badge">
						<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
						<view class="notification-badge">3</view>
					</view>
				</view>
			</view>

			<!-- 其他功能区 -->
			<view class="menu-group">
				<view class="menu-item" @click="navigateTo('/pages/ucenter/about/about')">
					<view class="icon-container gray">
						<uni-icons type="info" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title">关于我们</text>
					<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
				</view>

				<view class="menu-item" @click="navigateTo('/uni_modules/uni-feedback/pages/opendb-feedback/opendb-feedback')">
					<view class="icon-container gray">
						<uni-icons type="help" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title">帮助与反馈</text>
					<uni-icons type="arrowright" size="24" color="#999"></uni-icons>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-section">
				<view class="menu-item logout" @click="logout">
					<view class="icon-container red">
						<uni-icons type="logout" size="30" color="#fff"></uni-icons>
					</view>
					<text class="menu-title logout">退出登录</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import { store } from '@/uni_modules/uni-id-pages/common/store.js'
	export default {
		data() {
			return {
			}
		},
		onLoad() {
			// 加载用户信息
		},
		onShow() {
			// 每次页面显示时更新用户信息
		},
		computed: {
			userInfo() {
				return store.userInfo || { nickname: '123' }
			},
			hasLogin(){
				return store.hasLogin || true
			}
		},
		methods: {
			// 跳转到用户信息页面
			toUserInfo() {
				if (!this.hasLogin) {
					// 未登录则跳转到登录页面
					uni.navigateTo({
						url: '/uni_modules/uni-id-pages/pages/login/login'
					})
					return
				}
				// 已登录则跳转到个人信息页面
				uni.navigateTo({
					url: '/uni_modules/uni-id-pages/pages/userinfo/userinfo'
				})
			},

			// 通用导航方法
			navigateTo(url) {
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
							
							// 跳转到登录页面
							uni.navigateTo({
								url: '/uni_modules/uni-id-pages/pages/login/login'
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
		background-color: #0a0a0a;
	}

	.center {
		min-height: 100vh;
		background-color: #0a0a0a;
		padding-bottom: 60rpx;
	}

	/* 用户信息区域 */
	.userInfo {
		background-color: #1a1a3a;
		padding: 40rpx;
		padding-top: 100rpx; /* 为状态栏留出空间 */
		padding-bottom: 60rpx;
	}

	.user-info-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.user-info-section {
		display: flex;
		align-items: center;
	}

	.avatar-section {
		display: flex;
		align-items: center;
	}

	.avatar {
		width: 150rpx;
		height: 150rpx;
		border-radius: 50%;
		background-color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 30rpx;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
	}

	.avatar-image image {
		width: 100%;
		height: 100%;
	}

	.default-avatar {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #fff;
	}

	.user-info {
		flex: 1;
	}

	.user-name {
		font-size: 44rpx;
		font-weight: 600;
		color: #fff;
		display: block;
		margin-bottom: 16rpx;
	}

	.status-section {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.verified-badge {
		background-color: #007aff;
		padding: 6rpx 20rpx;
		border-radius: 20rpx;
	}

	.verified-badge text {
		font-size: 26rpx;
		color: #fff;
		font-weight: 500;
	}

	.online-status {
		display: flex;
		align-items: center;
	}

	.online-status text {
		font-size: 28rpx;
		color: #fff;
	}

	.online-dot {
		width: 16rpx;
		height: 16rpx;
		background-color: #4caf50;
		border-radius: 50%;
		margin-right: 10rpx;
	}

	.actions-section {
		display: flex;
		gap: 40rpx;
		align-items: center;
	}

	.action-icon {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* 菜单区域 */
	.menu-container {
		padding: 30rpx;
	}

	.menu-group {
		background-color: #1a1a3a;
		border-radius: 20rpx;
		overflow: hidden;
		margin-bottom: 30rpx;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 48rpx;
		position: relative;
	}

	.menu-item:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 160rpx;
		right: 0;
		height: 2rpx;
		background-color: rgba(255, 255, 255, 0.1);
	}

	.icon-container {
		width: 90rpx;
		height: 90rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 24rpx;
		margin-right: 30rpx;
	}

	.icon-container.blue {
		background-color: #007aff;
	}

	.icon-container.purple {
		background-color: #9b59b6;
	}

	.icon-container.green {
		background-color: #2ecc71;
	}

	.icon-container.gray {
		background-color: #7f8c8d;
	}

	.icon-container.red {
		background-color: #e74c3c;
	}

	.menu-title {
		font-size: 36rpx;
		color: #fff;
		font-weight: 500;
		flex: 1;
	}

	.menu-title.logout {
		color: #e74c3c;
	}

	.arrow-with-badge {
		position: relative;
	}

	.notification-badge {
		position: absolute;
		right: -32rpx;
		top: -20rpx;
		background-color: #e74c3c;
		color: #fff;
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 16rpx;
		min-width: 32rpx;
		text-align: center;
		font-weight: 500;
	}

	.logout-section {
		margin-top: 20rpx;
	}

	.logout-section .menu-item {
		background-color: #1a1a3a;
		border-radius: 20rpx;
	}
</style>
