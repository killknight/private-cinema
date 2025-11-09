<template>
  <view class="text selfText sound-box" :class="{reverse:!self}" :style="{width:soundBoxWidth}" @click="playSound">
    <text class="sound-time">
      {{ msg.body.time }}''
    </text>
    <view class="sound-icon-box" :class="{rotate:!self}">
      <image v-if="soundPlayState" src="@/uni_modules/uni-im/static/sound-ing.gif" style="width: 18px;height: 18px;"
        mode="widthFix" />
      <uni-im-icons v-else :class="{'sound-icon-active':soundPlayState}" code="e6f5" size="18px" color="#000000" />
    </view>
  </view>
</template>

<script>
  import uniIm from '@/uni_modules/uni-im/sdk/index.js';
  export default {
    data() {
      return {
        soundPlayState: 0
      }
    },
    props: {
      msg: {
        type: Object,
        default () {
          return {
            from_uid: '',
            body: {
              time: 0
            }
          }
        }
      },
      soundBoxWidth: {
        type: String,
        default: '100px'
      }
    },
    computed: {
      self() {
        return this.msg.from_uid === uniIm.currentUser._id
      }
    },
    destroyed() {
      // console.log('unmounted');
			if(this.isInit){
				const audioContext = uniIm.audioContext
				audioContext.offPlay(this.onPlay);
				audioContext.offPause(this.soundPlayEnd);
				audioContext.offStop(this.soundPlayEnd);
				audioContext.offEnded(this.soundPlayEnd);
				audioContext.offError(this.soundPlayEnd);
			}
    },
    methods: {
			init(){
				if (this.isInit) {
				  return
				}
				// console.log('----init');
				const audioContext = uniIm.audioContext
				this.onPlay = async () => {
				  // console.log('soundPlayStart------------------',this.msg.body);
				  const currentAudioUrl = await uniIm.utils.getTempFileURL(this.msg.body.url)
				  if (audioContext.src == currentAudioUrl) {
				    this.soundPlayState = 1
				  } else {
				    this.soundPlayState = 0
				  }
				}
				audioContext.onPlay(this.onPlay);
				this.soundPlayEnd = () => {
				  console.log('soundPlayEnd------------------');
				  this.soundPlayState = 0
				}
				// 确保事件监听器正确绑定
				if (audioContext.onPause) audioContext.onPause(this.soundPlayEnd);
				if (audioContext.onStop) audioContext.onStop(this.soundPlayEnd);
				if (audioContext.onEnded) audioContext.onEnded(this.soundPlayEnd);
				if (audioContext.onError) audioContext.onError(this.soundPlayEnd);
				this.isInit = true
			},
      async playSound() {
				this.init()
				const audioContext = uniIm.audioContext
        audioContext.src = await uniIm.utils.getTempFileURL(this.msg.body.url)
        // 下一个事件循环执行
        setTimeout(() => {
          if (this.soundPlayState === 1) {
            console.log('播放中，执行关闭');
            try {
              audioContext.stop()
              // 手动调用停止回调以确保状态正确更新
              this.soundPlayEnd()
            } catch (e) {
              console.error('停止音频失败:', e)
              this.soundPlayEnd()
            }
          } else {
						console.log('未播放中，执行播放');
            try {
              // 先停止再播放，确保状态正确
              if (audioContext.stop) audioContext.stop()
              setTimeout(() => {
                if (audioContext.play) audioContext.play()
                this.soundPlayState = 1
              }, 50)
            } catch (e) {
              console.error('播放音频失败:', e)
              this.soundPlayState = 0
            }
          }
        }, 0)
      }
    }
  }
</script>

<style lang="scss">
.sound-box {
  /* #ifdef H5 */
  cursor: pointer !important;
  /* #endif */
  flex-direction: row;
  background-color: #94EB6A;
  height: 44px;
  padding: 10px;
  width: 66px;
  border-radius: 5px;
  justify-content: flex-end;
  align-items: center;
  
  &.reverse {
    flex-direction: row-reverse;
  }
  
  .sound-time {
    font-size: 14px;
    margin: 0 4px;
  }
  
  .sound-icon-box {
    width: 18px;
    height: 18px;
    justify-content: center;
  }
  .rotate {
    transform: rotate(180deg);
  }
  .sound-icon-active {
    transform: option;
    opacity: 10;
    background-color: #007AFF;
    transition-property: background-color;
    transition-duration: 0.3s;
    transition-delay: 0.1s;
    transition-timing-function: cubic-bezier(0.25, 0.1, 0.25, 1.0);
  }
}
</style>