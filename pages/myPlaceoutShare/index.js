const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/myPlaceoutShare/index"
    }
}); // miniprogram/pages/adoptionDetail/adoptionDetail.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app: app,
        petId: "",
        petBanner: [],
        petName: "",
        year: 0,
        month: 0,
        petRemark: "",
        genderUrl: "../../images/male.svg",
        petCover: "",
        viewNum: 9688,
        favText: "收藏",
        favStatus: false,
        heartName: "like-o",
        options: [],
        location: "",
        customHeadHeight: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let that = this;
        let recordid = options.id;
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight
        });

        _my.showLoading({
            title: "寻找中"
        });

        _my.request({
            url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + recordid,
            method: "get",
            success: res => {
                _my.hideLoading();

                let { statusCode, data } = res;

                if (statusCode == 404) {
                    _my.navigateTo({
                        url: "../placeoutRemoved/index"
                    });

                    return;
                }

                data.resources.forEach(
                    item => (item.isImage = item.type.indexOf("image") >= 0)
                );
                that.setData({
                    petId: recordid,
                    year: parseInt(data.age / 12),
                    month: data.age % 12,
                    petName: data.name,
                    petRemark: data.story,
                    petCover: data.cover,
                    viewNum: data.views,
                    petBanner: data.resources,
                    options: data.options
                });
                app.globalData.cityPromise.then(cityArray => {
                    if (!app.globalData.cityArray) {
                        app.globalData.cityArray = cityArray;
                    }

                    that.setData({
                        locationStr: app.location2String(data.location)
                    });
                });
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
    onShareAppMessage: function(obj) {
        let { petName, locationStr } = this.data;
        locationStr =
            locationStr.lastIndexOf("-") > 0
                ? locationStr.substring(locationStr.lastIndexOf("-") + 1)
                : locationStr;
        return {
            title: `${locationStr}的${petName}想有个家，你愿意领养吗？`,
            path:
                "/pages/home/index?target=adoptionDetail&id=" + this.data.petId,
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

                        _my.showToast({
                            title: "取消收藏成功"
                        });
                    } else {
                        favText = "已收藏";
                        heartName = "like";
                        favStatus = true;

                        _my.showToast({
                            icon: "none",
                            duration: 3000,
                            title: "收藏成功.可在“我的”-“我的收藏”中查看"
                        });
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
        this.setData({
            reportShow: true
        });
    },
    onReportInput: function(evt) {
        this.setData({
            reportContent: evt.detail.value
        });
    },
    onReportConfirmTap: function() {
        let that = this;
        let { token, userInfo } = app.globalData;
        let { petId, reportContent } = this.data;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/accusations`,
            method: "POST",
            header: {
                Authorization: `Bearer ${token}`
            },
            data: {
                user_id: userInfo.id,
                accusation_type: "pet",
                target_id: petId,
                content: reportContent
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 201) {
                    _my.showToast({
                        icon: "none",
                        title: "已收到举报，感谢您的关注"
                    });

                    that.setData({
                        reportShow: false
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "好像没举报成功, 再试一下?"
                    });
                }
            }
        });
    },
    onReportCloseTap: function() {
        this.setData({
            reportShow: false
        });
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
    }
});
