<template>
  <view v-if="modelValue" class="toolbar">
    <view class="item" @click="shareMsg(false)">
      <view class="icons-box">
        <uni-icons size="20" type="redo"></uni-icons>
      </view>
      <text class="title">逐条转发</text>
    </view>
    <view class="item" @click="shareMsg(true)">
      <view class="icons-box">
        <uni-icons size="20" type="paperplane"></uni-icons>
      </view>
      <text class="title">合并转发</text>
    </view>
    <view class="item" @click="collectMsg">
      <view class="icons-box">
        <uni-icons size="20" type="folder-add"></uni-icons>
      </view>
      <text class="title">收藏</text>
    </view>
    <view class="item" @click="downloadMsg">
      <view class="icons-box">
        <uni-icons size="20" type="download"></uni-icons>
      </view>
      <text class="title">下载保存</text>
    </view>
    <view class="item" @click="deleteMsg">
      <view class="icons-box">
        <uni-icons size="20" type="trash"></uni-icons>
      </view>
      <text class="title">删除</text>
    </view>
    <uni-icons class="close-icon" @click="close" color="#999" size="35" type="closeempty"></uni-icons>
  </view>
</template>

<script>
  export default {
    name: 'UniImToolBar',
    emits: ['shareMsg', 'collectMsg', 'downloadMsg', 'deleteMsg', 'close', 'update:modelValue'],
    props: {
      checkedMsgList: {
        type: Array,
        default: () => []
      },
      modelValue: {
        type: Boolean,
        default: false,
      },
      isSelf: {
        type: Boolean,
        default: false
      },
      currentMsg: {
        type: Object,
        default: null
      }
    },
    data() {
      return {
        chooseMoreMsg: false
      }
    },
    methods: {
      /**
       * 消息转发
       * @param {Boolean} merge 是否合并转发
       */
      shareMsg(merge) {
        if (!this.checkedMsgList || this.checkedMsgList.length === 0) {
          return uni.showToast({
            title: '请选择要转发的消息',
            icon: 'none'
          });
        }
        this.$emit('shareMsg', merge)
        this.close();
      },
      
      /**
       * 收藏消息
       */
      collectMsg() {
        if (!this.checkedMsgList || this.checkedMsgList.length === 0) {
          return uni.showToast({
            title: '请选择要收藏的消息',
            icon: 'none'
          });
        }
        this.$emit('collectMsg', this.checkedMsgList)
        this.close();
      },
      
      /**
       * 下载消息
       */
      downloadMsg() {
        if (!this.checkedMsgList || this.checkedMsgList.length === 0) {
          return uni.showToast({
            title: '请选择要下载的消息',
            icon: 'none'
          });
        }
        this.$emit('downloadMsg', this.checkedMsgList)
        this.close();
      },
      
      /**
       * 删除消息
       */
      deleteMsg() {
        if (!this.checkedMsgList || this.checkedMsgList.length === 0) {
          return uni.showToast({
            title: '请选择要删除的消息',
            icon: 'none'
          });
        }
        
        // 弹出确认框
        uni.showModal({
          title: '确认删除',
          content: `确定要删除选中的${this.checkedMsgList.length}条消息吗？`,
          success: (res) => {
            if (res.confirm) {
              this.$emit('deleteMsg', this.checkedMsgList)
              this.close();
            }
          }
        });
      },
      
      /**
       * 关闭工具栏
       */
      close() {
        this.$emit('update:modelValue', false)
        this.$emit('close')
      },
      
      /**
       * 其他工具栏功能（保留向后兼容）
       */
      toolBarNext() {
        uni.showToast({
          title: '暂不支持',
          icon: 'none',
          duration: 2000
        });
        this.close();
      }
    },
    watch: {
      // 监听modelValue变化，确保组件状态同步
      modelValue(val) {
        this.chooseMoreMsg = val;
      }
    }
  }
</script>

<style lang="scss">
  .toolbar {
    background-color: #FFF;
    /* #ifdef H5 */
    @media screen and (min-device-width:960px){
      background-color: #ededed;
    }
    /* #endif */
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-top: solid 1px #ededed;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    z-index: 9;
    .item {
      align-items: center;
      /* #ifdef H5 */
      cursor: pointer;
      /* #endif */
      .icons-box {
        background-color: #fff;
        justify-content: center;
        align-items: center;
        border-radius: 100px;
        width: 30px;
        height: 30px;
        /* #ifdef H5 */
        @media screen and (min-device-width:960px){
          width: 60px;
          height: 60px;
          margin-bottom: 10px;
          .uni-icons {
            font-size: 35px !important;
          }
        }
        /* #endif */
      }
      .title {
        font-size: 8px;
        /* #ifdef H5 */
        @media screen and (min-device-width:960px){
          font-size: 14px;
        }
        /* #endif */
      }
    }
  }
</style>