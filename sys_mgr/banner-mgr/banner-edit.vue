<template>
	<view class="banner-edit-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- Banner标题 -->
			<view class="form-item">
				<view class="form-label">标题</view>
				<uni-easyinput v-model="bannerForm.title" placeholder="请输入Banner标题"></uni-easyinput>
			</view>
			
			<!-- Banner描述 -->
			<view class="form-item">
				<view class="form-label">描述</view>
				<uni-easyinput v-model="bannerForm.description" type="textarea" placeholder="请输入Banner描述"></uni-easyinput>
			</view>
			
			<!-- Banner图片 -->
			<view class="form-item">
				<view class="form-label">图片</view>
				<uni-file-picker
					ref="filePicker"
					limit="1"
					fileMediatype="image"
					mode="grid"
					auto-upload="false"
					:value="fileList"
					@select="handleSelect"
					@delete="handleDelete"
				></uni-file-picker>
			</view>
			
			<!-- Banner链接 -->
			<view class="form-item">
				<view class="form-label">跳转链接</view>
				<uni-easyinput v-model="bannerForm.linkUrl" placeholder="请输入点击后跳转的链接"></uni-easyinput>
			</view>
			<!-- 保存按钮 -->
			<view class="save-button" @click="saveBanner">保存</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				type: 'add', // add或edit
				bannerId: '',
				bannerForm: {
					title: '',
					description: '',
					imageUrl: '',
					linkUrl: ''
				},
				fileList: []
			}
		},
		onLoad(options) {
			this.type = options.type || 'add';
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: this.type === 'add' ? '添加Banner' : '编辑Banner'
			});
			if (this.type === 'edit' && options.id) {
				this.bannerId = options.id;
				this.loadBannerDetail();
			}
		},
		methods: {
			// 加载Banner详情
				loadBannerDetail() {
					uni.showLoading({
						title: '加载中...'
					});
					
					// 重置表单数据，避免旧数据残留
					this.bannerForm = {
						title: '',
						description: '',
						imageUrl: '',
						linkUrl: ''
					};
					this.fileList = [];
					
					uniCloud.callFunction({
						name: 'banner',
						data: {
							action: 'detail',
							data: {
								id: this.bannerId
							}
						}
					}).then(res => {
						uni.hideLoading();
						console.log('云函数返回结果:', res);
						if (res.result && res.result.code === 200 && res.result.data) {
							let bannerData = res.result.data;
							console.log('加载到的Banner数据:', bannerData);
							
							// 确保bannerData是对象，如果是数组则取第一个元素
							if (Array.isArray(bannerData) && bannerData.length > 0) {
								bannerData = bannerData[0];
							}
							
							// 初始化表单数据
							let imageUrl = '';
							let fileID = '';
							
							// 优先使用处理后的imageUrl
							if (bannerData.imageUrl && (bannerData.imageUrl.startsWith('http') || bannerData.imageUrl.startsWith('cloud://'))) {
								imageUrl = bannerData.imageUrl;
							}
							// 然后尝试从bannerfile获取
							else if (bannerData.bannerfile) {
								if (typeof bannerData.bannerfile === 'string') {
									imageUrl = bannerData.bannerfile;
									fileID = bannerData.bannerfile;
								} else if (bannerData.bannerfile.tempFileURL) {
									imageUrl = bannerData.bannerfile.tempFileURL;
									fileID = bannerData.bannerfile.fileID || '';
								} else if (bannerData.bannerfile.fileID) {
									imageUrl = bannerData.bannerfile.fileID;
									fileID = bannerData.bannerfile.fileID;
								} else if (bannerData.bannerfile.url) {
									imageUrl = bannerData.bannerfile.url;
								}
							}
							
							// 确保所有字段都正确赋值
							this.bannerForm = {
								title: String(bannerData.title || ''),
								description: String(bannerData.description || ''),
								imageUrl: imageUrl,
								linkUrl: String(bannerData.open_url || '')
							};
							
							// 设置文件列表用于显示已上传的图片
							if (imageUrl) {
								this.fileList = [{
									url: imageUrl,
									fileID: fileID,
									name: 'banner.jpg',
									size: 0,
									type: 'image/jpeg'
								}];
							}
						} else {
							uni.showToast({
								title: res.result ? (res.result.message || 'Banner不存在') : '加载失败',
								icon: 'none'
							});
						}
					}).catch(error => {
						uni.hideLoading();
						console.error('加载Banner详情失败:', error);
						uni.showToast({
							title: '加载失败: ' + (error.message || ''),
							icon: 'none'
						});
					});
				},
			
			// 处理文件选择（选择时手动上传）
				async handleSelect(e) {
					console.log('文件选择结果:', e);
					// 兼容uni-file-picker组件的不同返回格式
					let tempFile = null;
					let fileName = 'upload.jpg';
					let tempFilePath = '';
					
					if (e.detail && e.detail.tempFiles && e.detail.tempFiles.length > 0) {
						tempFile = e.detail.tempFiles[0];
						tempFilePath = tempFile.path || tempFile.tempFilePath;
						fileName = tempFile.name || fileName;
					} else if (e.tempFiles && e.tempFiles.length > 0) {
						tempFile = e.tempFiles[0];
						tempFilePath = tempFile.path || tempFile.tempFilePath || (tempFile.file && tempFile.file.url);
						fileName = tempFile.name || fileName;
					}
					
					if (tempFilePath) {
						// 显示加载状态
						uni.showLoading({
							title: '上传中...'
						});
						
						try {
							// 生成当前日期格式的文件名：yyyyMMdd_HHmmss
							const now = new Date();
							const dateStr = now.getFullYear() + 
											(now.getMonth() + 1).toString().padStart(2, '0') + 
											now.getDate().toString().padStart(2, '0') + '_' +
											now.getHours().toString().padStart(2, '0') + 
											now.getMinutes().toString().padStart(2, '0') + 
											now.getSeconds().toString().padStart(2, '0');
							 
							// 选择时手动上传到云存储
							const uploadResult = await uniCloud.uploadFile({
								storage: 'default',
								cloudPath: `banner/${dateStr}.jpg`,
								filePath: tempFilePath
							});
							 
							console.log('上传结果:', uploadResult);
							 
							if (uploadResult && uploadResult.fileID) {
								// 上传成功，设置fileID
								this.bannerForm.imageUrl = uploadResult.fileID;
								
								// 更新文件列表
								this.fileList = [{
									url: this.bannerForm.imageUrl,
									fileID: this.bannerForm.imageUrl,
									name: fileName,
									size: tempFile?.size || 0,
									type: tempFile?.type || 'image/jpeg'
								}];
								
								console.log('图片上传成功，fileID:', this.bannerForm.imageUrl);
							} else {
								throw new Error('上传失败');
							}
						} catch (error) {
							console.error('图片上传失败:', error);
							uni.showToast({
								title: '图片上传失败',
								icon: 'none'
							});
							// 清空选择
							this.fileList = [];
							this.bannerForm.imageUrl = '';
						} finally {
							uni.hideLoading();
						}
					}
				},
			
			// 处理文件删除
			handleDelete(e) {
				this.fileList = [];
				this.bannerForm.imageUrl = '';
			},
			
			// 保存Banner
				async saveBanner() {
					// 表单验证
					if (!this.bannerForm.title) {
						uni.showToast({
							title: '请输入Banner标题',
							icon: 'none'
						});
						return;
					}
					
					if (!this.bannerForm.imageUrl) {
						uni.showToast({
							title: '请上传Banner图片',
							icon: 'none'
						});
						return;
					}
					
					// 确保imageUrl是fileID格式
					if (!this.bannerForm.imageUrl.startsWith('cloud://')) {
						uni.showToast({
							title: '图片未正确上传，请重新选择',
							icon: 'none'
						});
						return;
					}
					
					uni.showLoading({
						title: '保存中...'
					});
					
					try {
						// 调用云函数保存数据
						let action = this.type === 'add' ? 'add' : 'update';
						let params = {
							name: 'banner',
							data: {
								action: action,
								data: {
									title: this.bannerForm.title,
									description: this.bannerForm.description,
									imageUrl: this.bannerForm.imageUrl,
									linkUrl: this.bannerForm.linkUrl
								}
							}
						};
						
						if (action === 'update') {
							params.data.data.id = this.bannerId;
						}
						
						const result = await uniCloud.callFunction(params);
						
						if (result.result.code === 200) {
							uni.hideLoading();
							uni.showToast({
								title: '保存成功',
								icon: 'success'
							});
							
							// 保存成功后返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500);
						} else {
							uni.hideLoading();
							uni.showToast({
								title: result.result.message || '保存失败',
								icon: 'none'
							});
						}
					} catch (error) {
						uni.hideLoading();
						uni.showToast({
							title: '保存失败',
							icon: 'none'
						});
						console.error('保存Banner失败:', error);
					}
				}
		}
	}
</script>

<style scoped>
	.banner-edit-container {
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