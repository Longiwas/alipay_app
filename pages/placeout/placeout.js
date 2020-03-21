const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/placeout/placeout"
    }
}); // miniprogram/pages/placeout/placeout.js

let app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        imageArray: [],
        hideView: true,
        hideVideo: true,
        imagesWidth: 0,
        video: "",
        categories: [],
        categoriesRawData: [],
        nickName: "",
        age: "",
        selectedType: [],
        selectedTypeId: "",
        selectedGender: ["selectedType", "deselectedType", "deselectedType"],
        gender: "",
        status: {},
        phoneNumber: "",
        wxId: "",
        story: "",
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
        ageText: "点击选择年龄",
        longTapTimeoutId: 0,
        animationArray: [],
        moving: false,
        conditions: [],
        conditions_selected: [],
        templateStatus: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
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
    onLoad: async function(options) {
        let that = this;

        _my.showLoading({
            title: "载入中",
            mask: true
        });

        try {
            let conditions = await this.getConditions();
            this.setData({
                conditions: conditions || [],
                conditions_selected: new Array(conditions.length).fill(
                    false,
                    0,
                    conditions.length
                )
            });

            let storageData = _my.getStorageSync("placeout");

            if (storageData) {
                _my.showModal({
                    title: "确认",
                    content: "之前有一份草稿未保存, 需要使用么?",
                    success: result => {
                        if (result.confirm) {
                            this.setData({ ...storageData });

                            _my.removeStorage({
                                key: "placeout"
                            });
                        }
                    }
                });
            }
        } catch (e) {
            if (e.code) {
                _my.showModal({
                    title: "服务器连接失败",
                    content:
                        "网络不怎么好的样子, 重新试一下吧!(" + e.code + ")",
                    showCancel: false,
                    success: () => {
                        _my.navigateBack({});
                    }
                });
            } else {
                console.error(e);
            }

            return;
        }

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/pet-categories",
            method: "get",
            success: res => {
                let categories = [];
                let selectedType = [];
                let status = {};
                let selectedTypeId = "";

                if (res.data.length > 0) {
                    var categoriesRawData = res.data;
                    categoriesRawData.sort((a, b) => {
                        if (a.id > b.id) return 1;
                        else if (a.id < b.id) return -1;
                        else return 0;
                    });
                    selectedTypeId = categoriesRawData[0].id;
                    categories = categoriesRawData[0].options;
                    categoriesRawData.forEach(item => {
                        selectedType.push("deselectedType");
                        let itemStatus = {};
                        item.options.forEach(opt => {
                            itemStatus = {
                                ...itemStatus,
                                [opt.name]: [
                                    "selectedType",
                                    "deselectedType",
                                    "deselectedType"
                                ]
                            };
                        });
                        status = { ...status, [item.id]: itemStatus };
                    });
                    selectedType[0] = "selectedType";
                }

                that.setData({
                    categoriesRawData,
                    categories,
                    selectedType,
                    selectedTypeId,
                    status
                });

                _my.hideLoading();
            }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
    },

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
        //save
        //get data
        let {
            nickName,
            age,
            ageText,
            year,
            month,
            locationValue,
            locationText,
            selectedGender,
            gender,
            selectedType,
            selectedTypeId,
            status,
            phoneNumber,
            wxId,
            conditions_selected,
            story,
            imageArray,
            video,
            hideVideo,
            hideView
        } = this.data;
        let selectedStatus = status[selectedTypeId];
        let isStatusChanged = true;
        isStatusChanged = Object.keys(selectedStatus).every(key => {
            let value = selectedStatus[key];
            if (value.indexOf("selectedType") > 0) return false;
            else return true;
        });

        if (
            nickName ||
            age ||
            locationValue.length > 0 ||
            selectedGender.indexOf("selectedType") > 0 ||
            selectedType.indexOf("selectedType") > 0 ||
            !isStatusChanged ||
            phoneNumber ||
            wxId ||
            conditions_selected.indexOf(true) >= 0 ||
            story
        ) {
            _my.setStorage({
                key: "placeout",
                data: {
                    nickName,
                    age,
                    ageText,
                    year,
                    month,
                    locationValue,
                    locationText,
                    selectedGender,
                    gender,
                    selectedType,
                    selectedTypeId,
                    status,
                    phoneNumber,
                    wxId,
                    conditions_selected,
                    story,
                    imageArray,
                    video,
                    hideVideo,
                    hideView
                }
            });
        }
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
    onUploadImage: function() {
        let { imageArray } = this.data;

        _my.chooseImage({
            count: 9 - imageArray.length,
            success: res => {
                let filepaths = [...imageArray, ...res.tempFilePaths];
                let animationArray = [];
                filepaths.forEach(() => {
                    animationArray.push({});
                });
                this.setData({
                    imageArray: filepaths,
                    hideView: false,
                    imagesWidth: (140 + 16) * filepaths.length,
                    animationArray
                });
            }
        });
    },
    onUploadVideo: function() {
        let that = this;

        _my.chooseVideo({
            maxDuration: 30,
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
    onRemoveTap: function(evt) {
        let index = evt.target.dataset.index;
        let { imageArray, hideView, video, animationArray } = this.data;
        imageArray.splice(index, 1);

        if (imageArray.length <= 0 && video == "") {
            hideView = true;
        }

        animationArray.pop();
        this.setData({
            imageArray,
            hideView,
            animationArray
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
            story: value
        });
    },
    onNextTap: function(evt) {
        let {
            nickName,
            age,
            video,
            imageArray,
            selectedGender,
            selectedTypeId,
            status,
            story,
            phoneNumber,
            locationValue
        } = this.data; //check

        if (imageArray.length < 3) {
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

        if (!story) {
            _my.showToast({
                title: "请输入宠物故事",
                icon: "none"
            });

            return;
        }

        if (story.length < 20) {
            _my.showToast({
                title: "宠物故事不得少于20字",
                icon: "none"
            });

            return;
        }

        let url = "../placeoutQuestions/placeoutQuestions";
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
    onLongTouchEvent: function(evt) {
        let { longTapTimeoutId } = this.data;
        clearTimeout(longTapTimeoutId);
        longTapTimeoutId = setTimeout(() => {
            _my.vibrateShort({});

            this.setData({
                moving: true
            });
        }, 250);
        this.setData({
            longTapTimeoutId
        });
    },
    onTouchMoveEvent: function(evt) {},
    onTouchCancelEvent: function() {
        let { longTapTimeoutId } = this.data;
        clearTimeout(longTapTimeoutId);
        this.setData({
            longTapTimeoutId: 0
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
