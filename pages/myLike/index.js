const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myLike/index"
    }
}); // miniprogram/pages/myLike/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        myLikeList: [],
        next: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });

        _my.showLoading({
            title: "寻找中"
        });

        let { token, userInfo } = app.globalData;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages?author_id=${userInfo.id}&type=like`,
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data, header } = res;

                if (statusCode == 200) {
                    this.setData({
                        myLikeList: data,
                        next: header.Next
                    });
                } else {
                    this.setData({
                        myLikeList: [],
                        next: ""
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
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
    onPullDownRefresh: function() {
        _my.showLoading({
            title: "寻找中"
        });

        let { token, userInfo } = app.globalData;
        let { next, myLikeList } = this.data;

        _my.request({
            url: next,
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data, header } = res;

                if (statusCode == 200) {
                    this.setData({
                        myLikeList: [...myLikeList, ...data],
                        next: header.Next
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {},
    onLikeTap: function(evt) {
        let { id } = evt.currentTarget.dataset;

        _my.navigateTo({
            url: `../adoptionDetail/adoptionDetail?id=${id}`
        });
    }
});
