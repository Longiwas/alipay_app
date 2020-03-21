const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionHelp/index"
    }
}); // miniprogram/pages/adoptionHelp/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        imageUrl: ""
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        let { id } = options;
        let { customHeadHeight, userInfo, token, screenWidth } = app.globalData;
        let scale = screenWidth / 750;
        this.setData({
            customHeadHeight
        });

        if (id) {
            _my.showLoading({
                title: "生成图片中",
                mask: true
            });

            _my.getImageInfo({
                src: `https://api.woyuanyi.511cwpt.com/api/v1/pets/${id}/poster`,
                success: res => {
                    this.setData({
                        imageUrl: res.path
                    });
                },
                fail: res => {},
                complete: () => {
                    _my.hideLoading();
                }
            });
        }
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
    onShareAppMessage: function() {},
    onSaveTap: function() {
        let { imageUrl } = this.data;

        _my.saveImageToPhotosAlbum({
            filePath: imageUrl,
            success: () => {
                _my.showToast({
                    title: "已保存至微信相册"
                });
            },
            fail: () => {
                _my.showToast({
                    title: "保存失败"
                });
            }
        });
    }
});
