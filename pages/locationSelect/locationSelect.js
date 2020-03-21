const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/locationSelect/locationSelect"
    }
}); // miniprogram/pages/locationSelect/locationSelect.js

var QQMapWX = require("../../libs/qqmapsdk/qqmap-wx-jssdk.js");

const qqmapsdk = new QQMapWX({
    key: "BNVBZ-TGL62-VH6UK-CID3D-MZMJ6-RDFEO"
});
const app = getApp();

_Page({
    properties: {
        customHeadHeight: {
            type: Number,
            value: 64
        },
        imgsize: {
            type: Number,
            value: 16
        },
        areaColor: {
            type: String,
            value: ""
        },
        scrollableHeight: {
            type: Number,
            value: 0
        }
    },

    /**
     * 页面的初始数据
     */
    data: {
        city_code: "",
        city: "定位失败",
        provinceArray: [],
        provinceColor: {},
        cityArray: [],
        areaArray: [],
        cityBackgroundColor: "",
        cityColor: {},
        areaBackgroundColor: "",
        areaColor: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { city_code, city } = app.globalData;
        let provinceid = city_code.slice(0, 2) + "0000";
        let cityid = city_code.slice(0, 4) + "00";
        let cityArray = [];
        let areaArray = [];
        this.data.provinceArray.forEach(province => {
            if (province.id == provinceid) {
                let { citys } = province;
                Object.keys(citys).forEach(cityid => {
                    cityArray.push(citys[cityid]);
                });
            }
        });
        cityArray.forEach(city => {
            if (city.id == cityid) {
                let { areas } = city;
                Object.keys(areas).forEach(areaid => {
                    areaArray.push(areas[areaid]);
                });
            }
        });
        this.setData({
            provinceColor: {
                [provinceid]: "provinceSelected"
            },
            cityArray,
            cityBackgroundColor: "#F7F7F7",
            cityColor: {
                [cityid]: "provinceSelected"
            },
            areaArray,
            areaBackgroundColor: "#F0F0F0"
        });
        /*that.setData({
      cityArray,
      cityBackgroundColor: '#F7F7F7',
      areaArray: [],
      areaBackgroundColor: '#FFF',
      provinceColor: {
        [provinceid]: 'provinceSelected'
      }
    });
        that.setData({
          areaArray,
          areaBackgroundColor: '#F0F0F0',
          cityColor: {
            [cityid]: 'provinceSelected'
          }
        });*/
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
        let that = this;
        let scroll = app.globalData.screenHeight;
        let query = this.createSelectorQuery();
        query.select("#city_bar").boundingClientRect();
        query.select("#city_now").boundingClientRect();
        query.exec(res => {
            that.setData({
                scrollableHeight: scroll - res[0].height - res[1].height - 16
            });
        });
        let provinceArray = [];
        Object.keys(app.globalData.cityArray).forEach(id => {
            provinceArray.push(app.globalData.cityArray[id]);
        });
        this.setData({
            customHeadHeight: app.globalData.customHeadHeight,
            imgsize: app.globalData.imgsize,
            city_code: app.globalData.gpscity_code,
            city: app.globalData.gpscity,
            provinceArray,
            screenHeight: app.globalData.screenHeight
        });
        this.onLoad();
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
    onLocationTap: function() {
        let pages = getCurrentPages();
        let prevpages = pages[pages.length - 2];
        app.globalData.city = app.globalData.gpscity;
        app.globalData.city_code = app.globalData.gpscity_code;

        _my.navigateBack({
            delta: 1
        });

        prevpages.onLocationChange();
    },
    onProvinceTap: function(evt) {
        let that = this;
        let provinceid = evt.target.dataset.provinceid;
        this.data.provinceArray.forEach(province => {
            if (province.id == provinceid) {
                let { citys } = province;
                let cityArray = [];
                Object.keys(citys).forEach(cityid => {
                    cityArray.push(citys[cityid]);
                });
                that.setData({
                    cityArray,
                    cityBackgroundColor: "#F7F7F7",
                    areaArray: [],
                    areaBackgroundColor: "#FFF",
                    provinceColor: {
                        [provinceid]: "provinceSelected"
                    }
                });
            }
        });
    },
    onCityTap: function(evt) {
        let that = this;
        let cityid = evt.target.dataset.cityid;
        let areaArray = [];
        this.data.cityArray.forEach(city => {
            if (city.id == cityid) {
                let { areas } = city;
                let areaArray = [];
                Object.keys(areas).forEach(areaid => {
                    areaArray.push(areas[areaid]);
                });
                app.globalData.selectedCity = city.fullname;
                that.setData({
                    areaArray,
                    areaBackgroundColor: "#F0F0F0",
                    cityColor: {
                        [cityid]: "provinceSelected"
                    }
                });
            }
        });
    },
    onAreaTap: function(evt) {
        let that = this;
        let areaid = evt.target.dataset.areaid;
        let cityid = areaid.slice(0, 4) + "00";

        if (cityid == areaid) {
            this.data.cityArray.forEach(city => {
                if (city.id === cityid) {
                    app.globalData.city_code = cityid;
                    app.globalData.city = city.fullname;
                    return;
                }
            });
        } else {
            this.data.areaArray.forEach(area => {
                if (area.id === areaid) {
                    app.globalData.city_code = areaid;
                    app.globalData.city = area.fullname;
                    return;
                }
            });
        }

        let pages = getCurrentPages();
        let prevpages = pages[pages.length - 2];
        prevpages.onLocationChange();

        _my.navigateBack({
            delta: 1
        });
    }
});
