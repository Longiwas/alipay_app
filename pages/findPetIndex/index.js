const _Page = require("../../__antmove/component/componentClass.js")("Page");
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/findPetIndex/index"
    }
}); // miniprogram/pages/petFindIndex/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: null,
        tab_selection1: "tab_selection",
        tab_selection2: "",
        pet_items: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.initPromise.then(data => {
            let { customHeadHeight, login, userInfo, token } = data;
            this.setData({
                customHeadHeight
            });
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
    onUnload: function() {},

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
    onShareAppMessage: function() {}
});
