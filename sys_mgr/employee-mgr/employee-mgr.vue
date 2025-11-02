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
					<view class="employee-avatar" v-if="item.avatar">
						<image :src="item.avatar" mode="aspectFill"></image>
					</view>
					<view class="employee-avatar default-avatar" v-else>
						<uni-icons type="person" size="40" color="#CCCCCC"></uni-icons>
					</view>
					<view class="employee-details">
						<view class="employee-name">{{ item.name }}</view>
						<view class="employee-job">{{ item.position }}</view>
					</view>
				</view>
				<view class="employee-contact">
					<view class="contact-item">
						<uni-icons type="call" size="20" color="#999999"></uni-icons>
						<text class="contact-text">{{ item.phone }}</text>
					</view>
				</view>
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
			this.loadEmployeeList();
		},
		methods: {
			
			// 加载员工列表
			loadEmployeeList() {
				// 这里应该调用云函数获取员工数据
				// 暂时使用模拟数据
				uni.showLoading({
					title: '加载中...'
				});
				
				setTimeout(() => {
					uni.hideLoading();
					// 模拟数据
					this.employeeList = [
						{
							_id: '1',
							name: '张三',
							position: '经理',
							phone: '13800138001',
							avatar: ''
						},
						{
							_id: '2',
							name: '李四',
							position: '前台接待',
							phone: '13800138002',
							avatar: ''
						},
						{
							_id: '3',
							name: '王五',
							position: '技术专员',
							phone: '13800138003',
							avatar: ''
						}
					];
				}, 1000);
			},
			
			// 搜索员工
			searchEmployee() {
				// 这里应该实现搜索功能
				let filtered = this.employeeList.filter(item => 
					item.name.toLowerCase().includes(this.searchText.toLowerCase())
				);
				// 如果有搜索结果，显示搜索结果，否则显示提示
				if (filtered.length === 0 && this.searchText) {
					uni.showToast({
						title: '未找到相关员工',
						icon: 'none'
					});
				}
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
							// 这里应该调用云函数删除员工
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
							this.loadEmployeeList();
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
	
	.employee-name {
		font-size: 32rpx;
		font-weight: bold;
		color: #333333;
		margin-bottom: 8rpx;
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