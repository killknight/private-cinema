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
				<view class="box-header">
					<view class="box-name">{{ item.boxName }}</view>
					<view class="box-status" :class="{ 'status-available': item.status === 'available', 'status-unavailable': item.status === 'unavailable' }">
						{{ item.status === 'available' ? '可用' : '不可用' }}
					</view>
			</view>
			<view class="box-info">
				<view class="info-item">
					<text class="info-label">容纳人数：</text>
					<text class="info-value">{{ item.capacity }}人</text>
				</view>
				<view class="info-item">
					<text class="info-label">价格：</text>
					<text class="info-value">¥{{ item.price }}/小时</text>
				</view>
			</view>
			<view class="box-actions">
					<uni-icons type="compose" size="24" color="#007AFF" @click="editBox(item)"></uni-icons>
					<uni-icons type="trash" size="24" color="#FF3B30" @click="deleteBox(item._id)"></uni-icons>
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
			this.loadBoxList();
		},
		methods: {
			// 加载包厢列表
			loadBoxList() {
				// 这里应该调用云函数获取包厢数据
				// 暂时使用模拟数据
				uni.showLoading({
					title: '加载中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					// 模拟数据
					this.boxList = [
						{
							_id: '1',
							boxName: '豪华观影厅A',
							capacity: 4,
							price: 198,
							status: 'available'
						},
						{
							_id: '2',
							boxName: '豪华观影厅B',
							capacity: 6,
							price: 298,
							status: 'available'
						},
						{
							_id: '3',
							boxName: 'VIP包厢',
							capacity: 2,
							price: 258,
							status: 'unavailable'
						}
					];
				}, 1000);
			},
			
			// 搜索包厢
			searchBox() {
				// 这里应该实现搜索功能
				let filtered = this.boxList.filter(item => 
					item.boxName.toLowerCase().includes(this.searchText.toLowerCase())
				);
				// 如果有搜索结果，显示搜索结果，否则显示提示
				if (filtered.length === 0 && this.searchText) {
					uni.showToast({
						title: '未找到相关包厢',
						icon: 'none'
					});
				}
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
							// 这里应该调用云函数删除包厢
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							this.loadBoxList();
						}
					}
				})
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
	}
	
	.box-item:last-child {
		border-bottom: none;
	}
	
	.box-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 15rpx;
	}
	
	.box-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}
	
	.box-status {
		padding: 4rpx 20rpx;
		border-radius: 16rpx;
		font-size: 24rpx;
	}
	
	.status-available {
		background-color: #E8F4EA;
		color: #34C759;
	}
	
	.status-unavailable {
		background-color: #FEECEB;
		color: #FF3B30;
	}
	
	.box-info {
		margin-bottom: 20rpx;
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
	
	.box-actions {
		display: flex;
		justify-content: flex-end;
		gap: 40rpx;
	}
</style>