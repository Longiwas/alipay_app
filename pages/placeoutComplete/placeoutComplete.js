const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/placeoutComplete/placeoutComplete"
    }
}); // miniprogram/pages/adoptionComplete/adoptionComplete.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: { ...app.globalData, petId: "", customHeadHeight: 0 },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.initPromise.then(data => {
            this.setData({
                petId: options.id,
                customHeadHeight: data.customHeadHeight
            });
        });

        _my.removeStorage({
            key: "placeout",
            success: function(res) {}
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {},

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {},

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {
        _my.switchTab({
            url: "/pages/home/index"
        });
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function({ from, target, url }) {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    onIndexTap: function() {
        _my.switchTab({
            url: "/pages/home/index"
        });
    },
    onQRTap: function() {
        _my.previewImage({
            urls: ["http://res.511cwpt.com/wyy_qr.jpg"]
        });
    },
    onSubscribeTap: function() {
        this.setData({
            subscribeInfoShow: false
        });
    },
    onShowSubscribe: function() {
        this.setData({
            subscribeInfoShow: true
        });
    }
});
