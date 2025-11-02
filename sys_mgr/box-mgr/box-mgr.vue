<template>
	<view class="box-mgr-container">
		<!-- 添加按钮 -->
		<view class="add-button" @click="addBox">添加包厢</view>
		
		<!-- 搜索栏 -->
		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索包厢名称" @confirm="searchBox"></uni-search-bar>
		</view>
		
		<!-- 包厢列表 -->
		<view class="box-list">
			<view class="empty-tip" v-if="boxList.length === 0">
				<uni-icons type="home" size="60" color="#CCCCCC"></uni-icons>
				<text class="empty-text">暂无包厢数据</text>
			</view>
			
			<view class="box-item" v-for="item in boxList" :key="item._id">
				<!-- 包厢图片 -->
				<view class="box-cover" v-if="item.cover || item.image">
					<image :src="item.cover || item.image" mode="aspectFill"></image>
				</view>
				<view class="box-cover empty" v-else>
					<uni-icons type="image" size="40" color="#CCCCCC"></uni-icons>
				</view>
				
				<view class="box-content">
					<view class="box-header">
						<view class="box-name">{{ item.name }}</view>
						<view class="box-features">
							<view class="feature hot" v-if="item.hot">热门</view>
							<view class="feature themed" v-if="item.themed">主题精选</view>
						</view>
					</view>
					
					<view class="box-info">
						<view class="info-item">
							<text class="info-label">容纳人数：</text>
							<text class="info-value">{{ item.capacity }}人</text>
						</view>
						<view class="info-item">
							<text class="info-label">价格：</text>
							<text class="info-value price">¥{{ item.price }}/{{ item.priceUnit || '小时' }}</text>
						</view>
					</view>
					
					<!-- 包厢标签 -->
					<view class="box-tags" v-if="item.tags && item.tags.length > 0">
						<view class="tag" v-for="(tag, index) in item.tags" :key="index">{{ tag }}</view>
					</view>
					
					<view class="box-actions">
						<uni-icons type="compose" size="24" color="#007AFF" @click="editBox(item)"></uni-icons>
						<uni-icons type="trash" size="24" color="#FF3B30" @click="deleteBox(item._id)"></uni-icons>
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
				searchText: '',
				boxList: []
			}
		},
		onLoad() {
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: '包厢维护'
			});
			
		},
		onShow() {
			this.loadBoxList();
		},
		methods: {
			// 加载包厢列表
			loadBoxList() {
				// 调用云函数获取包厢数据
				uni.showLoading({
					title: '加载中...'
				});
				
				uniCloud.callFunction({
					name: 'roomManager',
					data: {
						action: 'getAllRooms',
						searchText: this.searchText || '',
						limit: 100 // 加载足够多的数据
					}
				}).then(res => {
					uni.hideLoading();
					if (res.result && res.result.code === 200) {
						this.boxList = res.result.data.rooms || [];
					} else {
						uni.showToast({
							title: '加载失败',
							icon: 'none'
						});
					}
				}).catch(error => {
					uni.hideLoading();
					console.error('加载包厢列表失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
				});
			},
			
			// 搜索包厢
			searchBox() {
				// 重新调用云函数进行搜索
				this.loadBoxList();
			},
			
			// 添加包厢
			addBox() {
				uni.navigateTo({
					url: '/sys_mgr/box-mgr/box-edit?type=add'
				})
			},
			
			// 编辑包厢
			editBox(box) {
				uni.navigateTo({
					url: `/sys_mgr/box-mgr/box-edit?type=edit&id=${box._id}`
				})
			},
			
			// 删除包厢
			deleteBox(id) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个包厢吗？',
					confirmText: '删除',
					confirmColor: '#FF3B30',
					success: (res) => {
						if (res.confirm) {
							// 调用云函数删除包厢
								uniCloud.callFunction({
									name: 'roomManager',
									data: {
										action: 'deleteRoom',
										_id: id
									}
								}).then(result => {
									if (result.result && result.result.code === 200) {
										uni.showToast({
											title: '删除成功',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: result.result?.message || '删除失败',
											icon: 'none'
										});
									}
									this.loadBoxList();
								}).catch(error => {
									console.error('删除包厢失败:', error);
									uni.showToast({
										title: '删除失败，请稍后重试',
										icon: 'none'
									});
								});
						}
					}
				});
			}
		}
	}
</script>

<style scoped>
	.box-mgr-container {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.add-button {
		background-color: #007AFF;
		color: #FFFFFF;
		text-align: center;
		padding: 20rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
	}
	
	.search-bar {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
	}
	
	.box-list {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		overflow: hidden;
	}
	
	.empty-tip {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 100rpx 0;
	}
	
	.empty-text {
		margin-top: 20rpx;
		font-size: 28rpx;
		color: #999999;
	}
	
	.box-item {
		padding: 30rpx 20rpx;
		border-bottom: 1rpx solid #EEEEEE;
		display: flex;
		gap: 20rpx;
	}
	
	.box-item:last-child {
		border-bottom: none;
	}
	
	.box-cover {
		width: 180rpx;
		height: 120rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #f5f5f5;
	}
	
	.box-cover image {
		width: 100%;
		height: 100%;
	}
	
	.box-cover.empty {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.box-content {
		flex: 1;
	}
	
	.box-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 10rpx;
	}
	
	.box-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		flex: 1;
	}
	
	.box-features {
		display: flex;
		gap: 10rpx;
		margin-left: 10rpx;
	}
	
	.feature {
		font-size: 20rpx;
		color: #fff;
		border-radius: 10rpx;
		padding: 4rpx 12rpx;
	}
	
	.feature.hot {
		background-color: #ff6b6b;
	}
	
	.feature.themed {
		background-color: #4dabf7;
	}
	
	.box-info {
		margin-bottom: 10rpx;
	}
	
	.info-item {
		display: flex;
		margin-bottom: 8rpx;
	}
	
	.info-label {
		font-size: 28rpx;
		color: #666666;
	}
	
	.info-value {
		font-size: 28rpx;
		color: #333333;
	}
	
	.info-value.price {
		color: #e64340;
		font-weight: 500;
	}
	
	.box-tags {
		display: flex;
		flex-wrap: wrap;
		margin-bottom: 10rpx;
	}
	
	.tag {
		font-size: 20rpx;
		color: #666;
		background-color: #f5f5f5;
		border-radius: 10rpx;
		padding: 4rpx 12rpx;
		margin-right: 10rpx;
		margin-bottom: 8rpx;
	}
	
	.box-actions {
		display: flex;
		justify-content: flex-end;
		gap: 40rpx;
	}
</style>