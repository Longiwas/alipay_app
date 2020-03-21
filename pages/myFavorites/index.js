const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myFavorites/index"
    }
}); // miniprogram/pages/myFavorites/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app,
        petArray: [],
        itemHeight: parseInt(app.globalData.screenWidth / 2.5),
        fontSize: parseInt(((app.globalData.screenWidth / 2.5 - 32) / 4) * 0.7)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { customHeadHeight } = app.globalData;
        this.setData({
            customHeadHeight
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
        _my.showLoading({
            title: "寻找中"
        });

        let { userInfo, token } = app.globalData;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/favorites`,
            method: "get",
            header: {
                Authorization: "Bearer " + token,
                "user-id": userInfo.id
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 200) {
                    if (res.data == null) {
                        this.setData({
                            petArray: []
                        });
                    } else {
                        res.data.forEach(pet => {
                            let { gender, age, location } = pet;
                            let { cityArray } = app.globalData; //gender

                            if (gender === 1) {
                                pet.genderUrl = "../../images/male.svg";
                            } else if (gender === 2) {
                                pet.genderUrl = "../../images/female.svg";
                            } else {
                                pet.genderUrl = "";
                            } //age

                            pet.year = parseInt(age / 12);
                            pet.month = age % 12; //location

                            let locationArray = location.split(".");

                            if (locationArray.length == 3) {
                                let province = cityArray[locationArray[0]];

                                if (province) {
                                    let city = province.citys[locationArray[1]];

                                    if (city) {
                                        let area = city.areas[locationArray[2]];

                                        if (area) {
                                            pet.locationStr =
                                                province.fullname +
                                                "-" +
                                                city.fullname +
                                                "-" +
                                                area.fullname;
                                        } else {
                                            pet.locationStr =
                                                province.fullname +
                                                "-" +
                                                city.fullname;
                                        }
                                    } else {
                                        pet.locationStr = province.fullname;
                                    }
                                } else {
                                    pet.locationStr = "未知";
                                }
                            } else {
                                pet.locationStr = "未知";
                            }
                        });
                        this.setData({
                            petArray: res.data
                        });
                    }
                } else if (statusCode == 400) {
                    _my.showToast({
                        icon: "none",
                        title: "系统错误"
                    });
                } else if (statusCode == 204) {
                    this.setData({
                        petArray: []
                    });
                }
            },
            fail: function(res) {
                _my.showToast({
                    icon: "none",
                    title: "系统错误"
                });
            },
            complete: () => {
                _my.hideLoading();
            }
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
    onUnFavTap: function(evt) {
        let that = this;
        let { id } = evt.currentTarget.dataset;
        let { token, userInfo } = app.globalData;
        let { favStatus } = this.data;

        _my.showModal({
            title: "确认",
            content: "确定要取消收藏吗?",
            success: res => {
                if (res.confirm) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                            id +
                            "/actions",
                        method: "put",
                        header: {
                            Authorization: "Bearer " + token,
                            "user-id": userInfo.id
                        },
                        data: {
                            action: favStatus == 0 ? "favorite" : "unfavorite"
                        },
                        success: res => {
                            let { statusCode, data } = res;

                            if (statusCode == 200) {
                                that.onShow();
                            } else if (statusCode == 204) {
                                that.onShow();
                            } else if (statusCode == 400) {
                                _my.showToast({
                                    icon: "none",
                                    title: "系统错误!错误信息:" + res.msg
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    onPetTap: function(evt) {
        let { id } = evt.currentTarget.dataset;
        let { userInfo } = app.globalData;
        let { petArray } = this.data;

        _my.showLoading({
            title: "寻找中"
        });

        petArray.forEach(pet => {
            let { status } = pet;

            if (pet.id == id) {
                if (["normal", "contacting"].indexOf(status) > -1) {
                    _my.navigateTo({
                        url: `../adoptionDetail/adoptionDetail?id=${id}`
                    });
                } else {
                    _my.navigateTo({
                        url: `../petComplete/index?id=${id}`
                    });
                }
            }
        });
    },
    onGotoTap: function() {
        _my.switchTab({
            url: "/pages/adoption/adoption"
        });
    }
});
