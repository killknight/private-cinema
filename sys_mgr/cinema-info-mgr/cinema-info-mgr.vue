<template>
	<view class="cinema-info-mgr-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 影院名称 -->
			<view class="form-item">
				<view class="form-label">影院名称</view>
				<uni-easyinput v-model="cinemaForm.cinemaName" placeholder="请输入影院名称"></uni-easyinput>
			</view>
			
			<!-- 影院地址 -->
			<view class="form-item">
				<view class="form-label">影院地址</view>
				<uni-easyinput v-model="cinemaForm.address" type="textarea" placeholder="请输入影院详细地址"></uni-easyinput>
			</view>
			
			<!-- 联系电话 -->
			<view class="form-item">
				<view class="form-label">联系电话</view>
				<uni-easyinput v-model="cinemaForm.phone" placeholder="请输入联系电话"></uni-easyinput>
			</view>
			
			<!-- 营业时间 -->
			<view class="form-item">
				<view class="form-label">营业时间</view>
				<uni-easyinput v-model="cinemaForm.businessHours" placeholder="如：10:00-23:00"></uni-easyinput>
			</view>
			
			<!-- 影院简介 -->
			<view class="form-item">
				<view class="form-label">影院简介</view>
				<uni-easyinput v-model="cinemaForm.description" type="textarea" :rows="4" placeholder="请输入影院简介"></uni-easyinput>
			</view>
			
			<!-- 影院图片 -->
			<view class="form-item">
				<view class="form-label">影院图片</view>
				<uni-file-picker
					ref="filePicker"
					limit="1"
					fileMediatype="image"
					mode="grid"
					:value="fileList"
					@select="handleSelect"
					@delete="handleDelete"
				></uni-file-picker>
			</view>
			
			<!-- 保存按钮 -->
			<view class="save-button" @click="saveCinemaInfo">保存</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				cinemaForm: {
					cinemaName: '',
					address: '',
					phone: '',
					businessHours: '',
					description: '',
					imageUrl: ''
				},
				fileList: []
			}
		},
		onLoad() {
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: '影院信息维护'
			});
			this.loadCinemaInfo();
		},
		methods: {
			// 加载影院信息
			loadCinemaInfo() {
				// 这里应该调用云函数获取影院信息
				// 暂时模拟数据
				setTimeout(() => {
					this.cinemaForm = {
						cinemaName: '私人影院',
						address: '北京市朝阳区某某路123号',
						phone: '13800138000',
						businessHours: '10:00-23:00',
						description: '私人影院是一家专注于提供高品质观影体验的高端影院...',
						imageUrl: ''
					};
					if (this.cinemaForm.imageUrl) {
						this.fileList = [{url: this.cinemaForm.imageUrl}];
					}
				}, 500);
			},
			
			// 处理文件选择
			handleSelect(e) {
				this.fileList = e.tempFilePaths.map(path => ({
					url: path
				}));
				this.cinemaForm.imageUrl = e.tempFilePaths[0];
			},
			
			// 处理文件删除
			handleDelete(e) {
				this.fileList = [];
				this.cinemaForm.imageUrl = '';
			},
			
			// 保存影院信息
			saveCinemaInfo() {
				// 表单验证
				if (!this.cinemaForm.cinemaName) {
					uni.showToast({
						title: '请输入影院名称',
						icon: 'none'
					});
					return;
				}
				
				if (!this.cinemaForm.address) {
					uni.showToast({
						title: '请输入影院地址',
						icon: 'none'
					});
					return;
				}
				
				if (!this.cinemaForm.phone) {
					uni.showToast({
						title: '请输入联系电话',
						icon: 'none'
					});
					return;
				}
				
				// 提交数据
				uni.showLoading({
					title: '保存中...'
				});
				
				// 这里应该调用云函数保存影院信息
				// 暂时模拟保存成功
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				}, 1000);
			}
		}
	}
</script>

<style scoped>
	.cinema-info-mgr-container {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.form-container {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 20rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 15rpx;
	}
	
	.save-button {
		background-color: #007AFF;
		color: #FFFFFF;
		text-align: center;
		padding: 20rpx;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: bold;
		margin-top: 20rpx;
	}
</style>