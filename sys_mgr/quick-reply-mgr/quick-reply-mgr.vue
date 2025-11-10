<template>
	<view class="quick-reply-mgr-container">
		<!-- 标题栏 -->
		<view class="header">
			<button class="add-btn" @click="navigateToEdit()">添加回复</button>
		</view>
		
		<!-- 筛选图标在搜索框前面 -->
		<view class="search-filter-container">
			<!-- 筛选图标按钮 -->
			<view 
				class="filter-icon-button"
				@click="toggleFilter"
				:class="{ active: filterExpanded }"
				hover-class="filter-button-hover"
			>
				<uni-icons 
					type="list" 
					size="30" 
					color="#007AFF"
				></uni-icons>
			</view>
			
			<!-- 搜索框 -->
			<uni-search-bar 
				v-model="keyword" 
				@confirm="search" 
				placeholder="请输入回复内容进行搜索"
				:clearabled="true"
				:show-action="false"
				style="flex: 1;"
			></uni-search-bar>
		</view>
		
		<!-- 下滑显示的筛选内容 -->
			<view class="filter-content" :class="{ 'slide-down': filterExpanded }">
				<view class="filter-section">
					<text class="filter-section-title">状态筛选</text>
					<view class="filter-items">
						<view 
							class="filter-item" 
							:class="{ active: statusFilter === null }"
							@click="setStatusFilter(null)"
						>全部</view>
						<view 
							class="filter-item" 
							:class="{ active: statusFilter === true }"
							@click="setStatusFilter(true)"
						>启用</view>
						<view 
							class="filter-item" 
							:class="{ active: statusFilter === false }"
							@click="setStatusFilter(false)"
						>停用</view>
					</view>
				</view>
				
				<view class="filter-section">
					<text class="filter-section-title">类型筛选</text>
					<view class="filter-items">
						<view 
							class="filter-item" 
							:class="{ active: typeFilter === null }"
							@click="setTypeFilter(null)"
						>全部</view>
						<view 
							class="filter-item" 
							:class="{ active: typeFilter === 'customerService' }"
							@click="setTypeFilter('customerService')"
						>客服</view>
						<view 
							class="filter-item" 
							:class="{ active: typeFilter === 'user' }"
							@click="setTypeFilter('user')"
						>普通用户</view>
					</view>
				</view>
			</view>
		
		<!-- 快捷回复列表 -->
		<view class="reply-list">
			<view v-if="replies.length === 0" class="empty-tip">
				暂无快捷回复数据
			</view>
			<view v-for="(reply, index) in replies" :key="reply._id" class="reply-item">
				<view class="reply-content">
					<text class="content-text">{{ reply.content }}</text>
					<view class="reply-meta">
				<text class="sort">排序: {{ reply.sort }}</text>
				<text class="type-tag" :class="reply.type === 'customerService' ? 'type-customer-service' : 'type-user'">
					{{ reply.type === 'customerService' ? '客服' : '普通用户' }}
				</text>
				<text class="status" :class="reply.status ? 'active' : 'inactive'">
					{{ reply.status ? '启用' : '禁用' }}
				</text>
				<text class="time">{{ formatTime(reply.create_date) }}</text>
			</view>
				</view>
				<view class="action-buttons">
					<view class="icon-btn edit-icon" @click="navigateToEdit(reply)" title="编辑">
						<uni-icons type="compose" size="26" color="#1890FF"></uni-icons>
					</view>
					<view class="icon-btn delete-icon" @click="deleteReply(reply._id)" title="删除">
						<uni-icons type="trash" size="26" color="#F5222D"></uni-icons>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				replies: [],
				keyword: '',
				statusFilter: null, // 状态筛选：null表示全部，true表示启用，false表示停用
				typeFilter: 'customerService', // 类型筛选：默认筛选客服类型，'customerService'表示客服，'user'表示普通用户，null表示全部
				filterExpanded: false // 筛选器展开状态
			}
		},
		onLoad() {
			// this.loadReplies();
		},
		onShow() {
			this.loadReplies();
		},
		// 下拉刷新
		onPullDownRefresh() {
			this.loadReplies();
			uni.stopPullDownRefresh();
		},
		methods: {
			// 切换筛选器显示状态
			toggleFilter() {
				this.filterExpanded = !this.filterExpanded;
			},
			
			// 设置状态筛选
			setStatusFilter(status) {
				this.statusFilter = status;
				this.filterExpanded = false;
				this.search();
			},
			
			// 设置类型筛选
			setTypeFilter(type) {
				this.typeFilter = type;
				this.filterExpanded = false;
				this.search();
			},
			// 加载快捷回复列表
			loadReplies() {
				uni.showLoading({
					title: '加载中...'
				});

				// 调用云函数获取快捷回复列表
				uniCloud.callFunction({
					name: 'quickReplyManager',
					data: {
						action: 'getAllReplies'
					}
				}).then(res => {
					if (res.result && res.result.code === 200) {
					let replies = res.result.data || [];
					// 应用过滤条件
				replies = replies.filter(item => {
					// 关键词过滤
					const keywordMatch = !this.keyword || 
						item.content.toLowerCase().includes(this.keyword.toLowerCase());
						
					// 状态过滤
					const statusMatch = this.statusFilter === null || item.status === this.statusFilter;
					
					// 类型过滤
					const typeMatch = this.typeFilter === null || item.type === this.typeFilter;
						
					return keywordMatch && statusMatch && typeMatch;
				});
					this.replies = replies;
				} else {
						uni.showToast({
							title: res.result.message || '获取快捷回复列表失败',
							icon: 'none'
						});
					}
				}).catch(err => {
					console.error('获取快捷回复列表失败:', err);
					uni.showToast({
						title: '获取快捷回复列表失败',
						icon: 'none'
					});
				}).finally(() => {
					uni.hideLoading();
				});
			},

			// 导航到编辑页面
			navigateToEdit(reply = null) {
				const params = reply ? `?_id=${reply._id}` : '';
				uni.navigateTo({
					url: './quick-reply-edit' + params
				});
			},

			// 删除快捷回复
			deleteReply(id) {
				uni.showModal({
					title: '删除确认',
					content: '确定要删除这条快捷回复吗？',
					confirmText: '确定',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...'
							});

							// 调用云函数删除快捷回复
							uniCloud.callFunction({
								name: 'quickReplyManager',
								data: {
									action: 'deleteReply',
									data: {
										_id: id
									}
								}
							}).then(res => {
								if (res.result && res.result.code === 200) {
									// 从本地列表中删除
									this.replies = this.replies.filter(item => item._id !== id);
									uni.showToast({
										title: '删除成功'
									});
								} else {
									uni.showToast({
										title: res.result.message || '删除失败',
										icon: 'none'
									});
								}
							}).catch(err => {
								console.error('删除快捷回复失败:', err);
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
							}).finally(() => {
								uni.hideLoading();
							});
						}
					}
				});
			},

			// 搜索功能
			search() {
				this.loadReplies();
			},

			// 格式化时间
			formatTime(timestamp) {
				if (!timestamp) return '';
				const date = new Date(timestamp);
				return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
			}
		}
	}
</script>

<style scoped>
	.quick-reply-mgr-container {
			background-color: #F5F5F5;
			min-height: 100vh;
		}
		
		.header {
			padding: 15rpx 20rpx;
		}

		.add-btn {
			width: 100%;
			height: 70rpx;
			line-height: 70rpx;
			border-radius: 10rpx;
			font-size: 28rpx;
			background-color: #007AFF;
			color: #FFFFFF;
			border: none;
			font-weight: 500;
			transition: background-color 0.2s ease;
		}
		
		.add-btn:active {
			background-color: #0056B3;
		}
	
	.search-filter-container {
			display: flex;
			align-items: center;
			gap: 10rpx;
			padding: 0rpx 20rpx;
			background-color: #FFFFFF;
			border-bottom: 1rpx solid #EEEEEE;
		}
		
		/* 筛选图标按钮样式 */
		.filter-icon-button {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 70rpx;
			height: 70rpx;
			background-color: transparent;
			border-radius: 10rpx;
			/* 微信小程序兼容 */
		}
		
		/* 微信小程序触摸反馈 */
		.filter-button-hover {
			background-color: #F0F0F0;
		}
		
		.filter-icon-button.active {
			background-color: #E6F7FF;
		}
		
		/* 筛选内容区域 - 下滑显示 */
		.filter-content {
			height: 0;
			overflow: hidden;
			background-color: #FFFFFF;
			transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
			border-bottom: 2rpx solid #EEEEEE;
		}
		
		.filter-content.slide-down {
			height: 310rpx;
		}
		
		.filter-section {
			padding: 15rpx 20rpx 0;
		}
		
		.filter-section-title {
			display: block;
			font-size: 24rpx;
			color: #999999;
			margin-bottom: 10rpx;
			padding-left: 10rpx;
		}
		
		.filter-items {
			display: flex;
			flex-direction: row;
			padding: 15rpx 20rpx;
			gap: 20rpx;
			align-items: center;
		}
		
		.filter-item {
			flex: 1;
			padding: 18rpx 0;
			font-size: 28rpx;
			font-weight: 500;
			color: #333333;
			text-align: center;
			background-color: #F5F5F5;
			border-radius: 10rpx;
			transition: all 0.2s ease;
			box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		}
		
		.filter-item:active {
			background-color: #E8E8E8;
			transform: scale(0.98);
		}
		
		.filter-item.active {
			color: #FFFFFF;
			background-color: #007AFF;
			box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
		}

	.reply-list {
		padding: 0 20rpx 20rpx;
		margin-top: 15rpx;
	}

	.reply-item {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 25rpx;
		margin-bottom: 15rpx;
		position: relative;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		transition: all 0.2s ease;
	}
	
	.reply-item:active {
		background-color: #F8F8F8;
	}

	.reply-content {
		margin-right: 120rpx; /* 为图标按钮留出空间 */
	}

	.content-text {
		font-size: 32rpx;
		color: #333333;
		line-height: 1.5;
		word-break: break-all;
		margin-bottom: 10rpx;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.reply-meta {
		display: flex;
		align-items: center;
		gap: 20rpx;
		font-size: 24rpx;
		color: #999999;
	}

	.status.active {
			color: #07C160;
		}
		
		.status.inactive {
			color: #999999;
		}
		
		.type-tag {
			padding: 2rpx 12rpx;
			border-radius: 12rpx;
			font-size: 22rpx;
		}
		
		.type-customer-service {
			background-color: #E6F7FF;
			color: #1890FF;
		}
		
		.type-user {
			background-color: #F6FFED;
			color: #52C41A;
		}

	.action-buttons {
		position: absolute;
		right: 30rpx;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		flex-direction: row;
		gap: 20rpx;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 50rpx;
		height: 50rpx;
		border-radius: 12rpx;
		background-color: #F5F5F5;
		transition: all 0.3s ease;
		padding: 6rpx;
	}

	.icon-btn:active {
		background-color: #E8E8E8;
		transform: scale(0.95);
	}

	.edit-icon {
		background-color: #E6F7FF;
	}

	.delete-icon {
		background-color: #FFF1F0;
	}

	.empty-tip {
		text-align: center;
		padding: 100rpx 0;
		color: #999999;
		font-size: 28rpx;
		background-color: #FFFFFF;
		border-radius: 12rpx;
		/* margin: 0 20rpx 20rpx; */
	}
</style>