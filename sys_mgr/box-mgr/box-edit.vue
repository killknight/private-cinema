<template>
	<view class="box-edit-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 包厢名称 -->
			<view class="form-item">
				<view class="form-label">包厢名称</view>
				<uni-easyinput v-model="boxForm.boxName" placeholder="请输入包厢名称"></uni-easyinput>
			</view>
			
			<!-- 容纳人数 -->
			<view class="form-item">
				<view class="form-label">容纳人数</view>
				<uni-number-box v-model="boxForm.capacity" :min="1" :max="20"></uni-number-box>
			</view>
			
			<!-- 价格 -->
			<view class="form-item">
				<view class="form-label">价格(元/小时)</view>
				<uni-easyinput v-model.number="boxForm.price" type="number" placeholder="请输入价格"></uni-easyinput>
			</view>
			
			<!-- 包厢状态 -->
			<view class="form-item">
				<view class="form-label">状态</view>
				<uni-data-select
					v-model="boxForm.status"
					:localdata="statusOptions"
					placeholder="请选择状态"
				></uni-data-select>
			</view>
			
			<!-- 包厢描述 -->
			<view class="form-item">
				<view class="form-label">包厢描述</view>
				<uni-easyinput v-model="boxForm.description" type="textarea" :rows="3" placeholder="请输入包厢描述"></uni-easyinput>
			</view>
			
			<!-- 包厢图片 -->
			<view class="form-item">
				<view class="form-label">包厢图片</view>
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
			<view class="save-button" @click="saveBox">保存</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type: 'add', // add或edit
				boxId: '',
				boxForm: {
					boxName: '',
					capacity: 1,
					price: 0,
					status: 'available',
					description: '',
					imageUrl: ''
				},
				fileList: [],
				statusOptions: [
					{value: 'available', text: '可用'},
					{value: 'unavailable', text: '不可用'}
				]
			}
		},
		onLoad(options) {
			this.type = options.type || 'add';
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: this.type === 'add' ? '添加包厢' : '编辑包厢'
			});
			if (this.type === 'edit' && options.id) {
				this.boxId = options.id;
				this.loadBoxDetail();
			}
		},
		methods: {
			// 加载包厢详情
			loadBoxDetail() {
				// 这里应该调用云函数获取包厢详情
				// 暂时模拟数据
				uni.showLoading({
					title: '加载中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					// 模拟数据
					this.boxForm = {
						boxName: '豪华观影厅A',
						capacity: 4,
						price: 198,
						status: 'available',
						description: '豪华舒适的观影环境，配备高清投影和环绕音效。',
						imageUrl: ''
					};
					if (this.boxForm.imageUrl) {
						this.fileList = [{url: this.boxForm.imageUrl}];
					}
				}, 1000);
			},
			
			// 处理文件选择
			handleSelect(e) {
				this.fileList = e.tempFilePaths.map(path => ({
					url: path
				}));
				this.boxForm.imageUrl = e.tempFilePaths[0];
			},
			
			// 处理文件删除
			handleDelete(e) {
				this.fileList = [];
				this.boxForm.imageUrl = '';
			},
			
			// 保存包厢
			saveBox() {
				// 表单验证
				if (!this.boxForm.boxName) {
					uni.showToast({
						title: '请输入包厢名称',
						icon: 'none'
					});
					return;
				}
				
				if (this.boxForm.price <= 0) {
					uni.showToast({
						title: '请输入有效的价格',
						icon: 'none'
					});
					return;
				}
				
				// 提交数据
				uni.showLoading({
					title: '保存中...'
				});
				
				// 这里应该调用云函数保存包厢数据
				// 暂时模拟保存成功
				setTimeout(() => {
					uni.hideLoading();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
					
					// 保存成功后返回上一页
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				}, 1000);
			}
		}
	}
</script>

<style scoped>
	.box-edit-container {
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