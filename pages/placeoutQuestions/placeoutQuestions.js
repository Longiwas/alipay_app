const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/placeoutQuestions/placeoutQuestions"
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
        disabledQuestion: [],
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
        app: app,
        customHeadHeight: 0,
        timeout_handler: 0,
        template_show: false,
        templateStatus: false,
        templateIds: [
            "4Rs11-eFAc-WdEfCNWUrz5t32fbzG2d_jrvki6W83VM",
            "CkM-XwOcFsjV4dpmEp0JKshhshJzKmJLj5JRm1a3s-8",
            "tOCM2iAedX3UKPAlMZ_r2JwoVVfCs3Qf151YeVQEKdY"
        ]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    getQuestionTemplates: function() {
        return new Promise((yes, no) => {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/question-template",
                method: "get",
                success: res => {
                    let { statusCode, data } = res;
                    if (statusCode === 200) yes(data);
                    else yes(false);
                }
            });
        });
    },
    onLoad: async function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
        let that = this;

        _my.showLoading({
            title: "载入中",
            mask: true
        });

        try {
            let questions = await this.getQuestionTemplates();
            let i = 1;

            while (questions == false) {
                _my.showLoading({
                    title: `获取问题模板失败, 请稍等(${i})...`
                });

                questions = await this.getQuestionTemplates();
                await new Promise(yes => {
                    setTimeout(() => {
                        yes();
                    }, 3000);
                });
            }

            let textColor = [];
            let selectedQuestion = [];
            questions.forEach(() => {
                textColor.push("unchecked");
            });

            if (questions.length > 4) {
                textColor[0] = "checked";
                textColor[1] = "checked";
                textColor[2] = "checked";
                textColor[3] = "checked";
                selectedQuestion = ["0", "1", "2", "3"];
            } else {
                questions.forEach((item, index) => {
                    textColor[index] = "checked";
                    selectedQuestion.push(index.toString());
                });
            }

            that.setData({
                questions: questions,
                selectedQuestion,
                textColor
            });
            let { templateIds } = this.data;
            let templateStatus = await app.getAuthorizeTemplatesStatus(
                templateIds
            );
            this.setData({
                templateStatus: templateStatus.length == templateIds.length
            });

            _my.hideLoading();

            let storageData = _my.getStorageSync("placeoutQuestions");

            if (storageData) {
                _my.showModal({
                    title: "确认",
                    content: "之前有一份草稿未保存, 需要使用么?",
                    success: result => {
                        if (result.confirm) {
                            this.setData({ ...storageData });

                            _my.removeStorage({
                                key: "placeoutQuestions"
                            });
                        }
                    }
                });
            }
        } catch (e) {}
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
    onUnload: function() {
        try {
            let {
                customQuestions,
                customQuestionsSelected,
                selectedQuestion,
                textColor
            } = this.data;
            let isCustomQuestionsExist = true;
            isCustomQuestionsExist = customQuestionsSelected.every(
                (item, index) => {
                    if (item == "" && customQuestions[index]) return false;
                    else return true;
                }
            );

            if (selectedQuestion.length > 0 || !isCustomQuestionsExist) {
                _my.setStorage({
                    key: "placeoutQuestions",
                    data: {
                        customQuestions,
                        customQuestionsSelected,
                        selectedQuestion,
                        textColor
                    }
                });
            }
        } catch (e) {}
    },

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
        conditions_values
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

        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets",
                method: "POST",
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
                    profile: {
                        mobile: phoneNumber,
                        wechat_id: wxId
                    },
                    conditions:
                        conditions_values.length <= 0 ? null : conditions_values
                },
                success: res => {
                    yes({
                        statusCode: res.statusCode,
                        id: res.data.id
                    });
                },
                fail: e => {
                    no(e);
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
        this.setData({
            template_show: true
        });
    },
    confirmTap: async function(evt) {
        //let { formId } = evt.detail;
        let that = this;
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];
        let askedQuestions = [];
        let {
            nickName,
            year,
            month,
            video,
            imageArray,
            selectedGender,
            selectedTypeId,
            status,
            story,
            phoneNumber,
            locationValue,
            wxId,
            conditions,
            conditions_selected
        } = prevpage.data;
        let {
            customQuestions,
            customQuestionsSelected,
            selectedQuestion,
            questions
        } = this.data;
        let token = app.globalData.token;
        let age = parseInt(year) * 12 + parseInt(month);

        try {
            _my.showLoading({
                mask: true,
                title: "上传数据中"
            });

            selectedQuestion.forEach(item => {
                let index = parseInt(item);
                askedQuestions.push(questions[index]);
            });
            customQuestionsSelected.forEach((item, index) => {
                if (item == "" && customQuestions[index]) {
                    askedQuestions.push(customQuestions[index]);
                }
            });

            if (askedQuestions.length < 3) {
                _my.hideLoading();

                _my.showToast({
                    icon: "none",
                    title: "请选择至少3条问题"
                });

                return;
            }

            let conditions_values = [];
            conditions_selected.forEach((item, index) => {
                if (item) {
                    let value = conditions[index];

                    if (value) {
                        conditions_values.push(value);
                    }
                }
            });
            let idReturn = await this.onUploadInfo(
                selectedTypeId,
                nickName,
                locationValue,
                age,
                selectedGender,
                story,
                status,
                askedQuestions,
                phoneNumber,
                wxId,
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

            let promiseImageArray = [];
            let length = imageArray.length;
            if (video) length++;

            for (let i = 0; i < imageArray.length; i++) {
                let item = imageArray[i];

                _my.showLoading({
                    mask: true,
                    title: `上传文件中(${i + 1}/${length})`
                });

                let statusCode = await that.onUploadFile(
                    idReturn.id,
                    item,
                    i,
                    length,
                    token
                );

                if (statusCode === 422) {
                    _my.showModal({
                        title: "提交失败",
                        content: `您所选择的图片${i +
                            1}有违规内容, 请修改后再提交`,
                        showCancel: false
                    });

                    _my.hideLoading();

                    return;
                }
            }

            if (video) {
                _my.showLoading({
                    mask: true,
                    title: `上传文件中(${length}/${length})`
                });

                await that.onUploadFile(
                    idReturn.id,
                    video,
                    length,
                    length,
                    token
                );
            }

            _my.hideLoading();

            let acceptedIds = [];

            _my.requestSubscribeMessage({
                tmplIds: ["4Rs11-eFAc-WdEfCNWUrz5t32fbzG2d_jrvki6W83VM"],

                success(res) {
                    let { errMsg } = res;

                    if (errMsg && errMsg == "requestSubscribeMessage:ok") {
                        delete res.errMsg;
                        Object.keys(res).forEach(item => {
                            let value = res[item];

                            if (value == "accept") {
                                acceptedIds.push(item);
                            }
                        });
                    }
                },

                complete: () => {
                    _my.reLaunch({
                        url: "../placeoutComplete/placeoutComplete"
                    });
                }
            });
        } catch (e) {
            let { location } = e;

            if (location) {
                //if(location == 'showModalPromise') //do nothing
            } else {
                console.error(e);

                _my.showToast({
                    title: "系统错误, 请稍后重试"
                });
            }
        } finally {
            _my.hideLoading();
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
