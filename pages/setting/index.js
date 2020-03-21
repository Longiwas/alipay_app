const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/setting/index"
    }
}); // miniprogram/pages/setting/index.js

const app = getApp();
const pages = getCurrentPages();
const prevPage = pages[pages.length - 2];

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app,
        subscribed: false,
        subscribed_location: "",
        subscribed_disable: true,
        customHeadHeight: 0,
        userInfo: {},
        gender: 0,
        genderStr: "未知",
        locationStr: "未知"
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { gender, location } = app.globalData.userInfo;
        let genderStr = "未知";

        if (gender == 1) {
            genderStr = "男";
        } else if (gender == 2) {
            genderStr = "女";
        }

        let locationStr = app.location2String(location);
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight,
            userInfo: app.globalData.userInfo,
            gender,
            genderStr,
            location,
            locationStr
        });
        let { userInfo, token } = app.globalData;

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/config`,
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: resdata => {
                let { statusCode, data } = resdata;

                if (statusCode == 200) {
                    let subscribed_disable = false;
                    if (app.globalData.city_code == "100000")
                        subscribed_disable = true;
                    this.setData({
                        subscribed: data.notify_switch,
                        subscribed_disable,
                        subscribed_location: data.notify_location
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "网络异常,请稍后重试"
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
    onShow: function() {
        if (this.data.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo
            });
        }
    },

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
    onSubscribeChange: function(evt) {
        let { value } = evt.detail;
        let { subscribed_location } = this.data;
        let { userInfo, token } = app.globalData;

        _my.showLoading({
            title: ""
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/config`,
            method: "PUT",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                notify_switch: value,
                notify_location: subscribed_location
                    ? subscribed_location
                    : app.globalData.city_code.substring(0, 4) + "00"
            },
            success: resdata => {
                let { statusCode, data } = resdata;

                if (statusCode == 201) {
                } else {
                    /*wx.showToast({
            icon: 'none',
            title: '网络异常,请稍后重试',
          })*/
                }

                _my.showToast({
                    title: ""
                });
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },
    onNickNameTap: function() {
        _my.navigateTo({
            url: "../nickNameSetting/index"
        });
    },
    onGenderChange: function(evt) {
        let { value } = evt.detail;
        let { token, userInfo } = app.globalData;

        _my.showLoading({
            title: "正在保存"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}`,
            method: "PUT",
            data: {
                gender: parseInt(value)
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data } = res;

                _my.hideLoading();

                if (statusCode == 200) {
                    _my.showToast({});

                    let { gender } = data;
                    let genderStr = "未知";
                    if (gender == 1) genderStr = "男";
                    else if (gender == 2) genderStr = "女";
                    app.globalData.userInfo = data;
                    this.setData({
                        userInfo: data,
                        genderStr,
                        gender
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统繁忙"
                    });
                }
            }
        });
    },

    onLocationChange(evt) {
        let { code } = evt.detail;
        let { token, userInfo } = app.globalData;

        _my.showLoading({
            title: "正在保存"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}`,
            method: "PUT",
            data: {
                location: code.join(".")
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode, data } = res;

                _my.hideLoading();

                if (statusCode == 200) {
                    _my.showToast({});

                    app.globalData.userInfo = data;
                    let { location } = data;
                    this.setData({
                        userInfo: data,
                        locationStr: app.location2String(location)
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统繁忙"
                    });
                }
            }
        });
    },

    onAvatarTap: function(evt) {
        let { userInfo, token } = app.globalData;

        _my.chooseImage({
            count: 1,
            sizeType: ["compressed"],
            success: res => {
                let { tempFilePaths } = res;

                if (tempFilePaths.length != 1) {
                    _my.showToast({
                        icon: "none",
                        title: "请选择一张图片"
                    });
                } else {
                    _my.uploadFile({
                        url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/avatar`,
                        method: "PUT",
                        filePath: tempFilePaths[0],
                        name: "avatar",
                        header: {
                            Authorization: "Bearer " + token
                        },
                        success: res => {
                            let { statusCode, data } = res;

                            if (statusCode == 200) {
                                app.globalData.userInfo = JSON.parse(data);
                                this.setData({
                                    userInfo: JSON.parse(data)
                                });
                            } else if (statusCode === 422) {
                                _my.showToast({
                                    icon: "none",
                                    title: "该图片无法使用"
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
            }
        });
    }
});
