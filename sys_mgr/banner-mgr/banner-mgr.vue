<template>
	<view class="banner-mgr-container">
		<!-- 添加按钮 -->
		<view class="add-button" @click="addBanner">
			<uni-icons type="plus" size="28" color="#FFFFFF"></uni-icons>
			<text>添加Banner</text>
		</view>
		
		<!-- Banner列表 -->
		<view class="banner-list">
			<view class="empty-tip" v-if="bannerList.length === 0">
				<uni-icons type="image" size="60" color="#CCCCCC"></uni-icons>
				<text class="empty-text">暂无Banner数据</text>
			</view>
			
			<view class="banner-item" v-for="(item, index) in bannerList" :key="item._id">
					<image class="banner-image" :src="item.imageSrc" mode="aspectFill"></image>
					<view class="banner-info">
						<view class="banner-title">{{ item.title || '未命名Banner' }}</view>
						<view class="banner-desc">{{ item.description || '无描述' }}</view>
					</view>
					<view class="banner-actions">
						<uni-icons type="compose" size="24" color="#007AFF" @click="editBanner(item)"></uni-icons>
						<uni-icons type="trash" size="24" color="#FF3B30" @click="deleteBanner(item._id)"></uni-icons>
					</view>
				</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				bannerList: []
			}
		},
		onLoad() {
		},
		onShow() {
			// 每次显示页面时重新加载数据，确保新增或修改后能看到最新数据
			this.loadBannerList();
		},
		methods: {
			// 加载Banner列表
			loadBannerList() {
				uni.showLoading({
					title: '加载中...'
				});
				
				uniCloud.callFunction({
					name: 'banner',
					data: {
						action: 'list'
					}
				}).then(res => {
					uni.hideLoading();
					if (res.result.code === 200) {
						console.log('Banner列表数据:', res.result.data);
						// 确保图片URL正确处理
							this.bannerList = res.result.data.map(item => {
								// 构建完整的banner对象
								const banner = {
									...item,
									_id: item._id || '',
									title: item.title || '未命名Banner',
									description: item.description || '无描述',
									open_url: item.open_url || ''
								};
								
								// 优先使用云函数处理后的imageUrl
								if (item.imageUrl && (item.imageUrl.startsWith('http') || item.imageUrl.startsWith('cloud://'))) {
									banner.imageSrc = item.imageUrl;
								} 
								// 处理bannerfile可能是对象或字符串的情况
								else if (item.bannerfile) {
									if (typeof item.bannerfile === 'string') {
										banner.imageSrc = item.bannerfile;
									} else if (item.bannerfile.url) {
										banner.imageSrc = item.bannerfile.url;
									} else if (item.bannerfile.fileID) {
										banner.imageSrc = item.bannerfile.fileID;
									} else if (item.bannerfile.tempFileURL) {
										banner.imageSrc = item.bannerfile.tempFileURL;
									}
								} else {
									banner.imageSrc = '';
								}
								
								return banner;
							});
					} else {
						uni.showToast({
							title: res.result.message || '加载失败',
							icon: 'none'
						});
					}
				}).catch(error => {
					uni.hideLoading();
					console.error('加载Banner列表失败:', error);
					uni.showToast({
						title: '加载失败: ' + (error.message || ''),
						icon: 'none'
					});
				});
			},
			
			// 添加Banner
			addBanner() {
				uni.navigateTo({
					url: '/sys_mgr/banner-mgr/banner-edit?type=add'
				})
			},
			
			// 编辑Banner
			editBanner(banner) {
				uni.navigateTo({
					url: `/sys_mgr/banner-mgr/banner-edit?type=edit&id=${banner._id}`
				})
			},
			
			// 删除Banner
			deleteBanner(id) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个Banner吗？',
					confirmText: '删除',
					confirmColor: '#FF3B30',
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '删除中...'
							});
							
							uniCloud.callFunction({
								name: 'banner',
								data: {
									action: 'delete',
									data: {
										id: id
									}
								}
							}).then(result => {
								uni.hideLoading();
								if (result.result.code === 200) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.loadBannerList();
								} else {
									uni.showToast({
										title: result.result.message || '删除失败',
										icon: 'none'
									});
								}
							}).catch(error => {
								uni.hideLoading();
								uni.showToast({
									title: '删除失败',
									icon: 'none'
								});
								console.error('删除Banner失败:', error);
							});
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.banner-mgr-container {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.add-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10rpx;
		background-color: #007AFF;
		color: #FFFFFF;
		padding: 20rpx;
		border-radius: 12rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
	}
	
	.banner-list {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		overflow: hidden;
		padding: 20rpx;
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
	
	.banner-item {
		margin-bottom: 30rpx;
		border-radius: 12rpx;
		overflow: hidden;
		background-color: #F5F5F5;
	}
	
	.banner-image {
		width: 100%;
		height: 300rpx;
		background-color: #EEEEEE;
	}
	
	.banner-info {
		padding: 20rpx;
	}
	
	.banner-title {
		font-size: 32rpx;
		color: #333333;
		margin-bottom: 8rpx;
	}
	
	.banner-desc {
		font-size: 24rpx;
		color: #999999;
	}
	
	.banner-actions {
		display: flex;
		justify-content: flex-end;
		padding: 0 20rpx 20rpx;
		gap: 40rpx;
	}
</style>