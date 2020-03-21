const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionComplete/adoptionComplete"
    }
}); // miniprogram/pages/adoptionComplete/adoptionComplete.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: { ...app.globalData, petId: "", petCover: "", locationStr: "" },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            petId: options.id,
            petCover: options.image,
            customHeadHeight: app.globalData.customHeadHeight
        });

        _my.removeStorage({
            key: "",
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
            title: "我想免费领养这只小宝贝，麻烦支持我一下~",
            path: `/pages/home/index?target=adoptionSupportNew&id=${this.data.petId}`,
            imageUrl: this.data.petCover
        };
    },
    onIndexTap: function(evt) {
        _my.switchTab({
            url: "/pages/home/index"
        });
    }
});
