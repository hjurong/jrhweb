var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import React from "react";
import { connect } from 'react-redux';
import { blogPostEditClicked, blogPostLoaded } from '../../../actions';
var zlib = require('zlib');
var dateFormat = require('dateformat');
var appSettings = require('../../../lib/app-settings');
var postLogger = require('debug')("app:blog:post");
var Post = /** @class */ (function (_super) {
    __extends(Post, _super);
    function Post(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            postptr: 0,
            tagnames: [],
        };
        _this.onBlogPostEditClicked = _this.onBlogPostEditClicked.bind(_this);
        _this.onPrevBlogPostClicked = _this.onPrevBlogPostClicked.bind(_this);
        _this.onNextBlogPostClicked = _this.onNextBlogPostClicked.bind(_this);
        _this.handleStateChange = _this.handleStateChange.bind(_this);
        _this.fetchPost = _this.fetchPost.bind(_this);
        _this.renderPost = _this.renderPost.bind(_this);
        _this.renderAlert = _this.renderAlert.bind(_this);
        return _this;
    }
    Post.prototype.onBlogPostEditClicked = function (event) {
        this.blogPostEditClicked({
            showform: true,
            isedit: true,
            post: this.state.post,
        });
    };
    Post.prototype.renderAlert = function (type) {
        return "<div class=\"alert alert-warning alert-dismissible fade show\" role=\"alert\">\n            Already at " + type + " post\n            <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\">\n                <span aria-hidden=\"true\">&times;</span>\n            </button>\n        </div>";
    };
    Post.prototype.onNextBlogPostClicked = function (event) {
        var _this = this;
        this.state.postptr = this.props.postids.findIndex(function (e) { return e == _this.state.postid; });
        if (this.state.postptr == 0) {
            this.postAlertWrap.innerHTML = this.renderAlert('latest');
            return;
        }
        this.state.postptr--;
        this.renderPost(this.props.postids[this.state.postptr]);
    };
    Post.prototype.onPrevBlogPostClicked = function (event) {
        var _this = this;
        this.state.postptr = this.props.postids.findIndex(function (e) { return e == _this.state.postid; });
        if (this.state.postptr == this.props.postids.length - 1) {
            this.postAlertWrap.innerHTML = this.renderAlert('last');
            return;
        }
        this.state.postptr++;
        this.renderPost(this.props.postids[this.state.postptr]);
    };
    Post.prototype.handleStateChange = function (name, value) {
        var _a;
        switch (name) {
            case "content":
                var buf = Buffer.from(value, 'base64');
                value = zlib.unzipSync(buf).toString();
                this.postContentWrap.innerHTML = value;
                break;
            case "tagnames":
                value = value.split(',');
                break;
            case "date":
                value = dateFormat(value, "dddd, mmmm dS, yyyy");
            default:
                break;
        }
        this.setState((_a = {}, _a[name] = value, _a));
    };
    Post.prototype.getPostImgUrl = function () {
        return appSettings.publicDir + "/imgs/posts/" + this.state.postid + "/" + this.state.fnames;
    };
    Post.prototype.fetchPost = function (postid) {
        var params = { limit: 1 };
        var url = appSettings.apihost + "/api/rest/posts";
        if (postid !== undefined) {
            url = url + "/" + postid;
        }
        url = new URL(url);
        Object.keys(params).forEach(function (key) { return url.searchParams.append(key, params[key]); });
        return fetch(url).then(function (resp) { return resp.json(); });
    };
    Post.prototype.renderPost = function (postid) {
        postid = postid || this.props.postid;
        this.fetchPost(postid).then(function (data) {
            postLogger("fetchPost received: ", data);
            var post = data[0];
            Object.entries(post).forEach(function (pair) {
                this.handleStateChange(pair[0], pair[1]);
            }.bind(this));
            post.htmlContent = this.state.content;
            this.state.post = post;
            this.blogPostLoaded({ post: post });
        }.bind(this));
    };
    Post.prototype.componentDidMount = function () {
        this.blogPostEditClicked = this.props.blogPostEditClicked;
        this.blogPostLoaded = this.props.blogPostLoaded;
        this.renderPost();
    };
    Post.prototype.componentDidUpdate = function (prevProps) {
        if (prevProps.postid !== this.props.postid) {
            this.renderPost();
        }
    };
    Post.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", null,
            React.createElement("div", { className: "blog-post" },
                React.createElement("h2", { className: "blog-post-title" }, this.state.title),
                React.createElement("p", { className: "blog-post-meta" },
                    this.state.date,
                    " - ",
                    this.state.placename,
                    React.createElement("span", { className: "blog-post-edit", title: "edit post", onClick: this.onBlogPostEditClicked, ref: function (el) { return _this.blogPostEdit = el; } },
                        React.createElement("i", { className: "fas fa-edit" }))),
                React.createElement("div", { className: "post-img-wrap" },
                    React.createElement("img", { className: "post-img", src: this.getPostImgUrl() })),
                React.createElement("div", { className: "post-content-wrap", ref: function (el) { return _this.postContentWrap = el; } }),
                React.createElement("div", { className: "post-tags-wrap", ref: function (el) { return _this.postTagsWrap = el; } }, this.state.tagnames.map(function (tagname, i) {
                    return (React.createElement("span", { className: "badge badge-primary post-tag-span", key: i }, tagname));
                }))),
            React.createElement("div", { className: "blog-alert-wrap", ref: function (el) { return _this.postAlertWrap = el; } }),
            React.createElement("nav", { className: "blog-pagination" },
                React.createElement("button", { className: "btn btn-outline-primary post-btn-prev", onClick: this.onPrevBlogPostClicked }, "Prev"),
                React.createElement("button", { className: "btn btn-outline-secondary post-btn-next", onClick: this.onNextBlogPostClicked }, "Next"))));
    };
    return Post;
}(React.Component));
var mapStateToProps = function (state) { return ({
    postid: state.home.postid,
    postids: state.map.postids,
}); };
var mapDispatchToProps = function (dispatch) { return ({
    blogPostEditClicked: function (data) { return dispatch(blogPostEditClicked(data)); },
    blogPostLoaded: function (data) { return dispatch(blogPostLoaded(data)); },
}); };
export default connect(mapStateToProps, mapDispatchToProps)(Post);
//# sourceMappingURL=index.js.map