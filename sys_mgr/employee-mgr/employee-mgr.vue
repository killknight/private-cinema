<template>
	<view class="employee-mgr-container">
		<!-- 添加按钮 -->
		<view class="add-button" @click="addEmployee">添加员工</view>
		
		<!-- 搜索栏 -->
		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索员工姓名" @confirm="searchEmployee"></uni-search-bar>
		</view>
		
		<!-- 员工列表 -->
		<view class="employee-list">
			<view class="empty-tip" v-if="employeeList.length === 0">
				<uni-icons type="person" size="60" color="#CCCCCC"></uni-icons>
				<text class="empty-text">暂无员工数据</text>
			</view>
			
			<view class="employee-item" v-for="item in employeeList" :key="item._id">
				<view class="employee-info">
					<view class="employee-avatar" v-if="item.displayAvatar || item.avatar">
						<image :src="item.displayAvatar || item.avatar" mode="aspectFill"></image>
					</view>
					<view class="employee-avatar default-avatar" v-else>
						<uni-icons type="person" size="40" color="#CCCCCC"></uni-icons>
					</view>
					<view class="employee-details">
							<view class="employee-name-row">
								<text class="employee-name">{{ item.name }}</text>
								<view class="employee-type" :class="item.type">
									{{ item.type === 'core' ? '核心团队' : '服务团队' }}
								</view>
							</view>
							<view class="employee-job">{{ item.position }}</view>
						</view>
				</view>
<!-- 				<view class="employee-contact">
					<view class="contact-item">
						<uni-icons type="position" size="20" color="#999999"></uni-icons>
						<text class="contact-text">{{ item.position }}</text>
					</view>
				</view> -->
				<view class="employee-actions">
					<uni-icons type="compose" size="24" color="#007AFF" @click="editEmployee(item)"></uni-icons>
					<uni-icons type="trash" size="24" color="#FF3B30" @click="deleteEmployee(item._id)"></uni-icons>
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
				employeeList: []
			}
		},
		onLoad() {
			// 设置导航栏标题
			uni.setNavigationBarTitle({
				title: '员工维护'
			});
			
		},
		onShow() {
			this.loadEmployeeList();
			// 监听刷新列表事件
			uni.$on('refreshEmployeeList', this.loadEmployeeList);
		},
		onHide() {
			// 移除事件监听，避免重复绑定
			uni.$off('refreshEmployeeList', this.loadEmployeeList);
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
			
			// 批量处理员工数据中的fileID
			async processEmployeeFileIds(employees) {
				// 收集所有需要转换的fileID
				const allFileIds = [];
				employees.forEach(emp => {
					if (emp.avatar) allFileIds.push(emp.avatar);
					if (emp.lifeMoments && emp.lifeMoments.length > 0) {
						emp.lifeMoments.forEach(fileId => allFileIds.push(fileId));
					}
				});
				
				// 如果没有文件需要转换，直接返回
				if (allFileIds.length === 0) return employees;
				
				// 批量获取临时URL
				try {
					const res = await uniCloud.getTempFileURL({
						fileList: allFileIds
					});
					
					// 创建fileId到url的映射
					const fileIdMap = {};
					res.fileList.forEach(item => {
						if (item.tempFileURL) {
							fileIdMap[item.fileID] = item.tempFileURL;
						}
					});
					
					// 更新员工数据中的URL
					return employees.map(emp => {
						const processedEmp = {...emp};
						// 转换头像URL
						if (processedEmp.avatar) {
							processedEmp.displayAvatar = fileIdMap[processedEmp.avatar] || processedEmp.avatar;
						}
						// 转换生活照片URL
						if (processedEmp.lifeMoments && processedEmp.lifeMoments.length > 0) {
							processedEmp.displayLifeMoments = processedEmp.lifeMoments.map(fileId => 
								fileIdMap[fileId] || fileId
							);
						}
						return processedEmp;
					});
				} catch (error) {
					console.error('批量处理文件URL失败:', error);
					// 失败时，为每个员工设置显示用的URL为原始fileID
					return employees.map(emp => ({
						...emp,
						displayAvatar: emp.avatar,
						displayLifeMoments: emp.lifeMoments || []
					}));
				}
			},
			
			// 加载员工列表
			async loadEmployeeList() {
				// 调用云函数获取员工数据
				uni.showLoading({
					title: '加载中...'
				});
				
				try {
					const res = await uniCloud.callFunction({
						name: 'teamManager',
						data: {
							action: 'getAllMembers',
							data: {
								searchText: this.searchText || ''
							}
						}
					});
					
					if (res.result && res.result.code === 200) {
						// 处理返回的集合数据，支持直接是数组的情况
						const members = Array.isArray(res.result.data) ? res.result.data : (res.result.data.members || []);
						// 处理fileID转换为URL
						this.employeeList = await this.processEmployeeFileIds(members);
					} else {
						uni.showToast({
							title: res.result?.message || '加载失败',
							icon: 'none'
						});
						this.employeeList = [];
					}
				} catch (error) {
					console.error('加载员工列表失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
					this.employeeList = [];
				} finally {
					uni.hideLoading();
				}
			},
			
			// 搜索员工
			searchEmployee() {
				// 调用加载方法进行搜索，searchText已经绑定到data中
				this.loadEmployeeList();
			},
			
			// 添加员工
			addEmployee() {
				uni.navigateTo({
					url: '/sys_mgr/employee-mgr/employee-edit?type=add'
				})
			},
			
			// 编辑员工
			editEmployee(employee) {
				uni.navigateTo({
					url: `/sys_mgr/employee-mgr/employee-edit?type=edit&id=${employee._id}`
				})
			},
			
			// 删除员工
			deleteEmployee(id) {
				uni.showModal({
					title: '确认删除',
					content: '确定要删除这个员工吗？',
					confirmText: '删除',
					confirmColor: '#FF3B30',
					success: (res) => {
						if (res.confirm) {
							// 调用云函数删除员工
							uni.showLoading({
								title: '删除中...'
							});
							
							uniCloud.callFunction({
								name: 'teamManager',
								data: {
									action: 'deleteMember',
									data: {
										_id: id
									}
								}
							}).then(result => {
								uni.hideLoading();
								if (result.result && result.result.code === 200) {
									uni.showToast({
										title: '删除成功',
										icon: 'success'
									});
									this.loadEmployeeList();
								} else {
									uni.showToast({
										title: result.result?.message || '删除失败',
										icon: 'none'
									});
								}
							}).catch(error => {
								uni.hideLoading();
								console.error('删除员工失败:', error);
								uni.showToast({
									title: '删除失败，请稍后重试',
									icon: 'none'
								});
							});
						}
					}
				})
			}
		}
	}
</script>

<style scoped>
	.employee-mgr-container {
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
	
	.employee-list {
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
	
	.employee-item {
		padding: 30rpx 20rpx;
		border-bottom: 1rpx solid #EEEEEE;
	}
	
	.employee-item:last-child {
		border-bottom: none;
	}
	
	.employee-info {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}
	
	.employee-avatar {
		width: 100rpx;
		height: 100rpx;
		border-radius: 50%;
		overflow: hidden;
		background-color: #F5F5F5;
		margin-right: 20rpx;
	}
	
	.employee-avatar image {
		width: 100%;
		height: 100%;
	}
	
	.default-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.employee-details {
		flex: 1;
	}
	
	.employee-name-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 8rpx;
	}

	.employee-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
	}

	.employee-type {
		font-size: 24rpx;
		padding: 4rpx 16rpx;
		border-radius: 16rpx;
	}

	.employee-type.core {
		background-color: #E9F7FE;
		color: #1678FF;
	}

	.employee-type.service {
		background-color: #F0F9EB;
		color: #34C759;
	}
	
	.employee-job {
		font-size: 28rpx;
		color: #666666;
	}
	
	.employee-contact {
		margin-bottom: 20rpx;
	}
	
	.contact-item {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
	
	.contact-text {
		font-size: 28rpx;
		color: #999999;
	}
	
	.employee-actions {
		display: flex;
		justify-content: flex-end;
		gap: 40rpx;
	}
</style>