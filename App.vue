<script>
	import initApp from '@/common/appInit.js';
	import openApp from '@/common/openApp.js';
	// #ifdef H5
		openApp() //创建在h5端全局悬浮引导用户下载app的功能
	// #endif
	//1. 导入uni身份信息管理模块
	import uniIdPagesInit from '@/uni_modules/uni-id-pages/init.js';
	//2. 导入uniIm
	import uniIm from '@/uni_modules/uni-im/sdk/index.js';
	// 3.引入扩展插件（项目默认引入了，扩展插件uniImMsgReader用于展示消息是否已读）
	import MsgReaderExtension from '@/uni_modules/uni-im-msg-reader/extension.js'
	import checkIsAgree from '@/pages/uni-agree/utils/uni-agree.js';
	// import uniIdPageInit from '@/uni_modules/uni-id-pages/init.js';
	export default {
		globalData: {
			searchText: '',
			appVersion: {},
			config: {},
			$i18n: {},
			$t: {}
		},
		onLaunch: function() {
			console.log('App Launch')
			this.globalData.$i18n = this.$i18n
			this.globalData.$t = str => this.$t(str)
			initApp();
			// uniIdPageInit()
			//4. 安装uniIm扩展插件
			MsgReaderExtension.install()
			//5. 初始化uni身份信息管理模块
			uniIdPagesInit();
			//6. 初始化uniIm
			uniIm.init();
			
			// #ifdef APP
			//checkIsAgree(); APP端暂时先用原生默认生成的。目前，自定义方式启动vue界面时，原生层已经请求了部分权限这并不符合国家的法规
			// #endif

			// #ifdef H5
			// checkIsAgree(); // 默认不开启。目前全球，仅欧盟国家有网页端同意隐私权限的需要。如果需要可以自己去掉注视后生效
			// #endif

			// #ifdef APP-PLUS
			//idfa有需要的用户在应用首次启动时自己获取存储到storage中
			/*var idfa = '';
			var manager = plus.ios.invoke('ASIdentifierManager', 'sharedManager');
			if(plus.ios.invoke(manager, 'isAdvertisingTrackingEnabled')){
				var identifier = plus.ios.invoke(manager, 'advertisingIdentifier');
				idfa = plus.ios.invoke(identifier, 'UUIDString');
				plus.ios.deleteObject(identifier);
			}
			plus.ios.deleteObject(manager);
			console.log('idfa = '+idfa);*/
			// #endif
			uni.getPushClientId({
			  success(res) {
			    console.log('getPushClientId', res);
			  },
			  fail(err) {
			    console.log('getPushClientId', err)
			  }
			})

		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	body {
		background: #0f1320;
	}
	page {
		min-height: 100vh;
		/* background: #0f1320; */
	}
</style>
