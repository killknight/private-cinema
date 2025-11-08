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
        soundPlayState: 0,
        isInit: false,
        currentAudioContext: null,
        audioContext: null
      }
    },
    created() {
      // 初始化全局播放管理状态
      if (!uniIm._playingAudio) {
        uniIm._playingAudio = {
          instance: null,
          msgId: null
        }
      }
      
      // 初始化音频缓存
      if (!uniIm._audioCache) {
        uniIm._audioCache = {};
        // 设置缓存过期时间为20分钟
        uniIm._audioCacheExpiration = 20 * 60 * 1000;
        
        // 设置定时清理任务，每30分钟清理一次过期缓存
        if (!uniIm._audioCacheCleanupTimer) {
          uniIm._audioCacheCleanupTimer = setInterval(() => {
            this.cleanupExpiredCache();
          }, 30 * 60 * 1000); // 30分钟执行一次
        }
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
      console.log('销毁音频组件，清理资源');
      if(this.isInit && this.audioContext){
        this.audioContext.offPlay(this.onPlay);
        this.audioContext.offPause(this.soundPlayEnd);
        this.audioContext.offStop(this.soundPlayEnd);
        this.audioContext.offEnded(this.soundPlayEnd);
        this.audioContext.offError(this.onAudioError);
        console.log('移除组件音频上下文事件监听');
      }
      
      // 清理当前组件创建的音频上下文
      if (this.currentAudioContext) {
        try {
          console.log('停止并销毁组件自己的音频上下文');
          this.currentAudioContext.stop();
          this.currentAudioContext.offPlay();
          this.currentAudioContext.offError();
          this.currentAudioContext.offEnded();
        } catch (error) {
          console.error('清理音频上下文时出错:', error);
        }
        this.currentAudioContext = null;
      }
      
      // 当缓存数量过多时，手动触发一次清理
      const cacheSize = Object.keys(uniIm._audioCache || {}).length;
      if (cacheSize > 50) { // 当缓存超过100个时触发清理
        console.log(`缓存数量达到 ${cacheSize}，手动触发清理`);
        this.cleanupExpiredCache();
      }
    },
    methods: {
			init(){
			if (this.isInit) {
			  return
			}
			console.log('初始化音频播放器');
			// 自己创建音频上下文，使用WebAudio实现以获得更好的兼容性
			this.audioContext = uni.createInnerAudioContext({
			  useWebAudioImplement: true
			});
			
			// 监听播放事件
			this.onPlay = () => {
			  console.log('音频开始播放');
			  // 简化播放状态设置，不再异步获取临时URL进行严格匹配
			  // 只要开始播放，就设置为播放状态
			  this.soundPlayState = 1
			  console.log('当前音频正在播放，设置播放状态为1');
			}
			this.audioContext.onPlay(this.onPlay);
			
			// 监听错误事件，这是关键的调试信息
			this.onAudioError = (err) => {
			  console.error('音频播放错误:', err);
			  this.soundPlayState = 0
			}
			this.audioContext.onError(this.onAudioError);
			
			// 监听其他事件
			this.soundPlayEnd = () => {
			  console.log('音频播放结束或停止');
			  this.soundPlayState = 0
			}
			this.audioContext.onPause(this.soundPlayEnd);
			this.audioContext.onStop(this.soundPlayEnd);
			this.audioContext.onEnded(this.soundPlayEnd);
			
			// 检查audioContext是否有问题
			console.log('音频上下文初始化完成:', { 
			  volume: this.audioContext.volume,
			  muted: this.audioContext.muted,
			  state: this.audioContext.state
			});
			
			this.isInit = true
		},
      async getCachedAudioUrl(originalUrl) {
        const now = Date.now();
        const cacheKey = `audio_${originalUrl}`;
        
        // 检查缓存是否存在且未过期
        if (uniIm._audioCache[cacheKey] && (now - uniIm._audioCache[cacheKey].timestamp) < uniIm._audioCacheExpiration) {
          console.log('使用缓存的音频URL');
          return uniIm._audioCache[cacheKey].url;
        }
        
        // 缓存不存在或已过期，获取新URL
        console.log('缓存不存在或已过期，获取新音频URL');
        const newUrl = await uniIm.utils.getTempFileURL(originalUrl);
        
        // 更新缓存
        uniIm._audioCache[cacheKey] = {
          url: newUrl,
          timestamp: now
        };
        
        return newUrl;
      },
      
      // 清理过期的缓存
      cleanupExpiredCache() {
        const now = Date.now();
        let removedCount = 0;
        
        console.log('开始清理过期缓存...');
        
        // 遍历所有缓存项
        for (const key in uniIm._audioCache) {
          if (uniIm._audioCache.hasOwnProperty(key)) {
            const cacheItem = uniIm._audioCache[key];
            
            // 检查是否过期
            if (now - cacheItem.timestamp >= uniIm._audioCacheExpiration) {
              // 删除过期缓存
              delete uniIm._audioCache[key];
              removedCount++;
            }
          }
        }
        
        console.log(`清理完成，删除了 ${removedCount} 个过期缓存项`);
      },
      
      async playSound() {
	this.init()
	const audioContext = this.audioContext
        
        // 重置音频上下文设置
        audioContext.volume = 1.0;
        audioContext.muted = false;
        console.log('设置音频参数: 音量=1.0, 静音=false');
        
        // 获取临时URL（优先使用缓存）
        const audioUrl = await this.getCachedAudioUrl(this.msg.body.url)
        console.log('尝试播放音频:', audioUrl);
        
        // 下一个事件循环执行
        setTimeout(() => {
          // 如果当前消息正在播放，停止它
          if (this.soundPlayState === 1) {
            console.log('当前音频正在播放，停止播放');
            this.stopAllAudio();
          } else {
            console.log('准备播放新音频');
            
            // 停止其他正在播放的音频
            this.stopAllAudio();
            
            // 直接使用组件自己创建的音频上下文播放
            try {
              console.log('使用组件自己的音频上下文播放');
              audioContext.src = audioUrl;
              
              // 先停止再播放，确保状态正确
              try {
                audioContext.stop();
              } catch (stopError) {
                console.log('停止音频时可能尚未播放，忽略错误:', stopError);
              }
              
              setTimeout(() => {
                try {
                  audioContext.play();
                  console.log('调用audioContext.play()');
                  // 更新全局播放状态
                  uniIm._playingAudio = {
                    instance: audioContext,
                    msgId: this.msg._id,
                    component: this
                  };
                } catch (playError) {
                  console.error('播放失败:', playError);
                }
              }, 100);
              
            } catch (error) {
              console.error('播放音频失败:', error);
            }
          }
        }, 0)
      },
      stopAllAudio() {
        // 停止当前组件的音频
        if (this.currentAudioContext) {
          try {
            console.log('停止当前组件的额外音频上下文');
            this.currentAudioContext.stop();
          } catch (error) {
            console.error('停止当前额外音频上下文时出错:', error);
          }
          this.soundPlayState = 0;
        }
        
        // 停止组件自己的音频上下文
        if (this.audioContext) {
          try {
            console.log('停止组件自己的音频上下文');
            this.audioContext.stop();
          } catch (error) {
            console.error('停止组件音频上下文时出错:', error);
          }
          this.soundPlayState = 0;
        }
        
        // 停止全局正在播放的音频
        if (uniIm._playingAudio && uniIm._playingAudio.instance && uniIm._playingAudio.msgId !== this.msg._id) {
          try {
            console.log('停止其他组件正在播放的音频');
            uniIm._playingAudio.instance.stop();
            // 更新其他组件的播放状态
            if (uniIm._playingAudio.component) {
              uniIm._playingAudio.component.soundPlayState = 0;
            }
          } catch (error) {
            console.error('停止其他音频时出错:', error);
          }
          // 重置全局播放状态
          uniIm._playingAudio = {
            instance: null,
            msgId: null,
            component: null
          };
        }
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