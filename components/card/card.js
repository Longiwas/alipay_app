const _Component = require("../../__antmove/component/componentClass.js")(
    "Component"
);
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/components/card/card"
    }
});
const app = getApp();

_Component({
    properties: {
        petid: {
            type: String,
            value: ""
        },
        imgsrc: {
            type: String,
            value: ""
        },
        name: {
            type: String,
            value: ""
        },
        year: {
            type: Number,
            value: 0
        },
        month: {
            type: Number,
            value: 0
        },
        location: {
            type: String,
            value: ""
        },
        height: {
            type: Number,
            value: (_my.getSystemInfoSync().windowWidth - 3 * 16) / 2
        },
        fontSize: {
            type: Number,
            value:
                (_my.getSystemInfoSync().windowWidth - 3 * 16) / 2 < 150
                    ? 12
                    : 14
        },
        gender: {
            type: Number,
            value: 1
        },
        genderUrl: {
            type: String,
            value: ""
        },
        tags: {
            type: Array,
            value: []
        }
    },
    data: {
        locationStr: ""
    },
    lifetimes: {
        attached: function() {}
    },
    ready: function() {
        let that = this;
        let { location, imgsrc } = that.properties;
        app.globalData.initPromise.then(cityArray => {
            that.setData({
                locationStr: app.location2ProvinceCity(location)
            });
        });
        that.setData({
            imgsrc: imgsrc + "?imageMogr2/thumbnail/300x"
        });
    },
    methods: {
        setLocation: function(cityArray) {
            let { location, imgsrc } = this.properties;
            let locationArray = location.split(".");

            if (locationArray.length == 3) {
                let province = cityArray[locationArray[0]];

                if (province) {
                    let city = province.citys[locationArray[1]];

                    if (city) {
                        let area = city.areas[locationArray[2]];

                        if (area) {
                            this.setData({
                                locationStr: area.fullname
                            });
                        } else {
                            this.setData({
                                locationStr: city.fullname
                            });
                        }
                    } else {
                        this.setData({
                            locationStr: province.fullname
                        });
                    }
                }
            }
        }
    }
});
