const _my = require("./__antmove/api/index.js")(my);
const app = getApp(); //QQ Map SDK

var QQMapWX = require("./libs/qqmapsdk/qqmap-wx-jssdk.js");

const qqmapsdk = new QQMapWX({
    key: "BNVBZ-TGL62-VH6UK-CID3D-MZMJ6-RDFEO"
});
const submsg_status = [
    "gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw", //站内信提醒
    "NoHAk30hhf2aZS5gx_uy4RnVDYzI-0vc3hKiQHKcedw", //评论回复通知
    "tOCM2iAedX3UKPAlMZ_r2JwoVVfCs3Qf151YeVQEKdY", //新的评论提醒
    "iKbBE4VBuCuSN6j6eVWOCPiIYHZVihfe1uawo6vv9zo", //申请领养结果通知
    "CkM-XwOcFsjV4dpmEp0JKshhshJzKmJLj5JRm1a3s-8", //申请领养通知
    "4Rs11-eFAc-WdEfCNWUrz5t32fbzG2d_jrvki6W83VM" //审核结果通知
];

function getCityList() {
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
                        cityArray = filterCityList(res);

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
}

function login() {
    return new Promise((yes, no) => {
        _my.login({
            success: res => {
                let { code } = res;
                console.log('login', res)
                _my.request({
                    url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                    method: "POST",
                    data: {
                        type: "alipay",
                        data: {
                            type: 'auth_base',
                            code
                        }
                    },
                    success: res => {
                        console.log('seccess', res)
                        if (res.statusCode == 200) {
                            yes(res.data);
                        }
                    },
                    fail: err => {
                        console.log('fail', err)
                        no(err)
                    }
                });
            }
        });
    });
}

function getSetting() {
    return new Promise((yes, no) => {
        _my.getAuthCode({
            scopes: 'auth_base',
            success: res2 => {
                console.log('auth_base', res2)
                if (res2.authCode) {
                    yes(true);
                } else {
                    yes(false);
                }
            },
            fail: err => {
                no(err);
            }
        });
    });
}

function getLocationInfo() {
    return new Promise((yes, no) => {
        _my.getSetting({
            success(res) {
                if (res.authSetting["scope.userLocation"]) {
                    yes(true);
                } else {
                    yes(false);
                }
            },

            fail: err => {
                err.location = "wx.getSetting scope.userLocation";
                no(err);
            }
        });
    });
}

function authorizeLocation() {
    return new Promise((yes, no) => {
        _my.authorize({
            scope: "scope.userLocation",

            success() {
                yes(true);
            },

            fail(err) {
                _my.showToast({
                    icon: "none",
                    title: "未获取到坐标信息,定位可能无法使用"
                });

                yes(false);
            }
        });
    });
}

function getUserLocation() {
    return new Promise((yes, no) => {
        _my.getLocation({
            type: "gcj02",
            success: function(res) {
                let { latitude, longitude } = res;
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude,
                        longitude
                    },
                    sig: "axlUm4gJzYzTrBVsFOcCdtftQRrZFt",
                    success: function(res, data) {
                        if (res.status === 0) {
                            let {
                                city,
                                adcode,
                                nation_code
                            } = res.result.ad_info;

                            if (nation_code == "156") {
                                let city_code = adcode.slice(0, 4) + "00";
                                yes({
                                    city_code,
                                    city
                                });
                            } else {
                                yes({
                                    city_code: "100000",
                                    city: "全国"
                                });
                            }
                        }
                    },
                    fail: err => {
                        yes({
                            city_code: "100000",
                            city: "全国"
                        });
                    }
                });
            },
            fail: function(err) {
                yes({
                    city_code: "100000",
                    city: "全国"
                });
            }
        });
    });
}

function getSystemInfo() {
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
}

function getUnread(token) {
    let unread = false;
    return new Promise((yes, no) => {
        if (token) {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/messages-reading-status",
                method: "GET",
                header: {
                    Authorization: "Bearer " + token
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
                    yes(unread);
                }
            });
        } else {
            yes(unread);
        }
    });
}

function filterCityList(cityArray) {
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
}

function getSubscribeMessageStatus(token) {
    return new Promise((yes, no) => {
        _my.request({
            url:
                "https://api.woyuanyi.511cwpt.com/api/v1/users-template-records",
            method: "GET",
            header: {
                Authorization: "Bearer " + token
            },
            data: {
                template_id: submsg_status.join(",")
            },
            success: res => {
                let { statusCode, data } = res;
                let returnData = {};
                submsg_status.forEach(item => {
                    returnData[item] = false;
                });

                if (statusCode == 404) {
                    yes(returnData);
                } else if (statusCode == 200) {
                    data.forEach(item => {
                        returnData[item.template_id] = true;
                    });
                    yes(returnData);
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
}

function onReady() {
    return new Promise(async (yes, no) => {
        try {
            let systemInfo = await getSystemInfo();
            let loginResult = await getSetting();
            let loginData = {
                info: {},
                auth: {
                    token: ""
                }
            };

            console.log('loginResult', loginResult)
            if (loginResult) {
                loginData = await login();
            }
            console.log(loginData)
            let cityList = await getCityList();
            let locationAuth = await getLocationInfo();
            let unread = await getUnread(loginData.auth.token); //let submsgStatus = await getSubscribeMessageStatus(loginData.auth.token);

            let promiseData = {
                qqmapsdk,
                customHeadHeight:
                    systemInfo.screenHeight -
                    systemInfo.windowHeight +
                    systemInfo.statusBarHeight,
                headHeight: systemInfo.screenHeight - systemInfo.windowHeight,
                customHeadTopPadding: systemInfo.statusBarHeight,
                imgsize: systemInfo.fontSizeSetting,
                screenHeight: systemInfo.windowHeight,
                screenWidth: systemInfo.windowWidth,
                login: loginResult,
                userInfo: loginData.info,
                token: loginData.auth.token,
                cityPromise: getCityList(),
                cityArray: cityList,
                unread //submsg_status: submsgStatus
            };

            if (locationAuth) {
                let userLocation = await getUserLocation();
                promiseData = {
                    ...promiseData,
                    gpscity_code: userLocation.city_code,
                    gpscity: userLocation.city,
                    city_code: userLocation.city_code,
                    city: userLocation.city,
                    selectedCity: userLocation.city
                };
            } else {
                let authorizedLocation = await authorizeLocation();

                if (authorizedLocation) {
                    let userLocation = await getUserLocation();
                    promiseData = {
                        ...promiseData,
                        gpscity_code: userLocation.city_code,
                        gpscity: userLocation.city,
                        city_code: userLocation.city_code,
                        city: userLocation.city,
                        selectedCity: userLocation.city
                    };
                } else {
                    promiseData = {
                        ...promiseData,
                        gpscity_code: "100000",
                        gpscity: "全国",
                        city_code: "100000",
                        city: "全国",
                        selectedCity: "全国"
                    };
                }
            }

            yes(promiseData);
        } catch (e) {
            console.log(e);
            no(e);
        }
    });
}

module.exports = onReady();
