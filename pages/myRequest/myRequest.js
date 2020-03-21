const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myRequest/myRequest"
    }
}); // pages/adoption/adoption.js

const app = getApp();
var timeoutHandler = true;

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app: app,
        customHeadHeight: 0,
        selected: ["selected", "", "", ""],
        activate: ["", "deactivate", "deactivate"],
        nextPage: ["", "", ""],
        petArray: [],
        catArray: [],
        otherArray: [],
        show: [true, true, true],
        bottomshow: [false, false, false],
        pageIndex: 0,
        filter: {
            gender: [],
            age: [],
            status: []
        },
        failedReasonShow: false,
        cancelShow: false,
        calcelId: "",
        actionId: "",
        actionPopupShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        this.onDogTap();
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
    onUnload: function() {},

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {
        let { selected } = this.data;
        let selectedindex = selected.indexOf("selected");

        if (selectedindex == 0) {
            this.onDogTap();
        } else if (selectedindex == 1) {
            this.onCatTap();
        } else if (selectedindex == 2) {
            this.onOtherTap();
        } else {
            this.onDogTap();
        }
    },

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
    onPageScroll: function({ scrollTop }) {},
    onReachBottom: function() {
        let selectedindex = 0;
        this.data.selected.forEach((select, index) => {
            if (select == "selected") selectedindex = index;
        });

        if (selectedindex == 0) {
            this.onDogLoad();
        } else if (selectedindex == 1) {
            this.onCatLoad();
        } else if (selectedindex == 2) {
            this.onOtherLoad();
        }
    },
    onPetTap: function(evt) {
        let that = this;
        let id = evt.currentTarget.dataset.id;
        let { petArray, catArray, otherArray } = this.data;
        let exist = false;
        petArray.forEach(pet => {
            if (pet.id == id && exist == false) {
                this.onPetFound(pet);
                exist = true;
            }
        });
        catArray.forEach(pet => {
            if (pet.id == id && exist == false) {
                this.onPetFound(pet);
                exist = true;
            }
        });
        otherArray.forEach(pet => {
            if (pet.id == id && exist == false) {
                this.onPetFound(pet);
                exist = true;
            }
        });
    },
    onPetFound: function(pet) {
        let { id, msg, status, locationStr } = pet;

        if (status == "pending") {
            _my.showModal({
                showCancel: false,
                title: "该宠物还在审核中, 请耐心等待"
            });
        } else if (status == "withdraw") {
            _my.showModal({
                showCancel: false,
                title: "该宠物已被删除"
            });
        } else if (status == "eol") {
            _my.navigateTo({
                url: `../petComplete/index?id=${id}`
            });
        } else if (status == "invalid") {
            this.onFailedTap({
                currentTarget: {
                    dataset: {
                        id,
                        msg
                    }
                }
            });
        } else {
            _my.navigateTo({
                url: "../adoptionDetail/adoptionDetail?id=" + id
            });
        }
    },
    onTabTap: function(evt) {
        let that = this;

        _my.showLoading({
            title: "寻找中"
        });

        let index = evt.target.dataset.index;
        let selected = ["", "", ""];
        let activate = ["deactivate", "deactivate", "deactivate"];

        if (index == 0) {
            that.onDogTap();
        } else if (index == 1) {
            that.onCatTap();
        } else if (index == 2) {
            that.onOtherTap();
        }

        selected[index] = "selected";
        activate[index] = "";
        that.setData({
            selected,
            activate
        });

        _my.hideLoading();

        _my.pageScrollTo({
            scrollTop: 0,
            duration: 150,
            success: () => {}
        });
    },
    onSwiperChange: function(evt) {
        let { current, source } = evt.detail;
        let selected = ["", "", ""];
        selected[current] = "selected";
        this.setData({
            selected
        });
    },
    dogLoad: function(refresh, success, fail) {
        var that = this;
        let { userInfo, token } = app.globalData;
        let { id } = userInfo;
        let { nextPage } = this.data;

        if (!id || !token) {
            _my.showToast({
                title: "请先登录"
            });

            _my.navigateTo({
                url: "../user/index"
            });
        }

        _my.showLoading({
            title: "寻找中"
        });

        let url = "";
        if (refresh)
            url =
                "https://api.woyuanyi.511cwpt.com/api/v1/users/" + id + "/pets";
        else url = nextPage[0];

        _my.request({
            url: url,
            method: "get",
            data: {
                status: "pending,normal,invalid"
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                _my.stopPullDownRefresh();

                if (res.statusCode === 200) {
                    let next = res.header.Next;

                    if (next) {
                        nextPage[0] = next;
                        that.setData({
                            nextPage
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
                    success(res.data);
                } else {
                    fail(res);
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
    onDogTap: function() {
        var that = this;
        this.setData({
            pageIndex: 0
        });
        let show = this.data.show;
        show[0] = false;
        this.dogLoad(
            true,
            data => {
                that.setData({
                    petArray: data,
                    show
                });
            },
            res => {
                that.setData({
                    petArray: []
                });
            }
        );
    },
    onDogLoad: function() {
        var that = this;
        let petArray = this.data.petArray;
        this.dogLoad(
            false,
            data => {
                that.setData({
                    petArray: [...petArray, ...data]
                });
            },
            res => {}
        );
    },
    catLoad: function(success, fail) {
        var that = this;
        let pageIndex = this.data.pageIndex;
        let { userInfo, token } = app.globalData;
        let { id } = userInfo;

        if (!id || !token) {
            _my.showToast({
                title: "请先登录"
            });

            _my.navigateTo({
                url: "../user/index"
            });
        }

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/users/" + id + "/pets",
            method: "get",
            data: {
                status: "contacting"
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                if (res.statusCode === 200) {
                    pageIndex++;
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
                        pageIndex
                    });
                    success(res.data);
                } else {
                    fail(res);
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
    onCatTap: function() {
        var that = this;
        this.setData({
            pageIndex: 0
        });
        this.catLoad(
            data => {
                that.setData({
                    catArray: data
                });
            },
            res => {
                that.setData({
                    catArray: []
                });
            }
        );
    },
    onCatLoad: function() {
        var that = this;
        let catArray = this.data.catArray;
        this.catLoad(
            data => {
                that.setData({
                    catArray: [...catArray, ...data]
                });
            },
            res => {}
        );
    },
    otherLoad: function(success, fail) {
        var that = this;
        let pageIndex = this.data.pageIndex;
        let { userInfo, token } = app.globalData;
        let { id } = userInfo;

        if (!id || !token) {
            _my.showToast({
                title: "请先登录"
            });

            _my.navigateTo({
                url: "../user/index"
            });
        }

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/users/" + id + "/pets",
            method: "get",
            data: {
                status: "eol"
            },
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                _my.stopPullDownRefresh();

                if (res.statusCode === 200) {
                    pageIndex++;
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
                        pageIndex
                    });
                    success(res.data);
                } else {
                    fail(res);
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
    onOtherTap: function() {
        var that = this;
        this.setData({
            pageIndex: 0
        });
        this.otherLoad(
            data => {
                that.setData({
                    otherArray: data
                });
            },
            res => {
                that.setData({
                    otherArray: []
                });
            }
        );
    },
    onOtherLoad: function() {
        var that = this;
        let otherArray = this.data.otherArray;
        this.otherLoad(
            data => {
                that.setData({
                    otherArray: [...otherArray, ...data]
                });
            },
            res => {}
        );
    },
    onChooseTap: function(evt) {
        let id = evt.target.dataset.id;

        _my.navigateTo({
            url: "../myPlaceoutAnswer/myPlaceoutAnswer?id=" + id
        });
    },
    onPhoneTap: function(evt) {
        let { id, status } = evt.currentTarget.dataset;

        _my.navigateTo({
            url:
                "/pages/adoptionAnswers/adoptionAnswers?id=" +
                id +
                "&status=" +
                status
        });
    },
    onContractTap: function(evt) {
        let { id } = evt.target.dataset;
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
                    let array = res.data;
                    array.forEach(adoption => {
                        if (adoption.status == "contacting") {
                            _my.navigateTo({
                                url:
                                    "../adoptionAgre/adoptionAgre?id=" +
                                    adoption.id +
                                    "&pet_id=" +
                                    id
                            });

                            return;
                        }
                    });
                }
            }
        });
    },
    onSignedTap: function(evt) {
        let { id } = evt.target.dataset;
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
                    let array = res.data;
                    array.forEach(adoption => {
                        if (adoption.status == "eol") {
                            _my.navigateTo({
                                url:
                                    "../adoptionAgre/adoptionAgre?id=" +
                                    adoption.id +
                                    "&pet_id=" +
                                    id
                            });

                            return;
                        }
                    });
                }
            }
        });
    },
    onFailedTap: function(evt) {
        let { msg, id } = evt.currentTarget.dataset;
        this.setData({
            failedReasonShow: true,
            failedReasonText: msg,
            failedReasonId: id
        });
    },
    onFailedClose: function(evt) {
        this.setData({
            failedReasonShow: false
        });
    },
    onPlaceoutCancelTap: function(evt) {
        let that = this;
        let { formId } = evt.detail;
        let { id } = evt.target.dataset;
        let { token } = app.globalData;

        _my.showModal({
            title: "确认",
            content: "确定撤销么?",
            success: res => {
                if (res.confirm) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                            id +
                            "/action",
                        method: "PUT",
                        header: {
                            Authorization: "Bearer " + token,
                            "form-id": formId
                        },
                        data: {
                            action: "revert"
                        },
                        success: res => {
                            if (res.statusCode == 200) {
                                _my.showToast({
                                    title: "撤销成功."
                                });

                                that.onTabTap({
                                    target: {
                                        dataset: {
                                            index: 1
                                        }
                                    }
                                });
                            } else {
                                _my.showToast({
                                    icon: "none",
                                    title: "撤销失败."
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    onRemoveTap: function() {
        let { failedReasonId, selected } = this.data;
        let { token } = app.globalData;
        let that = this;

        _my.showModal({
            title: "确认",
            content: "确定删除宠物么?删除之后不可恢复!",
            success: res => {
                if (res.confirm) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/pets-removal",
                        method: "PUT",
                        header: {
                            Authorization: "Bearer " + token
                        },
                        data: [failedReasonId],
                        success: res => {
                            if (res.statusCode == 204) {
                                this.setData({
                                    failedReasonId: "",
                                    failedReasonText: "",
                                    failedReasonShow: false
                                });
                                let index = selected.indexOf("selected");
                                that.onTabTap({
                                    target: {
                                        dataset: {
                                            index
                                        }
                                    }
                                });
                            } else {
                                _my.showToast({
                                    icon: "none",
                                    title: "删除失败."
                                });

                                this.setData({
                                    failedReasonShow: false
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    onEditTap: function() {
        let { failedReasonId } = this.data;

        _my.navigateTo({
            url: "../editPlaceout/index?id=" + failedReasonId
        });
    },
    onCancelClose: function() {
        this.setData({
            cancelShow: false
        });
    },
    onCancelConfirm: function(evt) {
        let that = this;
        let { selected } = this.data;
        let { id } = evt.currentTarget.dataset;
        let { token } = app.globalData;

        _my.showModal({
            title: "确认",
            content: "确定删除宠物么?删除之后不可恢复!",
            success: res => {
                if (res.confirm) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/pets-removal",
                        method: "PUT",
                        header: {
                            Authorization: "Bearer " + token
                        },
                        data: [id],
                        success: res => {
                            if (res.statusCode == 204) {
                                let index = selected.indexOf("selected");
                                that.onTabTap({
                                    target: {
                                        dataset: {
                                            index
                                        }
                                    }
                                });
                            } else {
                                _my.showToast({
                                    icon: "none",
                                    title: "删除失败."
                                });
                            }
                        }
                    });
                }
            }
        });
    },
    onActionTap: function(evt) {
        let { id } = evt.target.dataset;
        this.setData({
            actionPopupShow: true,
            actionId: id
        });
    },
    onActionClose: function() {
        this.setData({
            actionPopupShow: false
        });
    },
    onActionEditTap: function() {
        let { actionId } = this.data;

        _my.navigateTo({
            url: "../editPlaceout/index?id=" + actionId
        });
    },
    onActionRemoveTap: function() {
        let { actionId, selected } = this.data;
        let { token } = app.globalData;
        let that = this;

        _my.showModal({
            title: "确认",
            content: "确定删除宠物么?删除之后不可恢复!",
            success: res => {
                if (res.confirm) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/pets-removal",
                        method: "PUT",
                        header: {
                            Authorization: "Bearer " + token
                        },
                        data: [actionId],
                        success: res => {
                            if (res.statusCode == 204) {
                                this.setData({
                                    actionId: "",
                                    actionPopupShow: false
                                });
                                let index = selected.indexOf("selected");
                                that.onTabTap({
                                    target: {
                                        dataset: {
                                            index
                                        }
                                    }
                                });
                            } else {
                                _my.showToast({
                                    icon: "none",
                                    title: "删除失败."
                                });

                                this.setData({
                                    actionPopupShow: false
                                });
                            }
                        }
                    });
                }
            }
        });
    }
});
