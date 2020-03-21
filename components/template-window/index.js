const _Component = require("../../__antmove/component/componentClass.js")(
    "Component"
);
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/components/template-window/index"
    }
}); // components/template-window/index.js

const app = getApp();

_Component({
    /**
     * 组件的属性列表
     */
    properties: {
        show: {
            type: Boolean,
            value: false
        },
        templateIds: {
            type: Array,
            value: []
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
        //return ['id', 'id']
        onConfirmTap: async function(evt) {
            _my.showLoading({
                title: "检查中"
            });

            let { templateIds } = this.data;
            let result = [];

            try {
                result = await app.requestSubscribeMessage(templateIds);
                await app.uploadTemplateAuthorize(templateIds);
            } catch (e) {
                console.error(e);
            } finally {
                this.setData({
                    show: false
                });

                _my.hideLoading();

                this.triggerEvent("AuthorizeComplete", result);
            }
        }
    }
});
