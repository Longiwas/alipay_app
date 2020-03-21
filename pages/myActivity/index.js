const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myActivity/index"
    }
}); // miniprogram/pages/myActivity/index.js

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        myActivityList: [
            {
                image:
                    "https://res.511cwpt.com/bls96oovijr5ka0f6n1g.jpg?imageMogr2/thumbnail/500x",
                url: "https://mp.weixin.qq.com/s/EA3OcJW9lx1HetpxWvcneg"
            },
            {
                image:
                    "https://res.511cwpt.com/bls96oovijr5ka0f6n1g.jpg?imageMogr2/thumbnail/500x",
                url: "https://mp.weixin.qq.com/s/EA3OcJW9lx1HetpxWvcneg"
            }
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
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
    onShareAppMessage: function() {},
    onActivityTap: function(evt) {
        let { url } = evt.target.dataset;

        _my.navigateTo({
            url: "../article/article?url=" + url
        });
    }
});
