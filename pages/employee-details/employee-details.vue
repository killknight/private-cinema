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

			<!-- 成就展示 - 自动轮播显示所有生活照 -->
			<view class="achievement-section">
				<view class="achievement-container">
					<image class="achievement-bg" :src="currentLifeMoment" mode="aspectFill"></image>
					<view class="achievement-item">
						<image class="achievement-image" :src="currentLifeMoment" mode="aspectFit"></image>
					</view>
				</view>
		</view>

			<!-- 生活瞬间 -->
			<view class="life-section">
				<view class="section-title">生活瞬间</view>
				<view class="life-grid">
					<view class="life-item" :class="{ 'active': index === currentMomentIndex }" v-for="(item, index) in employeeData.lifeMoments" :key="index" @click="previewImage(index)">
						<image class="life-image" :src="item" mode="aspectFill"></image>
					</view>
				</view>
			</view>

			<!-- 关于我 -->
			<view class="about-section" v-if="bioParagraphs.length > 0">
				<view class="section-title">关于我</view>
				<view class="about-content">
					<!-- 循环渲染每个段落 -->
				<view v-for="(paragraph, index) in bioParagraphs" :key="index" class="about-paragraph">
					<text class="about-text">{{ paragraph }}</text>
				</view>
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
					lifeMoments: [],
					bio: '',
					interests: []
			},
			currentMomentIndex: 0,
			timer: null,

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
		// 获取当前显示的生活照
		currentLifeMoment() {
			if (this.employeeData.lifeMoments && this.employeeData.lifeMoments.length > 0) {
				return this.employeeData.lifeMoments[this.currentMomentIndex];
			}
			return '';
		},
		
		// 将个人简介按换行符分割成段落数组
		bioParagraphs() {
			if (!this.employeeData.bio) return [];
			// 按换行符分割，过滤空字符串
			return this.employeeData.bio.split('\n').filter(paragraph => paragraph.trim() !== '');
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
			// 清除之前的定时器
			this.clearTimer();
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
				}
			} finally {
				this.loading = false;
				// 启动轮播定时器
				this.startRotation();
			}
		},

		// 启动自动轮播
		startRotation() {
			if (this.employeeData.lifeMoments && this.employeeData.lifeMoments.length > 1) {
				this.timer = setInterval(() => {
					this.currentMomentIndex = (this.currentMomentIndex + 1) % this.employeeData.lifeMoments.length;
				}, 4000); // 每2秒切换一次
			}
		},

		// 清除定时器
		clearTimer() {
			if (this.timer) {
				clearInterval(this.timer);
				this.timer = null;
			}
		},

		// 页面显示时重启轮播
		onShow() {
			if (!this.loading && this.employeeData.lifeMoments && this.employeeData.lifeMoments.length > 1) {
				this.startRotation();
			}
		},

		// 页面隐藏时清除定时器
		onHide() {
			this.clearTimer();
		},

		// 页面卸载时清除定时器
		onUnload() {
			this.clearTimer();
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

		// 成就展示
		.achievement-section {
				margin: 0 24rpx 0rpx;
				padding: 40rpx 24rpx;

				.section-title {
					font-size: 36rpx;
					font-weight: 700;
					color: #ffffff;
					margin-bottom: 30rpx;
					position: relative;

					&::after {
						content: '';
						display: block;
						position: absolute;
						bottom: -10rpx;
						left: 0;
						width: 100rpx;
						height: 6rpx;
						background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
						border-radius: 3rpx;
					}
				}

				.achievement-container {
					width: 100%;
					height: 500rpx;
					border-radius: 20rpx;
					overflow: hidden;
					position: relative;
					display: flex;
					align-items: center;
					justify-content: center;
				}

				// 背景模糊层
				.achievement-bg {
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					height: 100%;
					filter: blur(30rpx);
					opacity: 0.7;
					z-index: 1;
					// transform: scale(1.1); // 稍微放大背景以消除边缘空白
					object-fit: cover;
				}

				.achievement-item {
					width: 100%;
					height: 100%;
					display: flex;
					align-items: center;
					justify-content: center;
					position: relative;
					z-index: 2;
				}

				.achievement-image {
					max-width: 100%;
					max-height: 100%;
					object-fit: contain;
					border-radius: 20rpx;
					transform: scale(1.15);
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
				gap: 24rpx;

				.life-item {
					position: relative;
					width: 100%;
					padding-bottom: 100%; // 正方形
					overflow: hidden;
					border-radius: 12rpx;
					transition: all 0.3s ease;

					// 当前显示的图片样式
					&.active {
						opacity: 1;
						border: 3rpx solid #4facfe;
						transform: scale(1.05);
						box-shadow: 0 0 20rpx rgba(79, 172, 254, 0.5);
					}

					.life-image {
						position: absolute;
						top: 0;
						left: 0;
						width: 100%;
						height: 100%;
						transition: transform 0.3s ease;

						&:active {
							transform: scale(0.95);
						}
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

				.about-paragraph {
					margin-bottom: 20rpx;
				}
				
				.about-paragraph:last-child {
					margin-bottom: 0;
				}
				
				.about-text {
					font-size: 28rpx;
					color: #c9d1ee;
					line-height: 1.8;
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
