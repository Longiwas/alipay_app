const _Component = require("../../__antmove/component/componentClass.js")(
    "Component"
);
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/components/login-window/index"
    }
}); // components/login_window/index.js

const app = getApp();

_Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {},

    /**
     * 组件的方法列表
     */
    methods: {
        onClose: function() {
            this.setData({
                show: false
            });
        },
        login: function() {
            return new Promise((yes, no) => {
                _my.login({
                    timeout: 3000,
                    success: res => {
                        if (res.code) {
                            yes(res.code);
                        } else {
                            no({
                                detail: "no code",
                                location: "login"
                            });
                        }
                    },
                    fail: e => {
                        no({
                            detail: e,
                            location: "login"
                        });
                    }
                });
            });
        },
        authorize: function(code, obj) {
            obj.location = "";
            return new Promise((yes, no) => {
                _my.request({
                    url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                    method: "POST",
                    data: {
                        type: "alipay",
                        data: {
                            code,
                            ...obj
                        }
                    },
                    success: res => {
                        let { statusCode, data } = res;

                        if (statusCode == 200) {
                            app.globalData.login = true;
                            app.globalData.userInfo = data.info;
                            app.globalData.token = data.auth.token;
                            yes(data);
                        } else {
                            no({
                                detail: {
                                    statusCode,
                                    data
                                },
                                location: "authorize"
                            });
                        }
                    },
                    fail: e => {
                        no({
                            detail: e,
                            location: "authorize"
                        });
                    }
                });
            });
        },
        onAuthorizeTap: async function(evt) {
            let { userInfo } = evt.detail;

            if (userInfo) {
                _my.showLoading({
                    title: "登录中"
                });

                try {
                    let code = await this.login();
                    let data = await this.authorize(code, userInfo);
                    this.triggerEvent("complete", {
                        userInfo: data
                    });

                    _my.showToast({
                        icon: "none",
                        title: `登录成功`
                    });

                    this.onClose();
                } catch (e) {
                    let { location, detail } = e;

                    if (location) {
                        _my.showToast({
                            icon: "none",
                            title: `登录失败, 请稍后重试(${location})`
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "系统错误"
                        });

                        console.log(e);
                    }
                } finally {
                    _my.hideLoading();
                }
            } else {
                _my.showToast({
                    icon: "none",
                    title: "您取消了授权"
                });
            }
        },
        onComplete: function() {}
    }
});
