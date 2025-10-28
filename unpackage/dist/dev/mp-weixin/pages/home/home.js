"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      bannerImage: "/static/banner/bj1.jpg",
      statusBarHeight: 0,
      currentBanner: 0,
      features: [
        { key: "intro", icon: "🏛️", text: "影城介绍" },
        { key: "vip", icon: "💳", text: "怎么会" },
        { key: "contact", icon: "☎️", text: "联系电话" }
      ],
      banners: [],
      business: null,
      tags: ["4K HDR", "杜比视界", "独立观影", "私密空间", "卫生保障"],
      hotRooms: [],
      themedRooms: [],
      loading: true,
      error: "",
      isOpenNow: false
    };
  },
  onLoad() {
    const info = common_vendor.index.getSystemInfoSync();
    this.statusBarHeight = info.statusBarHeight || 0;
    this.fetchHome();
  },
  methods: {
    isWithin(open, close) {
      const pad = (n) => n < 10 ? "0" + n : "" + n;
      const now = /* @__PURE__ */ new Date();
      const cur = parseInt(pad(now.getHours()) + pad(now.getMinutes()));
      const o = parseInt((open || "10:00").replace(":", ""));
      const c = parseInt((close || "24:00").replace(":", ""));
      if (o <= c)
        return cur >= o && cur <= c;
      return cur >= o || cur <= c;
    },
    async fetchHome() {
      var _a;
      this.loading = true;
      this.error = "";
      try {
        const res = await common_vendor.tr.callFunction({
          name: "cinema-home",
          data: {}
        });
        const data = ((_a = res == null ? void 0 : res.result) == null ? void 0 : _a.data) || {};
        this.hotRooms = data.hotRooms || this.mockRooms(6);
        this.themedRooms = data.themedRooms || this.mockRooms(6);
        this.banners = data.banners || [];
        this.business = data.business || null;
        this.isOpenNow = this.isWithin(this.business.openTime, this.business.closeTime);
      } catch (e) {
        this.error = "加载失败，已为您展示示例数据";
        this.hotRooms = this.mockRooms(6);
        this.themedRooms = this.mockRooms(6);
      } finally {
        this.loading = false;
      }
    },
    mockRooms(n) {
      const arr = [];
      for (let i = 0; i < n; i++) {
        arr.push({
          id: "m" + i,
          name: ["情侣主题房3", "家庭欢聚房", "漫威主题房", "电竞观赛房", "女神专享房", "复古胶片房"][i % 6],
          capacity: [2, 4, 6, 4, 2, 6][i % 6],
          cover: "/static/uni-center/headers.png"
        });
      }
      return arr;
    },
    onFeatureClick(f) {
      common_vendor.index.showToast({ title: f.text, icon: "none" });
    },
    toMore(key) {
      common_vendor.index.navigateTo({ url: "/pages/list/list.nvue?type=" + key });
    },
    toDetail(room) {
      common_vendor.index.navigateTo({ url: "/pages/list/detail?roomId=" + room.id });
    },
    onBannerChange(e) {
      var _a;
      this.currentBanner = ((_a = e == null ? void 0 : e.detail) == null ? void 0 : _a.current) || 0;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.statusBarHeight + 6 + "px",
    b: common_vendor.f($data.banners, (b, idx, i0) => {
      return {
        a: idx
      };
    }),
    c: $data.bannerImage,
    d: common_vendor.o((...args) => $options.onBannerChange && $options.onBannerChange(...args)),
    e: $data.banners && $data.banners.length || true
  }, $data.banners && $data.banners.length || true ? {
    f: common_vendor.f($data.banners && $data.banners.length ? $data.banners.length : 3, (i, k0, i0) => {
      return {
        a: i,
        b: i - 1 === $data.currentBanner ? 1 : ""
      };
    })
  } : {}, {
    g: common_vendor.f($data.features, (f, k0, i0) => {
      return {
        a: common_vendor.t(f.icon),
        b: common_vendor.t(f.text),
        c: f.key,
        d: common_vendor.o(($event) => $options.onFeatureClick(f), f.key)
      };
    }),
    h: $data.isOpenNow
  }, $data.isOpenNow ? {} : {}, {
    i: common_vendor.t($data.isOpenNow ? "营业中" : "休息中"),
    j: common_vendor.t($data.business && $data.business.openTime || "10:00"),
    k: common_vendor.t($data.business && $data.business.closeTime || "24:00"),
    l: common_vendor.f($data.business && $data.business.tags ? $data.business.tags : $data.tags, (t, k0, i0) => {
      return {
        a: common_vendor.t(t),
        b: t
      };
    }),
    m: common_vendor.o(($event) => $options.toMore("hot")),
    n: common_vendor.f($data.hotRooms, (room, k0, i0) => {
      return {
        a: common_vendor.t(room.name),
        b: common_vendor.t(room.capacity),
        c: room.id,
        d: common_vendor.o(($event) => $options.toDetail(room), room.id)
      };
    }),
    o: common_assets._imports_0,
    p: common_vendor.f($data.themedRooms, (room, k0, i0) => {
      return {
        a: room.cover,
        b: common_vendor.t(room.name),
        c: room.id,
        d: common_vendor.o(($event) => $options.toDetail(room), room.id)
      };
    })
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
