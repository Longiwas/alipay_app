const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myComments/index"
    }
}); // miniprogram/pages/myComments/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        myCommentsList: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let { token, userInfo } = app.globalData;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages?author_id=${userInfo.id}&type=reply&order=desc`,
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 200) {
                    this.setData({
                        myCommentsList: data
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
    onShareAppMessage: function() {},
    onCommentTap: function(evt) {
        let { id } = evt.currentTarget.dataset;

        _my.navigateTo({
            url: `../adoptionDetail/adoptionDetail?id=${id}`
        });
    }
});
