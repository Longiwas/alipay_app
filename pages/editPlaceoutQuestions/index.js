const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/editPlaceoutQuestions/index"
    }
}); // miniprogram/pages/placeoutQuestions/placeoutQuestions.js

import Toast from "../../dist/toast/toast";
const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        questions: [],
        answers: [],
        selectedQuestion: [],
        textColor: [],
        customQuestions: ["", "", "", "", "", "", "", "", ""],
        customQuestionsSelected: [
            "",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox"
        ],
        customQuestionsAddBtnShow: [
            "",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox",
            "hide_checkbox"
        ],
        app: app
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let that = this;
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];

        _my.showLoading({
            title: "载入中",
            mask: true
        });

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/question-template",
            method: "get",
            success: res => {
                let textColor = [];
                let selectedQuestion = [];
                res.data.forEach(() => {
                    textColor.push("unchecked");
                });
                let customQuestions = [];
                let customQuestionsSelectedIndex = 0;
                let customQuestionsSelected = [
                    "",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox"
                ];
                let customQuestionsAddBtnShow = [
                    "",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox",
                    "hide_checkbox"
                ];
                let { questions } = prevpage.data;
                questions.forEach(question => {
                    let index = res.data.indexOf(question);

                    if (index < 0) {
                        customQuestions.push(question);
                        customQuestionsSelected[customQuestionsSelectedIndex] =
                            "";
                        customQuestionsSelectedIndex++;
                    } else {
                        textColor[index] = "";
                        selectedQuestion.push(index.toString());
                    }
                });
                let questions_index = customQuestions.length;

                for (var i = 0; i < 9 - questions_index; i++) {
                    customQuestions.push("");
                }

                customQuestionsAddBtnShow[customQuestionsSelectedIndex] = "";
                that.setData({
                    questions: res.data,
                    selectedQuestion,
                    customQuestions,
                    customQuestionsSelected,
                    customQuestionsAddBtnShow,
                    textColor
                });

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
    onShareAppMessage: function() {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    onChange: function(evt) {
        let textColor = [];
        this.data.questions.forEach(() => {
            textColor.push("unchecked");
        });
        let checkedArr = evt.detail;
        checkedArr.forEach(value => {
            let num = parseInt(value);
            textColor[num] = "checked";
        });
        this.setData({
            selectedQuestion: evt.detail,
            textColor
        });
    },
    //(selectedTypeId, nickName, locationValue, age, selectedGender, storyValue, status, askedQuestions, phoneNumber, wxId, id)
    onUploadInfo: (
        selectedTypeId,
        nickName,
        locationValue,
        age,
        selectedGender,
        story,
        status,
        questions,
        phoneNumber,
        wxId,
        id,
        resources,
        conditions
    ) => {
        let { userInfo, token } = app.globalData;
        let gender = selectedGender.indexOf("selectedType");
        let options = {};
        let selectedOptions = {};

        if (status[selectedTypeId]) {
            selectedOptions = status[selectedTypeId];
        }

        if (selectedOptions) {
            Object.keys(selectedOptions).forEach(key => {
                if (selectedOptions[key]) {
                    let value = selectedOptions[key].indexOf("selectedType");
                    options[key] = value;
                }
            });
        }

        let newResources = [];
        resources.forEach(item => {
            newResources.push(item.id);
        });
        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + id,
                method: "PUT",
                header: {
                    Authorization: "Bearer " + token
                },
                data: {
                    uid: userInfo.id,
                    category_id: selectedTypeId,
                    name: nickName,
                    cover: 1,
                    location: locationValue.join("."),
                    age: age,
                    gender: gender >= 0 ? gender : 0,
                    story,
                    options,
                    questions,
                    resources: newResources,
                    profile: {
                        mobile: phoneNumber,
                        wechat_id: wxId
                    },
                    conditions: conditions.length <= 0 ? null : conditions
                },
                success: res => {
                    yes({
                        statusCode: res.statusCode,
                        id: res.data.id
                    });
                },
                fail: () => {
                    no();
                }
            });
        });
    },
    onUploadFile: function(id, url, index, count, token) {
        return new Promise((yes, no) => {
            _my.uploadFile({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                    id +
                    "/resources",
                filePath: url,
                name: "img" + index,
                header: {
                    Authorization: "Bearer " + token
                },
                success: res => {
                    let { statusCode } = res;
                    yes(statusCode);
                },
                fail: e => {
                    no(e);
                }
            });
        });
    },
    onConfirmTap: function(evt) {
        _my.showLoading({
            mask: true,
            title: "上传数据中"
        });

        let { timeout_handler } = this.data;
        clearTimeout(timeout_handler);
        let handler = setTimeout(() => {
            this.confirmTap(evt);
        }, 2000);
        this.setData({
            timeout_handler: handler
        });
        /**/
    },
    confirmTap: async function(evt) {
        let that = this;
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        let askedQuestions = [];
        let {
            id,
            nickName,
            year,
            month,
            video,
            localImageArray,
            remoteImageArray,
            selectedGender,
            selectedTypeId,
            status,
            storyValue,
            phoneNumber,
            locationValue,
            wxId,
            conditions_selected,
            conditions_template
        } = prevpage.data;
        let {
            customQuestions,
            customQuestionsSelected,
            selectedQuestion,
            questions
        } = this.data;
        let token = app.globalData.token;
        let age = parseInt(year) * 12 + parseInt(month);
        selectedQuestion.forEach(item => {
            let index = parseInt(item);
            askedQuestions.push(questions[index]);
        });
        customQuestionsSelected.forEach((item, index) => {
            if (item == "" && customQuestions[index]) {
                askedQuestions.push(customQuestions[index]);
            }
        });
        let conditions_values = [];
        conditions_selected.forEach((item, index) => {
            if (item) {
                let value = conditions_template[index];

                if (value) {
                    conditions_values.push(value);
                }
            }
        });

        try {
            let idReturn = await this.onUploadInfo(
                selectedTypeId,
                nickName,
                locationValue,
                age,
                selectedGender,
                storyValue,
                status,
                askedQuestions,
                phoneNumber,
                wxId,
                id,
                remoteImageArray,
                conditions_values
            );

            if (idReturn.statusCode === 422) {
                _my.showModal({
                    title: "提交失败",
                    content: `您所输入的宠物资料有违规内容, 请修改后再提交`,
                    showCancel: false
                });

                _my.hideLoading();

                return;
            }

            let length = localImageArray.length;

            for (let index = 0; index < length; index++) {
                let item = localImageArray[index];

                _my.showLoading({
                    mask: true,
                    title: `上传文件中(${index + 1}/${length})`
                });

                let statusCode = await that.onUploadFile(
                    id,
                    item,
                    index,
                    localImageArray.length,
                    token
                );

                if (statusCode === 422) {
                    _my.showModal({
                        title: "提交失败",
                        content: `您所选择的图片${index +
                            1}有违规内容, 请修改后再提交`,
                        showCancel: false
                    });

                    _my.hideLoading();

                    return;
                }
            }

            _my.hideLoading({
                success: () => {
                    _my.reLaunch({
                        url: "../placeoutComplete/placeoutComplete"
                    });
                }
            });
        } catch (e) {
            if (e.statusCode) {
                let { statusCode, location, image_index } = e;

                if (statusCode === 422) {
                    _my.showModal({
                        title: "提交失败",
                        content:
                            location == "info"
                                ? "您所输入的宠物资料有违规内容, 请修改后再提交"
                                : `您所选择的图片${image_index +
                                      1}有违规内容, 请修改后再提交`,
                        showCancel: false
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "系统繁忙, 请稍后重试"
                    });
                }
            } else {
                _my.showToast({
                    icon: "none",
                    title: "系统繁忙, 请稍后重试"
                });

                console.error(e);
            }
        }
    },
    onCustomQuestionInput: function(evt) {
        let { index } = evt.currentTarget.dataset;
        let { value } = evt.detail;
        let { customQuestions } = this.data;
        customQuestions[index] = value;
        this.setData({
            customQuestions
        });
    },
    onCustomChange: function(evt) {
        let that = this;
        let index = evt.currentTarget.dataset.index;
        let {
            customQuestions,
            customQuestionsSelected,
            customQuestionsAddBtnShow
        } = this.data;

        if (customQuestionsSelected[1] == "hide_checkbox") {
            _my.showModal({
                title: "提示",
                content: "确认清空自定义问题内容?",
                success: confirm => {
                    if (confirm) {
                        that.setData({
                            customQuestions: [""]
                        });
                    }
                }
            });
        } else {
            _my.showModal({
                title: "提示",
                content: "确认删除这条自定义问题?",
                success: confirm => {
                    if (confirm) {
                        customQuestions.splice(index, 1);
                        customQuestions.push("");
                        customQuestionsSelected.splice(index, 1);
                        customQuestionsSelected.push("hide_checkbox");
                        customQuestionsAddBtnShow = [
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox",
                            "hide_checkbox"
                        ];
                        customQuestionsAddBtnShow[
                            customQuestionsSelected.indexOf("hide_checkbox") - 1
                        ] = "";
                        that.setData({
                            customQuestions,
                            customQuestionsSelected,
                            customQuestionsAddBtnShow
                        });
                    }
                }
            });
        }
    },
    onAddTap: function(evt) {
        let { index } = evt.currentTarget.dataset;
        let { customQuestionsSelected, customQuestionsAddBtnShow } = this.data;

        if (index < 7 && index >= 0) {
            customQuestionsSelected[index + 1] = "";
            customQuestionsAddBtnShow = [
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox"
            ];
            customQuestionsAddBtnShow[index + 1] = "";
            this.setData({
                customQuestionsSelected,
                customQuestionsAddBtnShow
            });
            Toast({
                message: "您还可以添加" + (7 - index) + "个自定义问题",
                duration: 1500
            });
        } else if (index == 7) {
            customQuestionsSelected[index + 1] = "";
            customQuestionsAddBtnShow = [
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox",
                "hide_checkbox"
            ];
            this.setData({
                customQuestionsSelected,
                customQuestionsAddBtnShow
            });
        }
    }
});
