const _Component = require("../../__antmove/component/componentClass.js")(
    "Component"
);
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/components/navbar/navbar"
    }
});
const app = getApp();

_Component({
    properties: {
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
            value: "location-o"
        },
        imgsize: {
            type: Number,
            value: 16
        },
        title: {
            type: String,
            value: ""
        },
        showLocation: {
            type: Boolean,
            value: true
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
    pageLifetimes: {
        show: function() {
            app.globalData.initPromise.then(promiseData => {
                this.setData({
                    locationid: app.globalData.city_code,
                    location: app.globalData.city
                });
            });
        }
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
        locationTap: function() {
            _my.navigateTo({
                url: "../../pages/locationSelect/locationSelect"
            });
        },
        onLocation: function(locationid, location) {
            this.setData({
                locationid: locationid,
                location: location,
                statusimg: "location-o"
            });
        }
    }
});
