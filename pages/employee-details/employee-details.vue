<template>
	<view class="employee-details">
		<!-- 内容区域 -->
		<scroll-view class="content" scroll-y>
			<!-- 员工基本信息卡片 -->
			<view class="employee-card">
				<!-- 背景装饰 -->
				<view class="background-gradient"></view>
				<!-- 员工信息 - 左右布局 -->
				<view class="employee-info">
					<!-- 左侧头像 -->
					<view class="avatar-wrapper">
						<image class="avatar" :src="employeeData.avatar" mode="aspectFill"></image>
						<view class="avatar-border"></view>
					</view>
					<!-- 右侧个人信息 -->
					<view class="personal-info">
						<text class="employee-name">{{ employeeData.name }}</text>
						<text class="employee-position">{{ employeeData.position }}</text>
						<!-- 兴趣爱好区域 -->
						<view class="interests-section">
							<!-- <text class="interests-label">兴趣爱好：</text> -->
							<view class="interests-tags">
								<view class="interest-tag" v-for="(interest, index) in employeeData.interests" :key="index">
									{{ interest }}
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 成就展示轮播 -->
			<view class="achievement-section">
				<swiper class="achievement-swiper" :current="currentAchievement" @change="onAchievementChange" indicator-dots=false>
					<swiper-item v-for="(achievement, index) in employeeData.achievements" :key="index">
						<view class="achievement-item">
							<image class="achievement-image" :src="achievement.image" mode="aspectFill"></image>
						</view>
					</swiper-item>
				</swiper>
			<!-- 轮播控制箭头 -->
			<view class="swiper-controls">
				<view class="swiper-arrow swiper-arrow-left" @click="prevAchievement" v-if="employeeData.achievements.length > 1">
					<text>‹</text>
				</view>
				<view class="swiper-arrow swiper-arrow-right" @click="nextAchievement" v-if="employeeData.achievements.length > 1">
					<text>›</text>
				</view>
			</view>
			<!-- 成就描述 -->
			<view class="achievement-desc">
				<text class="achievement-title">{{ currentAchievementData.title }}</text>
				<text class="achievement-text">{{ currentAchievementData.description }}</text>
			</view>
		</view>

			<!-- 生活瞬间 -->
			<view class="life-section">
				<view class="section-title">生活瞬间</view>
				<view class="life-grid">
					<view class="life-item" v-for="(item, index) in employeeData.lifeMoments" :key="index" @click="previewImage(index)">
						<image class="life-image" :src="item" mode="aspectFill"></image>
					</view>
				</view>
			</view>

			<!-- 关于我 -->
			<view class="about-section">
				<view class="section-title">关于我</view>
				<view class="about-content">
					<text class="about-text">{{ employeeData.bio }}</text>
				</view>
			</view>

			<!-- 内容结束 -->
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
			return {
				employeeId: '',
				employeeData: {
					name: '',
					position: '',
					avatar: '',
					achievements: [],
					lifeMoments: [],
					bio: '',
					interests: []
				},
				currentAchievement: 0,
				loading: true
			};
	},
	onLoad(options) {
		if (options && options.id) {
			this.employeeId = options.id;
			this.loadEmployeeDetails();
		}
	},
	computed: {
		currentAchievementData() {
			if (this.employeeData.achievements && this.employeeData.achievements.length > 0) {
				return this.employeeData.achievements[this.currentAchievement] || {
					title: '参加国际电影节',
					description: '2023年参加戛纳电影节，与国际导演交流学习'
				};
			}
			return {
				title: '参加国际电影节',
				description: '2023年参加戛纳电影节，与国际导演交流学习'
			};
		}
	},
	methods: {
		// 返回上一页
		goBack() {
			uni.navigateBack();
		},

		// 加载员工详情
		async loadEmployeeDetails() {
			this.loading = true;
			try {
				const { result } = await uniCloud.callFunction({
					name: 'getEmployeeDetails',
					data: {
						employeeId: this.employeeId
					}
				});

				if (result.code === 200) {
					// 设置员工数据，确保所有字段都有默认值
					this.employeeData = {
						name: result.data.name || '员工姓名',
						position: result.data.position || '职位名称',
						avatar: result.data.avatar || '/static/banner/logo.png',
						achievements: result.data.achievements && Array.isArray(result.data.achievements) ? result.data.achievements : [
							{ image: '/static/banner/bj1.jpg', title: '参加国际电影节', description: '2023年参加戛纳电影节，与国际导演交流学习' }
						],
						lifeMoments: result.data.lifeMoments && Array.isArray(result.data.lifeMoments) ? result.data.lifeMoments : [
							'/static/banner/bj1.jpg',
							'/static/banner/bj2.jpg',
							'/static/banner/bj3.jpg',
							'/static/bx.jpg',
							'/static/logo.png',
							'/static/banner/bj1.jpg'
						],
						bio: result.data.bio || '作为一名资深电影爱好者，我从小就对光影世界充满好奇。毕业后投身影院行业，从基层做起，积累了十年的管理经验。2018年创立星辰影院，希望打造一个真正以观众体验为中心的私人观影空间。\n\n工作之余，我喜欢收藏经典电影周边，徒步旅行，以及和团队一起探索新的电影技术。\n\n我相信，只有真正热爱的人，才能为观众带来最纯粹的观影享受。',
						interests: result.data.interests && Array.isArray(result.data.interests) ? result.data.interests : ['电影收藏', '徒步旅行', '咖啡品鉴', '摄影']
					};
				} else {
					// 使用默认数据
					this.employeeData = {
						name: '张明',
						position: '创始人 & 总经理',
						avatar: '/static/logo.png',
						achievements: [
							{ image: '/static/banner/bj1.jpg', title: '参加国际电影节', description: '2023年参加戛纳电影节，与国际导演交流学习' }
						],
						lifeMoments: [
							'/static/banner/bj1.jpg',
							'/static/banner/bj2.jpg',
							'/static/banner/bj3.jpg',
							'/static/bx.jpg',
							'/static/logo.png',
							'/static/banner/bj1.jpg'
						],
						bio: '作为一名资深电影爱好者，我从小就对光影世界充满好奇。毕业后投身影院行业，从基层做起，积累了十年的管理经验。2018年创立星辰影院，希望打造一个真正以观众体验为中心的私人观影空间。\n\n工作之余，我喜欢收藏经典电影周边，徒步旅行，以及和团队一起探索新的电影技术。\n\n我相信，只有真正热爱的人，才能为观众带来最纯粹的观影享受。',
						interests: ['电影收藏', '徒步旅行', '咖啡品鉴', '摄影']
					};
				}
			} catch (error) {
				console.error('加载员工详情失败:', error);
				// 使用默认数据
				this.employeeData = {
					name: '张明',
					position: '创始人 & 总经理',
					avatar: '/static/logo.png',
					achievements: [
						{ image: '/static/banner/bj1.jpg', title: '参加国际电影节', description: '2023年参加戛纳电影节，与国际导演交流学习' }
					],
					lifeMoments: [
						'/static/banner/bj1.jpg',
						'/static/banner/bj2.jpg',
						'/static/banner/bj3.jpg',
						'/static/bx.jpg',
						'/static/logo.png',
						'/static/banner/bj1.jpg'
					],
					bio: '作为一名资深电影爱好者，我从小就对光影世界充满好奇。毕业后投身影院行业，从基层做起，积累了十年的管理经验。2018年创立星辰影院，希望打造一个真正以观众体验为中心的私人观影空间。\n\n工作之余，我喜欢收藏经典电影周边，徒步旅行，以及和团队一起探索新的电影技术。\n\n我相信，只有真正热爱的人，才能为观众带来最纯粹的观影享受。',
					interests: ['电影收藏', '徒步旅行', '咖啡品鉴', '摄影']
				};
			} finally {
				this.loading = false;
			}
		},

		// 轮播图切换
		onAchievementChange(e) {
			this.currentAchievement = e.detail.current;
		},

		// 上一张成就图
		prevAchievement() {
			if (this.currentAchievement > 0) {
				this.currentAchievement--;
			}
		},

		// 下一张成就图
		nextAchievement() {
			if (this.currentAchievement < this.employeeData.achievements.length - 1) {
				this.currentAchievement++;
			}
		},

		// 预览图片
		previewImage(index) {
			uni.previewImage({
				urls: this.employeeData.lifeMoments,
				current: index
			});
		}
	}
};
</script>

<style lang="less" scoped>
.employee-details {
	background: #0f1320;
	min-height: 100vh;
	color: #e7e9f0;

	// 头部导航
	.nav-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 24rpx 20rpx 24rpx;
		background: #171b2b;
		box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.3);

		.back-btn {
			width: 80rpx;
			height: 80rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			.back-icon {
				font-size: 48rpx;
				color: #ffffff;
			}
		}

		.nav-title {
			font-size: 36rpx;
			font-weight: 700;
			color: #ffffff;
		}

		.nav-right {
			width: 80rpx;
		}
	}

	// 内容区域
	.content {
		padding-bottom: 40rpx;

		// 员工基本信息卡片
		.employee-card {
			position: relative;
			// margin: 24rpx;
			padding: 40rpx;
			// background: #171b2b;
			border-radius: 30rpx;
			// box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
			overflow: hidden;

			// 背景渐变装饰
			.background-gradient {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				// background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(16, 185, 129, 0.1));
				z-index: 1;
			}

			// 员工信息
			.employee-info {
				position: relative;
				display: flex;
				flex-direction: row;
				align-items: center;
				z-index: 2;

				// 头像包装器
				.avatar-wrapper {
					position: relative;
					margin-right: 40rpx;
					animation: pulse 3s infinite;

					.avatar {
						width: 200rpx;
						height: 200rpx;
						border-radius: 100rpx;
						border: 8rpx solid #171b2b;
						background: #22273b;
					}

					// 头像边框装饰
					.avatar-border {
						position: absolute;
						top: -12rpx;
						left: -12rpx;
						width: 224rpx;
						height: 224rpx;
						border-radius: 112rpx;
						border: 12rpx solid transparent;
						background: linear-gradient(45deg, #8b5cf6, #10b981) border-box;
						mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
						mask-composite: exclude;
						animation: rotateBorder 6s linear infinite;
					}
				}

				// 个人信息
				.personal-info {
					display: flex;
					flex-direction: column;
					align-items: flex-start;
					text-align: left;
					flex: 1;

					.employee-name {
						font-size: 36rpx;
						font-weight: 800;
						color: #ffffff;
						margin-bottom: 12rpx;
						text-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.3);
						letter-spacing: 2rpx;
					}

					.employee-position {
						font-size: 28rpx;
						color: #8b5cf6;
						// background: rgba(139, 92, 246, 0.1);
						padding: 8rpx 0rpx;
						border-radius: 999rpx;
						font-weight: 500;
						margin-bottom: 20rpx;
					}

					// 兴趣爱好区域
					.interests-section {
						display: flex;
						align-items: center;
						flex-wrap: wrap;
						width: 100%;

						.interests-label {
							font-size: 28rpx;
							font-weight: 600;
							color: #8b5cf6;
							margin-right: 16rpx;
							text-shadow: 0 2rpx 4rpx rgba(139, 92, 246, 0.3);
						}

						.interests-tags {
							display: flex;
							flex-wrap: wrap;
							flex: 1;

							.interest-tag {
								font-size: 26rpx;
								font-weight: 500;
								color: #ffffff;
								background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(16, 185, 129, 0.2));
								padding: 10rpx 20rpx;
								border-radius: 999rpx;
								margin-right: 16rpx;
								margin-bottom: 12rpx;
								border: 1rpx solid rgba(139, 92, 246, 0.4);
								box-shadow: 0 4rpx 12rpx rgba(139, 92, 246, 0.15);
								touch-action: manipulation;
								transition: all 0.3s ease;
								overflow: hidden;
								position: relative;

								&:active {
									transform: scale(0.95);
									background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(16, 185, 129, 0.3));
								}

								// 发光效果
								&::before {
									content: '';
									position: absolute;
									top: -50%;
									left: -50%;
									width: 200%;
									height: 200%;
									background: linear-gradient(45deg, transparent, rgba(139, 92, 246, 0.1), transparent);
									animation: shine 3s infinite;
								}
							}
						}
					}
				}
			}
		}

		// 成就展示轮播
		.achievement-section {
			margin: 0 24rpx 40rpx;
			position: relative;

			.achievement-swiper {
				height: 400rpx;
				border-radius: 20rpx;
				overflow: hidden;

				.achievement-item {
					width: 100%;
					height: 100%;

					.achievement-image {
						width: 100%;
						height: 100%;
					}
				}
			}

			.swiper-controls {
				position: absolute;
				top: 50%;
				transform: translateY(-50%);
				width: 100%;
				display: flex;
				justify-content: space-between;
				padding: 0 10rpx;
				box-sizing: border-box;

				.swiper-arrow {
					width: 60rpx;
					height: 60rpx;
					background: rgba(0, 0, 0, 0.5);
					color: #ffffff;
					font-size: 48rpx;
					text-align: center;
					line-height: 60rpx;
					border-radius: 30rpx;
					cursor: pointer;
					touch-action: manipulation;
					z-index: 10;

					&:active {
						background: rgba(0, 0, 0, 0.7);
					}
				}
			}

			.achievement-desc {
				margin-top: 20rpx;
				padding: 24rpx;
				background: #171b2b;
				border-radius: 20rpx;

				.achievement-title {
					font-size: 32rpx;
					font-weight: 700;
					color: #ffffff;
					margin-bottom: 12rpx;
					display: block;
				}

				.achievement-text {
					font-size: 26rpx;
					color: #9aa3c7;
					line-height: 1.6;
				}
			}
		}

		// 生活瞬间
		.life-section {
			margin: 0 24rpx 40rpx;

			.section-title {
				font-size: 36rpx;
				font-weight: 700;
				color: #ffffff;
				margin-bottom: 24rpx;
			}

			.life-grid {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 16rpx;

				.life-item {
					position: relative;
					width: 100%;
					padding-bottom: 100%; // 正方形
					overflow: hidden;
					border-radius: 12rpx;

					.life-image {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
					}

					&:active {
						opacity: 0.8;
					}
				}
			}
		}

		// 关于我
		.about-section {
			margin: 0 24rpx 40rpx;

			.section-title {
				font-size: 36rpx;
				font-weight: 700;
				color: #ffffff;
				margin-bottom: 24rpx;
			}

			.about-content {
				background: #171b2b;
				padding: 32rpx;
				border-radius: 20rpx;

				.about-text {
					font-size: 28rpx;
					color: #c9d1ee;
					line-height: 1.8;
					white-space: pre-wrap;
				}
			}
		}
	}

	// 动画效果
	@keyframes rotateBorder {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	@keyframes shine {
		0% {
			transform: rotate(0deg);
			opacity: 0;
		}
		50% {
			opacity: 0.3;
		}
		100% {
			transform: rotate(360deg);
			opacity: 0;
		}
	}
}
</style>
