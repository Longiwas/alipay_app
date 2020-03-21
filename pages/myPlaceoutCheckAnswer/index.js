const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myPlaceoutCheckAnswer/index"
    }
}); // miniprogram/pages/myPlaceoutCheckAnswer/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let { id, selected } = options;
        let { token, customHeadHeight } = app.globalData;
        this.setData({
            customHeadHeight
        });

        if (!id) {
            _my.showToast({
                icon: "none",
                title: "没有找到这个人的领养答案"
            });
        } else {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" + id,
                method: "get",
                header: {
                    Authorization: "Bearer " + token
                },
                success: res => {
                    if (res.statusCode == 200) {
                        let { qas, applicant, profile } = res.data;
                        let question_list = [],
                            answer_list = [];
                        qas.forEach(qs => {
                            question_list.push(qs.question);
                            answer_list.push(qs.answer);
                        });
                        that.setData({
                            question_list,
                            answer_list,
                            applicant,
                            profile,
                            selected,
                            id
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "没有找到这个人的领养答案"
                        });
                    }
                }
            });
        }
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
    onMobileTap: function(evt) {
        let { profile } = this.data;

        if (profile.adoption_mobile) {
            _my.makePhoneCall({
                phoneNumber: profile.adoption_mobile
            });
        }
    },
    onWxIdTap: function(evt) {
        let { profile } = this.data;

        if (profile.adoption_wxid) {
            _my.setClipboardData({
                data: profile.adoption_wxid,
                success: () => {
                    _my.showToast({
                        icon: "none",
                        title: "微信号已成功复制至剪贴板"
                    });
                }
            });
        }
    },
    onSelectedTap: function(evt) {
        let { id } = this.data;
        let pages = getCurrentPages();
        let prevpages = pages[pages.length - 2];
        prevpages.setData({
            selected: id
        });

        _my.navigateBack({});
    }
});
