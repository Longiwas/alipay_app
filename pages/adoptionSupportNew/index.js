const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionSupportNew/index"
    }
}); //?id=bkk9cp0vijr7k2ff3h70&location=123&cover=http://res.511cwpt.com/bkiab2ovijr5dovq1n9g.jpg

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app: app,
        applicant: {},
        recordid: "",
        pet: {},
        petId: "",
        petBanner: [],
        petName: "",
        petAge: 2,
        powered: true,
        year: 0,
        month: 0,
        petRemark: "",
        genderUrl: "",
        petCover: "",
        viewNum: 0,
        favStatus: false,
        favText: "收藏",
        heartName: "like-o",
        options: [],
        locationStr: "",
        power: 0,
        powered_users: [],
        supportBtnDisabled: false,
        supportBtnType: true //true: 不需要授权, false:需要授权
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let recordid = options.id; //recordid = 'bknmo20vijr5aiei9o1g';

        let locationStr = options.locationStr;

        _my.showLoading({
            title: "寻找中"
        });

        app.globalData.initPromise.then(initdata => {
            this.setData({
                customHeadHeight: initdata.customHeadHeight,
                supportBtnType: initdata.login
            });

            _my.request({
                url: `https://api.woyuanyi.511cwpt.com/api/v1/adoptions/${recordid}/empower`,
                method: "get",
                header: {
                    Authorization: "Bearer " + initdata.token,
                    "user-id": initdata.userInfo.id
                },
                success: res => {
                    _my.hideLoading();

                    let { statusCode, data } = res;

                    if (statusCode == 404) {
                        _my.navigateTo({
                            url: "../placeoutRemoved/index"
                        });

                        return;
                    }

                    let now = new Date();
                    let nowyear = now.getFullYear(),
                        nowmonth = now.getMonth(),
                        nowday = now.getDate(),
                        nowhour = now.getHours(),
                        nowminute = now.getMinutes();
                    let { age, applicant, power, powered_users = [] } = data;
                    data.pet.resources.forEach(
                        item => (item.isImage = item.type.indexOf("image") >= 0)
                    );
                    powered_users.forEach(user => {
                        let supportDate = new Date(user.time); //先算日期

                        if (now.getTime() < supportDate.getTime()) {
                            user.timeStr = "未知";
                            return;
                        }

                        let daytime = 1000 * 60 * 60 * 24;
                        let days = parseInt(
                            (now.getTime() - supportDate.getTime()) / daytime
                        );

                        if (days > 365) {
                            user.timeStr = days / 365 + "年前";
                            return;
                        } else if (days > 30) {
                            user.timeStr = days / 30 + "月前";
                            return;
                        } else if (days > 0) {
                            user.timeStr = days + "天前";
                            return;
                        } else {
                            let times =
                                (now.getTime() - supportDate.getTime()) %
                                daytime;

                            if (times > 1000 * 60 * 60) {
                                let hours = parseInt(times / (1000 * 60 * 60));
                                user.timeStr = hours + "小时前";
                                return;
                            } else if (times > 60000) {
                                let minutes = parseInt(times / 60000);
                                user.timeStr = minutes + "分钟前";
                                return;
                            } else {
                                let seconds = parseInt(times / 1000);
                                user.timeStr = seconds + "秒前";
                                return;
                            }
                        }
                    });
                    if (data.applicant.id == app.globalData.userInfo.id)
                        data.powered = true;
                    that.setData({
                        recordid,
                        petId: data.pet_id,
                        petAge: data.age,
                        petName: data.name,
                        petRemark: data.pet.story,
                        petCover: data.cover,
                        petBanner: data.pet.resources,
                        viewNum: data.views,
                        options: data.options,
                        year: parseInt(age / 12),
                        month: age % 12,
                        powered: data.powered,
                        powered_users: data.powered_users,
                        applicant,
                        pet: data.pet,
                        genderUrl: data.pet.gender
                            ? data.pet.gender == 1
                                ? "../../images/male.svg"
                                : "../../images/female.svg"
                            : "",
                        power
                    });

                    _my.hideLoading();
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
    onHeartTap: function(evt) {
        let that = this;
        let { favText, heartName, petId, favStatus } = this.data;
        /*favText = favText=='收藏'?'已收藏':'收藏'; 
    heartName = heartName=='like-o'?'like':'like-o'; 
    this.setData({ 
      favText, heartName 
    });*/

        let { userInfo, token } = app.globalData;
        let { id } = userInfo;

        if (!id) {
            _my.showToast({
                title: "请先登录",
                icon: "none"
            });

            _my.navigateTo({
                url: "../user/index"
            });

            return;
        }

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                petId +
                "/actions",
            method: "put",
            header: {
                Authorization: "Bearer " + token,
                "user-id": userInfo.id
            },
            data: {
                action: favStatus == false ? "favorite" : "unfavorite"
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 200) {
                    if (favStatus) {
                        favText = "收藏";
                        heartName = "like-o";
                        favStatus = false;

                        _my.showToast({
                            title: "取消收藏成功"
                        });
                    } else {
                        favText = "已收藏";
                        heartName = "like";
                        favStatus = true;

                        _my.showToast({
                            icon: "none",
                            duration: 3000,
                            title: "收藏成功.可在“我的”-“我的收藏”中查看"
                        });
                    }

                    that.setData({
                        favText,
                        heartName,
                        favStatus
                    });
                }
            }
        });
    },
    onWarningTap: function() {
        this.setData({
            reportShow: true
        });
    },
    onReportInput: function(evt) {
        this.setData({
            reportContent: evt.detail.value
        });
    },
    onReportConfirmTap: function() {
        let that = this;
        let { token, userInfo } = app.globalData;
        let { petId, reportContent } = this.data;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/accusations`,
            method: "POST",
            header: {
                Authorization: `Bearer ${token}`
            },
            data: {
                user_id: userInfo.id,
                accusation_type: "pet",
                target_id: petId,
                content: reportContent
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 201) {
                    _my.showToast({
                        icon: "none",
                        title: "已收到举报，感谢您的关注"
                    });

                    that.setData({
                        reportShow: false
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "好像没举报成功, 再试一下?"
                    });
                }
            }
        });
    },
    onReportCloseTap: function() {
        this.setData({
            reportShow: false
        });
    },
    onIndexTap: function() {
        _my.switchTab({
            url: "/pages/home/index"
        });
    },
    onGetUserInfoTap: function(evt) {
        let { rawData } = evt.detail;

        if (evt.detail.rawData) {
            //授权
            let userData = JSON.parse(rawData);
            let {
                nickName,
                avatarUrl,
                gender,
                country,
                province,
                city
            } = userData;
            new Promise((yes, no) => {
                _my.login({
                    success: res => {
                        if (res.code) {
                            yes(res.code);
                        } else {
                            no();
                        }
                    }
                });
            }).then(
                code => {
                    _my.request({
                        url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                        method: "post",
                        data: {
                            type: "alipay",
                            data: {
                                code,
                                nickName,
                                avatarUrl,
                                gender,
                                location: ""
                            }
                        },
                        success: res => {
                            app.globalData.login = true;
                            app.globalData.userInfo = res.data.info;
                            app.globalData.token = res.data.auth.token;
                            console.log(this);
                            this.setData({
                                supportBtnType: true
                            });
                            this.onSupportTap(evt);
                        }
                    });
                },
                () => {
                    _my.showToast({
                        icon: "none",
                        title: "授权失败, 请重试"
                    });
                }
            );
        } else {
            _my.showToast({
                icon: "none",
                title: "授权失败, 请重试"
            });
        }
    },
    onSupportTap: function(evt) {
        _my.showLoading({
            title: "助力中"
        });

        let { recordid } = this.data;
        let { token, userInfo } = app.globalData;

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                recordid +
                "/empower",
            method: "put",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                user_id: userInfo.id
            },
            success: res => {
                _my.showToast({
                    title: "助力成功"
                });

                _my.hideLoading();

                this.onLoad({
                    id: recordid
                });
            }
        });
    }
});
