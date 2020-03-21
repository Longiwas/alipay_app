const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionAnswers/adoptionAnswers"
    }
}); // miniprogram/pages/adoptionAnswers/adoptionAnswers.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app,
        userid: 1,
        questions: [],
        name: "",
        cover: "",
        answers: [],
        phone: "",
        answer_one: {},
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
        let { id, status } = options;
        let { token } = app.globalData;

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                id +
                "/adoptions",
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                if (res.statusCode == 200) {
                    if (res.data.length > 0) {
                        let data = res.data[0];

                        _my.request({
                            url:
                                "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                                data.id,
                            method: "GET",
                            header: {
                                Authorization: "Bearer " + token
                            },
                            success: res2 => {
                                if (res2.statusCode == 200) {
                                    let { qas } = res2.data;
                                    let question_list = [],
                                        answer_list = [];
                                    qas.forEach(qs => {
                                        question_list.push(qs.question);
                                        answer_list.push(qs.answer);
                                    });
                                    that.setData({
                                        question_list,
                                        answer_list,
                                        answer_one: res2.data,
                                        answer_show: true
                                    });
                                }
                            }
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "无领养数据"
                        });
                    }
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
    onMobileTap: function(evt) {
        let { answer_one } = this.data;

        if (answer_one.profile.adoption_mobile) {
            _my.makePhoneCall({
                phoneNumber: answer_one.profile.adoption_mobile
            });
        }
    },
    onWxIdTap: function(evt) {
        let { answer_one } = this.data;

        if (answer_one.profile.adoption_wxid) {
            _my.setClipboardData({
                data: answer_one.profile.adoption_wxid,
                success: () => {
                    _my.showToast({
                        icon: "none",
                        title: "微信号已成功复制至剪贴板"
                    });
                }
            });
        }
    }
});
