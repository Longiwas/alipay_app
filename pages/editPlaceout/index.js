const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/editPlaceout/index"
    }
}); // miniprogram/pages/placeout/placeout.js

let app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        ...app.globalData,
        id: "",
        remoteImageArray: [],
        localImageArray: [],
        scrollIntoView: "",
        hideView: true,
        hideVideo: true,
        imagesWidth: 0,
        video: "",
        categories: [],
        categoriesRawData: [],
        nickName: "",
        selectedType: [],
        selectedTypeId: "",
        selectedGender: ["selectedType", "deselectedType", "deselectedType"],
        gender: "",
        status: {},
        phoneNumber: "",
        wxIdShow: "",
        wxIdValue: "",
        storyShow: "",
        storyValue: "",
        locationText: "点击选择地区",
        locationValue: [],
        yearRange: [
            "0岁",
            "1岁",
            "2岁",
            "3岁",
            "4岁",
            "5岁",
            "6岁",
            "7岁",
            "8岁",
            "9岁",
            "10岁",
            "11岁",
            "12岁",
            "13岁",
            "14岁",
            "15岁以上"
        ],
        monthRange: [
            "0月",
            "1月",
            "2月",
            "3月",
            "4月",
            "5月",
            "6月",
            "7月",
            "8月",
            "9月",
            "10月",
            "11月"
        ],
        year: 0,
        month: 1,
        questions: [],
        conditions_selected: [],
        conditions_template: []
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
    getConditions: function() {
        return new Promise((yes, no) => {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/condition-template",
                method: "GET",
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 200) {
                        yes(data);
                    } else {
                        no({
                            code: statusCode
                        });
                    }
                }
            });
        });
    },
    getCategories: function(detail, options) {
        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pet-categories",
                method: "get",
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode === 200) {
                        let categories = [];
                        let selectedType = [];
                        let status = {};
                        let selectedTypeId = "";
                        let selectedIndex = 0;

                        if (res.data.length > 0) {
                            var categoriesRawData = res.data;
                            categoriesRawData.sort((a, b) => {
                                if (a.id > b.id) return 1;
                                else if (a.id < b.id) return -1;
                                else return 0;
                            });
                            selectedTypeId = detail.id;
                            categoriesRawData.forEach((item, index) => {
                                if (item.id == detail.id) {
                                    selectedType.push("selectedType");
                                    categories =
                                        categoriesRawData[index].options;
                                } else {
                                    selectedType.push("deselectedType");
                                }

                                let itemStatus = {};
                                item.options.forEach(opt => {
                                    let optStatus = [
                                        "deselectedType",
                                        "deselectedType",
                                        "deselectedType"
                                    ];
                                    options.forEach(opt2 => {
                                        if (opt2.name == opt.name) {
                                            optStatus[opt2.value] =
                                                "selectedType";
                                        }

                                        itemStatus = {
                                            ...itemStatus,
                                            [opt.name]: optStatus
                                        };
                                    });
                                });
                                status = { ...status, [item.id]: itemStatus };
                            });
                        }

                        yes({
                            categoriesRawData,
                            categories,
                            selectedType,
                            selectedTypeId,
                            status
                        });

                        _my.hideLoading();
                    } else {
                        no();
                    }
                }
            });
        });
    },
    getPetInfo: function(id) {
        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + id,
                method: "get",
                success: res => {
                    let { data, statusCode } = res;

                    if (statusCode === 200) {
                        yes(data);
                    } else {
                        no();
                    }

                    _my.hideLoading();
                }
            });
        });
    },
    onLoad: async function(options) {
        let { id } = options;
        let that = this;

        _my.showLoading({
            title: "载入中",
            mask: true
        });

        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });

        try {
            let petInfo = await this.getPetInfo(id);
            let {
                age,
                gender,
                questions,
                location,
                resources,
                name,
                story,
                profile,
                conditions
            } = petInfo;
            let year = parseInt(age / 12),
                month = age % 12;
            let selectedGender = [
                "deselectedType",
                "deselectedType",
                "deselectedType"
            ];
            selectedGender[gender] = "selectedType";
            let remoteImageArray = resources;
            let hideView = remoteImageArray.length <= 0;
            let locationText = "点击选择地区";

            if (app.location2String(location) != "未知") {
                locationText = app.location2String(location);
            }

            this.setData({
                id,
                nickName: name,
                year,
                month,
                age,
                ageText: `${year}岁${month}月`,
                gender,
                selectedGender,
                storyShow: story,
                storyValue: story,
                locationValue: location.split("."),
                locationText,
                phoneNumber: profile.mobile,
                wxId: profile.wechat_id,
                remoteImageArray,
                hideView,
                questions
            });
            let categoriesObj = await this.getCategories(
                petInfo.category_detail,
                petInfo.options
            );
            let conditions_template = await this.getConditions();
            let conditions_selected = new Array(
                conditions_template.length
            ).fill(false);
            (conditions || []).forEach(item => {
                conditions_template.forEach((item2, index2) => {
                    if (item2 == item) {
                        conditions_selected[index2] = true;
                    }
                });
            });
            this.setData({
                conditions_template,
                conditions_selected
            });
            this.setData(categoriesObj);
        } catch (e) {
            console.error(e);

            _my.showModal({
                title: "系统繁忙",
                content: "系统繁忙, 点击确定后刷新重试, 或者点击取消返回上一页",
                success: res => {
                    if (res.confirm) {
                        this.onLoad(options);
                    } else {
                        _my.navigateBack({});
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
    onShareAppMessage: function() {
        return {
            title: "给你安利一个可以免费领养宠物的小程序~",
            path: "/pages/home/index",
            imageUrl: "/images/index.png"
        };
    },
    getRecordData: function(recordid) {},
    onUploadImage: function() {
        let { localImageArray } = this.data;

        _my.chooseImage({
            success: res => {
                let filepaths = res.tempFilePaths;
                this.setData({
                    localImageArray: [...localImageArray, ...filepaths],
                    scrollIntoView: "local" + (filepaths.length - 1),
                    hideView: false,
                    imagesWidth: (140 + 16) * filepaths.length
                });
            }
        });
    },
    onUploadVideo: function() {
        let that = this;

        _my.chooseVideo({
            success: res => {
                that.setData({
                    video: res.tempFilePath,
                    hideView: false,
                    hideVideo: false
                });
            }
        });
    },
    onRemoveVideoTap: function(evt) {
        let { imageArray } = this.data;
        let hideView = false;
        if (imageArray.length <= 0) hideView = true;
        this.setData({
            video: "",
            hideView,
            hideVideo: true
        });
    },
    onRemoveLocalTap: function(evt) {
        let index = evt.target.dataset.index;
        let { remoteImageArray, localImageArray, hideView, video } = this.data;
        localImageArray.splice(index, 1);

        if (
            remoteImageArray.length <= 0 &&
            localImageArray.length <= 0 &&
            video == ""
        ) {
            hideView = true;
        }

        this.setData({
            localImageArray,
            hideView
        });
    },
    onRemoveRemoteTap: function(evt) {
        let index = evt.target.dataset.index;
        let { remoteImageArray, localImageArray, hideView, video } = this.data;
        remoteImageArray.splice(index, 1);

        if (
            remoteImageArray.length <= 0 &&
            localImageArray.length <= 0 &&
            video == ""
        ) {
            hideView = true;
        }

        this.setData({
            remoteImageArray,
            hideView
        });
    },
    onTypeTap: function(evt) {
        let { type, index } = evt.target.dataset;
        let { categoriesRawData } = this.data;
        let selectedCategory = categoriesRawData[index];
        let categories = selectedCategory.options;
        let selectedType = [];
        let selectedTypeId = selectedCategory.id;
        categoriesRawData.forEach(item => {
            selectedType.push("deselectedType");
        });
        selectedType[index] = "selectedType";
        this.setData({
            categories,
            selectedType,
            selectedTypeId
        });
    },
    onGenderTap: function(evt) {
        let { index } = evt.target.dataset;
        let selectedGender = [
            "deselectedType",
            "deselectedType",
            "deselectedType"
        ];
        selectedGender[index] = "selectedType";
        this.setData({
            selectedGender
        });
    },
    onStatusTap: function(evt) {
        let { name, value } = evt.target.dataset;
        let { status, selectedTypeId } = this.data;
        let selectedStatus = [
            "deselectedType",
            "deselectedType",
            "deselectedType"
        ];
        selectedStatus[value] = "selectedType";
        status[selectedTypeId][name] = selectedStatus;
        this.setData({
            status
        });
    },
    onPhoneInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            phoneNumber: value.trim()
        });
    },
    onWXInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            wxId: value.trim()
        });
    },
    onNickNameInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            nickName: value.trim()
        });
    },
    onAgeInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            age: value
        });
    },
    onStoryInput: function(evt) {
        let { value } = evt.detail;
        this.setData({
            storyValue: value
        });
    },
    onNextTap: function(evt) {
        let {
            nickName,
            age,
            video,
            localImageArray,
            remoteImageArray,
            selectedGender,
            selectedTypeId,
            status,
            storyValue,
            phoneNumber,
            locationValue
        } = this.data; //check

        if (localImageArray.length + remoteImageArray.length < 3) {
            _my.showToast({
                title: "请至少选择3张图片",
                icon: "none"
            });

            return;
        }

        if (!nickName) {
            _my.showToast({
                title: "请输入昵称",
                icon: "none"
            });

            return;
        }

        if (!age) {
            _my.showToast({
                title: "请输入年龄",
                icon: "none"
            });

            return;
        }

        if (!phoneNumber) {
            _my.showToast({
                title: "请输入手机号",
                icon: "none"
            });

            return;
        }

        if (locationValue.length <= 0) {
            _my.showToast({
                title: "请选择地区",
                icon: "none"
            });

            return;
        }

        if (!storyValue) {
            _my.showToast({
                title: "请输入宠物故事",
                icon: "none"
            });

            return;
        }

        if (storyValue.length < 20) {
            _my.showToast({
                title: "宠物故事不得少于20字",
                icon: "none"
            });

            return;
        }

        let url = "../editPlaceoutQuestions/index";
        /*url += ('?nickName=' + encodeURI(nickName));
    url += ('&age=' + age);
    if (video) url+='&video='+video;
    if (imageArray.length) url += '&images=' + JSON.stringify(imageArray);
    let gender = selectedGender.indexOf('selectedType');
    url += ('&gender=' + (gender > 0 ? gender : 0));
    url += ('&type=' + selectedTypeId);
    let statusObj = status[selectedTypeId];
    Object.keys(statusObj).map(value => {
      let arr = statusObj[value];
      let index = arr.indexOf('selectedType');
      index = index>0?index:0;
      statusObj[value] = index;
    });
    url += ('&options=' + JSON.stringify(statusObj));
    url += ('&phoneNumber=' + encodeURI(phoneNumber));
    url += ('&story=' + encodeURI(story))*/

        _my.navigateTo({
            url: url
        });
    },
    onLocationChange: function(evt) {
        let { code, value } = evt.detail;
        this.setData({
            locationText: value.join("-"),
            locationValue: code
        });
    },
    onYearChange: function(evt) {
        let { value } = evt.detail;
        this.setData({
            year: value[0],
            month: value[1],
            ageText: `${value[0]}岁${value[1]}月`,
            age: value[0] * 12 + value[1]
        });
    },
    onMonthChange: function(evt) {
        let { value } = evt.detail;
        this.setData({
            month: value
        });
    },
    onConditionTap: function(evt) {
        let { index } = evt.target.dataset;
        let { conditions_selected } = this.data;
        conditions_selected[index] = !conditions_selected[index];
        this.setData({
            conditions_selected
        });
    }
});
