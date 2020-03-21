const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoption/adoption"
    }
}); // pages/adoption/adoption.js

const app = getApp();
var timeoutHandler = true;

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        selected: ["selected", "", "", ""],
        activate: ["", "deactivate", "deactivate"],
        categories: [],
        currentId: "",
        currentNext: "",
        currentLocationId: "",
        show: [true, true, true],
        bottomshow: [false, false, false],
        age: 0,
        gender: 0,
        status: [],
        options: [],
        subscribed: true,
        city: "",
        location: "获取中",
        showSubBtn: false,
        subscribeInfoShow: false,
        template_show: false,
        templateStatus: false,
        templateIds: ["gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw"]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        app.globalData.initPromise.then(promiseData => {
            let { login, userInfo, token, customHeadHeight } = promiseData;

            if (app.globalData.login) {
                login = app.globalData.login;
                userInfo = app.globalData.userInfo;
                token = app.globalData.token;
            }

            this.setData({
                customHeadHeight,
                location: app.globalData.city
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

                _my.request({
                    url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/config`,
                    method: "GET",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    success: resdata => {
                        let { statusCode, data } = resdata;

                        if (statusCode == 200) {
                            if (data.city_code == "100000") {
                                this.setData({
                                    subscribed: true
                                });
                            } else if (
                                data.notify_switch &&
                                data.notify_location ==
                                    app.globalData.city_code.substring(0, 4) +
                                        "00"
                            ) {
                                this.setData({
                                    subscribed: true
                                });
                            } else {
                                this.setData({
                                    subscribed: false
                                });
                            }
                        } else {
                            this.setData({
                                subscribed: true
                            });
                        }
                    }
                });
            }

            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pet-categories",
                method: "get",
                success: res => {
                    let selected = [],
                        activate = [],
                        currentId = "";
                    /*res.data.sort((a, b) => {
            if (a.id > b.id) return 1;
            else if (a.id < b.id) return -1;
            else return 0;
          });*/

                    if (res.data.length > 0) {
                        selected = ["selected"];
                        activate = [""];
                        currentId = res.data[0].id;

                        for (var i = 1; i < res.data.length; i++) {
                            selected.push("");
                            activate.push("deactivate");
                        }
                    }

                    this.setData({
                        categories: res.data,
                        selected,
                        activate,
                        currentId,
                        currentLocationId: promiseData.city_code
                    });
                    this.onCategoryTap();
                }
            });

            this.setData({
                city: app.globalData.selectedCity
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
        let { userInfo, token } = app.globalData;

        if (
            this.data.currentId &&
            app.globalData.city_code != this.data.currentLocationId
        ) {
            this.onCategoryTap();
            this.setData({
                currentLocationId: app.globalData.city_code,
                location: app.globalData.city
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
                        if (app.globalData.city_code == "100000") {
                            this.setData({
                                subscribed: true
                            });
                        } else if (
                            data.notify_switch &&
                            data.notify_location ==
                                app.globalData.city_code.substring(0, 4) + "00"
                        ) {
                            this.setData({
                                subscribed: true
                            });
                        } else {
                            this.setData({
                                subscribed: false
                            });
                        }
                    } else {
                        this.setData({
                            subscribed: true
                        });
                    }
                }
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
    onShareAppMessage: function() {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    onPageScroll: function({ scrollTop }) {},
    onReachBottom: function() {
        let selectedindex = 0;
        this.data.selected.forEach((select, index) => {
            if (select == "selected") selectedindex = index;
        });
        this.onCategoryLoad();
    },
    onPetTap: function(evt) {
        let id = evt.currentTarget.dataset.id;
        let { petArray } = this.data;
        let { userInfo, login } = app.globalData;

        _my.navigateTo({
            url: "../adoptionDetail/adoptionDetail?id=" + id
        });
    },
    onTabTap: function(evt) {
        let that = this;

        _my.showLoading({
            title: "寻找中"
        });

        let { id, index } = evt.target.dataset;
        let selected = ["", "", ""];
        let activate = ["deactivate", "deactivate", "deactivate"];
        selected[index] = "selected";
        activate[index] = "";
        that.setData({
            selected,
            activate,
            currentId: id
        });
        that.onCategoryTap();

        _my.pageScrollTo({
            scrollTop: 0,
            duration: 150,
            success: () => {}
        });
    },
    onLocationChange: function() {
        let { userInfo, token } = app.globalData;
        this.onCategoryTap();
        this.setData({
            city: app.globalData.selectedCity,
            location: app.globalData.city
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
                    if (app.globalData.city_code == "100000") {
                        this.setData({
                            subscribed: true
                        });
                    } else if (
                        data.notify_switch &&
                        data.notify_location ==
                            app.globalData.city_code.substring(0, 4) + "00"
                    ) {
                        this.setData({
                            subscribed: true
                        });
                    } else {
                        this.setData({
                            subscribed: false
                        });
                    }
                } else {
                    this.setData({
                        subscribed: true
                    });
                }
            }
        });
    },
    petLoad: function(isNext, success, fail) {
        var that = this;
        let { currentId, currentNext, age, gender, status } = this.data;

        _my.showLoading({
            title: "寻找中"
        });

        let { login, userInfo } = app.globalData;
        let url = "https://api.woyuanyi.511cwpt.com/api/v1/pets";
        let params = {
            category_id: currentId,
            location: app.globalData.city_code
        };

        if (isNext) {
            url = currentNext;
            params = {};
        } else {
            if (age > 0) {
                if (age == 1) {
                    params.age_min = 0;
                    params.age_max = 11;
                } else if (age == 2) {
                    params.age_min = 12;
                    params.age_max = 95;
                } else if (age == 3) {
                    params.age_min = 96;
                }
            }

            if (gender > 0) params.gender = gender;

            if (status.length > 0) {
                status.forEach(s => {
                    params[s.name] = s.value;
                });
            }
        }

        _my.request({
            url: url,
            method: "get",
            data: params,
            success: res => {
                if (res.statusCode === 200) {
                    let next = res.header.Next;
                    let { userInfo } = app.globalData;
                    let { cityArray } = app.globalData;
                    res.data.forEach(banner => {
                        let { age, gender, location } = banner;

                        if (gender === 1) {
                            banner.genderUrl = "../../images/male.svg";
                        } else if (gender === 2) {
                            banner.genderUrl = "../../images/female.svg";
                        } else {
                            banner.genderUrl = "";
                        }

                        banner.year = parseInt(age / 12);
                        banner.month = age % 12;

                        if (userInfo) {
                            let { id } = userInfo;

                            if (id) {
                                if (banner.user_id == id) {
                                    banner.placeout = true;
                                } else {
                                    banner.placeout = false;
                                }
                            } else {
                                banner.placeout = false;
                            }
                        } else {
                            banner.placeout = false;
                        } //location

                        let locationArray = location.split(".");

                        if (locationArray.length == 3) {
                            let province = cityArray[locationArray[0]];

                            if (province) {
                                let city = province.citys[locationArray[1]];

                                if (city) {
                                    let area = city.areas[locationArray[2]];

                                    if (area) {
                                        banner.locationStr =
                                            province.fullname +
                                            "-" +
                                            city.fullname +
                                            "-" +
                                            area.fullname;
                                    } else {
                                        banner.locationStr =
                                            province.fullname +
                                            "-" +
                                            city.fullname;
                                    }
                                } else {
                                    banner.locationStr = province.fullname;
                                }
                            } else {
                                banner.locationStr = "未知";
                            }
                        } else {
                            banner.locationStr = "未知";
                        }
                    });
                    that.setData({
                        currentNext: next
                    });
                    success(res.data);
                } else {
                    fail(res);
                }
            },
            fail: function(res) {
                _my.showToast({
                    title: "系统错误"
                });
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },
    onCategoryTap: function() {
        var that = this;
        let show = this.data.show;
        show[0] = false;
        this.petLoad(
            false,
            data => {
                that.setData({
                    petArray: data,
                    show
                });
            },
            res => {
                that.setData({
                    petArray: []
                });
            }
        );
    },
    onCategoryLoad: function() {
        var that = this;
        let petArray = this.data.petArray;
        this.petLoad(
            true,
            data => {
                that.setData({
                    petArray: [...petArray, ...data]
                });
            },
            res => {}
        );
    },
    onFilterTap: function() {
        let that = this;
        let { currentId } = this.data;

        _my.navigateTo({
            url: "../petFilter/petFilter?id=" + currentId
        });
    },
    onScrollTop: function() {
        _my.pageScrollTo({
            scrollTop: 0
        });
    },
    onLocationSubscribeTap: function() {
        let { userInfo, token } = app.globalData;
        let { showSubBtn, templateIds } = this.data; //打开订阅消息说明

        this.setData({
            template_show: true
        });
    },
    commit: function() {
        let { userInfo, token, submsg_handler } = app.globalData;
        let { showSubBtn } = this.data;

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
                notify_switch: true,
                notify_location: app.globalData.city_code.substring(0, 4) + "00"
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
                    title: "订阅成功"
                });

                this.setData({
                    subscribed: true
                });
            },
            complete: () => {
                _my.hideLoading();
            }
        });

        if (showSubBtn) {
            this.setData({
                subscribeInfoShow: true
            });
        }
    },
    onSubscribeCancelTap: function() {
        this.setData({
            subscribed: true
        });
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
    },
    onNoPetTap: function() {
        _my.setClipboardData({
            data: "Wyyqppcds"
        });
    }
});
