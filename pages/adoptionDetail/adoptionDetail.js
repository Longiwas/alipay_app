const _Page = require("../../__antmove/component/componentClass.js")("Page");
const _my = require("../../__antmove/api/index.js")(my);
my.setStorageSync({
    key: "activeComponent",
    data: {
        is: "/pages/adoptionDetail/adoptionDetail"
    }
}); // miniprogram/pages/adoptionDetail/adoptionDetail.js

const app = getApp();

_Page({
    /**
     * 页面的初始数据
     */
    data: {
        app,
        petId: "",
        petBanner: [],
        petName: "",
        petAge: 2,
        petRemark: "",
        genderUrl: "",
        petCover: "",
        petTags: [],
        viewNum: 0,
        favStatus: false,
        favText: "收藏",
        heartName: "http://res.511cwpt.com/favdisable.png",
        questions: [],
        options: [],
        year: 0,
        month: 0,
        apply: false,
        owner: false,
        authorize_btn: true,
        loginShow: false,
        locationStr: "",
        reportContent: "",
        customHeadHeight: 0,
        like: 0,
        is_like: false,
        like_str: "",
        selected_view: true,
        commentid: "",
        comments: [],
        total_count: 0,
        scroll_handler: 0,
        tabTitleHeight: 0,
        placeholder: "请输入评论",
        ref: "",
        show_post: false,
        comment_focus: false,
        comment: "",
        comment_all: false,
        login: false,
        login_action: "",
        login_params: {},
        conditions: [],
        conditions_left: [],
        conditions_right: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    getRandom: function() {
        let { petId } = this.data;
        return new Promise((yes, no) => {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/pets?order=random",
                method: "get",
                header: {
                    "page-size": 2
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 200) {
                        for (let record of data) {
                            record.year = parseInt(record.age / 12);
                            record.month = record.age % 12;
                            record.locationStr = app.location2ProvinceCity(
                                record.location
                            );
                        }

                        yes(data);
                    } else if (statusCode === 200) {
                        no({
                            code: statusCode
                        });
                    }
                }
            });
        });
    },
    setLikeStatus: function(like, is_like) {
        let like_str = "";
        if (like > 99999) like_str = "99K+";
        else if (like > 999)
            like_str = parseFloat(like / 1000).toFixed(1) + "K";
        else like_str = like;
        this.setData({
            like,
            is_like,
            like_str
        });
    },
    getRecord: function(recordid) {
        let { token, userInfo } = app.globalData;
        return new Promise((yes, no) => {
            _my.request({
                url: "https://api.woyuanyi.511cwpt.com/api/v1/pets/" + recordid,
                method: "get",
                header: {
                    Authorization: "Bearer " + token,
                    "user-id": userInfo.id
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 404) {
                        no({
                            code: 404
                        });
                    } else if (statusCode === 200) {
                        yes(data);
                    }
                }
            });
        });
    },
    getComments: function(petid, commentid) {
        let { token, userInfo, login } = app.globalData;
        return new Promise((yes, no) => {
            let header = {};

            if (login) {
                header = {
                    Authorization: "Bearer " + token,
                    "user-id": userInfo.id
                };
            }

            _my.request({
                url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages?target_id=${petid}&order=asc&type=reply`,
                //url: `https://api.woyuanyi.511cwpt.com/api/v1/common-messages?order=asc&type=reply`,
                method: "get",
                header,
                success: res => {
                    let { statusCode, data, header } = res;

                    if (statusCode === 200) {
                        yes({
                            total_count: header["Total-Count"]
                        });
                    } else {
                        yes({
                            total_count: 0
                        });
                    }
                }
            });
        });
    },
    onLoad: function(options) {
        let { commentid, id } = options;
        this.setData({
            petId: id,
            commentid: commentid || ""
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {},

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        let { petId, commentid, templateIds } = this.data;
        app.globalData.initPromise.then(async data => {
            let { userInfo } = data;
            this.setData({
                authorize_btn: !data.login,
                customHeadHeight: data.customHeadHeight
            });
            let { screenWidth, customHeadHeight } = data; //swiper 500rpx;
            //petname 45+60rpx;
            //pettags 15+50rpx;
            //petlocation 15+50rpx
            //pettabtitle 40+50rpx;

            let scale = screenWidth / 750;
            let tabTitleHeight = 825 * scale;
            this.setData({
                tabTitleHeight
            });

            try {
                let record = await this.getRecord(petId);
                let comments = await this.getComments(petId);
                let random = await this.getRandom();
                this.setData({
                    total_count: comments.total_count
                });

                _my.hideLoading();

                let optionsShow = [];
                let { user_id, like, is_like, resources, gender } = record;
                this.setLikeStatus(like, is_like);

                if (user_id == userInfo.id) {
                    this.setData({
                        owner: true
                    });
                }

                let video_index = -1;
                resources.forEach((item, index) => {
                    item.isImage = item.type.indexOf("image") >= 0;
                    item.file = item.file.replace("http://", "https://");

                    if (item.type.indexOf("video") >= 0) {
                        video_index = index;
                    }
                });

                if (video_index >= 0) {
                    let [videoObj] = resources.splice(video_index, 1);
                    resources.push(videoObj);
                }

                let genderUrl = "../../images/";
                if (gender === 0) genderUrl = "";
                else if (gender === 1) genderUrl += "male.svg";
                else if (gender === 2) genderUrl += "female.svg"; //is_like = true;

                let conditions_left = [];
                let conditions_right = [];
                record.conditions = record.conditions ? record.conditions : [];

                if (record.conditions.length > 0) {
                    if (record.conditions.length % 2 == 0) {
                        conditions_left = record.conditions.slice(
                            0,
                            record.conditions.length / 2
                        );
                        conditions_right = record.conditions.slice(
                            record.conditions.length / 2
                        );
                    } else {
                        conditions_left = record.conditions.slice(
                            0,
                            record.conditions.length / 2 + 1
                        );
                        conditions_right = record.conditions.slice(
                            record.conditions.length / 2 + 1
                        );
                    }
                }

                this.setData({
                    petBanner: resources,
                    petAge: record.age,
                    petName: record.name,
                    petRemark: record.story,
                    petCover: record.cover,
                    viewNum: record.views,
                    petTags: record.options,
                    questions: record.questions,
                    options: record.options,
                    year: parseInt(record.age / 12),
                    month: record.age % 12,
                    favStatus: record.favorite,
                    favText: record.favorite ? "已收藏" : "收藏",
                    heartName: record.favorite
                        ? "https://res.511cwpt.com/favenable.png"
                        : "https://res.511cwpt.com/favdisable.png",
                    apply: record.apply,
                    genderUrl,
                    locationStr: app.location2String(record.location),
                    conditions_left,
                    conditions_right,
                    random
                });
            } catch (e) {
                if (e.code) {
                    if (e.code === 404) {
                        _my.navigateTo({
                            url: "../placeoutRemoved/index"
                        });

                        return;
                    }
                } else {
                    console.error(e);
                }
            }
        });
    },

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
    onPageScroll: function(evt) {
        /*let { tabTitleHeight, scroll_handler} = this.data;
    let tabtitle_fixed = false;
    clearTimeout(scroll_handler);
    scroll_handler = setTimeout(()=>{
      let { scrollTop } = evt;
      if (scrollTop > tabTitleHeight){
         tabtitle_fixed= true;
      }
      this.setData({
        tabtitle_fixed
      });
    }, 200);
    this.setData({
      scroll_handler
    });*/
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {
        let { petName, locationStr } = this.data;
        locationStr =
            locationStr.lastIndexOf("-") > 0
                ? locationStr.substring(locationStr.lastIndexOf("-") + 1)
                : locationStr;
        return {
            title: `${locationStr}的${petName}想有个家，你愿意领养吗？`,
            path:
                "/pages/home/index?target=adoptionDetail&id=" + this.data.petId,
            imageUrl: this.data.petCover
        };
    },
    onHeartTap: function(evt) {
        let that = this;
        let { favText, heartName, petId, favStatus } = this.data;
        let { userInfo, token, login } = app.globalData;

        if (!login) {
            this.setData({
                login_action: "favorite",
                loginShow: true
            });
        } else {
            _my.request({
                url:
                    "https://api.woyuanyi.511cwpt.com/api/v1/pets/" +
                    petId +
                    "/actions",
                method: "put",
                header: {
                    Authorization: "Bearer " + token,
                    "user-id": userInfo.id
                },
                data: {
                    action: favStatus == false ? "favorite" : "unfavorite"
                },
                success: res => {
                    let { statusCode } = res;

                    if (statusCode == 200) {
                        if (favStatus) {
                            favText = "收藏";
                            heartName = "http://res.511cwpt.com/favdisable.png";
                            favStatus = false;

                            _my.showToast({
                                icon: "none",
                                duration: 3000,
                                title: "取消收藏成功"
                            });
                        } else {
                            favText = "已收藏";
                            heartName = "http://res.511cwpt.com/favenable.png";
                            favStatus = true;

                            _my.showToast({
                                icon: "none",
                                duration: 3000,
                                title: "收藏成功.可在“我的”-“我的收藏”中查看"
                            });
                        }

                        that.setData({
                            favText,
                            heartName,
                            favStatus
                        });
                    }
                }
            });
        }
    },
    onLikeTap: function(evt) {
        let { token, userInfo, login } = app.globalData;
        let { petId, is_like, like } = this.data;

        let pet_video = _my.createVideoContext("pet_video", this);

        if (!login) {
            this.setData({
                login_action: "like",
                loginShow: true
            });
        } else {
            _my.request({
                url: `https://api.woyuanyi.511cwpt.com/api/v1/pets/${petId}/${
                    is_like ? "dislike" : "like"
                }`,
                method: "PUT",
                header: {
                    Authorization: `Bearer ${token}`,
                    user_id: userInfo.id
                },
                success: res => {
                    let { statusCode, data } = res;

                    if (statusCode == 200) {
                        pet_video.pause();

                        if (is_like) {
                            this.setLikeStatus(--like, !is_like);
                        } else {
                            this.setLikeStatus(++like, !is_like);
                        }
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "?好像没成功, 再试一下?"
                        });
                    }
                }
            });
        }
    },
    onWarningTap: function() {
        this.setData({
            reportShow: true
        });
    },
    onReportInput: function(evt) {
        this.setData({
            reportContent: evt.detail.value
        });
    },
    onReportConfirmTap: function() {
        let that = this;
        let { token, userInfo } = app.globalData;
        let { petId, reportContent } = this.data;

        _my.request({
            url: `https://api.woyuanyi.511cwpt.com/api/v1/accusations`,
            method: "POST",
            header: {
                Authorization: `Bearer ${token}`
            },
            data: {
                user_id: userInfo.id,
                accusation_type: "pet",
                target_id: petId,
                content: reportContent
            },
            success: res => {
                let { statusCode, data } = res;

                if (statusCode == 201) {
                    _my.showToast({
                        icon: "none",
                        title: "已收到举报，感谢您的关注"
                    });

                    that.setData({
                        reportShow: false
                    });
                } else {
                    _my.showToast({
                        icon: "none",
                        title: "好像没举报成功, 再试一下?"
                    });
                }
            }
        });
    },
    onReportCloseTap: function() {
        this.setData({
            reportShow: false
        });
    },
    onAnswerQuestionTap: function(evt) {
        let recordid = evt.target.dataset.recordid;
        let { login, userInfo } = app.globalData;

        if (login) {
            _my.navigateTo({
                url: `../adoptionAnswerQuestion/adoptionAnswerQuestion?id=${this.data.petId}&image=${this.data.petCover}`
            });
        } else {
            this.setData({
                loginShow: true
            });
        }
    },
    onLoginTap: function() {
        _my.login({
            success: res => {
                if (res.code) {
                    this.onGetUserInfo(res.code);
                } else {
                    alert("登陆失败");
                }
            }
        });
    },
    onGetUserInfo: function(code) {
        let that = this;

        _my.getUserInfo({
            success: res => {
                let { userInfo } = res;
                let { nickName, avatarUrl } = userInfo;
                that.onAuth(code, userInfo);
            },
            fail: err => {
                err.location = "wx.getUserInfo existSetting";
            }
        });
    },
    onAuth: function(code, obj = {}) {
        let { login_action, login_params, petId, petCover } = this.data;
        obj.location = "";

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
                if (res.statusCode == 200) {
                    app.globalData.userInfo = res.data.info;
                    app.globalData.token = res.data.auth.token;
                    this.setData({
                        loginShow: false
                    });

                    if (login_action == "adoption") {
                        _my.navigateTo({
                            url: `../adoptionAnswerQuestion/adoptionAnswerQuestion?id=${petId}&image=${petCover}`
                        });
                    } else if (login_action == "like") {
                        this.onLikeTap();
                    } else if (login_action == "favorite") {
                        this.onHeartTap();
                    } else if (login_action == "comment") {
                        this.onCommentPostTap();
                    } else if (login_action == "comment_like") {
                        this.onCommentLikeTap(login_params);
                    }

                    _my.showToast({
                        title: "登录成功"
                    });
                }
            },
            complete: () => {
                _my.hideLoading();
            }
        });
    },
    onAuthorizeComplete: function(evt) {
        let { userInfo } = evt.detail;
        let { login_action, login_params, petId, petCover } = this.data;
        this.setData({
            loginShow: false
        });

        if (login_action == "adoption") {
            _my.navigateTo({
                url: `../adoptionAnswerQuestion/adoptionAnswerQuestion?id=${petId}&image=${petCover}`
            });
        } else if (login_action == "like") {
            this.onLikeTap();
        } else if (login_action == "favorite") {
            this.onHeartTap();
        } else if (login_action == "comment") {
            this.onCommentPostTap();
        } else if (login_action == "comment_like") {
            this.onCommentLikeTap(login_params);
        }
    },
    onAuthorizeTap: function(evt) {
        let { userInfo } = evt.detail;

        if (userInfo) {
            app.globalData.login = true;

            _my.showLoading({
                title: "登录中"
            });

            _my.login({
                success: res => {
                    if (res.code) {
                        this.onAuth(res.code, userInfo);
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "登陆失败"
                        });

                        _my.hideLoading();
                    }
                }
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "您取消了授权"
            });
        }
    },
    onImageTap: function(evt) {
        let { index } = evt.currentTarget.dataset;
        let { petBanner } = this.data;
        let images = {
            urls: []
        };
        petBanner.forEach((img, arrayindex) => {
            if (index == arrayindex) {
                images.current = img.file;
            }

            if (img.type.indexOf("image") >= 0) {
                images.urls.push(img.file);
            }
        });

        _my.previewImage(images);
    },
    onCancelClose: function(evt) {
        this.setData({
            loginShow: false
        });
    },
    onHelpPopupClose: function() {
        this.setData({
            helpShow: false
        });
    },
    onHelpTap: function() {
        this.setData({
            helpShow: true
        });
    },
    onCircleTap: function() {
        _my.navigateTo({
            url: "../adoptionHelp/index?id=" + this.data.petId
        });
    },
    onCommentTap: function() {
        this.setData({
            selected_view: false,
            comment_focus: true
        });
    },
    onCommentsJumpTap: function() {
        _my.navigateTo({
            url: "../adoptionComments/index?id=" + this.data.petId
        });
    },
    onReplyTap: function(evt) {
        let { author, authorname } = evt.currentTarget.dataset;
        this.setData({
            comment_focus: true,
            placeholder: `回复${authorname}:`,
            ref: author
        });
    },
    onTabChange: function(evt) {
        let { index } = evt.target.dataset;
        let { selected_view } = this.data;
        this.setData({
            selected_view: index,
            placeholder: "请输入评论",
            ref: "",
            ref_name: ""
        });
    },
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
    onCommentPostTap: function() {
        let { comment, show_post, ref, petId, comments } = this.data;
        let { token, login } = app.globalData;

        if (!login) {
            this.setData({
                login_action: "comment",
                loginShow: true
            });
        } else if (show_post && comment) {
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
        }
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
    onCommentAllTap: async function() {
        let { petId } = this.data;

        try {
            let data = await this.getComments(petId);
            this.setData({
                comments: data.data,
                commentid: "",
                total_count: data.total_count
            });
        } catch (e) {
            if (e.code) {
                if (e.code === 404) {
                    _my.navigateTo({
                        url: "../placeoutRemoved/index"
                    });

                    return;
                }
            } else {
                console.error(e);

                _my.showToast({
                    icon: "none",
                    title: "读取评论列表失败, 请重试..."
                });
            }
        }
    },
    onCommentPostUserInfo: function(evt) {
        let { userInfo } = evt.detail;

        if (userInfo) {
            _my.login({
                success: res => {
                    if (res.code) {
                        userInfo.location = "";

                        _my.request({
                            url: "https://api.woyuanyi.511cwpt.com/api/v1/auth",
                            method: "POST",
                            data: {
                                type: "alipay",
                                data: {
                                    code: res.code,
                                    ...userInfo
                                }
                            },
                            success: res => {
                                if (res.statusCode == 200) {
                                    app.globalData.login = true;
                                    app.globalData.userInfo = res.data.info;
                                    app.globalData.token = res.data.auth.token;
                                    this.setData({
                                        login: true
                                    });
                                    this.onCommentPostTap();
                                }
                            }
                        });
                    } else {
                        _my.showToast({
                            icon: "none",
                            title: "登录失败, 请重试"
                        });
                    }
                }
            });
        } else {
            _my.showToast({
                icon: "none",
                title: "您取消了授权"
            });
        }
    },
    onRandomTap: function(evt) {
        let { id } = evt.currentTarget.dataset;
        let { random } = this.data;

        _my.navigateTo({
            url: "adoptionDetail?id=" + random[id].id
        });
    }
});
