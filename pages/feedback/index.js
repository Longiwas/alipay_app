const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/feedback/index"
    }
}); // miniprogram/pages/feedback/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        text: "",
        customHeadHeight: 0,
        template_show: false,
        templateStatus: false,
        templateIds: ["gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw"]
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
    onFeedbackChange: function(evt) {
        this.setData({
            text: evt.detail.value
        });
    },
    onConfirmTap: function() {
        this.setData({
            template_show: true
        });
    },
    commit: function() {
        let { userInfo, token } = app.globalData;
        let { text } = this.data;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/accusations`,
            method: "POST",
            header: {
                Authorization: `Bearer ${token}`
            },
            data: {
                user_id: userInfo.id,
                accusation_type: "tips",
                target_id: "",
                content: text
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 201) {
                    _my.showToast({
                        icon: "none",
                        title: "感谢您的反馈, 2秒后自动返回"
                    });

                    setTimeout(() => {
                        _my.navigateBack({});
                    }, 2000);
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "好像没成功, 再试一下?"
                    });
                }
            }
        });
    }
});
