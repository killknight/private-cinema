<template>
	<view class="quick-reply-edit-container">
		<!-- 表单 -->
		<view class="form-container">

			<view class="form-item">
				<text class="label">回复内容 *</text>
				<textarea v-model="replyForm.content" class="textarea" placeholder="请输入快捷回复内容" maxlength="200"></textarea>
				<text class="counter">{{ replyForm.content.length }}/200</text>
			</view>
			
			<view class="form-item">
				<text class="label">排序号 *</text>
				<input v-model.number="replyForm.sort" type="number" class="input" placeholder="请输入排序号，数字越小排序越靠前" />
				<text class="hint">排序号用于控制快捷回复的显示顺序，数字越小排序越靠前。</text>
			</view>
			
			<view class="form-item">
				<text class="label">状态 *</text>
				<view class="switch-container">
					<switch :checked="replyForm.status" @change="replyForm.status = $event.detail.value" class="status-switch" checked-color="#07C160" />
					<text class="switch-label">{{ replyForm.status ? '启用' : '禁用' }}</text>
				</view>
			</view>
			
			<view class="form-item">
				<text class="label">备注</text>
				<textarea v-model="replyForm.remark" class="textarea" placeholder="请输入备注信息（选填）" maxlength="100"></textarea>
				<text class="counter">{{ replyForm.remark.length }}/100</text>
			</view>
			
			<!-- 底部保存按钮 -->
			<view class="bottom-save-container">
				<button class="bottom-save-btn" @click="saveReply">保存</button>
			</view>
		</view>
		
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isEditMode: false,
				replyForm: {
					_id: '',
					content: '',
					sort: 0,
					status: true,
					remark: ''
				}
			}
		},
		
		onLoad(options) {
			if (options && options._id) {
				this.isEditMode = true;
				this.replyForm._id = options._id;
				this.loadReplyDetails();
			}
		},
		
		// 设置页面标题
		onShow() {
			// 使用小程序原生方式设置导航栏标题
			uni.setNavigationBarTitle({
				title: this.isEditMode ? '编辑快捷回复' : '添加快捷回复'
			});
		},
		
		methods: {
			// 加载快捷回复详情
			loadReplyDetails() {
				uni.showLoading({
					title: '加载中...'
				});

				// 调用云函数获取快捷回复详情，使用withCredentials确保传递登录凭证
				uniCloud.callFunction({
					name: 'quickReplyManager',
					data: {
						action: 'getAllReplies'
					},
					// 确保携带登录凭证
					withCredentials: true
				}).then(res => {
					if (res.result && res.result.code === 200) {
						const allReplies = res.result.data || [];
						const reply = allReplies.find(item => item._id === this.replyForm._id);
						if (reply) {
							this.replyForm = {
								_id: reply._id,
								content: reply.content,
								sort: reply.sort || 0,
								status: reply.status,
								remark: reply.remark || ''
							};
						} else {
							uni.showToast({
								title: '快捷回复不存在',
								icon: 'none'
							});
							// 如果获取详情失败，返回上一页
							setTimeout(() => {
								this.goBack();
							}, 1000);
							return;
						}
					} else {
						uni.showToast({
							title: res.result.message || '获取快捷回复详情失败',
							icon: 'none'
						});
						// 如果获取详情失败，返回上一页
						setTimeout(() => {
							this.goBack();
						}, 1000);
					}
				}).catch(err => {
					console.error('获取快捷回复详情失败:', err);
					// 更详细的错误信息显示
					const errorMsg = err.message || '获取快捷回复详情失败';
					uni.showToast({
						title: errorMsg,
						icon: 'none'
					});
					// 如果获取详情失败，返回上一页
					setTimeout(() => {
						this.goBack();
					}, 1000);
				}).finally(() => {
					uni.hideLoading();
				});
			},

			// 验证表单
			validateForm() {
				if (!this.replyForm.content.trim()) {
					uni.showToast({
						title: '请输入快捷回复内容',
						icon: 'none'
					});
					return false;
				}
				if (typeof this.replyForm.sort !== 'number' || isNaN(this.replyForm.sort)) {
					uni.showToast({
						title: '请输入有效的排序号',
						icon: 'none'
					});
					return false;
				}
				return true;
			},

			// 保存快捷回复
			saveReply() {
				if (!this.validateForm()) {
					return;
				}

				uni.showLoading({
					title: '保存中...'
				});

				// 准备数据
				const data = {
					content: this.replyForm.content.trim(),
					sort: this.replyForm.sort,
					status: this.replyForm.status,
					remark: this.replyForm.remark.trim()
				};

				// 确定操作类型
				const action = this.isEditMode ? 'updateReply' : 'createReply';
				if (this.isEditMode) {
					data._id = this.replyForm._id;
				}

				// 调用云函数保存快捷回复，使用withCredentials确保传递登录凭证
				uniCloud.callFunction({
					name: 'quickReplyManager',
					data: {
						action: action,
						data: data
					},
					// 确保携带登录凭证
					withCredentials: true
				}).then(res => {
					// 详细打印响应结果用于调试
					console.log('云函数响应:', res);
					if (res.result && res.result.code === 200) {
						uni.showToast({
							title: this.isEditMode ? '更新成功' : '添加成功',
							icon: 'none'
						});
						// 保存成功后返回上一页
						setTimeout(() => {
							this.goBack();
						}, 1000);
					} else {
						// 显示更具体的错误信息
						const errorMessage = res.result?.message || (this.isEditMode ? '更新失败' : '添加失败');
						uni.showToast({
							title: errorMessage,
							icon: 'none'
						});
						// 特殊处理登录相关错误
						if (errorMessage.includes('登录')) {
							console.warn('可能存在登录状态问题，尝试刷新登录状态');
							// 这里可以添加重新获取登录状态的逻辑
						}
					}
				}).catch(err => {
					console.error(this.isEditMode ? '更新快捷回复失败:' : '添加快捷回复失败:', err);
					// 捕获网络或其他错误
					uni.showToast({
						title: '网络请求失败，请检查网络连接',
						icon: 'none'
					});
				}).finally(() => {
					uni.hideLoading();
				});
			},

			// 返回上一页
			goBack() {
				uni.navigateBack();
			}
		}
	}
</script>

<style scoped>
	.quick-reply-edit-container {
		background-color: #F5F5F5;
		min-height: 100vh;
		padding: 20rpx 0 40rpx;
	}
	
	.bottom-save-container {
		/* background-color: #FFFFFF;
		padding: 30rpx;
		margin-top: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05); */
	}
	
	.bottom-save-btn {
		width: 100%;
		height: 90rpx;
		line-height: 90rpx;
		font-size: 32rpx;
		border: none;
		border-radius: 10rpx;
		background-color: #007AFF;
		color: #FFFFFF;
		font-weight: 500;
	}

	.form-container {
		background-color: #FFFFFF;
		padding: 30rpx;
		margin-bottom: 20rpx;
	}

	.form-item {
		padding: 30rpx 0;
		border-bottom: 1rpx solid #EEEEEE;
	}

	.form-item:last-child {
		border-bottom: none;
	}

	.label {
		display: block;
		font-size: 28rpx;
		color: #333333;
		margin-bottom: 20rpx;
		font-weight: 500;
	}

	.textarea,
	.input {
		width: 100%;
		font-size: 28rpx;
		color: #333333;
		background-color: transparent;
	}

	.textarea {
		height: 160rpx;
		line-height: 1.5;
		border: 1rpx solid #EEEEEE;
		border-radius: 8rpx;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.input {
		height: 80rpx;
		border: 1rpx solid #EEEEEE;
		border-radius: 8rpx;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.counter {
		display: block;
		text-align: right;
		font-size: 24rpx;
		color: #999999;
		margin-top: 10rpx;
	}

	.hint {
		display: block;
		font-size: 24rpx;
		color: #999999;
		margin-top: 10rpx;
		line-height: 1.4;
	}

	.switch-container {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.switch-label {
		font-size: 28rpx;
		color: #333333;
	}
</style>