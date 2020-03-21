const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myPlaceoutAnswer/myPlaceoutAnswer"
    }
}); // miniprogram/pages/myPlaceoutAnswer/myPlaceoutAnswer.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        cover: "",
        name: "",
        year: 0,
        month: 0,
        gender: 2,
        recordid: "",
        genderIcon: "../../images/female.svg",
        options: [],
        location: "",
        questions: [],
        wishNum: 3,
        wishList: [],
        selected: "",
        answer_show: false,
        question_list: [],
        answer_list: [],
        answer_name: "",
        confirmShow: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let { id } = options;
        let { token, customHeadHeight } = app.globalData;
        this.setData({
            customHeadHeight
        });

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + id,
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                if (res.statusCode == 200) {
                    let { data } = res;
                    let { cityArray } = app.globalData;
                    let { cover, name, age, gender, location, options } = data;
                    let genderIcon = "";

                    if (gender == 1) {
                        genderIcon = "../../images/male.svg";
                    } else if (gender == 2) {
                        genderIcon = "../../images/female.svg";
                    }

                    let locationStr = "";
                    let locationArray = location.split(".");

                    if (locationArray.length == 3) {
                        let province = cityArray[locationArray[0]];

                        if (province) {
                            let city = province.citys[locationArray[1]];

                            if (city) {
                                let area = city.areas[locationArray[2]];

                                if (area) {
                                    locationStr =
                                        province.fullname +
                                        "-" +
                                        city.fullname +
                                        "-" +
                                        area.fullname;
                                } else {
                                    locationStr =
                                        province.fullname + "-" + city.fullname;
                                }
                            } else {
                                locationStr = province.fullname;
                            }
                        } else {
                            locationStr = "未知";
                        }
                    } else {
                        locationStr = "未知";
                    }

                    that.setData({
                        cover,
                        name,
                        year: parseInt(age / 12),
                        month: age % 12,
                        genderIcon,
                        location: locationStr,
                        wishNum: data.apply_num,
                        options
                    });
                }
            }
        });

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                id +
                "/adoptions",
            method: "get",
            header: {
                Authorization: "Bearer " + token
            },
            success: res => {
                if (res.statusCode == 200) {
                    that.setData({
                        wishList: res.data
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
    onAnswerTap: function(evt) {
        let { id } = evt.currentTarget.dataset;
        let { selected } = this.data;

        _my.navigateTo({
            url: `../myPlaceoutCheckAnswer/index?id=${id}&selected=${selected}`
        });
        /*let {token} = app.globalData;
    wx.request({
      url: 'https://api.woyuanyi.511cwpt.com/api/v1/adoptions/' + id,
      method:'get',
      header:{
        'Authorization':'Bearer '+token
      },
      success:res=>{
        if(res.statusCode==200){
          let {qas} = res.data;
          let question_list = [], answer_list = [];
          qas.forEach(qs=>{
            question_list.push(qs.question);
            answer_list.push(qs.answer);
          });
          that.setData({
            question_list, answer_list, answer_one: res.data, answer_show:true
          });
        }
      }
    })*/
    },
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
        let that = this;
        let { id } = evt.currentTarget.dataset;
        this.setData({
            selected: id,
            answer_show: false
        });
    },
    onConfirmTap: function(evt) {
        _my.showModal({
            title: "确定",
            content: "确定选择这位领养人么?",
            success: result => {}
        });
    },
    confirm: function(evt) {
        let { formId } = evt.detail;
        let { recordid, selected } = this.data;
        let { token } = app.globalData;
        let pages = getCurrentPages();
        let prevpage = pages[pages.length - 2];

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/adoptions/" +
                selected +
                "/action",
            method: "PUT",
            header: {
                Authorization: "Bearer " + token,
                "form-id": formId
            },
            data: {
                action: "contact"
            },
            success: res => {
                if (res.statusCode == 200) {
                    _my.showToast({
                        title: "确认送养成功"
                    });

                    prevpage.setData({
                        selected: ["", "selected", ""]
                    });
                    prevpage.onTabTap({
                        target: {
                            dataset: {
                                index: 1
                            }
                        }
                    });

                    _my.navigateBack({
                        delta: 1
                    });
                }
            }
        });
    },
    onConfirmShow: function() {
        let { selected } = this.data;

        if (selected) {
            this.setData({
                confirmShow: true
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "请选择领养人"
            });
        }
    },
    onConfirmClose: function() {
        this.setData({
            confirmShow: false
        });
    }
});
