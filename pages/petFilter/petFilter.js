const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/petFilter/petFilter"
    }
}); // miniprogram/pages/petFilter/petFilter.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        ageEnable: [
            "tags_enable",
            "tags_disable",
            "tags_disable",
            "tags_disable"
        ],
        genderEnable: ["tags_enable", "tags_disable", "tags_disable"],
        statusEnable: [],
        statusAll: "tags_enable",
        tagsArray: [],
        statusAll: false,
        customHeadHeight: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let that = this;
        let { id } = options;
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        let { age, status, gender } = prevpage.data;
        let ageEnable = [
            "tags_disable",
            "tags_disable",
            "tags_disable",
            "tags_disable"
        ];
        ageEnable[age] = "tags_enable";
        let genderEnable = ["tags_disable", "tags_disable", "tags_disable"];
        genderEnable[gender] = "tags_enable";

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/pet-categories",
            method: "get",
            success: res => {
                if (res.statusCode == 200) {
                    let { data } = res;
                    let tagsArray = [];
                    let statusEnable = [];
                    data.forEach(category => {
                        if (category.id == id) {
                            tagsArray = category.options;
                            tagsArray.forEach(tag => {
                                let value = "tags_disable";
                                status.forEach(s => {
                                    if (s.name == tag.name) {
                                        value = "tags_enable";
                                    }
                                });
                                statusEnable.push(value);
                            });
                        }
                    });
                    that.setData({
                        ageEnable,
                        genderEnable,
                        tagsArray,
                        statusEnable,
                        statusAll:
                            status.length > 0 ? "tags_disable" : "tags_enable"
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统错误"
                    });
                }
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

    onConfirmTap() {
        let {
            ageEnable,
            genderEnable,
            statusEnable,
            statusAll,
            tagsArray
        } = this.data;
        let age = ageEnable.indexOf("tags_enable");
        let gender = genderEnable.indexOf("tags_enable");
        let status = [];

        if (statusAll == "tags_disable") {
            statusEnable.forEach((stat, index) => {
                if (stat == "tags_enable") {
                    status.push({
                        name: tagsArray[index].name,
                        value: 1
                    });
                }
            });
        }

        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        prevPage.setData({
            age,
            gender,
            status
        });
        prevPage.onCategoryTap();

        _my.navigateBack({
            delta: 1
        });
    },

    onResetTap() {
        let { tagsArray } = this.data;
        let statusEnable = [];
        tagsArray.forEach(tag => {
            statusEnable.push("tags_disable");
        });
        this.setData({
            ageEnable: [
                "tags_enable",
                "tags_disable",
                "tags_disable",
                "tags_disable"
            ],
            genderEnable: ["tags_enable", "tags_disable", "tags_disable"],
            statusEnable,
            statusAll: "tags_enable"
        });
    },

    onAgeTap: function(evt) {
        let index = evt.target.dataset.index;
        let ageEnable = this.data.ageEnable;

        if (index == 0) {
            this.setData({
                ageEnable: [
                    "tags_enable",
                    "tags_disable",
                    "tags_disable",
                    "tags_disable"
                ]
            });
        } else {
            let ageEnable = [
                "tags_disable",
                "tags_disable",
                "tags_disable",
                "tags_disable"
            ];
            ageEnable[index] = "tags_enable";
            this.setData({
                ageEnable
            });
        }
    },
    onGenderTap: function(evt) {
        let index = evt.target.dataset.index;
        let genderEnable = this.data.genderEnable;

        if (index == 0) {
            this.setData({
                genderEnable: ["tags_enable", "tags_disable", "tags_disable"]
            });
        } else {
            let genderEnable = ["tags_disable", "tags_disable", "tags_disable"];
            genderEnable[index] = "tags_enable";
            this.setData({
                genderEnable
            });
        }
    },
    onAllTap: function() {
        let { statusAll, tagsArray } = this.data;

        if (statusAll == "tags_disable") {
            statusAll = "tags_enable";
            let statusEnable = [];
            tagsArray.forEach(tag => {
                statusEnable.push("tags_disable");
            });
            this.setData({
                statusEnable,
                statusAll
            });
        }
    },
    onStatusTap: function(evt) {
        let index = evt.currentTarget.dataset.index;
        let { statusEnable, statusAll } = this.data;
        let status = statusEnable[index];
        statusEnable[index] =
            status == "tags_enable" ? "tags_disable" : "tags_enable";

        if (statusEnable.indexOf("tags_enable") < 0) {
            statusAll = "tags_enable";
        } else {
            statusAll = "tags_disable";
        }

        this.setData({
            statusEnable,
            statusAll
        });
    }
});
