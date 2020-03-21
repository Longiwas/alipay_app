const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myAdoption/myAdoption"
    }
}); // pages/adoption/adoption.js

const app = getApp();
var timeoutHandler = true;

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        selected: ["selected", "", "", ""],
        activate: ["", "deactivate", "deactivate"],
        show: [true, true, true],
        bottomshow: [false, false, false],
        pageIndex: 0,
        filter: {
            gender: [],
            age: [],
            status: []
        },
        phoneShow: false,
        phoneModalImage: "",
        phoneModalName: "",
        phoneModalPhone: "",
        cancelId: "",
        cancelShow: false,
        shareShow: false,
        shareObj: {
            id: "",
            location: "",
            cover: ""
        }
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
    onShow: function() {
        /*wx.pageScrollTo({
      scrollTop: 0,
    })*/
    },

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
    onShareAppMessage: function(evt) {
        let { target, from } = evt;

        if (from == "button") {
            let { id, cover, location } = this.data.shareObj;
            return {
                title: "我想免费领养这只小宝贝，麻烦支持我一下~",
                path: `/pages/home/index?target=adoptionSupportNew&id=${id}`,
                imageUrl: cover
            };
        } else {
            return {
                title: "给你安利一个可以免费领养宠物的小程序~",
                path: "/pages/home/index",
                imageUrl: "/images/index.png"
            };
        }
    },
    onPageScroll: function({ scrollTop }) {},
    // onReachBottom: function () {
    //   let selectedindex = 0;
    //   this.data.selected.forEach((select, index) => {
    //     if (select == 'selected') selectedindex = index;
    //   });
    //   if (selectedindex == 0) {
    //     this.onDogLoad();
    //   } else if (selectedindex == 1) {
    //     this.onCatLoad();
    //   } else if (selectedindex == 2) {
    //     this.onOtherLoad();
    //   }
    // },
    onPetTap: function(evt) {
        let that = this;
        let id = evt.currentTarget.dataset.id;
        let { petArray = [], catArray = [], otherArray = [] } = this.data;
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
        let { pet_id, msg, status, locationStr } = pet;

        if (status == "withdraw") {
            _my.showModal({
                showCancel: false,
                title: "该宠物已被删除"
            });
        } else if (status == "eol") {
            _my.navigateTo({
                url: `../petComplete/index?id=${pet_id}`
            });
        } else {
            _my.navigateTo({
                url:
                    "../adoptionDetail/adoptionDetail?id=" +
                    pet_id +
                    "&locationStr=" +
                    locationStr
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
    dogLoad: function(success, fail) {
        var that = this;
        let { userInfo, token, cityArray } = app.globalData;
        let { id } = userInfo;

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${id}/adoptions`,
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                status: "normal"
            },
            success: res => {
                if (res.statusCode === 200) {
                    (res.data || []).forEach(pet => {
                        let { gender, age, location } = pet;

                        if (gender === 1) {
                            pet.genderUrl = "../../images/male.svg";
                        } else if (gender === 2) {
                            pet.genderUrl = "../../images/female.svg";
                        } else {
                            pet.genderUrl = "";
                        }
                        /*pet.powered_users = [{
              avatarUrl:'../../images/index_enable.png'
            }, {
              avatarUrl: '../../images/index_disable.png'
            }, {
              avatarUrl: '../../images/pet_enable.png'
            }, {
              avatarUrl: '../../images/dog1.png'
            }];
            pet.powered=2000;*/

                        if (pet.powered_users) {
                            if (pet.powered_users.length >= 5) {
                                pet.powered_list = [
                                    pet.powered_users[0],
                                    pet.powered_users[1],
                                    pet.powered_users[2],
                                    pet.powered_users[3]
                                ];
                            } else {
                                pet.powered_list = pet.powered_users;

                                for (
                                    let i = pet.powered_list.length;
                                    i < 4;
                                    i++
                                ) {
                                    pet.powered_list.push({
                                        avatarUrl:
                                            "../../images/user-unlogin.png"
                                    });
                                }
                            }
                        }

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
                    success(res.data || []);
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
            pageIndex: 0,
            petArray: []
        });
        let show = this.data.show;
        show[0] = false;
        this.dogLoad(
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
        let { userInfo, token, cityArray } = app.globalData;
        let { id } = userInfo;

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${id}/adoptions`,
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                status: "contacting"
            },
            success: res => {
                if (res.statusCode === 200) {
                    (res.data || []).forEach(pet => {
                        let { gender, age, location } = pet;

                        if (gender === 1) {
                            pet.genderUrl = "../../images/male.svg";
                        } else if (gender === 2) {
                            pet.genderUrl = "../../images/female.svg";
                        } else {
                            pet.genderUrl = "";
                        }

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
                    success(res.data || []);
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
            pageIndex: 0,
            catArray: []
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
        let { userInfo, token, cityArray } = app.globalData;
        let { id } = userInfo;

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/users/${id}/adoptions`,
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                status: "eol"
            },
            success: res => {
                if (res.statusCode === 200) {
                    (res.data || []).forEach(pet => {
                        let { gender, age, location } = pet;

                        if (gender === 1) {
                            pet.genderUrl = "../../images/male.svg";
                        } else if (gender === 2) {
                            pet.genderUrl = "../../images/female.svg";
                        } else {
                            pet.genderUrl = "";
                        }

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
                    success(res.data || []);
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
            pageIndex: 0,
            otherArray: []
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
    onShareTap: function(evt) {
        let { id, cover, location } = evt.target.dataset;
        this.setData({
            shareShow: true,
            shareObj: {
                id,
                location,
                cover
            }
        });
    },
    onPhoneTap: function(evt) {
        let { cover, name, phone } = evt.target.dataset; // phone = '13052173772';

        this.setData({
            phoneShow: true,
            phoneModalImage: cover,
            phoneModalName: name,
            phoneModalPhone: phone
        });
    },
    onContractTap: function(evt) {
        let { id, petId } = evt.target.dataset;

        _my.navigateTo({
            url:
                "/pages/adoptionAgre/adoptionAgre?id=" + id + "&pet_id=" + petId
        });
    },
    onModalMaskTap: function(evt) {
        this.setData({
            phoneShow: false
        });
    },

    onModalMaskTouchMove() {},

    onPhoneCallTap: function(evt) {
        let phone = evt.target.dataset.phone;

        _my.makePhoneCall({
            phoneNumber: phone
        });
    },
    onAdoptingCancelTap: function(evt) {
        let { id } = evt.target.dataset;
        this.setData({
            cancelId: id,
            cancelShow: true
        });
    },
    onCancelClose: function() {
        this.setData({
            cancelShow: false
        });
    },
    onCancelConfirm: function(evt) {
        let { formId } = evt.detail;
        let { cancelId } = this.data;
        let { token } = app.globalData; // put / adoptions / id / action   { "action": "revert" }

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/adoptions/${cancelId}/action`,
            method: "put",
            header: {
                Authorization: "Bearer " + token,
                "form-id": formId
            },
            data: {
                action: "revert"
            },
            success: res => {
                _my.showToast({
                    title: "撤销成功"
                });
            },
            fail: function(res) {
                _my.showToast({
                    title: "系统错误"
                });
            },
            complete: res => {
                this.onCatTap();
            }
        });

        this.onCancelClose();
    },
    onShareClose: function() {
        this.setData({
            shareShow: false
        });
    },
    onAdoptionInformationTap: function(evt) {
        let { id } = evt.currentTarget.dataset;
        let { petArray = [] } = this.data;
        petArray.every((item, index) => {
            if (item.id == id) {
                let { name, cover, pet_profile, applicant } = item;

                _my.request({
                    url: ""
                });

                this.setData({
                    informationShow: true,
                    adoptionInformation: {
                        name,
                        cover,
                        pet_profile,
                        applicantName: applicant.nickName
                    }
                });
                return false;
            }

            return true;
        });
    },
    onInformationClose: function() {
        this.setData({
            informationShow: false
        });
    },
    onPhoneTap: function(evt) {
        let { phone } = evt.currentTarget.dataset;

        _my.makePhoneCall({
            phoneNumber: phone
        });
    },
    onWechatTap: function(evt) {
        let { wechatid } = evt.currentTarget.dataset;

        if (wechatid) {
            _my.setClipboardData({
                data: wechatid
            });
        }
    }
});
