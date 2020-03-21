const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionComments/index"
    }
}); // miniprogram/pages/adoptionComments/index.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        customHeadHeight: 0,
        placeholder: "请输入评论",
        ref: "",
        ref_name: "",
        show_post: false,
        petId: "",
        comment: "",
        pet: {},
        template_show: false,
        templateStatus: false,
        templateIds: [
            "NoHAk30hhf2aZS5gx_uy4RnVDYzI-0vc3hKiQHKcedw",
            "tOCM2iAedX3UKPAlMZ_r2JwoVVfCs3Qf151YeVQEKdY"
        ]
    },
    getRecord: function(id) {
        let { token, userInfo } = app.globalData;
        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + id,
                method: "get",
                header: {
                    Authorization: "Bearer " + token,
                    "user-id": userInfo.id
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode === 200) {
                        let { gender, age } = data;
                        let genderUrl = "../../images/";
                        if (gender === 0) genderUrl = "";
                        else if (gender === 1) genderUrl += "male.svg";
                        else if (gender === 2) genderUrl += "female.svg";
                        data = {
                            ...data,
                            genderUrl,
                            year: parseInt(age / 12),
                            month: age % 12
                        };
                        yes(data);
                    } else {
                        no({
                            statusCode
                        });
                    }
                }
            });
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function(options) {
        let { templateIds } = this.data;
        let { id, commentid } = options;
        let { userInfo, token, login, customHeadHeight } = app.globalData;
        this.setData({
            customHeadHeight,
            petId: id
        });
        let body = `target_id=${id}`;
        let commentBody = "";

        if (commentid) {
            commentBody = `/${commentid}/context`;
            this.setData({
                comment_all: true
            });
        } else {
            this.setData({
                comment_all: false
            });
        }

        let header = {};

        if (login) {
            header = {
                Authorization: "Bearer " + token,
                "user-id": userInfo.id
            };
        }

        if (id) {
            try {
                let pet = await this.getRecord(id);
                let templateStatus = await app.getAuthorizeTemplatesStatus(
                    templateIds
                );
                this.setData({
                    pet,
                    templateStatus: templateStatus.length == templateIds.length
                });
            } catch (e) {
                if (e.statusCode) {
                    _my.showModal({
                        title: "宠物信息获取失败",
                        content: "宠物信息获取失败, 请点击确定返回重试",
                        showCancel: false,
                        success: () => {
                            _my.navigateBack({});
                        }
                    });
                } else {
                    console.error(e);
                }
            }

            _my.request({
                url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages${commentBody}?${body}&order=asc&type=reply`,
                method: "get",
                header,
                success: res => {
                    let { statusCode, data, header } = res;

                    if (statusCode === 200) {
                        let now = new Date();
                        data.forEach(item => {
                            if (item.created) {
                                let date = new Date(item.created);

                                if (
                                    now.getFullYear() != date.getFullYear() ||
                                    now.getMonth() != date.getMonth() ||
                                    now.getDate() - date.getDate() > 2
                                ) {
                                    item.date_str = item.created.split(" ")[0];
                                } else {
                                    let seconds =
                                        (now.getTime() - date.getTime()) / 1000;
                                    let minutes = seconds / 60;
                                    let hours = minutes / 60;

                                    if (hours < 1) {
                                        if (minutes < 1) {
                                            item.date_str =
                                                parseInt(seconds) + "秒前";
                                        } else {
                                            item.date_str =
                                                parseInt(minutes) + "分钟前";
                                        }
                                    } else {
                                        item.date_str =
                                            parseInt(hours) + "小时前";
                                    }
                                }

                                let mill = now.getTime() - date.getTime();
                            }
                        });
                        this.setData({
                            comments: data
                        });
                    } else {
                        this.setData({
                            comments: []
                        });
                    }
                }
            });
        } else {
            _my.navigateBack({});
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
    onContentInput: function(evt) {
        let { value } = evt.detail;

        if (value) {
            this.setData({
                show_post: true,
                comment: value
            });
        } else {
            this.setData({
                show_post: false,
                comment: value
            });
        }
    },
    onReplyTap: function(evt) {
        let { author, authorname } = evt.currentTarget.dataset;
        this.setData({
            comment_focus: true,
            placeholder: `回复${authorname}:`,
            ref: author
        });
    },
    onCommentLikeTap: function(evt) {
        let { like, id } = evt.currentTarget.dataset;
        let { token, login } = app.globalData;

        if (!login) {
            this.setData({
                login_action: "comment_like",
                login_params: {
                    currentTarget: {
                        dataset: {
                            like,
                            id
                        }
                    }
                },
                loginShow: true
            });
        } else {
            let url = `https://api.woyuanyi.511cwpt.com/api/v1/common-messages/${id}/${
                like ? "dislike" : "like"
            }`;
            let { comments } = this.data;

            _my.request({
                url,
                method: "PUT",
                header: {
                    Authorization: `Bearer ${token}`
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 200) {
                        comments.every(item => {
                            if (item.id == id) {
                                item.is_like = !like;
                                return false;
                            }

                            return true;
                        });
                        this.setData({
                            comments
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "网络错误, 点赞评论失败"
                        });
                    }
                }
            });
        }
    },
    onCommentPostTap: async function() {
        let {
            comment,
            show_post,
            ref,
            petId,
            comments,
            templateIds
        } = this.data;
        let { token, login, submsg_handler } = app.globalData;

        if (!login) {
            this.setData({
                login_action: "comment",
                loginShow: true
            });
        } else if (show_post && comment) {
            let auth_result = await app.requestSubscribeMessage(templateIds);
            await app.uploadTemplateAuthorize(auth_result);
            this.commit();
        }
    },
    commit: function() {
        let { comment, show_post, ref, petId, comments } = this.data;
        let { token, login } = app.globalData;
        let params = {
            target_id: petId,
            type: "pet",
            content: comment
        };

        if (ref) {
            params.ref_id = ref;
        }

        _my.showLoading({});

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages`,
            method: "POST",
            header: {
                Authorization: `Bearer ${token}`
            },
            data: params,
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 201) {
                    data.date_str = "0秒前";
                    this.setData({
                        comments: [...comments, data],
                        comment: ""
                    });
                    this.scrollToEnd();
                } else if (statusCode === 422) {
                    _my.showToast({
                        icon: "none",
                        title: "评论有非法字符, 请修改后重试."
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "网络错误, 发布评论失败"
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },
    onCommentAllTap: function() {
        let { petId } = this.data;
        this.onLoad({
            id: petId
        });
    },
    scrollToEnd: function() {
        _my.createSelectorQuery()
            .select("#comments_view")
            .boundingClientRect(function(rect) {
                // 使页面滚动到底部
                _my.pageScrollTo({
                    scrollTop: rect.bottom
                });
            })
            .exec();
    },
    onPetTap: function() {
        let { pet } = this.data;

        _my.navigateTo({
            url: "../adoptionDetail/adoptionDetail?id=" + pet.id
        });
    },
    onAuthorizeComplete: function(evt) {
        let { userInfo } = evt.detail;
        let { login_action, login_params, petId, petCover } = this.data;
        this.setData({
            loginShow: false
        });

        if (login_action == "comment") {
            this.onCommentPostTap();
        } else if (login_action == "comment_like") {
            this.onCommentLikeTap(login_params);
        }
    }
});
