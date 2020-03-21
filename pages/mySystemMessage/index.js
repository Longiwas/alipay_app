const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/mySystemMessage/index"
    }
}); // miniprogram/pages/mySystemMessage/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        systemMessages: [],
        target_id: "",
        template_show: false,
        templateStatus: false,
        templateIds: ["gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw"]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { userInfo, customHeadHeight, token } = app.globalData;
        this.setData({
            customHeadHeight
        });

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/system-messages?userid=" +
                userInfo.id,
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode === 200) {
                    this.setData({
                        systemMessages: data || []
                    });
                } else {
                    this.setData({
                        systemMessages: []
                    });
                }
            },
            fail: function(res) {
                _my.showToast({
                    title: "获取系统消息失败, 请返回再进入"
                });
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
    onPullDownRefresh: function() {},

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {},

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {},
    onMessageTap: function(evt) {
        let { id } = evt.currentTarget.dataset;
        let { submsg_handler } = app.globalData;

        if (submsg_handler) {
            app.reque;
            this.confirm();
        } else {
            this.setData({
                target_id: id,
                template_show: true
            });
        }
    },
    confirm: function(result) {}
});
