const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionAnswerQuestion/adoptionAnswerQuestion"
    }
}); // miniprogram/pages/adoptionAnswerQuestion/adoptionAnswerQuestion.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app: app,
        petCover: "",
        questions: [],
        answers: [],
        locationStr: "",
        phone: "",
        wxid: "",
        timeout_handler: 0,
        customHeadHeight: 0,
        answers_status: [],
        wxid_status: true,
        submitBtn_disabled: false,
        templateIds: ["gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw"]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        let { petCover, questions, petId, locationStr } = prevpage.data;
        let answers_status = [];
        questions.forEach(() => {
            answers_status.push(true);
        });
        this.setData({
            petId,
            petCover,
            questions,
            locationStr,
            answers_status
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
    onInputChange: function(evt) {
        let index = evt.target.dataset.index;
        let { value } = evt.detail;
        let { answers, timeout_handler } = this.data;
        answers[index] = value;
        clearTimeout(timeout_handler);
        timeout_handler = setTimeout(() => {
            this.checkAnswer(value, index);
        }, 300);
        this.setData({
            answers,
            timeout_handler
        });
    },
    checkAnswer: function(answer, index) {
        let { answers_status } = this.data;
        this.setData(
            {
                submitBtn_disabled: true
            },
            () => {
                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/wechat-security-check",
                    method: "PUT",
                    data: [answer],
                    success: res => {
                        let { statusCode } = res;

                        if (statusCode == 200) {
                            answers_status[index] = true;
                        } else {
                            answers_status[index] = false;
                        }

                        this.setData({
                            answers_status,
                            submitBtn_disabled: false
                        });
                    }
                });
            }
        );
    },
    onContinueTap: function() {
        this.setData({
            failedReasonShow: true
        });
    },
    onPhoneInput: function(evt) {
        this.setData({
            phone: evt.detail.value
        });
    },
    onWxIdInput: function(evt) {
        this.setData({
            wxid: evt.detail.value
        });
    },
    onFailedClose: function() {
        this.setData({
            failedReasonShow: false
        });
    },
    onConfirmTap: async function(evt) {
        let { formId } = evt.detail;
        let {
            petId,
            answers,
            phone,
            wxid,
            answers_status,
            questions,
            locationStr,
            templateIds
        } = this.data;
        let qas = [];

        if (phone.length < 11) {
            _my.showToast({
                icon: "none",
                title: "请输入正确的手机号"
            });

            return;
        }

        if (answers.length <= 0) {
            _my.showToast({
                icon: "none",
                title: "请输入答案"
            });

            return;
        }

        let num = 0;
        let checked = questions.every((question, index) => {
            let answer = answers[index];

            if (answer) {
                return true;
            } else {
                num = index;
                return false;
            }
        });

        if (!checked) {
            _my.showToast({
                icon: "none",
                title: `请填写问题${num + 1}的答案`
            });

            return;
        }

        let falseIndex = answers_status.indexOf(false);

        if (falseIndex > -1) {
            _my.showModal({
                title: "答案不规范",
                content: `请修改第${falseIndex + 1}条问题的答案.`
            });

            return;
        }

        this.setData({
            template_show: true
        });
    },
    onAuthorizeComplete: function(result) {
        this.submitAdoption();
    },
    submitAdoption: function() {
        _my.showLoading({
            title: "寻找中"
        });

        let {
            petId,
            answers,
            phone,
            wxid,
            answers_status,
            questions,
            locationStr
        } = this.data;
        let { userInfo, token } = app.globalData;
        let qas = [];
        questions.forEach((question, index) => {
            qas.push({
                question,
                answer: answers[index]
            });
        });

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/adoptions",
            method: "POST",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                pet_id: petId,
                user_id: userInfo.id,
                qas,
                profile: {
                    adoption_mobile: phone,
                    adoption_wxid: wxid
                }
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 201) {
                    let { id, cover } = res.data;

                    _my.navigateTo({
                        url: `../adoptionComplete/adoptionComplete?id=${id}&image=${cover}&locationStr=${locationStr}`
                    });
                } else if (statusCode === 422) {
                    _my.showModal({
                        title: "提交失败",
                        content: "您的答案不符合规范,请重新填写",
                        showCancel: false
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统错误,领养失败,请重试"
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    }
});
