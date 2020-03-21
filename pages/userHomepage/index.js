const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/userHomepage/index"
    }
}); // miniprogram/pages/userHomepage/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        genderUrl: "",
        locationStr: "",
        refresh: true,
        next: "",
        petArray: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { userInfo, customHeadHeight, login, token } = app.globalData;
        let { refresh, next } = this.data;
        let genderUrl = "";
        if (userInfo.gender === 1) genderUrl = "../../images/male.svg";
        else if (userInfo.gender === 2) genderUrl = "../../images/female.svg";
        this.setData({
            customHeadHeight,
            login,
            userInfo,
            genderUrl,
            locationStr: app.location2String(userInfo.location)
        });

        _my.showLoading({
            title: "寻找中"
        });

        let url = "";
        if (refresh)
            url = `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/pets`;
        else url = "https://api.woyuanyi.511cwpt.com" + next;

        _my.request({
            url: url,
            method: "get",
            data: {
                status: "normal"
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                _my.stopPullDownRefresh();

                if (res.statusCode === 200) {
                    let next = res.header.Next;

                    if (next) {
                        this.setData({
                            next
                        });
                    }

                    (res.data || []).forEach(pet => {
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

                        pet.locationStr = app.location2String(pet.location);
                    });
                    this.setData({
                        petArray: res.data
                    });
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
    onPetTap: function(evt) {
        let { id } = evt.target.dataset;

        _my.navigateTo({
            url: "../adoptionDetail/adoptionDetail?id=" + id
        });
    },
    onPosterTap: function(evt) {
        let { userInfo, city_code } = app.globalData;
        let locationStr = "";

        if (city_code.substring(4) == "00") {
            locationStr = city_code.substring(0, 2) + "0000." + city_code;
        } else {
            locationStr =
                city_code.substring(0, 2) +
                "0000." +
                city_code.substring(0, 4) +
                "00." +
                city_code;
        }

        _my.showLoading({
            title: "生成中"
        });

        _my.getImageInfo({
            src: `https://api.woyuanyi.511cwpt.com/api/v1/users/${userInfo.id}/poster?location=${locationStr}`,
            success: res => {
                _my.previewImage({
                    urls: [res.path]
                });
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    }
});
