<template>
  <view class="box-edit-container">
    <!-- 表单内容 -->
    <view class="form-container">
      <!-- 包厢名称 -->
      <view class="form-item">
        <view class="form-label">包厢名称</view>
        <uni-easyinput
          v-model="boxForm.name"
          placeholder="请输入包厢名称"
        ></uni-easyinput>
      </view>

      <!-- 容纳人数 -->
      <view class="form-item">
        <view class="form-label">容纳人数</view>
        <uni-number-box
          v-model="boxForm.capacity"
          :min="1"
          :max="20"
        ></uni-number-box>
      </view>

      <!-- 价格 -->
      <view class="form-item">
        <view class="form-label">价格</view>
        <uni-easyinput
          v-model.number="boxForm.price"
          type="number"
          placeholder="请输入价格"
        ></uni-easyinput>
      </view>

      <!-- 价格单位 -->
      <view class="form-item">
        <view class="form-label">价格单位</view>
        <uni-easyinput
          v-model="boxForm.priceUnit"
          placeholder="如: 3小时起"
        ></uni-easyinput>
      </view>

      <!-- 包厢描述 -->
      <view class="form-item">
        <view class="form-label">包厢描述</view>
        <uni-easyinput
          v-model="boxForm.description"
          type="textarea"
          :rows="3"
          placeholder="请输入包厢描述"
        ></uni-easyinput>
      </view>

      <!-- 包厢标签 -->
      <view class="form-item">
        <view class="form-label">包厢标签</view>
        <uni-easyinput
          v-model="tagsInput"
          placeholder="请输入标签，用逗号分隔"
        ></uni-easyinput>
      </view>

      <!-- 是否热门 -->
      <view class="form-item">
        <view class="form-label">是否热门</view>
        <view
          class="toggle-button"
          :class="{ active: boxForm.hot }"
          @click="boxForm.hot = !boxForm.hot"
        >
          <text class="button-text">{{ boxForm.hot ? '已选中' : '热门' }}</text>
        </view>
      </view>

      <!-- 是否主题精选 -->
      <view class="form-item">
        <view class="form-label">是否主题精选</view>
        <view
          class="toggle-button"
          :class="{ active: boxForm.themed }"
          @click="boxForm.themed = !boxForm.themed"
        >
          <text class="button-text">{{
            boxForm.themed ? '已选中' : '主题精选'
          }}</text>
        </view>
      </view>

      <!-- 排序值 -->
      <view class="form-item">
        <view class="form-label">排序值</view>
        <uni-easyinput
          v-model.number="boxForm.sort"
          type="number"
          placeholder="数字越小排越前"
        ></uni-easyinput>
      </view>

      <!-- 包厢封面图片 -->
      <view class="form-item">
        <view class="form-label">包厢封面图片</view>
        <uni-file-picker
          ref="filePicker"
          limit="1"
          fileMediatype="image"
          mode="grid"
          :value="fileList"
          :auto-upload="true"
          :upload-file-api="''"
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
				name: '',
				capacity: 1,
				price: 0,
				priceUnit: '',
				description: '',
				tags: [],
				hot: false,
				themed: false,
				sort: 999,
				cover: ''
			},
			tagsInput: '',
			fileList: [],
			uploading: false
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
			// 调用云函数获取包厢详情
			uni.showLoading({
				title: '加载中...'
			});

			uniCloud.callFunction({
				name: 'roomManager',
				data: {
					action: 'getRoomDetail',
					_id: this.boxId
				}
			}).then(res => {
				uni.hideLoading();
				if (res.result && res.result.code === 200 && res.result.data) {
					// 获取包厢详情数据
					const roomData = res.result.data;
					// 设置表单数据
					this.boxForm = {
						name: roomData.name || '',
						capacity: roomData.capacity || 1,
						price: roomData.price || 0,
						priceUnit: roomData.priceUnit || '',
						description: roomData.description || '',
						tags: roomData.tags || [],
						hot: roomData.hot || false,
						themed: roomData.themed || false,
						sort: roomData.sort !== undefined ? roomData.sort : 999,
						cover: roomData.cover || ''
					};
					// 设置标签输入
					this.tagsInput = this.boxForm.tags.join(', ');
					// 设置封面图片
					if (this.boxForm.cover) {
						// 如果有cover_url字段，使用它来显示图片
						const displayUrl = roomData.cover_url || this.boxForm.cover;
						this.fileList = [{url: displayUrl}];
					}
				} else {
					uni.showToast({
						title: '加载包厢详情失败',
						icon: 'none'
					});
				}
			}).catch(error => {
				uni.hideLoading();
				console.error('加载包厢详情失败:', error);
				uni.showToast({
					title: '加载失败，请稍后重试',
					icon: 'none'
				});
			});
		},
		// 处理文件选择 - 上传到云存储bx目录
		handleSelect(e) {
			if (this.uploading) return;

			this.uploading = true;
			uni.showLoading({
				title: '上传中...'
			});

			const file = e.tempFiles[0];
			// 生成文件名
			const timestamp = Date.now();
			const ext = file.name ? file.name.split('.').pop().toLowerCase() : 'jpg';
			const cloudPath = `bx/room_${timestamp}.${ext}`;

			// 使用uniCloud.uploadFile进行真实的文件上传
			uniCloud.uploadFile({
				filePath: file.path,
				cloudPath: cloudPath,
				success: (res) => {
					const fileID = res.fileID;
					this.boxForm.cover = fileID;
					this.fileList = [{url: fileID}];

					uni.showToast({
						title: '上传成功',
						icon: 'success'
					});
				},
				fail: (err) => {
					console.error('文件上传失败:', err);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				},
				complete: () => {
					this.uploading = false;
					uni.hideLoading();
				}
			});
		},

		// 处理文件删除 - 使用真实的云存储删除API
		handleDelete(e) {
			const fileID = this.boxForm.cover;
			if (fileID && fileID.startsWith('cloud://')) {
				// 使用uniCloud.deleteFile进行真实的文件删除
				uniCloud.deleteFile({
					fileList: [fileID],
					success: (res) => {
						console.log('图片删除成功:', res);
					},
					fail: (err) => {
						console.error('图片删除失败:', err);
					},
					complete: () => {
						// 无论删除成功与否，都重置本地数据
						this.fileList = [];
						this.boxForm.cover = '';
					}
				});
			} else {
				// 非云存储路径，直接重置本地数据
				this.fileList = [];
				this.boxForm.cover = '';
			}
		},

			// 保存包厢
		saveBox() {
			// 表单验证
			if (!this.boxForm.name) {
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

			if (!this.boxForm.cover) {
				uni.showToast({
					title: '请上传包厢封面图片',
					icon: 'none'
				});
				return;
			}

			// 转换标签输入为数组
			this.boxForm.tags = this.tagsInput ? this.tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

			// 提交数据
			uni.showLoading({
				title: '保存中...'
			});

			// 调用云函数保存包厢数据
			uniCloud.callFunction({
				name: 'roomManager',
				data: {
					action: 'updateRoom',
					roomInfo: this.boxForm,
					type: this.type,
					_id: this.boxId
				}
			}).then(res => {
				uni.hideLoading();
				if (res.result && res.result.code === 200) {
					uni.showToast({
						title: '保存成功',
						icon: 'success',
						duration: 1500
					});
					// 先发送事件通知列表页刷新
					uni.$emit('refreshBoxList');
					// 保存成功后返回上一页
					setTimeout(() => {
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
				console.error('保存包厢信息失败:', error);
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
.box-edit-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-container {
  background-color: #ffffff;
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

.toggle-button {
  width: 100px;
  height: 36px;
  line-height: 34px;
  border: 1px solid #ddd;
  border-radius: 18px;
  text-align: center;
  font-size: 14px;
  color: #666;
  background-color: #fff;
  transition: all 0.3s ease;
}

.toggle-button.active {
  border-color: #007aff;
  background-color: #007aff;
  color: #fff;
}

.button-text {
  font-size: 14px;
}

.save-button {
  background-color: #007aff;
  color: #ffffff;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}
</style>
