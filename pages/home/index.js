const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
  key: "activeComponent",
  data: {
    is: "/pages/home/index"
  }
}); //index.js

var QQMapWX = require("../../libs/qqmapsdk/qqmap-wx-jssdk.js");

const qqmapsdk = new QQMapWX({
  key: "BNVBZ-TGL62-VH6UK-CID3D-MZMJ6-RDFEO"
});
const app = getApp();

const initPromise = require("../../utils.js");

_Page({
  properties: {
    customHeadHeight: {
      type: Number,
      value: 50
    },
    customHeadTopPadding: {
      type: Number,
      value: 32
    },
    imgsize: {
      type: Number,
      value: 16
    },
    screenHeight: {
      type: Number,
      value: 0
    }
  },
  data: {
    app,
    logged: false,
    takeSession: false,
    requestResult: "",
    customHeadHeight: 0,
    customHeadTopPadding: 0,
    regions: ["上海市", "上海市", "浦东新区"],
    currentRegion: "地区",
    type: [
      {
        key: 0,
        value: "全部"
      },
      {
        key: 1,
        value: "汪汪"
      },
      {
        key: 2,
        value: "喵~"
      }
    ],
    currentType: 0,
    currentTypeName: "全部",
    bannerArray: [],
    show: false,
    petArrayLeft: [],
    petArrayRight: [],
    next: "",
    currentLocationId: "",
    showSubBtn: false,
    subscribeInfoShow: false
  },
  onShareAppMessage: function() {
    return {
      title: "给你安利一个可以免费领养宠物的小程序~",
      path: "/pages/home/index",
      imageUrl: "/images/index.png"
    };
  },
  onReachBottom: function() {
    let that = this;
    let { petArrayLeft, petArrayRight, next } = this.data;

    _my.showLoading({
      title: "寻找中"
    });

    _my.request({
      url: next,
      method: "get",
      header: {
        "page-size": 100
      },
      success: res => {
        _my.hideLoading();

        if (res.statusCode == 200) {
          let { petArrayLeft, petArrayRight } = that.data;
          res.data.forEach(banner => {
            let gender = banner.gender;

            if (gender === 1) {
              banner.genderUrl = "../../images/male.svg";
            } else if (gender === 2) {
              banner.genderUrl = "../../images/female.svg";
            } else {
              banner.genderUrl = "";
            }

            banner.year = parseInt(banner.age / 12);
            banner.month = banner.age % 12;
            banner.locationStr = app.location2ProvinceCity(
              banner.location
            );
          });

          if (res.data.length % 2 == 1) {
            let middle = (res.data.length + 1) / 2;

            if (petArrayLeft.length == petArrayRight.length) {
              that.setData({
                petArrayLeft: petArrayLeft.concat(
                  res.data.slice(0, middle)
                ),
                petArrayRight: petArrayRight.concat(
                  res.data.slice(middle, res.data.length)
                )
              });
            } else {
              that.setData({
                petArrayRight: petArrayRight.concat(
                  res.data.slice(0, middle)
                ),
                petArrayLeft: petArrayLeft.concat(
                  res.data.slice(middle, res.data.length)
                )
              });
            }
          } else {
            let middle = res.data.length / 2;
            that.setData({
              petArrayLeft: petArrayLeft.concat(
                res.data.slice(0, middle)
              ),
              petArrayRight: petArrayRight.concat(
                res.data.slice(middle, res.data.length)
              )
            });
          }

          let next = res.header.Next;
          this.setData({
            next
          });
        }
      }
    });
  },

  onRegionPickerChange(evt) {
    this.setData({
      currentRegion: evt.detail.value[2]
    });
  },

  onTypePickerChange(evt) {
    let target = this.data.type[evt.detail.value];
    this.setData({
      currentType: target.key,
      currentTypeName: target.value
    });
  },

  onLeftCardTap(evt) {
    let id = evt.currentTarget.dataset.id;
    let exist = false;
    let { login, userInfo } = app.globalData;

    _my.navigateTo({
      url: "../adoptionDetail/adoptionDetail?id=" + id //url: `../adoptionSupport/adoptionSupport?id=${id}`,
    });
  },

  onRightCardTap(evt) {
    let id = evt.currentTarget.dataset.id;
    let exist = false;
    let { login, userInfo } = app.globalData;

    _my.navigateTo({
      url: "../adoptionDetail/adoptionDetail?id=" + id //url: `../adoptionSupport/adoptionSupport?id=${id}`,
    });
  },

  onLoad: function(options) {
    var that = this;
    console.log('onLoad')
    _my.showLoading({
      title: "加载中",
      mask: true
    });

    let { target, id, locationid, pet_id, scene, resource } = options;
    console.log(app)
    app.globalData.initPromise.then(data => {
      let { login, userInfo, token } = data;
      console.log('initPromise.then')
      this.setData({
        customHeadHeight: data.customHeadHeight,
        customHeadTopPadding: data.customHeadTopPadding,
        location: data.city
      });
      /*if(resource){
    wx.request({
      url: 'https://',
    })
    }*/

      if (scene) {
        let petid = decodeURIComponent(scene);

        _my.navigateTo({
          url: `../adoptionDetail/adoptionDetail?id=${petid}`
        });
      }

      if (target) {
        _my.hideLoading();

        _my.showLoading({
          mask: true,
          title: "准备跳转中"
        });

        switch (target) {
          case "adoptionSupport": {
            _my.navigateTo({
              url: `../adoptionSupport/adoptionSupport?id=${id}`
            });

            break;
          }

          case "adoptionDetail": {
            _my.navigateTo({
              url: `../adoptionDetail/adoptionDetail?id=${id}`
            });

            break;
          }

          case "adoptionSupportNew": {
            _my.navigateTo({
              url: `../adoptionSupportNew/index?id=${id}`
            });

            break;
          }

          case "myRequestFailed": {
            _my.navigateTo({
              url: `../myRequest/myRequest?id=${id}`
            });

            break;
          }

          case "adoptionAgre": {
            _my.navigateTo({
              url: `../adoptionAgre/adoptionAgre?id=${id}&pet_id=${pet_id}`
            });

            break;
          }

          case "myAdoption": {
            _my.navigateTo({
              url: `../myAdoption/myAdoption`
            });

            break;
          }

          case "myPlaceoutShare": {
            _my.navigateTo({
              url: `../adoptionDetail/adoptionDetail?id=${id}`
            });

            break;
          }

          case "myPlaceoutAnswer": {
            _my.navigateTo({
              url: `../myPlaceoutAnswer/myPlaceoutAnswer?id=${id}`
            });

            break;
          }

          case "petComplete": {
            _my.navigateTo({
              url: `../petComplete/index?id=${id}`
            });

            break;
          }

          default: {
            _my.hideLoading();

            _my.showToast({
              icon: "none",
              title: "没有找到这个宠物"
            });
          }
        }
      }

      if (login) {
        _my.request({
          url:
            "https://api.woyuanyi.511cwpt.com/api/v1/users/" +
            userInfo.id +
            "/status",
          method: "get",
          header: {
            Authorization: "Bearer " + token
          },
          success: res => {
            if (res.statusCode == 200) {
              that.setData({
                showSubBtn: !res.data.wechat_pub_user
              });
            } else {
              that.setData({
                showSubBtn: false
              });
            }
          }
        });
      }

      _my.request({
        url: "https://api.woyuanyi.511cwpt.com/api/v1/banners",
        method: "get",
        success: res => {
          if (res.statusCode == 200) {
            that.setData({
              bannerArray: res.data
            });
          } else {
            that.setData({
              bannerArray: [
                {
                  cover: "../../images/banner.png",
                  url: "./index.wxml"
                }
              ]
            });
          }
        }
      });

      that.onPetsLoad();
    }).catch(err => {
      console.log(err)
    });
  },
  onShow: function() {
    //this.selectComponent('#index_title').onLocation(app.globalData.city_code, app.globalData.city);
  },
  onPetsLoad: function(agree) {
    let param = {
      order: "random",
      location: app.globalData.city_code
    };

    if (!this.data.currentLocationId) {
      this.setData({
        currentLocationId: app.globalData.city_code
      });
    } else {
      param.location = this.data.currentLocationId;
    }

    _my.showLoading({
      title: "寻找中"
    });

    _my.request({
      url: "https://api.woyuanyi.511cwpt.com/api/v1/pets",
      method: "get",
      data: param,
      header: {
        "page-size": 100
      },
      success: res => {
        if (res.statusCode == 200) {
          let next = res.header.Next;
          res.data.forEach(banner => {
            let gender = banner.gender;

            if (gender === 1) {
              banner.genderUrl = "../../images/male.svg";
            } else if (gender === 2) {
              banner.genderUrl = "../../images/female.svg";
            } else {
              banner.genderUrl = "";
            }

            banner.year = parseInt(banner.age / 12);
            banner.month = banner.age % 12;
            banner.locationStr = app.location2ProvinceCity(
              banner.location
            );
            banner.cover = banner.cover.replace(
              "http://",
              "https://"
            );
          });

          if (res.data.length % 2 == 1) {
            let middle = (res.data.length + 1) / 2;
            this.setData(
              {
                petArrayLeft: res.data.slice(0, middle),
                petArrayRight: res.data.slice(
                  middle,
                  res.data.length
                ),
                next
              },
              () => {
                _my.hideLoading();
              }
            );
          } else {
            let middle = res.data.length / 2;
            this.setData(
              {
                petArrayLeft: res.data.slice(0, middle),
                petArrayRight: res.data.slice(
                  middle,
                  res.data.length
                ),
                next
              },
              () => {
                _my.hideLoading();
              }
            );
          }
        } else {
          this.setData({
            petArrayLeft: [],
            petArrayRight: []
          });

          _my.hideLoading();
        }
      }
    });
  },
  onReady: function() {
    var that = this; //authorize

    /*
  wx.getSystemInfo({
    success: (result) => {
    that.setData({
      customHeadHeight: result.statusBarHeight + 50,
      customHeadTopPadding: result.statusBarHeight,
      imgsize: result.fontSizeSetting,
      screenHeight: result.windowHeight
    });
    }
  });*/
  },
  onAuth: function(code, options, obj = {}) {
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
          let userInfo = res.data.info,
            token = res.data.auth.token;
        }
      }
    });
  },
  onGetUserInfo: function(code, options) {
    let that = this;

    _my.getUserInfo({
      success(res) {
        let { userInfo } = res;
        let { nickName, avatarUrl } = userInfo;
        that.onAuth(code, options, userInfo);
      },

      fail: err => {
        err.location = "wx.getUserInfo existSetting";
      }
    });
  },
  onLocationChange: function() {
    if (
      this.data.currentLocationId &&
      app.globalData.city_code != this.data.currentLocationId
    ) {
      _my.showLoading({
        title: "寻找中"
      });

      this.setData(
        {
          currentLocationId: app.globalData.city_code
        },
        function() {
          this.onPetsLoad();
        }
      );
    }
  },
  onLocationOpen: function() {
    _my.navigateTo({
      url: "../locationSelect/locationSelect"
    });
  },
  onPopupClose: function() {
    this.setData({
      show: false
    });
  },
  onBannerTap: evt => {
    let { url, type } = evt.target.dataset;

    if (type == "mini-program") {
      _my.navigateTo({
        url
      });
    } else if (type == "link") {
      _my.navigateTo({
        url: "../article/article?url=" + url
      });
    }
  },
  onAdoptionTap: evt => {
    /*wx.requestSubscribeMessage({
    tmplIds: ['gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw', 'ThqPqWgyXTLs_pKLDoCcqjqhJfpUptPsFJjAFpfnrPo', 'tOCM2iAedX3UKPAlMZ_r2JwoVVfCs3Qf151YeVQEKdY'],
    success(res) {
    let { errMsg } = res;
    if (errMsg == 'requestSubscribeMessage:ok') {
      Object.keys(res).forEach(key => {
      if (key != "errMsg") {
        let value = res[key];
        if (value == "accept") {
        console.log(key + '订阅消息被预定');
        }
      }
      })
    }
    }
  })*/
    _my.navigateTo({
      url: "../adoptionGuild/adoptionGuild"
    });
  },
  onPlaceoutTap: evt => {
    //TODO

    /*wx.requestSubscribeMessage({
    tmplIds: ['gXwHrHFRc6x3S_YuO2FrvYDNN2b1bvme8d8Er5Gl9Vw', 'ThqPqWgyXTLs_pKLDoCcqjqhJfpUptPsFJjAFpfnrPo', 'NoHAk30hhf2aZS5gx_uy4RnVDYzI-0vc3hKiQHKcedw'],
    success(res) { 
    let { errMsg} = res;
    if (errMsg == 'requestSubscribeMessage:ok'){
      Object.keys(res).forEach(key=>{
      if (key !="errMsg"){
        let value = res[key];
        if(value=="accept"){
        console.log(key+'订阅消息被预定');
        }
      }
      })
    }
    }
  })*/
    _my.navigateTo({
      url: "../placeoutGuide/placeoutGuide"
    });
  },
  onUnload: function() {
    console.log("onUnload");
  },
  onShowSubscribe: function() {
    this.setData({
      subscribeInfoShow: true
    });
  },
  onSubscribeTap: function() {
    this.setData({
      subscribeInfoShow: false
    });
  }
});
