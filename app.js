const _App = require("./__antmove/component/componentClass.js")("App");
const _my = require("./__antmove/api/index.js")(my);
//app.js
const utilPromise = require("./utils.js");

_App({
    globalData: {
        initPromise: utilPromise,
        unread_handler: 0,
        submsg_handler: false
    },
    onLoad: function() {},
    onLaunch: function(options) {
        let { path, query } = options;

        _my.removeStorage({
            key: "placeoutQuesions",
            success: function(res) {}
        });

        this.globalData.initPromise.then(async data => {
            this.globalData = { ...this.globalData, ...data };

            if (data.unread) {
                _my.showTabBarRedDot({
                    index: 2
                });
            }

            if (path == "pages/adoption/adoption" && query.id) {
                let { id } = query;
                let city = this.location2String(id);
                this.globalData.city_code = id;
                this.globalData.city = city;
                this.globalData.selectedCity = city;
            }

            this.globalData.getUnreadStatus = () => {
                let unread = false;

                if (data.login) {
                    _my.request({
                        url:
                            "https://api.woyuanyi.511cwpt.com/api/v1/messages-reading-status",
                        method: "GET",
                        header: {
                            Authorization: "Bearer " + data.token
                        },
                        success: res => {
                            if (res.statusCode == 200) {
                                let {
                                    unread_common_msgs,
                                    unread_system_msgs,
                                    unread_offical_msgs,
                                    unread_likes
                                } = res.data;

                                if (
                                    unread_common_msgs ||
                                    unread_system_msgs ||
                                    unread_offical_msgs ||
                                    unread_likes
                                ) {
                                    unread = true;
                                }
                            }
                        },
                        complete: () => {
                            if (unread) {
                                _my.showTabBarRedDot({
                                    index: 2
                                });
                            } else {
                                _my.hideTabBarRedDot({
                                    index: 2
                                });
                            }
                        }
                    });
                }
            };

            this.globalData.unread_handler = setInterval(() => {
                this.globalData.getUnreadStatus();
            }, 60 * 1000);
        });
        /*var that = this;
    let systemInfo = await this.getSystemInfo();
    let login = await this.getSetting();
    let loginData = await this.login();
    this.globalData = {
      qqmapsdk,
      cityPromise: this.getCityList(),
    
      appPromise: new Promise((yes, no) => {
        this.globalData = {
          ...this.globalData,
          customHeadHeight: systemInfo.screenHeight - systemInfo.windowHeight + systemInfo.statusBarHeight + 20,
          headHeight: systemInfo.screenHeight - systemInfo.windowHeight,
          customHeadTopPadding: systemInfo.statusBarHeight,
          imgsize: systemInfo.fontSizeSetting,
          screenHeight: systemInfo.windowHeight,
          screenWidth: systemInfo.windowWidth,
          login,
          userInfo: loginData.info,
          token: loginData.auth.token,
        }
        yes();
      })
    };
     .then(()=>{
      
    }).then(()=>{
      
      wx.getSetting({
        success(res2) {
          if (res2.authSetting['scope.userInfo']) {
            that.globalData.login = true;
          } else {
            that.globalData.login = false;
          }
        },
        fail: () => {
         }
      });
    });*/
    },
    onShow: function() {},
    getCityList: function() {
        return new Promise((yes, no) => {
            //腾讯位置服务
            let cityArray = _my.getStorageSync("cityArray");

            if (cityArray) {
                yes(cityArray);
            } else {
                qqmapsdk.getCityList({
                    sig: "axlUm4gJzYzTrBVsFOcCdtftQRrZFt",
                    success: function(res, data) {
                        if (res.status === 0) {
                            cityArray = that.filterCityList(res);

                            _my.setStorage({
                                key: "cityArray",
                                data: cityArray
                            });

                            yes(cityArray);
                        }
                    },
                    fail: err => {
                        no(err);
                    }
                });
            }
        });
    },
    login: function() {
        return new Promise((yes, no) => {
            _my.login({
                success: res => {
                    let { code } = res;

                    _my.request({
                        url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                        method: "POST",
                        data: {
                            type: "mini-program",
                            data: {
                                code
                            }
                        },
                        success: res => {
                            if (res.statusCode == 200) {
                                yes(res.data);
                            }
                        }
                    });
                }
            });
        });
    },
    getSetting: function() {
        return new Promise((yes, no) => {
            _my.getSetting({
                success: res2 => {
                    if (res2.authSetting["scope.userInfo"]) {
                        yes(true);
                    } else {
                        yes(false);
                    }
                }
            });
        });
    },
    getSystemInfo: function() {
        return new Promise((yes, no) => {
            _my.getSystemInfo({
                success: result => {
                    /*that.globalData = {
            ...that.globalData,
            customHeadHeight: result.screenHeight - result.windowHeight + result.statusBarHeight + 20,
            headHeight: result.screenHeight - result.windowHeight,
            customHeadTopPadding: result.statusBarHeight,
            imgsize: result.fontSizeSetting,
            screenHeight: result.windowHeight,
            screenWidth: result.windowWidth,
            login: false,
            userInfo: {
              avatarUrl: '../../images/user-unlogin.png'
            }
          };*/
                    yes(result);
                }
            });
        });
    },
    filterCityList: function(cityArray) {
        let [provinces, citys, areas] = cityArray.result;
        let returnObj = {};
        provinces.forEach(province => {
            province.citys = {};
            returnObj[province.id] = province;
        });
        citys.forEach(city => {
            //最后两位为0
            let realCityId = city.id.slice(0, 4) + "00";
            let provinceid = city.id.slice(0, 2) + "0000";
            let last = city.id.slice(4, 6);

            if (last == "00") {
                if (returnObj[provinceid]) {
                    city.areas = {
                        [city.id]: {
                            id: city.id,
                            name: "不限",
                            fullname: "不限",
                            pinyin: ["bu", "xian"],
                            location: city.location
                        }
                    };
                    returnObj[provinceid].citys[city.id] = city;
                }
            } else {
                if (returnObj[provinceid]) {
                    if (returnObj[provinceid].citys[realCityId]) {
                        returnObj[provinceid].citys[realCityId].areas[
                            city.id
                        ] = city;
                    } else {
                        let province = returnObj[provinceid];
                        returnObj[provinceid].citys[realCityId] = {
                            id: realCityId,
                            name: province.name,
                            fullname: province.fullname,
                            pinyin: province.pinyin,
                            location: province.location,
                            areas: {
                                [realCityId]: {
                                    id: realCityId,
                                    name: "不限",
                                    fullname: "不限",
                                    pinyin: ["bu", "xian"],
                                    location: city.location
                                },
                                [city.id]: city
                            }
                        };
                    }
                }
            }
        });
        areas.forEach(area => {
            let cityId = area.id.slice(0, 4) + "00";
            let provinceid = area.id.slice(0, 2) + "0000";

            if (returnObj[provinceid] && returnObj[provinceid].citys[cityId]) {
                returnObj[provinceid].citys[cityId].areas[area.id] = area;
            }
        });
        return returnObj;
    },
    location2String: function(location) {
        let { cityArray } = this.globalData;
        let locationArray = location.split(".");

        if (locationArray.length == 1) {
            let cityid = locationArray[0];
            let provinceid = cityid.substring(0, 2) + "0000";
            let province = cityArray[provinceid];

            if (province) {
                let city = province.citys[cityid];
                if (city) return city.fullname;
                else return province.fullname;
            } else return "未知";
        } else if (locationArray.length == 3) {
            let province = cityArray[locationArray[0]];

            if (province) {
                let city = province.citys[locationArray[1]];

                if (city) {
                    let area = city.areas[locationArray[2]];

                    if (area) {
                        return (
                            province.fullname +
                            "-" +
                            city.fullname +
                            "-" +
                            area.fullname
                        );
                    } else {
                        return province.fullname + "-" + city.fullname;
                    }
                } else {
                    return province.fullname;
                }
            } else {
                return "未知";
            }
        } else {
            return "未知";
        }
    },
    location2ProvinceCity: function(location) {
        let { cityArray } = this.globalData;
        let locationArray = location.split(".");

        if (locationArray.length == 1) {
            let cityid = locationArray[0];
            let provinceid = cityid.substring(0, 2) + "0000";
            let province = cityArray[provinceid];

            if (province) {
                let city = province.citys[cityid];
                if (city) return city.fullname;
                else return province.fullname;
            } else return "未知";
        } else if (locationArray.length == 3) {
            let province = cityArray[locationArray[0]];

            if (province) {
                let city = province.citys[locationArray[1]];

                if (city) {
                    return province.fullname + "-" + city.fullname;
                } else {
                    return province.fullname;
                }
            } else {
                return "未知";
            }
        } else {
            return "未知";
        }
    },
    showModalPromise: function(title, content, showCancel = true) {
        return new Promise((yes, no) => {
            _my.showModal({
                title,
                content,
                showCancel,
                success: res => {
                    if (res.confirm) yes();
                    else
                        no({
                            location: "showModalPromise",
                            reason: "showModal success, res.confirm false"
                        });
                },
                fail: () => {
                    no({
                        location: "showModalPromise",
                        reason: "showModal failed."
                    });
                }
            });
        });
    },
    getAuthorizeTemplatesStatus: function(templateIds) {
        let { token } = this.globalData;
        return new Promise((yes, no) => {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/users-template-records",
                method: "GET",
                header: {
                    Authorization: "Bearer " + token
                },
                data: {
                    template_id: templateIds.join(",")
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 404) {
                        yes([]);
                    } else if (statusCode == 200) {
                        yes(data);
                    } else {
                        no(res);
                    }
                },
                fail: () => {
                    no({
                        statusCode: 404
                    });
                }
            });
        });
    },
    requestSubscribeMessage: function(templateIds) {
        let result = [];
        return new Promise((yes, no) => {
            _my.requestSubscribeMessage({
                tmplIds: templateIds,

                success(res) {
                    let { errMsg } = res;

                    if (errMsg == "requestSubscribeMessage:ok") {
                        Object.keys(res).forEach(key => {
                            if (key != "errMsg") {
                                if (res[key] == "accept") {
                                    result.push(key);
                                }
                            }
                        });
                    }
                },

                complete: () => {
                    yes(result);
                }
            });
        });
    },
    uploadTemplateAuthorize: function(result) {
        let { token } = this.globalData;
        return new Promise((yes, no) => {
            if (result.length <= 0) {
                yes();
            } else {
                _my.request({
                    url:
                        "https://api.woyuanyi.511cwpt.com/api/v1/users-template-records",
                    method: "POST",
                    header: {
                        Authorization: "Bearer " + token
                    },
                    data: {
                        template_ids: result
                    },
                    success: res => {
                        let { statusCode } = res;

                        if (statusCode == 201) {
                            yes(true);
                        } else {
                            yes(false);
                        }
                    },
                    fail: () => {
                        no();
                    }
                });
            }
        });
    }
});
