<template>
	<view class="sys-mgr-container">
		
		<!-- 功能列表 -->
		<view class="function-list">
			<!-- Banner维护 -->
			<view class="function-item" @click="goToBannerMgr">
				<view class="item-icon">
					<uni-icons type="image" size="28" color="#007AFF"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">Banner维护</view>
					<view class="item-desc">管理首页轮播图</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
			
			<!-- 影院信息维护 -->
			<view class="function-item" @click="goToCinemaInfoMgr">
				<view class="item-icon">
					<uni-icons type="location" size="28" color="#FF9500"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">影院信息维护</view>
					<view class="item-desc">修改影院基本信息</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
			
			<!-- 包厢维护 -->
			<view class="function-item" @click="goToBoxMgr">
				<view class="item-icon">
					<uni-icons type="home" size="28" color="#34C759"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">包厢维护</view>
					<view class="item-desc">管理影院包厢信息</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
			
			<!-- 员工维护 -->
			<view class="function-item" @click="goToEmployeeMgr">
				<view class="item-icon">
					<uni-icons type="person" size="28" color="#AF52DE"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">员工维护</view>
					<view class="item-desc">管理影院员工信息</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
			
			<!-- 设置管理员 -->
			<view class="function-item" @click="goToAdminMgr">
				<view class="item-icon">
					<uni-icons type="personadd" size="28" color="#FF3B30"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">设置管理员</view>
					<view class="item-desc">管理系统管理员权限</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
			
			<!-- 设置客服 -->
			<view class="function-item" @click="goToCustomerServiceMgr">
				<view class="item-icon">
					<uni-icons type="chatbubble" size="28" color="#5AC8FA"></uni-icons>
				</view>
				<view class="item-content">
					<view class="item-title">设置客服</view>
					<view class="item-desc">管理系统客服权限</view>
				</view>
				<uni-icons type="right" size="20" color="#CCCCCC"></uni-icons>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			// 跳转到Banner维护页面
			goToBannerMgr() {
				uni.navigateTo({
					url: '/sys_mgr/banner-mgr/banner-mgr'
				})
			},
			
			// 跳转到影院信息维护页面
			goToCinemaInfoMgr() {
				uni.navigateTo({
					url: '/sys_mgr/cinema-info-mgr/cinema-info-mgr'
				})
			},
			
			// 跳转到包厢维护页面
			goToBoxMgr() {
				uni.navigateTo({
					url: '/sys_mgr/box-mgr/box-mgr'
				})
			},
			
			// 跳转到员工维护页面
			goToEmployeeMgr() {
				uni.navigateTo({
					url: '/sys_mgr/employee-mgr/employee-mgr'
				})
			},
			
			// 跳转到设置管理员页面
			goToAdminMgr() {
				uni.navigateTo({
					url: '/sys_mgr/admin-mgr/admin-mgr'
				})
			},
			
			// 跳转到设置客服页面
			goToCustomerServiceMgr() {
				uni.navigateTo({
					url: '/sys_mgr/customer-service-mgr/customer-service-mgr'
				})
			}
		}
	}
</script>

<style scoped>
	.sys-mgr-container {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333333;
		margin: 30rpx 0;
		padding-left: 20rpx;
	}
	
	.function-list {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.function-item {
		display: flex;
		align-items: center;
		padding: 30rpx 20rpx;
		border-bottom: 1rpx solid #EEEEEE;
	}
	
	.function-item:last-child {
		border-bottom: none;
	}
	
	.item-icon {
		margin-right: 30rpx;
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: #F5F5F5;
		border-radius: 12rpx;
	}
	
	.item-content {
		flex: 1;
	}
	
	.item-title {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 8rpx;
	}
	
	.item-desc {
		font-size: 24rpx;
		color: #999999;
	}
</style>
