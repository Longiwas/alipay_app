const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/nickNameSetting/index"
    }
}); // miniprogram/pages/nickNameSetting/index.js

const app = getApp();

_Page({
    timeoutId: "",

    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        userInfo: {},
        btn_disabled: true,
        nickName: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight,
            userInfo: app.globalData.userInfo,
            nickName: app.globalData.userInfo.nickName
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
    onNickNameChange: function(evt) {
        let { value } = evt.detail;
        let { userInfo } = this.data;
        clearTimeout(this.timeoutId);
        this.timeoutId = setTimeout(() => {
            if (userInfo.nickName == value) {
                this.setData({
                    btn_disabled: true,
                    nickName: value
                });
            } else {
                this.setData({
                    btn_disabled: false,
                    nickName: value
                });
            }
        }, 50);
    },
    onSaveButtonTap: function(evt) {
        let { userInfo, nickName } = this.data;
        let { token } = app.globalData;

        _my.showLoading({
            title: "正在保存"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}`,
            method: "PUT",
            data: {
                nickName
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode } = res;

                _my.hideLoading();

                if (statusCode == 200) {
                    app.globalData.userInfo = res.data;

                    _my.navigateBack({});
                } else if (statusCode === 422) {
                    _my.showToast({
                        icon: "none",
                        title: "昵称含有违规内容"
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统繁忙"
                    });
                }
            }
        });
    }
});
