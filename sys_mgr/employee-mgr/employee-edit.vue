<template>
	<view class="employee-edit-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 员工头像 -->
			<view class="form-item avatar-item">
				<view class="form-label">头像</view>
				<view class="avatar-upload">
					<view class="avatar-preview" v-if="employeeForm.displayAvatar || employeeForm.avatar">
						<image :src="employeeForm.displayAvatar || employeeForm.avatar" mode="aspectFill"></image>
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
				<view class="form-label">姓名<text class="required">*</text></view>
				<uni-easyinput v-model="employeeForm.name" placeholder="请输入员工姓名"></uni-easyinput>
			</view>
			
			<!-- 职位 -->
			<view class="form-item">
				<view class="form-label">职位</view>
				<uni-easyinput v-model="employeeForm.position" placeholder="请输入职位"></uni-easyinput>
			</view>
			
			<!-- 成员类型 -->
			<view class="form-item">
				<view class="form-label">成员类型</view>
				<uni-data-select v-model="employeeForm.type" :localdata="[{value:'core',text:'核心团队'},{value:'service',text:'服务团队'}]" placeholder="请选择成员类型"></uni-data-select>
			</view>
			
			<!-- 个人简介 -->
			<view class="form-item">
				<view class="form-label">个人简介</view>
				<uni-easyinput v-model="employeeForm.bio" type="textarea" :rows="3" placeholder="请输入个人简介"></uni-easyinput>
			</view>
			
			<!-- 排序 -->
			<view class="form-item">
				<view class="form-label">排序</view>
				<uni-easyinput v-model.number="employeeForm.order" type="number" placeholder="请输入排序数字"></uni-easyinput>
			</view>
			
			<!-- 兴趣爱好 -->
			<view class="form-item">
				<view class="form-label">兴趣爱好 <text class="required">*</text></view>
				<view class="interests-container">
					<view v-for="(item, index) in employeeForm.interests" :key="index" class="interest-tag">
						<text>{{ item }}</text>
						<uni-icons type="clear" size="16" @click="removeInterest(index)"></uni-icons>
					</view>
					<view class="interest-input-wrapper">
						<input type="text" v-model="newInterest" class="interest-input" placeholder="输入兴趣爱好" @confirm="addInterest" />
						<button class="add-interest-btn" @click="addInterest">添加</button>
					</view>
				</view>
			</view>
			
			<!-- 生活照片 -->
			<view class="form-item">
				<view class="form-label">生活照片 <text class="required">*</text></view>
				<view class="life-photos-container">
					<view v-for="(photo, index) in employeeForm.displayLifeMoments || employeeForm.lifeMoments" :key="index" class="life-photo-item">
						<image :src="photo" mode="aspectFill"></image>
						<view class="photo-remove" @click="removeLifePhoto(index)">
							<uni-icons type="clear" size="20" color="#FFFFFF"></uni-icons>
						</view>
					</view>
					<view class="add-photo-btn" @click="chooseLifePhotos">
						<uni-icons type="camera" size="32" color="#CCCCCC"></uni-icons>
						<text>添加照片</text>
					</view>
				</view>
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
					avatar: '',
					displayAvatar: '', // 用于显示的头像URL
					bio: '',
					type: 'core',
					order: 0,
					socialIcons: [],
					lifeMoments: [],
					displayLifeMoments: [], // 用于显示的生活照片URL
					interests: []
				},
				newInterest: ''
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
			// 将fileID转换为URL
			async fileIDToUrl(fileId) {
				if (!fileId) return '';
				try {
					const res = await uniCloud.getTempFileURL({
						fileList: [fileId]
					});
					return res.fileList[0]?.tempFileURL || '';
				} catch (error) {
					console.error('获取文件URL失败:', error);
					return '';
				}
			},
			
			// 批量处理文件ID转换为URL
			async processFileIds(member) {
				const fileIds = [];
				if (member.avatar) fileIds.push(member.avatar);
				if (member.lifeMoments && member.lifeMoments.length > 0) {
					fileIds.push(...member.lifeMoments);
				}
				
				if (fileIds.length === 0) {
					return member;
				}
				
				try {
					const res = await uniCloud.getTempFileURL({
						fileList: fileIds
					});
					
					const fileIdMap = {};
					res.fileList.forEach(item => {
						if (item.tempFileURL) {
							fileIdMap[item.fileID] = item.tempFileURL;
						}
					});
					
					return {
						...member,
						displayAvatar: member.avatar ? (fileIdMap[member.avatar] || member.avatar) : '',
						displayLifeMoments: member.lifeMoments ? 
							member.lifeMoments.map(fileId => fileIdMap[fileId] || fileId) : []
					};
				} catch (error) {
					console.error('批量处理文件URL失败:', error);
					return {
						...member,
						displayAvatar: member.avatar,
						displayLifeMoments: member.lifeMoments || []
					};
				}
			},
			
			// 加载员工详情
			async loadEmployeeDetail() {
				// 调用云函数获取员工详情
				uni.showLoading({
					title: '加载中...'
				});
				
				try {
					const res = await uniCloud.callFunction({
						name: 'teamManager',
						data: {
							action: 'getMemberById',
							data: {
								_id: this.employeeId
							}
						}
					});
					
					uni.hideLoading();
					if (res.result && res.result.code === 200) {
						let memberData = res.result.data;
						// 处理fileID转换为URL
						memberData = await this.processFileIds(memberData);
							
						this.employeeForm = {
							name: memberData.name,
							position: memberData.position,
							avatar: memberData.avatar || '',
							displayAvatar: memberData.displayAvatar || '',
							bio: memberData.bio || '',
							type: memberData.type || 'core',
							order: memberData.order || 0,
							socialIcons: memberData.socialIcons || [],
							lifeMoments: memberData.lifeMoments || [],
							displayLifeMoments: memberData.displayLifeMoments || [],
							interests: memberData.interests || []
						};
					} else {
						uni.showToast({
							title: res.result?.message || '加载失败',
							icon: 'none'
						});
					}
				} catch (error) {
					uni.hideLoading();
					console.error('加载员工详情失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
				}
			},
			
			// 选择头像
			chooseAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 上传头像到云存储td目录
						uni.showLoading({
							title: '上传中...'
						});
						
						const tempFilePath = res.tempFilePaths[0];
						const fileName = `td/${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`;
						
						uniCloud.uploadFile({
							cloudPath: fileName,
							filePath: tempFilePath,
							success: (uploadRes) => {
								uni.hideLoading();
								// 保存云存储地址
								this.employeeForm.avatar = uploadRes.fileID;
								
								// 立即使用本地临时路径作为显示，确保用户能看到图片
								this.employeeForm.displayAvatar = tempFilePath;
								
								// 异步获取临时URL用于更持久的显示
								uniCloud.getTempFileURL({
									fileList: [uploadRes.fileID],
									success: (urlRes) => {
										if (urlRes.fileList[0]?.tempFileURL) {
											this.employeeForm.displayAvatar = urlRes.fileList[0].tempFileURL;
										}
									},
									fail: (urlError) => {
										console.error('获取头像临时URL失败:', urlError);
										// 继续使用本地临时路径，不影响用户体验
									}
								});
							},
							fail: (error) => {
								uni.hideLoading();
								console.error('上传头像失败:', error);
								uni.showToast({
									title: '上传头像失败',
									icon: 'none'
								});
							}
						});
					}
				});
			},
			
			// 移除头像
			removeAvatar() {
				this.employeeForm.avatar = '';
				this.employeeForm.displayAvatar = '';
			},
			
			// 添加兴趣爱好
			addInterest() {
				if (this.newInterest && !this.employeeForm.interests.includes(this.newInterest)) {
					this.employeeForm.interests.push(this.newInterest);
					this.newInterest = '';
				}
			},
			
			// 移除兴趣爱好
			removeInterest(index) {
				this.employeeForm.interests.splice(index, 1);
			},
			
			// 选择生活照片
			chooseLifePhotos() {
				uni.chooseImage({
					count: 9 - this.employeeForm.lifeMoments.length,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						uni.showLoading({
							title: '上传中...'
						});
						
						try {
							const tempFilePaths = res.tempFilePaths;
							const newFileIds = [];
							const tempUrls = [...tempFilePaths]; // 保存临时路径用于显示
							
							for (let i = 0; i < tempFilePaths.length; i++) {
								const tempFilePath = tempFilePaths[i];
								const fileName = `td/life_${Date.now()}_${i}.jpg`;
								
								const uploadRes = await new Promise((resolve, reject) => {
									uniCloud.uploadFile({
										cloudPath: fileName,
										filePath: tempFilePath,
										success: resolve,
										fail: reject
									});
								});
								
								newFileIds.push(uploadRes.fileID);
							}
							
							// 更新fileID列表
							this.employeeForm.lifeMoments = [...this.employeeForm.lifeMoments, ...newFileIds];
							
							// 更新显示用的URL列表
							if (!this.employeeForm.displayLifeMoments) {
								this.employeeForm.displayLifeMoments = [];
							}
							this.employeeForm.displayLifeMoments = [...this.employeeForm.displayLifeMoments, ...tempUrls];
							
							// 尝试获取临时URL用于更持久的显示
							try {
								const urlRes = await uniCloud.getTempFileURL({
									fileList: newFileIds
								});
								// 更新已上传的文件URL
								urlRes.fileList.forEach((item, index) => {
									if (item.tempFileURL && index < this.employeeForm.displayLifeMoments.length) {
										this.employeeForm.displayLifeMoments[this.employeeForm.displayLifeMoments.length - newFileIds.length + index] = item.tempFileURL;
									}
								});
							} catch (urlError) {
								console.error('获取照片URL失败:', urlError);
								// 失败时继续使用临时路径
							}
						} catch (error) {
							console.error('上传照片失败:', error);
							uni.showToast({
								title: '部分照片上传失败',
								icon: 'none'
							});
						} finally {
							uni.hideLoading();
						}
				}
			});
			},
			
			// 移除生活照片
			removeLifePhoto(index) {
				this.employeeForm.lifeMoments.splice(index, 1);
				if (this.employeeForm.displayLifeMoments) {
					this.employeeForm.displayLifeMoments.splice(index, 1);
				}
			},
			
			// 保存员工信息
			saveEmployee() {
				// 表单验证 - 只保留姓名必填
				if (!this.employeeForm.name) {
					uni.showToast({
						title: '请输入员工姓名',
						icon: 'none'
					});
					return;
				}
				
				// 职位不再必填
				// 成员类型也不再验证，允许空值
				
				// 验证兴趣爱好
				if (!this.employeeForm.interests || this.employeeForm.interests.length === 0) {
					uni.showToast({
						title: '请至少添加一个兴趣爱好',
						icon: 'none'
					});
					return;
				}
				
				// 验证生活照片
				if (!this.employeeForm.lifeMoments || this.employeeForm.lifeMoments.length === 0) {
					uni.showToast({
						title: '请至少添加一张生活照片',
						icon: 'none'
					});
					return;
				}
				
				// 提交数据
				uni.showLoading({
					title: '保存中...'
				});
				
				// 准备提交的数据，只包含页面上有的字段
				const submitData = {
					name: this.employeeForm.name,
					position: this.employeeForm.position || '', // 允许为空
					avatar: this.employeeForm.avatar,
					bio: this.employeeForm.bio,
					type: this.employeeForm.type || '', // 允许为空
					order: this.employeeForm.order,
					socialIcons: this.employeeForm.socialIcons,
					lifeMoments: this.employeeForm.lifeMoments,
					interests: this.employeeForm.interests
				};
				
				// 根据操作类型调用不同的云函数方法
				const action = this.type === 'add' ? 'createMember' : 'updateMember';
				if (action === 'updateMember') {
					submitData._id = this.employeeId;
				}
				
				uniCloud.callFunction({
					name: 'teamManager',
					data: {
						action: action,
						data: submitData
					}
				}).then(res => {
					uni.hideLoading();
					if (res.result && res.result.code === 200) {
						uni.showToast({
							title: '保存成功',
							icon: 'success'
						});
						
						// 保存成功后返回上一页
						setTimeout(() => {
							// 先发送事件通知列表页刷新
							uni.$emit('refreshEmployeeList');
							uni.navigateBack();
						}, 1500);
					} else {
						uni.showToast({
							title: res.result?.message || '保存失败',
							icon: 'none'
						});
					}
				}).catch(error => {
					uni.hideLoading();
					console.error('保存员工信息失败:', error);
					uni.showToast({
						title: '保存失败，请稍后重试',
						icon: 'none'
					});
				});
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
	
	.required {
		color: #FF3B30;
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
	
	/* 兴趣爱好样式 */
	.interests-container {
		min-height: 60rpx;
	}

	.interest-tag {
		display: inline-flex;
		align-items: center;
		background-color: #E9F7FE;
		color: #1678FF;
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
		margin-right: 15rpx;
		margin-bottom: 15rpx;
		font-size: 26rpx;
	}

	.interest-input-wrapper {
		display: flex;
		align-items: center;
		gap: 15rpx;
		margin-top: 10rpx;
	}

	.interest-input {
		border: 1rpx solid #E0E0E0;
		border-radius: 8rpx;
		padding: 8rpx 15rpx;
		flex: 1;
		height: 50rpx;
		font-size: 26rpx;
	}

	.add-interest-btn {
		background-color: #007AFF;
		color: #FFFFFF;
		border: none;
		border-radius: 8rpx;
		padding: 0 30rpx;
		height: 68rpx;
		font-size: 28rpx;
		line-height: 64rpx;
	}
	
	/* 生活照片样式 */
	.life-photos-container {
		display: flex;
		flex-wrap: wrap;
		gap: 20rpx;
	}
	
	.life-photo-item {
		width: 180rpx;
		height: 180rpx;
		position: relative;
		border-radius: 8rpx;
		overflow: hidden;
	}
	
	.life-photo-item image {
		width: 100%;
		height: 100%;
	}
	
	.photo-remove {
		position: absolute;
		top: 0;
		right: 0;
		background-color: rgba(0, 0, 0, 0.5);
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.add-photo-btn {
		width: 180rpx;
		height: 180rpx;
		background-color: #F5F5F5;
		border: 1rpx dashed #CCCCCC;
		border-radius: 8rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: #999999;
		font-size: 24rpx;
	}
</style>