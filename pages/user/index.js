const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/user/index"
    }
}); // miniprogram/pages/user/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        login: false,
        userInfo: {},
        showSubBtn: false,
        subscribeInfoShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.initPromise.then(data => {
            let { customHeadHeight, login, userInfo, token } = data;

            if (app.globalData.login) {
                login = app.globalData.login;
                token = app.globalData.token;
                userInfo = app.globalData.userInfo;
            }

            this.setData({
                customHeadHeight,
                login,
                userInfo
            });

            if (login) {
                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/users/" +
                        userInfo.id +
                        "/status",
                    method: "get",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: res => {
                        if (res.statusCode == 200) {
                            this.setData({
                                showSubBtn: !res.data.wechat_pub_user
                            });
                        } else {
                            this.setData({
                                showSubBtn: false
                            });
                        }
                    }
                });
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
        let { login, userInfo } = app.globalData;
        this.setData({
            login,
            userInfo
        });
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
    onShareAppMessage: function() {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    onPetPostTap: function() {
        if (this.data.login) {
            _my.navigateTo({
                url: "../myRequest/myRequest"
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "请先登录"
            });
        }
    },
    onPetAdoptTap: function() {
        if (this.data.login) {
            _my.navigateTo({
                url: "../myAdoption/myAdoption"
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "请先登录"
            });
        }
    },
    onPetFavTap: function() {
        if (this.data.login) {
            _my.navigateTo({
                url: "../myFavorites/index"
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "请先登录"
            });
        }
    },
    onGetUserInfo: function(res) {
        let that = this;
        let { userInfo } = res.detail;

        if (userInfo) {
            _my.showLoading({
                title: "登陆中"
            });

            userInfo.location = "";

            _my.login({
                success(res2) {
                    if (res2.code) {
                    console.log('onAuth')
                        _my.request({
                            url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                            method: "post",
                            data: {
                                type: "alipay",
                                data: {
                                    code: res2.code,
                                    ...userInfo
                                }
                            },

                            success(res3) {
                                if (res3.statusCode == 200) {
                                    let { info, auth } = res3.data;
                                    app.globalData.login = true;
                                    app.globalData.token = auth.token;
                                    app.globalData.userInfo = info;
                                    that.setData({
                                        login: true,
                                        userInfo: info
                                    });

                                    _my.hideLoading();
                                } else {
                                    _my.showToast({
                                        icon: "none",
                                        title: "登录失败"
                                    });

                                    _my.hideLoading();
                                }
                            }
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "登录失败"
                        });

                        _my.hideLoading();
                    }
                }
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "您取消了授权"
            });

            return;
        }
    },
    onFeedbackTap: function(evt) {
        let { login } = this.data;

        if (login) {
            _my.navigateTo({
                url: "../feedback/index"
            });
        }
    },
    onSettingTap: function(evt) {
        let { login } = this.data;

        if (login) {
            _my.navigateTo({
                url: "../setting/index"
            });
        }
    },
    onUserHomepageTap: function() {
        let { login } = this.data;

        if (login) {
            _my.navigateTo({
                url: "../userHomepage/index"
            });
        }
    },
    onShowSubscribe: function() {
        this.setData({
            subscribeInfoShow: true
        });
    },
    onSubscribeTap: function() {
        this.setData({
            subscribeInfoShow: false
        });
    }
});
