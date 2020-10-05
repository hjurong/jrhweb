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
import React from 'react';
import { connect } from 'react-redux';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import TagsInput from 'react-tagsinput';
import { blogFormSubmitted, blogFormCancelled } from '../../../actions';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'croppie/croppie.css';
var appSettings = require('../../../lib/app-settings');
var Croppie = require('croppie');
var dateFormat = require('dateformat');
var loadImage = require('blueimp-load-image');
var zlib = require('zlib');
var formLogger = require('debug')("app:blog:form");
var Form = /** @class */ (function (_super) {
    __extends(Form, _super);
    function Form(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            title: "",
            date: "",
            auth: "",
            editorState: EditorState.createEmpty(),
            postTags: [],
            autoCompleteTags: [],
            placename: _this.props.placename || "",
            location: _this.props.location || {},
        };
        if (_this.props.isedit && _this.props.post !== undefined) {
            _this.state.postid = _this.props.post.postid;
            _this.state.title = _this.props.post.title;
            _this.state.date = dateFormat(_this.props.post.date, 'isoDate');
            _this.state.postTags = _this.props.post.tagnames.split(',');
            _this.state.placename = _this.props.post.placename;
            _this.state.location = _this.props.post.location;
            var contentBlock = convertFromHTML(_this.props.post.htmlContent);
            if (contentBlock) {
                var contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks, contentBlock.entityMap);
                _this.state['editorState'] = EditorState.createWithContent(contentState);
            }
        }
        _this.handleInputChange = _this.handleInputChange.bind(_this);
        _this.handlePostTagsChange = _this.handlePostTagsChange.bind(_this);
        _this.onEditorStateChange = _this.onEditorStateChange.bind(_this);
        _this.onImgInputChange = _this.onImgInputChange.bind(_this);
        _this.onImgDeleteClick = _this.onImgDeleteClick.bind(_this);
        _this.onPostFormClear = _this.onPostFormClear.bind(_this);
        _this.onPostFormCancel = _this.onPostFormCancel.bind(_this);
        _this.onPostFormSubmit = _this.onPostFormSubmit.bind(_this);
        _this.onPostFormDelete = _this.onPostFormDelete.bind(_this);
        _this.toLatLng = _this.toLatLng.bind(_this);
        return _this;
    }
    Form.prototype.onEditorStateChange = function (editorState) {
        formLogger("editor emitted state changed");
        this.setState({
            editorState: editorState,
        });
    };
    Form.prototype.handlePostTagsChange = function (postTags) {
        this.setState({
            postTags: postTags
        });
    };
    Form.prototype.handleInputChange = function (event) {
        var _a;
        var name = event.target.name;
        var value = event.target.value;
        var errmsg = '';
        switch (name) {
            case "date":
                var ts = Date.parse(value);
                if (isNaN(ts)) {
                    errmsg = "<strong>Invalid date</strong>";
                }
                break;
            default:
                break;
        }
        this.setState({ errormessage: errmsg });
        this.setState((_a = {}, _a[name] = value, _a));
    };
    Form.prototype.toLatLng = function (location) {
        if (location.hasOwnProperty('lat')) {
            return location.lat + "," + location.lng;
        }
        else if (location.hasOwnProperty('x')) {
            return location.x + "," + location.y;
        }
    };
    Form.prototype.onPostFormCancel = function (event) {
        event.preventDefault();
        this.blogFormCancelled({ showform: false });
    };
    Form.prototype.onPostFormClear = function (event) {
        this.setState({
            placename: "",
            title: "",
            date: "",
            postTags: [],
        });
        event.preventDefault();
    };
    Form.prototype.onPostFormDelete = function (event) {
        var _this = this;
        var url = appSettings.apihost + "/api/rest/posts/" + this.state.postid + "/remove";
        var formData = new FormData();
        formData.append('auth', this.state.auth);
        fetch(url, {
            method: 'POST',
            body: formData,
        }).then(function (resp) { return resp.json(); }).then(function (data) {
            if (data.hasOwnProperty('err')) {
                throw data.err;
            }
            this.blogFormSubmitted({
                showform: false,
            });
        }.bind(this)).catch(function (err) {
            _this.setState({ 'postError': JSON.stringify(err) });
            _this.postErrorWrap.style.display = "block";
        });
        event.preventDefault();
    };
    Form.prototype.onPostFormSubmit = function (event) {
        var _this = this;
        event.preventDefault();
        var formPromise = new Promise(function (resolve, reject) {
            var formData = new FormData();
            var content = draftToHtml(convertToRaw(this.state.editorState.getCurrentContent()));
            var zbuffer = zlib.deflateSync(content);
            formData.append('content', zbuffer.toString('base64'));
            formData.append('date', this.state.date);
            formData.append('auth', this.state.auth);
            formData.append('tags', JSON.stringify({ add: this.state.postTags }));
            formData.append('title', this.state.title);
            formData.append('location', this.toLatLng(this.state.location));
            formData.append('placename', this.state.placename);
            if ('croppie' in this.state) {
                this.state.croppie.result({
                    size: 'original',
                    type: 'blob',
                }).then(function (blob) {
                    formData.append('postimgs', blob);
                    resolve(formData);
                });
            }
            else {
                resolve(formData);
            }
        }.bind(this));
        var url = appSettings.apihost;
        if (this.props.isedit) {
            url = url + "/api/rest/posts/" + this.state.postid + "/update";
        }
        else {
            url = url + "/api/rest/posts";
        }
        formPromise.then(function (formData) {
            return fetch(url, {
                method: 'POST',
                body: formData,
            });
        }).then(function (resp) { return resp.json(); }).then(function (data) {
            formLogger("form submitted - resp=", url, data);
            if (data.hasOwnProperty('err')) {
                throw data.err;
            }
            this.blogFormSubmitted({
                showform: false,
                postid: data.postid || this.state.postid,
                refresh: this.props.isedit ? -1 : data.postid,
            });
        }.bind(this)).catch(function (err) {
            formLogger("form submit errored: ", err);
            _this.setState({ 'postError': JSON.stringify(err) });
            _this.postErrorWrap.style.display = "block";
        });
    };
    Form.prototype.onImgDeleteClick = function (event) {
        this.cropContainter.style.display = 'none';
        this.imgUploadInput.value = "";
    };
    Form.prototype.onImgInputChange = function (event) {
        if (event.target.files && event.target.files[0]) {
            var onload = function (img) {
                var c;
                if ('croppie' in this.state) {
                    c = this.state['croppie'];
                }
                else {
                    c = new Croppie(this.cropContainter, {
                        viewport: { width: 250, height: 250 },
                        boundary: { width: 300, height: 300 },
                        showZoomer: true,
                        enableResize: false,
                        enableOrientation: true,
                        enforceBoundary: true,
                    });
                    this.state['croppie'] = c;
                    this.rotateLeft.addEventListener("click", function () {
                        c.rotate(90);
                    });
                    this.rotateRight.addEventListener("click", function () {
                        c.rotate(-90);
                    });
                }
                c.bind({
                    url: img.toDataURL(),
                });
                this.cropContainter.style.display = 'block';
                formLogger("done init croppie:");
            }.bind(this);
            loadImage(event.target.files[0], onload, {
                maxWidth: 1024,
                orientation: true,
            });
        }
    };
    Form.prototype.componentDidMount = function () {
        this.cropContainter.style.display = "None";
        this.blogFormCancelled = this.props.blogFormCancelled;
        this.blogFormSubmitted = this.props.blogFormSubmitted;
    };
    Form.prototype.componentDidUpdate = function (prevProps, prevState) {
        if (prevProps.placename != this.props.placename &&
            this.props.placename != prevState.placename) {
            this.setState({ placename: this.props.placename });
        }
    };
    Form.prototype.render = function () {
        var _this = this;
        var editorState = this.state.editorState;
        return (React.createElement("div", { id: this.props.id, className: "blog-form", ref: function (el) { return _this.blogFormDiv = el; } },
            React.createElement("div", { className: "post-error-wrap", ref: function (el) { return _this.postErrorWrap = el; } },
                React.createElement("div", { className: "alert alert-danger" }, this.state.postError)),
            React.createElement("form", { onSubmit: this.onPostFormSubmit, ref: function (el) { return _this.postForm = el; } },
                this.state.errormessage,
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "title" }, "Title:"),
                    React.createElement("input", { type: "text", className: "form-control", name: "title", placeholder: "Post title", value: this.state.title, onChange: this.handleInputChange, required: true })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "date" }, "Date:"),
                    React.createElement("input", { type: "date", className: "form-control", name: "date", placeholder: "yyyy-mm-dd", value: this.state.date, onChange: this.handleInputChange, required: true })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "placename" }, "Place Name:"),
                    React.createElement("input", { type: "text", className: "form-control", name: "placename", value: this.state.placename, onChange: this.handleInputChange })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "postTags" }, "Tags:"),
                    React.createElement(TagsInput, { name: "postTags", value: this.state.postTags, onChange: this.handlePostTagsChange })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "imgUploadInput" }, "Upload Photo:"),
                    React.createElement("input", { type: "file", className: "form-control-file", name: "imgUploadInput", ref: function (el) { return _this.imgUploadInput = el; }, onChange: this.onImgInputChange, accept: "image/*", required: !this.props.isedit }),
                    React.createElement("small", { id: "fileHelp", className: "form-text text-muted" }, "Upload a photo for this place"),
                    React.createElement("div", { className: "cropContainer", ref: function (el) { return _this.cropContainter = el; } },
                        React.createElement("span", { className: "rotateLeft", ref: function (el) { return _this.rotateLeft = el; } },
                            React.createElement("i", { className: "fas fa-undo-alt" })),
                        React.createElement("span", { className: "imgdelete", onClick: this.onImgDeleteClick, ref: function (el) { return _this.imgdelete = el; } },
                            React.createElement("i", { className: "far fa-times-circle" })),
                        React.createElement("span", { className: "rotateRight", ref: function (el) { return _this.rotateRight = el; } },
                            React.createElement("i", { className: "fas fa-redo-alt" })))),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", null, "Post content:"),
                    React.createElement(Editor, { editorState: editorState, toolbarClassName: "post-editor-toolbar", wrapperClassName: "post-editor-wrapper", editorClassName: "post-editor-editor", onEditorStateChange: this.onEditorStateChange })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("label", { htmlFor: "auth" }, "Auth:"),
                    React.createElement("input", { type: "password", className: "form-control", name: "auth", placeholder: "Secret Auth", value: this.state.auth, onChange: this.handleInputChange, required: true })),
                React.createElement("div", { className: "form-group" },
                    React.createElement("button", { type: "submit", className: "btn btn-sm btn-outline-dark form-btn-submit" }, "Submit"),
                    React.createElement("button", { onClick: this.onPostFormClear, className: "btn btn-sm btn-outline-dark form-btn-clear" }, "Clear"),
                    React.createElement("button", { onClick: this.onPostFormCancel, className: "btn btn-sm btn-outline-dark form-btn-cancel" }, "Cancel"),
                    this.props.isedit ?
                        React.createElement("button", { onClick: this.onPostFormDelete, className: "btn btn-sm btn-outline-dark form-btn-delete" }, "Delete")
                        : ""))));
    };
    return Form;
}(React.Component));
var mapStateToProps = function (state) { return ({
    post: state.posts.post,
}); };
var mapDispatchToProps = function (dispatch) { return ({
    blogFormSubmitted: function (data) { return dispatch(blogFormSubmitted(data)); },
    blogFormCancelled: function (data) { return dispatch(blogFormCancelled(data)); },
}); };
export default connect(mapStateToProps, mapDispatchToProps)(Form);
//# sourceMappingURL=index.js.map