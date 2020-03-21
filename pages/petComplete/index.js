const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/petComplete/index"
    }
}); // miniprogram/pages/adoptionDetail/adoptionDetail.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app,
        pageWidth: app.globalData.screenWidth - 32,
        pageHeight: parseInt(
            (app.globalData.screenHeight - app.globalData.customHeadHeight) / 2
        ),
        petId: "",
        petBanner: [],
        petName: "",
        petAge: 2,
        petRemark: "",
        genderUrl: "",
        petCover: "",
        petTags: [],
        viewNum: 9688,
        favStatus: false,
        favText: "收藏",
        heartName: "like-o",
        questions: [],
        options: [],
        year: 0,
        month: 0,
        apply: false,
        authorize_btn: true,
        loginShow: false,
        locationStr: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let recordid = options.id;
        app.globalData.initPromise.then(data => {
            let { userInfo } = data;
            this.setData({
                authorize_btn: !data.login,
                customHeadHeight: data.customHeadHeight
            });

            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + recordid,
                method: "get",
                header: {
                    Authorization: "Bearer " + data.token,
                    "user-id": userInfo.id
                },
                success: res => {
                    let data = res.data;

                    _my.hideLoading();

                    let optionsShow = [];
                    data.resources.forEach(
                        item => (item.isImage = item.type.indexOf("image") >= 0)
                    );
                    let genderUrl = "../../images/";
                    if (data.gender == 0) genderUrl = "";
                    else if (data.gender == 1) genderUrl += "male.svg";
                    else if (data.gender == 2) genderUrl += "female.svg";
                    that.setData({
                        petBanner: data.resources,
                        petId: recordid,
                        petAge: data.age,
                        petName: data.name,
                        petRemark: data.story,
                        petCover: data.cover,
                        viewNum: data.views,
                        petTags: data.options,
                        questions: data.questions,
                        options: data.options,
                        year: parseInt(data.age / 12),
                        month: data.age % 12,
                        favStatus: data.favorite,
                        favText: data.favorite ? "已收藏" : "收藏",
                        heartName: data.favorite ? "like" : "like-o",
                        apply: data.apply,
                        genderUrl,
                        locationStr: app.location2String(data.location)
                    });
                }
            });
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
        let { petName, locationStr } = this.data;
        locationStr =
            locationStr.lastIndexOf("-") > 0
                ? locationStr.substring(locationStr.lastIndexOf("-") + 1)
                : locationStr;
        return {
            title: `${locationStr}的${petName}想有个家，你愿意领养吗？`,
            path:
                "/pages/adoptionSupport/adoptionSupport?id=" + this.data.petId,
            imageUrl: this.data.petCover
        };
    },
    onHeartTap: function(evt) {
        let that = this;
        let { favText, heartName, petId, favStatus } = this.data;
        /*favText = favText=='收藏'?'已收藏':'收藏'; 
    heartName = heartName=='like-o'?'like':'like-o'; 
    this.setData({ 
      favText, heartName 
    });*/

        let { userInfo, token } = app.globalData;
        let { id } = userInfo;

        if (!id) {
            _my.showToast({
                title: "请先登录",
                icon: "none"
            });

            _my.navigateTo({
                url: "../user/index"
            });

            return;
        }

        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                petId +
                "/actions",
            method: "put",
            header: {
                Authorization: "Bearer " + token,
                "user-id": userInfo.id
            },
            data: {
                action: favStatus == false ? "favorite" : "unfavorite"
            },
            success: res => {
                let { statusCode } = res;

                if (statusCode == 200) {
                    if (favStatus) {
                        favText = "收藏";
                        heartName = "like-o";
                        favStatus = false;
                    } else {
                        favText = "已收藏";
                        heartName = "like";
                        favStatus = true;
                    }

                    that.setData({
                        favText,
                        heartName,
                        favStatus
                    });
                }
            }
        });
    },
    onWarningTap: function() {
        _my.showToast({
            title: "举报"
        });
    },
    onAnswerQuestionTap: function(evt) {
        let recordid = evt.target.dataset.recordid;
        let { login, userInfo } = app.globalData;

        if (login) {
            _my.navigateTo({
                url:
                    "../adoptionAnswerQuestion/adoptionAnswerQuestion?id=" +
                    this.data.petId +
                    "&image=" +
                    this.data.petCover
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    },
    onLoginTap: function() {
        _my.login({
            success: res => {
                if (res.code) {
                    this.onGetUserInfo(res.code);
                } else {
                    alert("登陆失败");
                }
            }
        });
    },
    onGetUserInfo: function(code) {
        let that = this;

        _my.getUserInfo({
            success: res => {
                let { userInfo } = res;
                let { nickName, avatarUrl } = userInfo;
                // that.onAuth(code, userInfo);
            },
            fail: err => {
                err.location = "wx.getUserInfo existSetting";
            }
        });
    },
    onAuth: function(code, obj = {}) {
        console.log('onAuth')
        obj.location = "";

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
            method: "POST",
            data: {
                type: "mini-program",
                data: {
                    code,
                    ...obj
                }
            },
            success: res => {
                if (res.statusCode == 200) {
                    app.globalData.userInfo = res.data.info;
                    app.globalData.token = res.data.auth.token;
                    this.setData({
                        loginShow: false
                    });

                    _my.navigateTo({
                        url:
                            "../adoptionAnswerQuestion/adoptionAnswerQuestion?id=" +
                            this.data.petId +
                            "&image=" +
                            this.data.petCover
                    });

                    _my.showToast({
                        title: "登录成功"
                    });
                }
            }
        });
    },
    onAuthorizeTap: function(evt) {
        let { userInfo } = evt.detail;

        if (userInfo) {
            app.globalData.login = true;

            _my.login({
                success: res => {
                    if (res.code) {
                        this.onAuth(res.code, userInfo);
                    } else {
                        alert("登陆失败");
                    }
                }
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "您取消了授权"
            });
        }
    },
    onImageTap: function(evt) {
        let { petBanner } = this.data;
        let imgArray = [];
        petBanner.forEach(img => {
            if (img.type.indexOf("image") >= 0) {
                imgArray.push(img.file);
            }
        });

        _my.previewImage({
            urls: imgArray
        });
    },
    onCancelClose: function(evt) {
        this.setData({
            loginShow: false
        });
    }
});
