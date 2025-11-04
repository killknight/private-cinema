<template>
	<view class="customer-service-mgr-container">
		<!-- 搜索框 -->
		<view class="search-bar">
			<uni-search-bar v-model="keyword" @confirm="search" placeholder="请输入昵称进行搜索"></uni-search-bar>
		</view>
		<!-- 用户列表 -->
		<view class="user-list">
			<view v-if="users.length === 0" class="empty-tip">
				暂无用户数据
			</view>
			<view v-for="(user, index) in users" :key="user._id" class="user-item">
				<view class="user-info">
					<view class="user-avatar">
							<uni-icons v-if="!user.avatar" type="person" size="40" color="#999999"></uni-icons>
							<image v-else :src="user.avatar" mode="aspectFill" @error="onAvatarError($event, index)"></image>
						</view>
					<view class="user-details">
						<view class="user-nickname">{{ user.nickname || '未设置昵称' }}</view>
						<view class="user-role">
							{{ user.isCustomerService ? '当前身份：客服' : '当前身份：普通用户' }}
						</view>
					</view>
				</view>
				<view class="action-buttons">
					<button v-if="!user.isCustomerService" class="set-service-btn" @click="setCustomerService(user._id)">
						设置客服
					</button>
					<button v-else class="cancel-service-btn" @click="cancelCustomerService(user._id)">
						取消客服
					</button>
				</view>
			</view>
		</view>

		<!-- 加载提示 -->
		<uni-load-more :status="loadStatus" :content-text="{contentdown: '下拉加载更多', contentrefresh: '加载中...', contentnomore: '没有更多数据了'}" v-if="users.length > 0"></uni-load-more>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				users: [],
				page: 1,
				pageSize: 10,
				hasMore: true,
				loadStatus: 'more', // more, loading, noMore
				keyword: ''
			}
		},
		onLoad() {
			this.loadUsers();
		},
		methods: {
			// 头像加载失败处理
			onAvatarError(event, index) {
				// 将失败的头像设为空，触发显示默认图标
				if (this.users[index]) {
					this.$set(this.users[index], 'avatar', '');
				}
			},

			// 加载用户列表
			loadUsers(refresh = false) {
				if (refresh) {
					this.page = 1;
					this.hasMore = true;
				}

				if (!this.hasMore) {
					this.loadStatus = 'noMore';
					return;
				}

				this.loadStatus = 'loading';

				// 调用云函数获取用户列表
				uniCloud.callFunction({
					name: 'userManagement',
					data: {
						action: 'getUserList',
						page: this.page,
						pageSize: this.pageSize,
						keyword: this.keyword
					}
				}).then(res => {
					if (res.result && res.result.code === 0) {
						const userList = res.result.data || [];
						if (refresh) {
							this.users = userList;
						} else {
							this.users = [...this.users, ...userList];
						}

						// 判断是否还有更多数据
						this.hasMore = userList.length === this.pageSize;
						this.loadStatus = this.hasMore ? 'more' : 'noMore';
						if (this.hasMore) {
							this.page++;
						}
					} else {
						uni.showToast({
							title: res.result.msg || '获取用户列表失败',
							icon: 'none'
						});
						this.loadStatus = 'more';
					}
				}).catch(err => {
					console.error('获取用户列表失败:', err);
					uni.showToast({
						title: '获取用户列表失败',
						icon: 'none'
					});
					this.loadStatus = 'more';
				});
			},

			// 设置客服
			setCustomerService(userId) {
				uni.showModal({
					title: '设置客服',
					content: '确定要将此用户设置为客服吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '设置中...'
							});

							// 调用云函数设置客服
							uniCloud.callFunction({
								name: 'userManagement',
								data: {
									action: 'updateUserRole',
									userId: userId,
									isCustomerService: true
								}
							}).then(res => {
								if (res.result && res.result.code === 0) {
									// 更新本地用户数据
									const userIndex = this.users.findIndex(u => u._id === userId);
									if (userIndex !== -1) {
										this.users[userIndex].isCustomerService = true;
									}
									uni.showToast({
										title: '设置成功'
									});
								} else {
									uni.showToast({
										title: res.result.msg || '设置失败',
										icon: 'none'
									});
								}
							}).catch(err => {
								console.error('设置客服失败:', err);
								uni.showToast({
									title: '设置失败',
									icon: 'none'
								});
							}).finally(() => {
								uni.hideLoading();
							});
						}
					}
				});
			},

			// 取消客服
			cancelCustomerService(userId) {
				uni.showModal({
					title: '取消客服',
					content: '确定要取消此用户的客服权限吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '取消中...'
							});

							// 调用云函数取消客服
							uniCloud.callFunction({
								name: 'userManagement',
								data: {
									action: 'updateUserRole',
									userId: userId,
									isCustomerService: false
								}
							}).then(res => {
								if (res.result && res.result.code === 0) {
									// 更新本地用户数据
									const userIndex = this.users.findIndex(u => u._id === userId);
									if (userIndex !== -1) {
										this.users[userIndex].isCustomerService = false;
									}
									uni.showToast({
										title: '取消成功'
									});
								} else {
									uni.showToast({
										title: res.result.msg || '取消失败',
										icon: 'none'
									});
								}
							}).catch(err => {
								console.error('取消客服失败:', err);
								uni.showToast({
									title: '取消失败',
									icon: 'none'
								});
							}).finally(() => {
								uni.hideLoading();
							});
						}
					}
				});
			},

			// 下拉刷新
			onPullDownRefresh() {
				this.loadUsers(true);
				uni.stopPullDownRefresh();
			},

			// 上拉加载更多
			onReachBottom() {
				// 搜索模式下不上拉加载更多
				if (!this.keyword && this.hasMore && this.loadStatus !== 'loading') {
					this.loadUsers(false);
				}
			},
			
			// 搜索功能
			search() {
				this.page = 1;
				this.hasMore = true;
				this.loadUsers(true);
			}
		}
	}
</script>

<style scoped>
	.customer-service-mgr-container {
		padding-top: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.search-bar {
		padding: 20rpx;
		background-color: #FFFFFF;
		margin-bottom: 20rpx;
	}

	.user-list {
		padding: 20rpx;
	}

	.user-item {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 30rpx;
		margin-bottom: 20rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.user-info {
		display: flex;
		align-items: center;
		flex: 1;
	}

	.user-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		background-color: #F5F5F5;
		margin-right: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.user-avatar image {
		width: 100%;
		height: 100%;
	}

	.user-details {
		flex: 1;
	}

	.user-nickname {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 8rpx;
	}

	.user-role {
		font-size: 24rpx;
		color: #999999;
	}

	.action-buttons {
		margin-left: 20rpx;
	}

	.set-service-btn,
	.cancel-service-btn {
		padding: 0 30rpx;
		height: 70rpx;
		line-height: 70rpx;
		border-radius: 35rpx;
		font-size: 28rpx;
		border: none;
	}

	.set-service-btn {
		background-color: #007AFF;
		color: #FFFFFF;
	}

	.cancel-service-btn {
		background-color: #F5F5F5;
		color: #333333;
	}

	.empty-tip {
		text-align: center;
		padding: 100rpx 0;
		color: #999999;
		font-size: 28rpx;
	}
</style>