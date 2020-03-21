const _Component = require("../../__antmove/component/componentClass.js")(
    "Component"
);
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/components/titlebar/titlebar"
    }
});
const app = getApp();

_Component({
    properties: {
        title: {
            type: String,
            value: ""
        },
        locationid: {
            type: String,
            value: 0
        },
        location: {
            type: String,
            value: "获取中"
        },
        statusimg: {
            type: String,
            value: "../../images/loading.gif"
        },
        imgsize: {
            type: Number,
            value: 16
        }
    },
    data: {
        customHeadHeight: 0,
        customHeadTopPadding: 0,
        show: false
    },
    lifetimes: {
        attached() {}
    },
    ready: function() {
        app.globalData.initPromise.then(data => {
            this.setData({
                customHeadHeight: data.headHeight,
                customHeadTopPadding: data.customHeadTopPadding
            });
        });
    },
    methods: {
        onBackTap: function() {
            let pages = getCurrentPages();

            if (pages.length >= 2) {
                _my.navigateBack();
            } else {
                _my.switchTab({
                    url: "/pages/home/index"
                });
            }
        },
        onTitleTap: function(evt) {
            console.log();

            _my.showActionSheet({
                itemList: ["修改", "删除"],
                success: res => {
                    console.log(res.tapIndex);
                }
            });
        }
    }
});
