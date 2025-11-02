<template>
	<view class="employee-edit-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 员工头像 -->
			<view class="form-item avatar-item">
				<view class="form-label">头像</view>
				<view class="avatar-upload">
					<view class="avatar-preview" v-if="employeeForm.avatar">
						<image :src="employeeForm.avatar" mode="aspectFill"></image>
						<view class="avatar-remove" @click="removeAvatar">
							<uni-icons type="clear" size="24" color="#FFFFFF"></uni-icons>
						</view>
					</view>
					<view class="avatar-placeholder" v-else @click="chooseAvatar">
						<uni-icons type="camera" size="40" color="#CCCCCC"></uni-icons>
						<text class="avatar-text">点击上传头像</text>
					</view>
				</view>
			</view>
			
			<!-- 员工姓名 -->
			<view class="form-item">
				<view class="form-label">姓名</view>
				<uni-easyinput v-model="employeeForm.name" placeholder="请输入员工姓名"></uni-easyinput>
			</view>
			
			<!-- 职位 -->
			<view class="form-item">
				<view class="form-label">职位</view>
				<uni-easyinput v-model="employeeForm.position" placeholder="请输入职位"></uni-easyinput>
			</view>
			
			<!-- 联系电话 -->
			<view class="form-item">
				<view class="form-label">联系电话</view>
				<uni-easyinput v-model="employeeForm.phone" type="number" placeholder="请输入联系电话"></uni-easyinput>
			</view>
			
			<!-- 电子邮箱 -->
			<view class="form-item">
				<view class="form-label">电子邮箱</view>
				<uni-easyinput v-model="employeeForm.email" placeholder="请输入电子邮箱"></uni-easyinput>
			</view>
			
			<!-- 员工描述 -->
			<view class="form-item">
				<view class="form-label">备注</view>
				<uni-easyinput v-model="employeeForm.description" type="textarea" :rows="3" placeholder="请输入备注信息"></uni-easyinput>
			</view>
		</view>
		
		<!-- 保存按钮 -->
		<view class="save-button" @click="saveEmployee">保存</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type: 'add', // add或edit
				employeeId: '',
				employeeForm: {
					name: '',
					position: '',
					phone: '',
					email: '',
					avatar: '',
					description: ''
				}
			}
		},
		onLoad(options) {
			this.type = options.type || 'add';
			
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: this.type === 'add' ? '添加员工' : '编辑员工'
			});
			
			if (this.type === 'edit' && options.id) {
				this.employeeId = options.id;
				this.loadEmployeeDetail();
			}
		},
		methods: {
			
			// 加载员工详情
			loadEmployeeDetail() {
				// 这里应该调用云函数获取员工详情
				// 暂时模拟数据
				uni.showLoading({
					title: '加载中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					// 模拟数据
					this.employeeForm = {
						name: '张三',
						position: '经理',
						phone: '13800138001',
						email: 'zhangsan@example.com',
						avatar: '',
						description: '负责影院全面管理工作'
					};
				}, 1000);
			},
			
			// 选择头像
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.employeeForm.avatar = res.tempFilePaths[0];
					}
				});
			},
			
			// 移除头像
			removeAvatar() {
				this.employeeForm.avatar = '';
			},
			
			// 保存员工信息
			saveEmployee() {
				// 表单验证
				if (!this.employeeForm.name) {
					uni.showToast({
						title: '请输入员工姓名',
						icon: 'none'
					});
					return;
				}
				
				if (!this.employeeForm.position) {
					uni.showToast({
						title: '请输入职位',
						icon: 'none'
					});
					return;
				}
				
				if (!this.employeeForm.phone) {
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
				
				// 这里应该调用云函数保存员工数据
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
	.employee-edit-container {
		padding: 20rpx;
		background-color: #F5F5F5;
		min-height: 100vh;
	}
	
	.form-container {
		background-color: #FFFFFF;
		border-radius: 12rpx;
		padding: 20rpx;
	}
	
	/* 保存按钮 */
	.save-button {
		background-color: #007AFF;
		color: #FFFFFF;
		text-align: center;
		padding: 20rpx;
		border-radius: 12rpx;
		font-size: 32rpx;
		font-weight: bold;
		margin-top: 40rpx;
	}
	
	.form-item {
		margin-bottom: 30rpx;
	}
	
	.form-label {
		font-size: 28rpx;
		color: #666666;
		margin-bottom: 15rpx;
	}
	
	.avatar-item {
		margin-bottom: 40rpx;
	}
	
	.avatar-upload {
		display: flex;
		justify-content: center;
	}
	
	.avatar-preview {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		position: relative;
	}
	
	.avatar-preview image {
		width: 100%;
		height: 100%;
	}
	
	.avatar-remove {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 50rpx;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.avatar-placeholder {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		background-color: #F5F5F5;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		border: 1rpx dashed #CCCCCC;
	}
	
	.avatar-text {
		font-size: 24rpx;
		color: #999999;
		margin-top: 10rpx;
	}
</style>