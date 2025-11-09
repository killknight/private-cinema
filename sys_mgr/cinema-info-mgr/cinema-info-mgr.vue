<template>
	<view class="cinema-info-mgr-container">
		<!-- 表单内容 -->
		<view class="form-container">
			<!-- 影院名称 -->
			<view class="form-item">
				<view class="form-label">影院名称</view>
				<uni-easyinput v-model="cinemaForm.cinemaName" placeholder="请输入影院名称"></uni-easyinput>
			</view>
			
			<!-- 开门时间 -->
			<view class="form-item">
				<view class="form-label">开门时间</view>
				<uni-easyinput v-model="cinemaForm.openTime" placeholder="如：10:00"></uni-easyinput>
			</view>
			
			<!-- 打烊时间 -->
			<view class="form-item">
				<view class="form-label">打烊时间</view>
				<uni-easyinput v-model="cinemaForm.closeTime" placeholder="如：23:00"></uni-easyinput>
			</view>

			<!-- 联系电话 -->
			<view class="form-item">
				<view class="form-label">预约电话</view>
				<uni-easyinput v-model="cinemaForm.phone" placeholder="请输入预约电话"></uni-easyinput>
			</view>
			
			<!-- 特色标签 -->
			<view class="form-item">
				<view class="form-label">特色标签</view>
				<view class="tags-container">
					<view v-for="(tag, index) in cinemaForm.tags" :key="index" class="tag-item">
						<text>{{ tag }}</text>
						<uni-icons type="clear" size="16" @click="removeTag(index)"></uni-icons>
					</view>
					<view class="tag-input-wrapper">
						<input type="text" v-model="newTag" class="tag-input" placeholder="输入标签" @confirm="addTag" />
						<button class="add-tag-btn" @click="addTag">添加</button>
					</view>
				</view>
			</view>
			
			<!-- 影院地址 -->
			<view class="form-item">
				<view class="form-label">影院地址</view>
				<uni-easyinput v-model="cinemaForm.address" type="textarea" placeholder="请输入影院详细地址"></uni-easyinput>
				<button class="location-btn" @click="getLocation" :disabled="gettingLocation">
					{{ gettingLocation ? '定位中...' : '获取定位' }}
				</button>
			</view>
			
			<!-- 纬度 -->
			<view class="form-item">
				<view class="form-label">纬度</view>
				<uni-easyinput v-model.number="cinemaForm.latitude" type="number" placeholder="请输入纬度"></uni-easyinput>
			</view>
			
			<!-- 经度 -->
			<view class="form-item">
				<view class="form-label">经度</view>
				<uni-easyinput v-model.number="cinemaForm.longitude" type="number" placeholder="请输入经度"></uni-easyinput>
			</view>
			
			<!-- 影院故事 -->
			<view class="form-item">
				<view class="form-label">影院故事</view>
				<uni-easyinput v-model="storyInput" type="textarea" :rows="4" placeholder="请输入影院故事"></uni-easyinput>
			</view>
			
			<!-- 公众号二维码 -->
			<view class="form-item">
				<view class="form-label">公众号二维码</view>
				<uni-file-picker
					ref="wechatQrCodePicker"
					limit="1"
					fileMediatype="image"
					mode="grid"
					:value="wechatQrCodeList"
					:custom-btn="true"
					:disable-preview="false"
					:auto-upload="true"
					:upload-file-api="''"
					@select="handleWechatQrCodeSelect"
					@delete="handleWechatQrCodeDelete"
				></uni-file-picker>
			</view>
			
			<!-- 应用logo -->
			<view class="form-item">
				<view class="form-label">应用logo</view>
				<uni-file-picker
					ref="logoImagePicker"
					limit="1"
					fileMediatype="image"
					mode="grid"
					:value="logoImageList"
					:custom-btn="true"
					:disable-preview="false"
					:auto-upload="true"
					:upload-file-api="''"
					@select="handleLogoImageSelect"
					@delete="handleLogoImageDelete"
				></uni-file-picker>
			</view>
			
			<!-- 影院介绍图片 -->
			<view class="form-item">
				<view class="form-label">影院介绍图片</view>
				<uni-file-picker
					ref="cinemaIntroImagePicker"
					limit="1"
					fileMediatype="image"
					mode="grid"
					:value="cinemaIntroImageList"
					:custom-btn="true"
					:disable-preview="false"
					:auto-upload="true"
					:upload-file-api="''"
					@select="handleCinemaIntroImageSelect"
					@delete="handleCinemaIntroImageDelete"
				></uni-file-picker>
			</view>
			
			<!-- 环境信息列表 -->
			<view class="form-section">
				<view class="section-header">
					<view class="section-title">环境信息 ({{cinemaForm.environments.length}})</view>
					<view class="add-button" @click="showEnvironmentPopup(-1)">添加环境</view>
				</view>
				<view class="info-list">
					<view class="info-item" v-for="(item, index) in cinemaForm.environments" :key="index">
						<view class="info-title">{{item.name || '未命名环境'}}</view>
						<view class="info-actions">
							<text class="edit-btn" @click="showEnvironmentPopup(index)">编辑</text>
							<text class="delete-btn" @click="removeEnvironment(index)">删除</text>
						</view>
					</view>
				</view>
			</view>
			
			<!-- 设备信息列表 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-title">设备信息 ({{cinemaForm.equipment.length}})</view>
						<view class="add-button" @click="showEquipmentPopup(-1)">添加设备</view>
					</view>
					<view class="info-list">
						<view class="info-item" v-for="(item, index) in cinemaForm.equipment" :key="index">
							<view class="info-title">{{item.title || '未命名设备'}}</view>
							<view class="info-actions">
								<text class="edit-btn" @click="showEquipmentPopup(index)">编辑</text>
								<text class="delete-btn" @click="removeEquipment(index)">删除</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 服务信息列表 -->
				<view class="form-section">
					<view class="section-header">
						<view class="section-title">服务信息 ({{cinemaForm.services.length}})</view>
						<view class="add-button" @click="showServicePopup(-1)">添加服务</view>
					</view>
					<view class="info-list">
						<view class="info-item" v-for="(item, index) in cinemaForm.services" :key="index">
							<view class="info-title">{{item.title || '未命名服务'}}</view>
							<view class="info-actions">
								<text class="edit-btn" @click="showServicePopup(index)">编辑</text>
								<text class="delete-btn" @click="removeService(index)">删除</text>
							</view>
						</view>
					</view>
				</view>
				
				<!-- 设备信息弹窗 -->
				<uni-popup ref="equipmentPopup" type="bottom" :animation="true">
					<view class="popup-container">
						<view class="popup-header">
							<view class="popup-title">{{editingEquipmentIndex === -1 ? '添加设备' : '编辑设备'}}</view>
							<view class="popup-close" @click="closeEquipmentPopup">×</view>
						</view>
						<view class="popup-content">
							<view class="form-item">
								<view class="form-label">设备ID</view>
								<uni-easyinput v-model="tempEquipment.id" placeholder="请输入设备ID"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">图标</view>
								<uni-easyinput v-model="tempEquipment.icon" placeholder="请输入图标"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">设备名称</view>
								<uni-easyinput v-model="tempEquipment.title" placeholder="请输入设备名称"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">描述</view>
								<uni-easyinput v-model="tempEquipment.description" type="textarea" placeholder="请输入设备描述"></uni-easyinput>
							</view>
						</view>
						<view class="popup-footer">
							<view class="cancel-button" @click="closeEquipmentPopup">取消</view>
							<view class="confirm-button" @click="saveEquipment">确定</view>
						</view>
					</view>
				</uni-popup>
				
				<!-- 服务信息弹窗 -->
				<uni-popup ref="servicePopup" type="bottom" :animation="true">
					<view class="popup-container">
						<view class="popup-header">
							<view class="popup-title">{{editingServiceIndex === -1 ? '添加服务' : '编辑服务'}}</view>
							<view class="popup-close" @click="closeServicePopup">×</view>
						</view>
						<view class="popup-content">
							<view class="form-item">
								<view class="form-label">服务ID</view>
								<uni-easyinput v-model="tempService.id" placeholder="请输入服务ID"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">图标</view>
								<uni-easyinput v-model="tempService.icon" placeholder="请输入图标"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">服务名称</view>
								<uni-easyinput v-model="tempService.title" placeholder="请输入服务名称"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">描述</view>
								<uni-easyinput v-model="tempService.description" type="textarea" placeholder="请输入服务描述"></uni-easyinput>
							</view>
						</view>
						<view class="popup-footer">
							<view class="cancel-button" @click="closeServicePopup">取消</view>
							<view class="confirm-button" @click="saveService">确定</view>
						</view>
					</view>
				</uni-popup>
				
				<!-- 环境信息弹窗 -->
				<uni-popup ref="environmentPopup" type="bottom" :animation="true">
					<view class="popup-container">
						<view class="popup-header">
							<view class="popup-title">{{editingEnvironmentIndex === -1 ? '添加环境' : '编辑环境'}}</view>
							<view class="popup-close" @click="closeEnvironmentPopup">×</view>
						</view>
						<view class="popup-content">
							<view class="form-item">
								<view class="form-label">环境名称</view>
								<uni-easyinput v-model="tempEnvironment.name" placeholder="请输入环境名称"></uni-easyinput>
							</view>
							<view class="form-item">
							<view class="form-label">环境图片</view>
							<uni-file-picker
								ref="tempEnvironmentImagePicker"
								limit="1"
								fileMediatype="image"
								mode="grid"
								:value="tempEnvironment.image ? [{url: tempEnvironment.image_url || tempEnvironment.image}] : []"
								:custom-btn="true"
								:disable-preview="false"
								:auto-upload="true"
								:upload-file-api="''"
								@select="handleTempEnvironmentImageSelect"
								@delete="handleTempEnvironmentImageDelete"
							></uni-file-picker>
						</view>
							<view class="form-item">
								<view class="form-label">排序</view>
								<uni-easyinput v-model.number="tempEnvironment.order" type="number" placeholder="请输入排序号"></uni-easyinput>
							</view>
							<view class="form-item">
								<view class="form-label">描述</view>
								<uni-easyinput v-model="tempEnvironment.description" type="textarea" placeholder="请输入环境描述"></uni-easyinput>
							</view>
						</view>
						<view class="popup-footer">
							<view class="cancel-button" @click="closeEnvironmentPopup">取消</view>
							<view class="confirm-button" @click="saveEnvironment">确定</view>
						</view>
					</view>
				</uni-popup>
				
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
				openTime: '',
				closeTime: '',
				tags: [],
				address: '',
				phone: '',
				wechatQrCode: '',
				logoImage: '',
				cinemaIntroImage: '',
				latitude: '',
				longitude: '',
				story: [],
				equipment: [],
				services: [],
				environments: []
			},
			newTag: '',
			storyInput: '',
			wechatQrCodeList: [],
			logoImageList: [],
			cinemaIntroImageList: [],
			uploadFiles: {
				wechatQrCode: null,
				logoImage: null,
				cinemaIntroImage: null,
				environmentImages: []
			},
			// 弹窗相关数据
			editingEquipmentIndex: -1,
			tempEquipment: {},
			editingServiceIndex: -1,
			tempService: {},
			editingEnvironmentIndex: -1,
			tempEnvironment: {},
			tempEnvironmentImage: null,
			// 上传状态
			uploading: false,
			// 定位状态
			gettingLocation: false
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
			// 获取定位
			getLocation() {
				this.gettingLocation = true;
				uni.getLocation({
					type: 'gcj02',
					highAccuracyExpireTime: 3000,
					success: (res) => {
						// 保存经纬度
						this.cinemaForm.latitude = res.latitude;
						this.cinemaForm.longitude = res.longitude;
						
						// 调用逆地理编码获取地址
						this.getAddressByLocation(res.latitude, res.longitude);
					},
					fail: (err) => {
						console.error('获取定位失败:', err);
						let errorMsg = '获取定位失败';
						
						switch(err.errCode) {
							case 1:
								errorMsg = '位置权限未授权，请在设置中开启';
								break;
							case 2:
								errorMsg = '位置信息不可用';
								break;
							case 3:
								errorMsg = '获取位置信息超时';
								break;
						}
						
						uni.showToast({
							title: errorMsg,
							icon: 'none'
						});
					},
					complete: () => {
						this.gettingLocation = false;
					}
				});
			},
			
			// 根据经纬度获取地址
			getAddressByLocation(latitude, longitude) {
				// 在微信小程序环境中使用wx.chooseLocation API
				// 这将打开地图选择器，用户可以选择当前位置或其他位置
				wx.chooseLocation({
					latitude: latitude,
					longitude: longitude,
					name: '',
					address: '',
					success: (res) => {
						// 更新经纬度和地址信息
						this.cinemaForm.latitude = res.latitude;
						this.cinemaForm.longitude = res.longitude;
						this.cinemaForm.address = res.address;
						
						uni.showToast({
							title: '定位成功，已获取地址信息',
							icon: 'success'
						});
					},
					fail: (err) => {
						console.error('选择位置失败:', err);
						
						// 检查是否是用户取消选择
						if (err.errMsg.indexOf('cancel') === -1) {
							uni.showToast({
								title: '获取地址信息失败',
								icon: 'none'
							});
						}
					}
				});
			},
			
			// 加载影院信息
				loadCinemaInfo() {
					uni.showLoading({
						title: '加载中...'
					});
					
					uniCloud.callFunction({
						name: 'getCinemaInfo',
						data: {}
					}).then(res => {
						uni.hideLoading();
						if (res.result && res.result.code === 200 && res.result.data && res.result.data.cinemaInfo) {
							const cinemaInfo = res.result.data.cinemaInfo;
							// 转换数据格式适配表单
							this.cinemaForm = {
								cinemaName: cinemaInfo.cinemaName || '',
								openTime: cinemaInfo.openTime || '',
								closeTime: cinemaInfo.closeTime || '',
								tags: cinemaInfo.tags || [],
								address: cinemaInfo.address || '',
								phone: cinemaInfo.phone || '',
								wechatQrCode: cinemaInfo.wechatQrCode || '',
								logoImage: cinemaInfo.logoImage || '',
								cinemaIntroImage: cinemaInfo.cinemaIntroImage || '',
								latitude: cinemaInfo.latitude || '',
								longitude: cinemaInfo.longitude || '',
								story: cinemaInfo.story || [],
								equipment: cinemaInfo.equipment || [],
								services: cinemaInfo.services || [],
								environments: cinemaInfo.environments || []
							};
							
							// 标签数据已在cinemaForm.tags中设置
							this.storyInput = this.cinemaForm.story.join('\n');
							
							// 设置图片列表 - 使用新的_url字段显示图片，但保留原始fileID用于修改操作
							if (this.cinemaForm.wechatQrCode) {
								// 使用wechatQrCode_url显示图片，如果不存在则使用原始fileID
								const displayUrl = cinemaInfo.wechatQrCode_url || this.cinemaForm.wechatQrCode;
								this.wechatQrCodeList = [{url: displayUrl}];
							}
							if (this.cinemaForm.logoImage) {
								// 使用logoImage_url显示图片，如果不存在则使用原始fileID
								const displayUrl = cinemaInfo.logoImage_url || this.cinemaForm.logoImage;
								this.logoImageList = [{url: displayUrl}];
							}
							if (this.cinemaForm.cinemaIntroImage) {
								// 使用cinemaIntroImage_url显示图片，如果不存在则使用原始fileID
								const displayUrl = cinemaInfo.cinemaIntroImage_url || this.cinemaForm.cinemaIntroImage;
								this.cinemaIntroImageList = [{url: displayUrl}];
							}
					} else {
						uni.showToast({
							title: '加载影院信息失败',
							icon: 'none'
						});
					}
				}).catch(error => {
					uni.hideLoading();
					console.error('加载影院信息失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
				});
			},
			
			// 处理公众号二维码选择
			handleWechatQrCodeSelect(e) {
				this.uploadFileToCloud(e.tempFiles[0], 'wechatQrCode');
			},
			
			// 上传文件到云存储 - 使用真实的云存储上传API
			uploadFileToCloud(file, fileType, envIndex = null) {
				if (this.uploading) return;
				
				this.uploading = true;
				uni.showLoading({
					title: '上传中...'
				});
				
				// 生成文件名
				const timestamp = Date.now();
				const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
				let cloudPath = '';
				
				if (fileType === 'wechatQrCode') {
					cloudPath = `other/wechatQrCode_${timestamp}.${ext}`;
				} else if (fileType === 'logoImage') {
					cloudPath = `other/logoImage_${timestamp}.${ext}`;
				} else if (fileType === 'cinemaIntroImage') {
					cloudPath = `other/cinemaIntroImage_${timestamp}.${ext}`;
				} else if (fileType === 'environmentImage') {
					cloudPath = `other/environmentImage_${timestamp}_${envIndex || 0}.${ext}`;
				}
				
				// 使用uniCloud.uploadFile进行真实的文件上传
				uniCloud.uploadFile({
					filePath: file.path,
					cloudPath: cloudPath,
					success: (res) => {
						const fileID = res.fileID;
						
						// 根据文件类型更新数据
						if (fileType === 'wechatQrCode') {
							this.cinemaForm.wechatQrCode = fileID;
							this.wechatQrCodeList = [{url: fileID}];
							this.uploadFiles.wechatQrCode = null;
						} else if (fileType === 'logoImage') {
							this.cinemaForm.logoImage = fileID;
							this.logoImageList = [{url: fileID}];
							this.uploadFiles.logoImage = null;
						} else if (fileType === 'cinemaIntroImage') {
							this.cinemaForm.cinemaIntroImage = fileID;
							this.cinemaIntroImageList = [{url: fileID}];
							this.uploadFiles.cinemaIntroImage = null;
						} else if (fileType === 'environmentImage' && envIndex !== null) {
							this.tempEnvironment.image = fileID;
							this.tempEnvironmentImage = fileID;
						}
						
						uni.showToast({
							title: '上传成功',
							icon: 'success'
						});
					},
					fail: (err) => {
						console.error('文件上传失败:', err);
						uni.showToast({
							title: '上传失败：' + (err.errMsg || '未知错误'),
							icon: 'none'
						});
					},
					complete: () => {
						this.uploading = false;
						uni.hideLoading();
					}
				});
			},
			
			// 处理公众号二维码删除 - 使用真实的云存储删除API
			handleWechatQrCodeDelete(e) {
				const fileID = this.cinemaForm.wechatQrCode;
				if (fileID && fileID.startsWith('cloud://')) {
					// 使用uniCloud.deleteFile进行真实的文件删除
					uniCloud.deleteFile({
						fileList: [fileID],
						success: (res) => {
							console.log('文件删除成功:', res);
						},
						fail: (err) => {
							console.error('文件删除失败:', err);
						},
						complete: () => {
							// 无论删除成功与否，都重置本地数据
							this.uploadFiles.wechatQrCode = null;
							this.wechatQrCodeList = [];
							this.cinemaForm.wechatQrCode = '';
						}
					});
				} else {
					// 非云存储路径，直接重置本地数据
					this.uploadFiles.wechatQrCode = null;
					this.wechatQrCodeList = [];
					this.cinemaForm.wechatQrCode = '';
				}
			},
			
			// 处理logo图片选择
			handleLogoImageSelect(e) {
				this.uploadFileToCloud(e.tempFiles[0], 'logoImage');
			},
			
			// 处理logo图片删除 - 使用真实的云存储删除API
			handleLogoImageDelete(e) {
				const fileID = this.cinemaForm.logoImage;
				if (fileID && fileID.startsWith('cloud://')) {
					// 使用uniCloud.deleteFile进行真实的文件删除
					uniCloud.deleteFile({
						fileList: [fileID],
						success: (res) => {
							console.log('文件删除成功:', res);
						},
						fail: (err) => {
							console.error('文件删除失败:', err);
						},
						complete: () => {
							// 无论删除成功与否，都重置本地数据
							this.uploadFiles.logoImage = null;
							this.logoImageList = [];
							this.cinemaForm.logoImage = '';
						}
					});
				} else {
					// 非云存储路径，直接重置本地数据
					this.uploadFiles.logoImage = null;
					this.logoImageList = [];
					this.cinemaForm.logoImage = '';
				}
			},
			
			// 处理影院介绍图片选择
			handleCinemaIntroImageSelect(e) {
				this.uploadFileToCloud(e.tempFiles[0], 'cinemaIntroImage');
			},
			
			// 处理影院介绍图片删除 - 使用真实的云存储删除API
				handleCinemaIntroImageDelete(e) {
					const fileID = this.cinemaForm.cinemaIntroImage;
					if (fileID && fileID.startsWith('cloud://')) {
						// 使用uniCloud.deleteFile进行真实的文件删除
						uniCloud.deleteFile({
							fileList: [fileID],
							success: (res) => {
								console.log('文件删除成功:', res);
							},
							fail: (err) => {
								console.error('文件删除失败:', err);
							},
							complete: () => {
								// 无论删除成功与否，都重置本地数据
								this.uploadFiles.cinemaIntroImage = null;
								this.cinemaIntroImageList = [];
								this.cinemaForm.cinemaIntroImage = '';
							}
						});
					} else {
						// 非云存储路径，直接重置本地数据
						this.uploadFiles.cinemaIntroImage = null;
						this.cinemaIntroImageList = [];
						this.cinemaForm.cinemaIntroImage = '';
					}
				},
				
				// 显示设备弹窗
				showEquipmentPopup(index) {
					this.editingEquipmentIndex = index;
					if (index === -1) {
						// 新增
						this.tempEquipment = {
							id: '',
							icon: '',
							title: '',
							description: ''
						};
					} else {
						// 编辑
						this.tempEquipment = JSON.parse(JSON.stringify(this.cinemaForm.equipment[index]));
					}
					this.$refs.equipmentPopup.open();
				},
				
				// 关闭设备弹窗
				closeEquipmentPopup() {
					this.$refs.equipmentPopup.close();
				},
				
				// 保存设备信息
				saveEquipment() {
					if (!this.tempEquipment.title) {
						uni.showToast({
							title: '请输入设备名称',
							icon: 'none'
						});
						return;
					}
					
					if (this.editingEquipmentIndex === -1) {
						// 新增
						this.cinemaForm.equipment.push(this.tempEquipment);
					} else {
						// 编辑
						this.cinemaForm.equipment[this.editingEquipmentIndex] = this.tempEquipment;
					}
					this.closeEquipmentPopup();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				},
				
				// 删除设备
				removeEquipment(index) {
					uni.showModal({
						title: '确认删除',
						content: '确定要删除这个设备吗？',
						confirmText: '删除',
						cancelText: '取消',
						confirmColor: '#ff3b30',
						success: (res) => {
							if (res.confirm) {
								this.cinemaForm.equipment.splice(index, 1);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							}
						}
					});
				},
				
				// 显示服务弹窗
				showServicePopup(index) {
					this.editingServiceIndex = index;
					if (index === -1) {
						// 新增
						this.tempService = {
							id: '',
							icon: '',
							title: '',
							description: ''
						};
					} else {
						// 编辑
						this.tempService = JSON.parse(JSON.stringify(this.cinemaForm.services[index]));
					}
					this.$refs.servicePopup.open();
				},
				
				// 关闭服务弹窗
				closeServicePopup() {
					this.$refs.servicePopup.close();
				},
				
				// 保存服务信息
				saveService() {
					if (!this.tempService.title) {
						uni.showToast({
							title: '请输入服务名称',
							icon: 'none'
						});
						return;
					}
					
					if (this.editingServiceIndex === -1) {
						// 新增
						this.cinemaForm.services.push(this.tempService);
					} else {
						// 编辑
						this.cinemaForm.services[this.editingServiceIndex] = this.tempService;
					}
					this.closeServicePopup();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				},
				
				// 删除服务
				removeService(index) {
					uni.showModal({
						title: '确认删除',
						content: '确定要删除这个服务吗？',
						confirmText: '删除',
						cancelText: '取消',
						confirmColor: '#ff3b30',
						success: (res) => {
							if (res.confirm) {
								this.cinemaForm.services.splice(index, 1);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							}
						}
					});
				},
				
				// 显示环境弹窗
				showEnvironmentPopup(index) {
					this.editingEnvironmentIndex = index;
					this.tempEnvironmentImage = null;
					if (index === -1) {
						// 新增
						this.tempEnvironment = {
							name: '',
							image: '',
							order: this.cinemaForm.environments.length + 1,
							description: ''
						};
					} else {
						// 编辑
						// 深拷贝原始环境数据，保留fileID
						this.tempEnvironment = JSON.parse(JSON.stringify(this.cinemaForm.environments[index]));
						// 保留原始image字段（fileID），用于后续修改操作
						this.tempEnvironmentImage = this.tempEnvironment.image;
					}
					this.$refs.environmentPopup.open();
				},
				
				// 关闭环境弹窗
				closeEnvironmentPopup() {
					this.$refs.environmentPopup.close();
				},
				
				// 保存环境信息
				saveEnvironment() {
					if (!this.tempEnvironment.name) {
						uni.showToast({
							title: '请输入环境名称',
							icon: 'none'
						});
						return;
					}
					
					if (this.editingEnvironmentIndex === -1) {
						// 新增
						this.cinemaForm.environments.push(this.tempEnvironment);
					} else {
						// 编辑
						this.cinemaForm.environments[this.editingEnvironmentIndex] = this.tempEnvironment;
					}
					this.closeEnvironmentPopup();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				},
				
				// 删除环境 - 使用云函数删除图片
			removeEnvironment(index) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个环境吗？',
					confirmText: '删除',
					cancelText: '取消',
					confirmColor: '#ff3b30',
					success: (res) => {
						if (res.confirm) {
							const env = this.cinemaForm.environments[index];
							if (env.image && env.image.startsWith('cloud://')) {
								// 使用云函数删除图片
								uni.showLoading({
									title: '删除中...'
								});
								
								uniCloud.callFunction({
									name: 'deleteCloudFile',
									data: {
										fileIDs: [env.image]
									}
								}).then(res => {
									console.log('云函数删除图片结果:', res);
									// 无论云函数执行结果如何，都从本地数据中移除
									this.cinemaForm.environments.splice(index, 1);
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
								}).catch(error => {
									console.error('调用云函数删除图片失败:', error);
									// 即使云函数调用失败，也从本地数据中移除
									this.cinemaForm.environments.splice(index, 1);
									uni.showToast({
										title: '环境已删除，图片删除失败',
										icon: 'none'
									});
								}).finally(() => {
									uni.hideLoading();
								});
							} else {
								// 非云存储路径，直接从本地数据中移除
								this.cinemaForm.environments.splice(index, 1);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							}
						}
					}
				});
			},
				
				// 处理临时环境图片选择
			handleTempEnvironmentImageSelect(e) {
				this.uploadFileToCloud(e.tempFiles[0], 'environmentImage', this.editingEnvironmentIndex);
			},
				
				// 处理临时环境图片删除 - 使用真实的云存储删除API
			handleTempEnvironmentImageDelete(e) {
				const fileID = this.tempEnvironment.image;
				if (fileID && fileID.startsWith('cloud://')) {
					// 使用uniCloud.deleteFile进行真实的文件删除
					uniCloud.deleteFile({
						fileList: [fileID],
						success: (res) => {
							console.log('临时环境图片删除成功:', res);
						},
						fail: (err) => {
							console.error('临时环境图片删除失败:', err);
						},
						complete: () => {
							// 无论删除成功与否，都重置本地数据
							this.tempEnvironmentImage = null;
							this.tempEnvironment.image = '';
						}
					});
				} else {
					// 非云存储路径，直接重置本地数据
					this.tempEnvironmentImage = null;
					this.tempEnvironment.image = '';
				}
			},
			
			// 添加标签
				addTag() {
					if (this.newTag && !this.cinemaForm.tags.includes(this.newTag)) {
						this.cinemaForm.tags.push(this.newTag);
						this.newTag = '';
					}
				},

				// 移除标签
				removeTag(index) {
					this.cinemaForm.tags.splice(index, 1);
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
				
				// 标签已经是数组格式，不需要转换
							const formData = {...this.cinemaForm};
							formData.story = this.storyInput ? this.storyInput.split('\n').filter(line => line.trim()) : [];
				
				// 提交数据
				uni.showLoading({
					title: '保存中...'
				});
				
				const submitData = {
					cinemaInfo: formData
				};
				
				// 直接调用处理函数，图片已在选择时上传完成
				this.processImageUploads(submitData);
			},
			
			// 直接调用云函数，图片已经在选择时上传完成
			processImageUploads(submitData) {
				// 图片已经在选择时上传完成，直接调用云函数
				this.callUpdateFunction(submitData);
			},
			
			// 调用更新云函数
				callUpdateFunction(data) {
					uniCloud.callFunction({
						name: 'updateCinemaInfo',
						data: data
					}).then(res => {
						uni.hideLoading();
						if (res.result && res.result.code === 200) {
							uni.showToast({
								title: '保存成功',
								icon: 'success',
								duration: 1500 // 增加显示时间，让用户有足够时间看到提示
							});
							// 保存成功后返回上一页
							setTimeout(() => {
								uni.navigateBack();
							}, 1500); // 延迟返回，确保用户看到提示
						} else {
							uni.showToast({
								title: res.result?.message || '保存失败',
								icon: 'none'
							});
						}
					}).catch(error => {
						uni.hideLoading();
						console.error('保存影院信息失败:', error);
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
	
	.location-btn {
		background-color: #4CD964;
		color: #FFFFFF;
		border: none;
		border-radius: 8rpx;
		padding: 0rpx 30rpx;
		font-size: 28rpx;
		margin-top: 15rpx;
	}
	
	.location-btn:disabled {
		background-color: #CCCCCC;
		color: #999999;
	}

	/* 标签样式 */
	.tags-container {
		min-height: 60rpx;
	}

	.tag-item {
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

	.tag-input-wrapper {
		display: flex;
		align-items: center;
		gap: 15rpx;
		margin-top: 10rpx;
	}

	.tag-input {
		border: 1rpx solid #E0E0E0;
		border-radius: 8rpx;
		padding: 8rpx 15rpx;
		flex: 1;
		height: 50rpx;
		font-size: 26rpx;
	}

	.add-tag-btn {
		background-color: #007AFF;
		color: #FFFFFF;
		border: none;
		border-radius: 8rpx;
		padding: 0 30rpx;
		height: 68rpx;
		font-size: 28rpx;
		line-height: 64rpx;
	}
	
	.form-section {
				margin-top: 40rpx;
				padding: 20rpx;
				background-color: #f5f5f5;
				border-radius: 12rpx;
			}
			.section-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20rpx;
			}
			.section-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
			.info-list {
				background-color: white;
				border-radius: 8rpx;
				overflow: hidden;
			}
			.info-item {
				padding: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;
				display: flex;
				justify-content: space-between;
				align-items: center;
			}
			.info-item:last-child {
				border-bottom: none;
			}
			.info-title {
				font-size: 28rpx;
				color: #333;
			}
			.info-actions {
				display: flex;
				gap: 20rpx;
			}
			.edit-btn {
				font-size: 24rpx;
				color: #007aff;
			}
			.delete-btn {
				font-size: 24rpx;
				color: #ff3b30;
			}
			.add-button {
				background-color: #4cd964;
				color: white;
				text-align: center;
				padding: 10rpx 20rpx;
				border-radius: 8rpx;
				font-size: 24rpx;
			}
			
			/* 弹窗样式 */
			.popup-container {
				background-color: white;
				border-top-left-radius: 20rpx;
				border-top-right-radius: 20rpx;
				max-height: 80vh;
				overflow-y: auto;
			}
			.popup-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 20rpx;
				border-bottom: 1rpx solid #f0f0f0;
				position: sticky;
				top: 0;
				background-color: white;
				z-index: 10;
			}
			.popup-title {
				font-size: 32rpx;
				font-weight: bold;
				color: #333;
			}
			.popup-close {
				font-size: 48rpx;
				color: #999;
				padding: 0 20rpx;
			}
			.popup-content {
				padding: 20rpx;
			}
			.popup-footer {
				display: flex;
				padding: 20rpx;
				border-top: 1rpx solid #f0f0f0;
				position: sticky;
				bottom: 0;
				background-color: white;
				z-index: 10;
				gap: 20rpx;
			}
			.cancel-button {
				flex: 1;
				background-color: #f5f5f5;
				color: #333;
				text-align: center;
				padding: 20rpx;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
			.confirm-button {
				flex: 1;
				background-color: #007aff;
				color: white;
				text-align: center;
				padding: 20rpx;
				border-radius: 8rpx;
				font-size: 28rpx;
			}
</style>