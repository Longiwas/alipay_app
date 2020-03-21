const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/informationCenter/index"
    }
}); // miniprogram/pages/informationCenter/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        customHeadTopPadding: 20,
        mix_data: [],
        unread_common_msgs: false,
        unread_system_msgs: false,
        unread_offical_msgs: false,
        unread_likes: false,
        next: "",
        cover: "",
        template_show: false,
        templateStatus: false,
        templateIds: ["gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw"],
        target_action: -1,
        //0: reply, 1: like
        target_commentid: "",
        target_petid: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.initPromise.then(data => {
            let { headHeight, customHeadTopPadding, token, login } = data;
            this.setData({
                customHeadHeight: headHeight,
                customHeadTopPadding
            });

            if (login) {
                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/messages-reading-status",
                    method: "GET",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: res => {
                        if (res.statusCode == 200) {
                            this.setData(res.data);
                        }
                    }
                });
            }

            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/offical-messages",
                method: "GET",
                header: {
                    "page-size": 1
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 200 && data.length > 0) {
                        let { cover, type, url } = data[0];
                        this.setData({
                            cover,
                            type,
                            url
                        });
                    }
                }
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
    onShow: function() {
        let { token, userInfo, login } = app.globalData;

        if (login) {
            _my.request({
                url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages?user_id=${userInfo.id}&order=desc`,
                method: "GET",
                header: {
                    Authorization: "Bearer " + token,
                    "page-size": 30
                },
                success: res => {
                    if (res.statusCode == 200) {
                        this.setData({
                            mix_data: res.data,
                            next: res.header.Next
                        });

                        _my.request({
                            url:
                                "https://api.woyuanyi.511cwpt.com/api/v1/messages-reading-time",
                            method: "PUT",
                            header: {
                                Authorization: "Bearer " + token
                            },
                            data: {
                                type: "like"
                            },
                            complete: () => {
                                _my.stopPullDownRefresh();
                            }
                        });
                    }
                }
            });
        } else {
            this.setData({
                loginShow: true
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
    onPullDownRefresh: function() {
        this.onLoad();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {
        let { token, userInfo, login } = app.globalData;
        let { next, mix_data } = this.data;

        if (login) {
            _my.request({
                url: next,
                method: "GET",
                header: {
                    Authorization: "Bearer " + token,
                    "page-size": 30
                },
                success: res => {
                    if (res.statusCode == 200) {
                        this.setData({
                            mix_data: [...mix_data, ...res.data],
                            next: res.header.Next
                        });
                    }
                }
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    },

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
    onMyLikeCommentsTap: function() {
        let { login } = app.globalData;

        if (login) {
            _my.navigateTo({
                url: "../myLikeComments/index"
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    },
    onSystemMessageTap: function() {
        let { login } = app.globalData;

        if (login) {
            _my.navigateTo({
                url: "../mySystemMessage/index"
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    },
    onReplyTap: function(evt) {
        let { id, petid } = evt.currentTarget.dataset;
        let { token, login, userInfo, submsg_handler } = app.globalData;

        if (login) {
            if (submsg_handler) {
                _my.navigateTo({
                    url: `../adoptionComments/index?id=${petid}&commentid=${id}`
                });

                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/messages-reading",
                    method: "PUT",
                    data: [id],
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: () => {
                        app.globalData.getUnreadStatus();
                    }
                });
            } else {
                this.setData({
                    template_show: true,
                    target_action: 0,
                    target_commentid: id,
                    target_petid: petid
                });
                app.globalData.submsg_handler = true;
            }
        } else {
            this.setData({
                loginShow: true,
                target_action: 0,
                target_commentid: id,
                target_petid: petid
            });
        }
    },
    onLikeTap: function(evt) {
        let { petid } = evt.currentTarget.dataset;
        let { login } = app.globalData;

        if (login) {
            _my.navigateTo({
                url: `../adoptionDetail/adoptionDetail?id=${petid}`
            });

            app.globalData.getUnreadStatus();
        } else {
            this.setData({
                loginShow: true,
                target_action: 1,
                target_commentid: "",
                target_petid: petid
            });
        }
    },
    onImageTap: function(evt) {
        let { type, url } = this.data;

        if (type == "link") {
            _my.navigateTo({
                url: "../article/article?url=" + url
            });
        } else if (type == "mini-program") {
            _my.navigateTo({
                url
            });
        }
    },
    onAuthorizeComplete: function() {
        let { target_action, target_commentid, target_petid } = this.data;

        if (target_action == 0) {
            this.onReplyTap({
                currentTarget: {
                    dataset: {
                        id: target_commentid,
                        petid: target_petid
                    }
                }
            });
        } else if (target_action == 1) {
            this.onLikeTap({
                currentTarget: {
                    dataset: {
                        petid: target_petid
                    }
                }
            });
        } else {
            this.onLoad();
        }

        this.cleanTarget();
    },
    cleanTarget: function() {
        this.setData({
            target_action: -1,
            target_commentid: "",
            target_petid: ""
        });
    }
});
