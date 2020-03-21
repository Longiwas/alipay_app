const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionAgre/adoptionAgre"
    }
}); // pages/adoptionAgre/adoptionAgre.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        petId: "",
        adoptionId: "",
        options: [],
        signed: false,
        signButtonClass: "sign_disable",
        signedStatus: true,
        adoptionName: "",
        adoptionPhone: "",
        placeoutName: "",
        placeoutPhone: "",
        signName: "",
        signPhone: "",
        userId: "",
        applicantId: "",
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
        let { id, pet_id } = options;
        let { cityArray, token, userInfo } = app.globalData;

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + pet_id,
            method: "get",
            success: res => {
                let data = res.data;
                let genderUrl = "";

                if (data.gender === 1) {
                    genderUrl = "../../images/male.svg";
                } else if (data.gender === 2) {
                    genderUrl = "../../images/female.svg";
                } //location

                let locationArray = data.location.split(".");

                if (locationArray.length == 3) {
                    let province = cityArray[locationArray[0]];

                    if (province) {
                        let city = province.citys[locationArray[1]];

                        if (city) {
                            let area = city.areas[locationArray[2]];

                            if (area) {
                                data.locationStr =
                                    province.fullname +
                                    "-" +
                                    city.fullname +
                                    "-" +
                                    area.fullname;
                            } else {
                                data.locationStr =
                                    province.fullname + "-" + city.fullname;
                            }
                        } else {
                            data.locationStr = province.fullname;
                        }
                    } else {
                        data.locationStr = "未知";
                    }
                } else {
                    data.locationStr = "未知";
                }

                this.setData({
                    adoptionId: id,
                    petId: pet_id,
                    petAge: data.age,
                    petName: data.name,
                    genderUrl: genderUrl,
                    petCover: data.cover,
                    petLocation: data.locationStr,
                    options: data.options,
                    status: data.status,
                    userId: data.user_id,
                    year: parseInt(data.age / 12),
                    month: data.age % 12
                });

                _my.request({
                    url: `https://api.woyuanyi.511cwpt.com/api/v1/adoptions/${id}/contract-notifications`,
                    method: "GET",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: res => {
                        let { statusCode } = res;

                        if (statusCode == 200) {
                            this.setData({
                                signButtonClass: "sign"
                            });
                        }
                    },
                    complete: () => {
                        _my.hideLoading();
                    }
                });

                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                        id,
                    method: "GET",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: res2 => {
                        if (res2.statusCode == 200) {
                            let { applicant, profile } = res2.data;
                            let signedStatus = false;

                            if (
                                data.user_id == userInfo.id &&
                                (profile || {}).placeoutName
                            ) {
                                signedStatus = true;
                            }

                            if (
                                applicant.id == userInfo.id &&
                                (profile || {}).adoptionName
                            ) {
                                signedStatus = true;
                            }

                            if (profile && profile.signData) {
                                let signDateObj = new Date(profile.signData);
                                profile.signYear = signDateObj.getFullYear();
                                profile.signMonth = signDateObj.getMonth() + 1;
                                profile.signDate = signDateObj.getDate();
                            }

                            this.setData({
                                applicantId: applicant.id,
                                ...profile,
                                signedStatus
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
    onSignTap: function() {
        this.setData({
            failedReasonShow: true
        });
    },
    onSignedTap: function() {
        let { adoptionId, signButtonClass } = this.data;
        let { token } = app.globalData;

        if (signButtonClass == "sign_disable") {
            _my.showToast({
                icon: "none",
                title: "提醒每24小时只能发送一次,请一天后再次尝试发送"
            });

            return;
        }

        _my.showLoading({
            title: "发送中"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/adoptions/${adoptionId}/contract-notifications`,
            method: "PUT",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 200) {
                    _my.showToast({
                        title: "提醒发送成功,请等待对方签署协议"
                    });

                    this.setData({
                        signButtonClass: "sign_disable"
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "提醒每24小时只能发送一次,请一天后再次尝试发送"
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },
    onFailedClose: function() {
        this.setData({
            failedReasonShow: false
        });
    },
    onNickNameInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            signName: value
        });
    },
    onPhoneInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            signPhone: value
        });
    },
    onSignConfirmTap: function(evt) {
        let { userInfo } = app.globalData;
        let { userId, signName, signPhone } = this.data;

        if (!signName) {
            _my.showToast({
                icon: "none",
                title: "请输入姓名"
            });

            return;
        }

        if (!signPhone) {
            _my.showToast({
                icon: "none",
                title: "请输入手机号码"
            });

            return;
        }

        if (userInfo.id == userId) {
            this.setData({
                placeoutName: signName,
                placeoutPhone: signPhone,
                signed: true
            });
            this.onFailedClose();
        } else {
            this.setData({
                adoptionName: signName,
                adoptionPhone: signPhone,
                signed: true
            });
            this.onFailedClose();
        }
    },
    onConfirmTap: function(evt) {
        _my.showModal({
            title: "确定",
            content: "确定后不可修改, 确定么?",
            success: () => {
                this.setData({
                    template_show: true
                });
            }
        });
    },
    commit: function(result) {
        let { token, userInfo } = app.globalData;
        let { userId, signName, signPhone, petId, adoptionId } = this.data;
        let profile = {
            signData: new Date()
        };

        if (userInfo.id == userId) {
            profile = {
                ...profile,
                placeoutName: signName,
                placeoutPhone: signPhone
            };
        } else {
            profile = {
                ...profile,
                adoptionName: signName,
                adoptionPhone: signPhone
            };
        }

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                adoptionId,
            method: "PUT",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                profile
            },
            success: res => {
                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                        adoptionId +
                        "/action",
                    method: "PUT",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    data: {
                        action: "confirm"
                    },
                    success: res => {
                        let pages = getCurrentPages();
                        let prevpage = pages[pages.length - 2];
                        prevpage.onCatTap();

                        _my.showToast({
                            title: "签署协议成功!"
                        });

                        this.onLoad({
                            id: this.data.adoptionId,
                            pet_id: this.data.petId
                        });
                    }
                });
            }
        });
    }
});
