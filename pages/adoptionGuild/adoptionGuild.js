const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionGuild/adoptionGuild"
    }
}); // miniprogram/pages/adoptionGuild/adoptionGuild.js

const app = getApp();

_Page({
    properties: {},

    /**
     * 页面的初始数据
     */
    data: {
        app,
        paddingTitle: app.globalData.customHeadHeight,
        screenHeight: app.globalData.screenHeight,
        screenWidth: app.globalData.screenWidth,
        adoptionGuildHeight: 0,
        customHeadHeight: 0,
        waiting: "很多",
        done: "很多",
        loginShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let { city_code, token } = app.globalData;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/pet-report/`,
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                location: city_code
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 200) {
                    this.setData({
                        waiting: res.data.total,
                        done: res.data.eol
                    });
                }
            }
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
    onShareAppMessage: function() {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    onAdoptionGuildTap: function(evt) {
        _my.navigateTo({
            url: "../adoptionGuideDetail/index"
        });
    },
    onStartTap: function(evt) {
        let { login } = app.globalData;

        if (login) {
            _my.switchTab({
                url: "/pages/adoption/adoption"
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    }
});
