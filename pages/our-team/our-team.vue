<template>
	<view class="team-container">
		<!-- 加载状态 -->
		<uni-load-state v-if="loading" title="加载中..." show-icon="true"></uni-load-state>

		<template v-else>
			<!-- 团队标题和简介 -->
			<view class="team-header">
				<h1 class="team-title">{{ teamInfo.title }}</h1>
				<p class="team-description">{{ teamInfo.description }}</p>
			</view>

		<!-- 核心团队 -->
			<view class="team-section">
				<h2 class="section-title">核心团队</h2>
				<view class="core-team">
					<!-- 核心团队成员卡片 -->
					<view class="team-card" v-for="(member, index) in coreMembers" :key="index">
						<!-- 左右结构布局 -->
						<view class="member-avatar">
							<image :src="member.avatar" mode="aspectFill"></image>
						</view>
						<div class="member-info">
							<h3 class="member-name">{{ member.name }}</h3>
							<p class="member-position">{{ member.position }}</p>
							<p class="member-bio">{{ member.bio }}</p>
							<view class="social-icons">
								<view v-for="(icon, i) in member.socialIcons" :key="i" class="social-icon" :class="{ active: icon.active }">
									{{ icon.text || '' }}
								</view>
							</view>
						</div>
					</view>
				</view>
			</view>

		<!-- 服务团队 -->
		<view class="team-section">
			<h2 class="section-title">服务团队</h2>
			<view class="service-team">
				<!-- 服务团队成员卡片 -->
				<view class="service-card" v-for="(member, index) in serviceMembers" :key="index">
					<view class="member-avatar">
						<image :src="member.avatar" mode="aspectFill"></image>
					</view>
					<h3 class="member-name">{{ member.name }}</h3>
					<p class="member-position">{{ member.position }}</p>
					<p class="member-bio">{{ member.bio }}</p>
				</view>
			</view>
		</view>

		<!-- 企业文化 -->
		<view class="team-section">
			<h2 class="section-title">我们的文化</h2>
			<view class="culture-grid">
				<view class="culture-card" v-for="(culture, index) in cultures" :key="index">
					<view class="culture-icon">{{ culture.icon }}</view>
					<h3 class="culture-title">{{ culture.title }}</h3>
					<p class="culture-desc">{{ culture.description }}</p>
				</view>
			</view>
		</view>

			<!-- 加入我们 -->
			<view class="join-section">
				<h2 class="join-title">{{ joinInfo.title }}</h2>
				<p class="join-description">{{ joinInfo.description }}</p>
				<button class="join-button" @click="handleViewJobs">{{ joinInfo.buttonText }}</button>
			</view>
		</template>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 响应式数据
				teamInfo: {
					title: '遇见星辰团队',
					description: '我们是一群热爱电影与服务的专业人士，致力于为您打造极致观影体验'
				},
				coreMembers: [],
				serviceMembers: [],
				cultures: [],
				joinInfo: {
					title: '加入我们',
					description: '我们正在寻找热爱电影与服务的你，一起创造更多美好回忆',
					buttonText: '查看职位'
				},
				loading: true
			};
		},
		
		mounted() {
			// 组件挂载时获取数据
			this.fetchTeamData();
		},
		
		methods: {
			// 从云函数获取数据
			fetchTeamData: async function() {
				this.loading = true;
				try {
					// 调用云函数
					const result = await uniCloud.callFunction({
						name: 'getTeamData'
					});
					
					if (result.result && result.result.code === 0) {
						const data = result.result.data;
						this.teamInfo = data.teamInfo || this.teamInfo;
						this.coreMembers = data.coreMembers || [];
						this.serviceMembers = data.serviceMembers || [];
						this.cultures = data.cultures || [];
						this.joinInfo = data.joinInfo[0] || this.joinInfo;
					} else {
						throw new Error(result.result && result.result.message || '获取数据失败');
					}
				} catch (error) {
					console.error('获取团队数据失败:', error);
					uni.showToast({
						title: '加载失败，请稍后重试',
						icon: 'none'
					});
					// 使用默认数据作为备份
					this.useDefaultData();
				} finally {
					this.loading = false;
				}
			},
			
			// 使用默认数据作为备份
			useDefaultData: function() {
				this.coreMembers = [
					{
						name: '张明',
						position: '创始人 & 总经理',
						bio: '10年影院管理经验，前万达影院区域经理，电影爱好者',
						avatar: '/static/banner/bj1.jpg',
						socialIcons: [
							{ active: false },
							{ active: true, text: '微信' }
						]
					},
					{
						name: '李华',
						position: '技术总监',
						bio: '影音设备专家，曾参与多家高端影院声学设计与设备调试',
						avatar: '/static/banner/bj1.jpg',
						socialIcons: [
							{ active: false },
							{ active: true, text: '知' }
						]
					},
					{
						name: '王芳',
						position: '服务总监',
						bio: '五星级酒店服务管理经验，专注打造贴心周到的客户体验',
						avatar: '/static/bx.jpg',
						socialIcons: [
							{ active: false },
							{ active: false }
						]
					}
				];

				this.serviceMembers = [
					{
						name: '李强',
						position: '包厢服务员',
						bio: '电影爱好者，服务热情',
						avatar: '/static/bx.jpg'
					},
					{
						name: '赵琳',
						position: '前台接待',
						bio: '微笑天使，耐心细致',
						avatar: '/static/bx.jpg'
					},
					{
						name: '陈工',
						position: '技术专员',
						bio: '设备专家，响应迅速',
						avatar: '/static/banner/bj1.jpg'
					},
					{
						name: '孙悦',
						position: '包厢服务员',
						bio: '细心周到，电影达人',
						avatar: '/static/bx.jpg'
					}
				];

				this.cultures = [
					{
						icon: '♡',
						title: '客户至上',
						description: '用心服务，创造极致体验'
					},
					{
						icon: '💡',
						title: '追求卓越',
						description: '不断创新，超越期待'
					},
					{
						icon: '👥',
						title: '团结协作',
						description: '携手共进，创造价值'
					},
					{
						icon: '🎬',
						title: '热爱电影',
						description: '传播电影文化，分享快乐'
					}
				];
			},
			
			// 查看职位按钮点击事件
			handleViewJobs: function() {
				uni.showToast({
					title: '查看职位功能开发中',
					icon: 'none'
				});
				// 实际项目中可以跳转到职位列表页面
				// uni.navigateTo({ url: '/pages/jobs/jobs-list' });
			}
		}
	};
</script>

<style scoped>
	/* 加载状态样式 */
	:deep(.uni-load-state) {
		padding: 200rpx 0;
		color: #cccccc;
	}
	.team-container {
		background-color: #0c0c1e;
		color: #ffffff;
		min-height: 100vh;
		padding: 20rpx;
		box-sizing: border-box;
	}

	.team-header {
		text-align: center;
		padding: 60rpx 0;
	}

	.team-title {
		font-size: 48rpx;
		font-weight: bold;
		margin-bottom: 20rpx;
		color: #ffffff;
	}

	.team-description {
		font-size: 28rpx;
		line-height: 1.6;
		color: #cccccc;
		margin: 0 40rpx;
	}

	.team-section {
		margin-bottom: 50rpx;
	}

	.section-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #ffffff;
		margin-bottom: 40rpx;
		/* padding-left: 20rpx; */
		position: relative;
	}

	/* .section-title::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 8rpx;
		height: 36rpx;
		background-color: #9c27b0;
	} */

	/* 核心团队样式 */
	.core-team {
		display: flex;
		flex-direction: column;
		gap: 40rpx;
	}

	.team-card {
		background: linear-gradient(135deg, rgba(22, 24, 37, 0.85), rgba(30, 32, 48, 0.85));
		border-radius: 32rpx;
		padding: 24rpx;
		display: flex;
		flex-direction: row;
		align-items: center;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
		backdrop-filter: blur(20rpx);
		border: 1rpx solid rgba(255, 255, 255, 0.08);
		transition: all 0.3s ease;
		overflow: hidden;
		position: relative;
	}
	/*
	.team-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 6rpx;
		background: linear-gradient(90deg, #9c27b0, #3f51b5, #2196f3);
		animation: gradientShift 4s ease infinite;
	}
	*/

	@keyframes gradientShift {
		0% { background-position: 0% 50%; }
		50% { background-position: 100% 50%; }
		100% { background-position: 0% 50%; }
	}

	.team-card::after {
		content: '';
		position: absolute;
		bottom: -100rpx;
		right: -100rpx;
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #9c27b0, transparent);
		opacity: 0.15;
		z-index: 0;
		transition: all 0.5s ease;
	}

	/* .team-card:hover {
		transform: translateY(-12rpx);
		box-shadow: 0 20rpx 70rpx rgba(156, 39, 176, 0.25);
		background: linear-gradient(135deg, rgba(25, 27, 40, 0.9), rgba(33, 35, 52, 0.9));
	} */

	.team-card:hover::after {
		opacity: 0.25;
		transform: scale(1.1);
	}

	/* 头像样式 */
	.member-avatar {
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		overflow: hidden;
		margin-right: 40rpx;
		border: 4rpx solid rgba(156, 39, 176, 0.3);
		box-shadow: 0 0 40rpx rgba(156, 39, 176, 0.3), inset 0 0 0 2rpx rgba(255, 255, 255, 0.1);
		position: relative;
		animation: float 3s ease-in-out infinite;
		flex-shrink: 0;
		z-index: 1;
	}

	.member-avatar::after {
		content: '';
		position: absolute;
		inset: -2rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #9c27b0, #3f51b5);
		opacity: 0.7;
		filter: blur(10rpx);
		z-index: -1;
	}

	.member-avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.5s ease;
	}

	.team-card:hover .member-avatar image {
		transform: scale(1.1);
	}

	/* 成员信息容器 */
	.member-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		position: relative;
		z-index: 1;
	}

	/* 成员信息 */
	.member-name {
		font-size: 40rpx;
		font-weight: 700;
		margin-bottom: 10rpx;
		color: #ffffff;
		text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
		position: relative;
		display: inline-block;
		letter-spacing: 2rpx;
		padding-bottom: 12rpx;
	}

	.member-name::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 70rpx;
		height: 5rpx;
		background: linear-gradient(90deg, #9c27b0, #3f51b5);
		border-radius: 2rpx;
		/* animation: pulse 2s ease infinite; */
	}

	@keyframes pulse {
		0% { transform: scaleX(1); }
		50% { transform: scaleX(1.1); }
		100% { transform: scaleX(1); }
	}

	.member-position {
		font-size: 30rpx;
		color: #c299ff;
		margin-bottom: 15rpx;
		font-weight: 500;
		letter-spacing: 1rpx;
	}

	.member-bio {
		font-size: 28rpx;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.8);
		text-align: left;
		margin-bottom: 20rpx;
		padding: 0;
		word-break: break-all;
	}

	/* 社交图标 */
	.social-icons {
		display: flex;
		gap: 20rpx;
		margin-top: 15rpx;
		justify-content: flex-start;
	}

	.social-icon {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.08);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 26rpx;
		color: #888;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.social-icon::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #9c27b0, #3f51b5);
		opacity: 0;
		transition: opacity 0.3s ease;
	}

	.social-icon.active {
		color: #ffffff;
	}

	.social-icon.active::before {
		opacity: 1;
	}

	.social-icon.active::after {
		content: '';
		position: absolute;
		inset: -4rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #9c27b0, #3f51b5);
		filter: blur(10rpx);
		opacity: 0.6;
		z-index: -1;
	}

	.social-icon:hover {
		transform: scale(1.1);
	}

	/* 响应式调整 */
	@media screen and (max-width: 375px) {
		.team-card {
			flex-direction: column;
			text-align: center;
		}
		
		.member-avatar {
			margin-right: 0;
			margin-bottom: 30rpx;
			width: 160rpx;
			height: 160rpx;
		}
		
		.member-info {
			align-items: center;
		}
		
		.member-name::after {
			left: 50%;
			transform: translateX(-50%);
		}
		
		.member-bio {
			text-align: center;
		}
		
		.social-icons {
			justify-content: center;
		}
	}

	@media screen and (min-width: 768px) {
		.team-card {
			padding: 24rpx;
			gap: 40rpx;
		}
		
		.member-avatar {
			width: 200rpx;
			height: 200rpx;
			margin-right: 50rpx;
		}
		
		.member-name {
			font-size: 40rpx;
		}
		
		.member-position {
			font-size: 30rpx;
		}
		
		.member-bio {
			font-size: 28rpx;
			line-height: 1.8;
		}
		
		.social-icon {
			width: 68rpx;
			height: 68rpx;
			font-size: 28rpx;
		}
	}

	/* 服务团队样式 */
	.service-team {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 35rpx;
	}

	.service-card {
		background: linear-gradient(135deg, rgba(22, 24, 37, 0.85), rgba(30, 32, 48, 0.85));
		border-radius: 28rpx;
		padding: 35rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		backdrop-filter: blur(20rpx);
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1rpx solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
		text-align: center;
	}

	.service-card::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		right: -60rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #9c27b0, transparent);
		opacity: 0.1;
		z-index: 0;
	}

	.service-card:hover {
		transform: translateY(-8rpx);
		box-shadow: 0 15rpx 50rpx rgba(156, 39, 176, 0.2);
	}

	.service-card:hover::after {
		opacity: 0.2;
		transform: scale(1.1);
		transition: all 0.5s ease;
	}

	.service-card .member-avatar {
		width: 160rpx;
		height: 160rpx;
		margin: 0 0 20rpx 0;
		border: 3rpx solid rgba(156, 39, 176, 0.3);
		animation: float 4s ease-in-out infinite;
		position: relative;
		z-index: 1;
	}

	.service-card .member-name {
		font-size: 32rpx;
		font-weight: 700;
		margin-bottom: 10rpx;
		color: #ffffff;
		position: relative;
		z-index: 1;
		letter-spacing: 1rpx;
	}

	.service-card .member-position {
		font-size: 26rpx;
		color: #c299ff;
		margin-bottom: 15rpx;
		position: relative;
		z-index: 1;
	}

	.service-card .member-bio {
		font-size: 24rpx;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.7);
		margin-bottom: 0;
		position: relative;
		z-index: 1;
		text-align: center;
	}

	/* 企业文化样式 */
	.culture-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 35rpx;
	}

	.culture-card {
		background: linear-gradient(135deg, rgba(22, 24, 37, 0.85), rgba(30, 32, 48, 0.85));
		border-radius: 28rpx;
		padding: 30rpx 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		backdrop-filter: blur(20rpx);
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1rpx solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
	}

	.culture-card::after {
		content: '';
		position: absolute;
		bottom: -60rpx;
		right: -60rpx;
		width: 200rpx;
		height: 200rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #3f51b5, transparent);
		opacity: 0.1;
		z-index: 0;
	}

	.culture-card:hover {
		transform: translateY(-8rpx);
		box-shadow: 0 15rpx 50rpx rgba(63, 81, 181, 0.2);
	}

	.culture-card:hover::after {
		opacity: 0.2;
		transform: scale(1.1);
		transition: all 0.5s ease;
	}

	.culture-icon {
		font-size: 56rpx;
		margin-bottom: 25rpx;
		color: #9c27b0;
		position: relative;
		z-index: 1;
	}

	.culture-title {
		font-size: 34rpx;
		font-weight: 700;
		margin-bottom: 20rpx;
		color: #ffffff;
		position: relative;
		z-index: 1;
		letter-spacing: 1rpx;
	}

	.culture-desc {
		font-size: 26rpx;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.7);
		position: relative;
		z-index: 1;
	}

	/* 加入我们样式 */
	.join-section {
		background: linear-gradient(135deg, rgba(22, 24, 37, 0.9), rgba(30, 32, 48, 0.9));
		border-radius: 32rpx;
		padding: 40rpx 40rpx;
		text-align: center;
		margin-top: 50rpx;
		margin-bottom: 50rpx;
		backdrop-filter: blur(20rpx);
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
		border: 1rpx solid rgba(255, 255, 255, 0.08);
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
	}

	.join-section::after {
		content: '';
		position: absolute;
		top: -100rpx;
		right: -100rpx;
		width: 300rpx;
		height: 300rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #9c27b0, transparent);
		opacity: 0.2;
		z-index: 0;
	}

	.join-title {
		font-size: 40rpx;
		font-weight: 700;
		color: #ffffff;
		margin-bottom: 25rpx;
		position: relative;
		z-index: 1;
		letter-spacing: 2rpx;
	}

	.join-description {
		font-size: 28rpx;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 45rpx;
		position: relative;
		z-index: 1;
	}

	.join-button {
		background: linear-gradient(135deg, #3f51b5, #283593);
		color: #ffffff;
		border: none;
		border-radius: 48rpx;
		padding: 10rpx 100rpx;
		font-size: 32rpx;
		font-weight: 700;
		box-shadow: 0 8rpx 24rpx rgba(63, 81, 181, 0.4);
		transition: all 0.3s ease;
		position: relative;
		z-index: 1;
		letter-spacing: 2rpx;
		overflow: hidden;
	}

	.join-button::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(135deg, #5c6bc0, #3949ab);
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.join-button:hover {
		transform: translateY(-2rpx);
		box-shadow: 0 10rpx 32rpx rgba(63, 81, 181, 0.5);
	}

	.join-button:active {
		transform: scale(0.96);
	}

	.join-button:active::before {
		opacity: 1;
	}

	/* 响应式调整 */
	@media screen and (min-width: 768px) {
		.team-container {
			max-width: 800rpx;
			margin: 0 auto;
		}

		.core-team {
			gap: 40rpx;
		}

		.service-team,
		.culture-grid {
			gap: 40rpx;
		}
	}
</style>
