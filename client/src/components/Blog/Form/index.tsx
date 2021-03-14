import React from 'react';

import { connect } from 'react-redux';
import { EditorState, convertToRaw, convertFromHTML, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import TagsInput from 'react-tagsinput';
import { Dispatch } from "redux";
import * as ReduxTypes from "ReduxTypes";
import { 
    blogFormSubmitted, 
    blogFormCancelled,
    BlogFormSubmittedData,
    BlogFormCancelledData,
} from '../../../actions'
import * as BlogFormTypes from "BlogFormTypes";
import * as BlogPostsTypes from "BlogPostsTypes";

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'croppie/croppie.css';

const appSettings = require('../../../lib/app-settings');
const Croppie = require('croppie');
const dateFormat = require('dateformat');
const loadImage = require('blueimp-load-image');
const zlib = require('zlib');
var formLogger = require('debug')("app:blog:form");

const mapStateToProps = (state:ReduxTypes.ReducerState) => ({
    post: state.posts.post, 
});

const mapDispatchToProps = (dispatch:Dispatch<ReduxTypes.RootAction>) => ({
    blogFormSubmitted: (data:BlogFormSubmittedData) => dispatch(blogFormSubmitted(data)),
    blogFormCancelled: (data:BlogFormCancelledData) => dispatch(blogFormCancelled(data)),
});

type FormLocationType = (BlogFormTypes.BlogFormLocationLngLatType | BlogFormTypes.BlogFormLocationXYType);

type FormProps = ReturnType<typeof mapStateToProps> & 
    ReturnType<typeof mapDispatchToProps> & {
        isedit: boolean,
        placename: string,
        location: {lng: number, lat: number},
    };

type FormState = {
    title: string,
    postid: number,
    date: string,
    auth: string,
    errormessage: string,
    postError: string,
    editorState: EditorState,
    postTags: string[],
    autoCompleteTags: string[],
    placename: string,
    location: FormLocationType,
};

class Form extends React.Component<FormProps, FormState> {

    postErrorWrap = React.createRef<HTMLDivElement>();
    cropContainer = React.createRef<HTMLDivElement>();
    rotateLeft = React.createRef<HTMLButtonElement>();
    rotateRight = React.createRef<HTMLButtonElement>();
    imgdelete = React.createRef<HTMLButtonElement>();
    imgUploadInput = React.createRef<HTMLInputElement>();
    blogFormDiv = React.createRef<HTMLDivElement>();
    postForm = React.createRef<HTMLFormElement>();

    blogFormCancelled = this.props.blogFormCancelled;
    blogFormSubmitted = this.props.blogFormSubmitted;

    constructor(props:FormProps) {
        super(props);

        this.state = {
            title: "",
            date: "",
            auth: "",
            postError: "",
            errormessage: "",
            postid: -1,
            editorState: EditorState.createEmpty(),
            postTags: [],
            autoCompleteTags: [],
            placename: this.props.placename || "",
            location: this.props.location || {},
        };

        if (this.props.isedit && this.props.post !== undefined) {
            this.setState({
                postid: this.props.post.postid,
                title: this.props.post.title,
                date: dateFormat(this.props.post.date, 'isoDate'),
                postTags: this.props.post.tagnames.split(','),
                placename: this.props.post.placename,
                location: this.props.post.location,
            });

            const contentBlock = convertFromHTML(this.props.post.htmlContent);
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(
                    contentBlock.contentBlocks,
                    contentBlock.entityMap,
                );
                this.setState({
                    editorState: EditorState.createWithContent(contentState)
                });
            }
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handlePostTagsChange = this.handlePostTagsChange.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.onImgInputChange = this.onImgInputChange.bind(this);
        this.onImgDeleteClick = this.onImgDeleteClick.bind(this);
        this.onPostFormClear = this.onPostFormClear.bind(this);
        this.onPostFormCancel = this.onPostFormCancel.bind(this);
        this.onPostFormSubmit = this.onPostFormSubmit.bind(this);
        this.onPostFormDelete = this.onPostFormDelete.bind(this);
        this.toLatLng = this.toLatLng.bind(this);

        this.postErrorWrap = React.createRef();
    }
    onEditorStateChange(editorState) {
        formLogger("editor emitted state changed");
        this.setState({
            editorState,
        });
    }
    handlePostTagsChange(postTags) {
        this.setState({
            postTags
        });
    }
    handleInputChange(event:React.ChangeEvent<HTMLInputElement>) {
        let name = event.target.name;
        let value = event.target.value;
        let errmsg = '';
        switch (name) {
            case "date":
                let ts = Date.parse(value);
                if (isNaN(ts)) {
                    errmsg = "<strong>Invalid date</strong>";
                }
                break;

            default:
                break;
        }
        this.setState({ errormessage: errmsg });
        this.setState((prevState) => ({ 
            ...prevState,
            [name]: value 
        }));
    }
    toLatLng(location:FormLocationType) {
        if ('lat' in location) {
            return `${location.lat},${location.lng}`;
        } else if ('x' in location) {
            return `${location.x},${location.y}`;
        }
    }
    onPostFormCancel(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        this.blogFormCancelled({ showform: false });
    }
    onPostFormClear(event: React.MouseEvent<HTMLButtonElement>) {
        this.setState({
            placename: "",
            title: "",
            date: "",
            postTags: [],
        });
        event.preventDefault();
    }
    onPostFormDelete(event: React.MouseEvent<HTMLButtonElement>) {
        let url = `${appSettings.apihost}/api/rest/posts/${this.state.postid}/remove`;
        let formData = new FormData();
        formData.append('auth', this.state.auth);
        fetch(url, {
            method: 'POST',
            body: formData,
        }).then((resp) => resp.json()).then(function(data) {
            if (data.hasOwnProperty('err')) {
                throw data.err;
            }
            this.blogFormSubmitted({ 
                showform: false,
            });
        }.bind(this)).catch((err) => {
            this.setState({'postError': JSON.stringify(err)});
            if (this.postErrorWrap.current !== null) {
                this.postErrorWrap.current.style.display = "block";
            }
        });
        event.preventDefault();
    }
    onPostFormSubmit(event:React.FormEvent) {
        event.preventDefault();

        let formPromise = new Promise(function(resolve, reject) {
            let formData = new FormData();
            let content = draftToHtml(convertToRaw(
                this.state.editorState.getCurrentContent()
            ));
            let zbuffer = zlib.deflateSync(content);
            formData.append('content', zbuffer.toString('base64'));
            formData.append('date', this.state.date);
            formData.append('auth', this.state.auth);
            formData.append('tags', JSON.stringify({add:this.state.postTags}));
            formData.append('title', this.state.title);
            formData.append('location', this.toLatLng(this.state.location));
            formData.append('placename', this.state.placename);
            if ('croppie' in this.state) {
                this.state.croppie.result({
                    size: 'original',
                    type: 'blob',
                }).then(function(blob) {
                    formData.append('postimgs', blob);
                    resolve(formData);
                });
            } else {
                resolve(formData);
            }
        }.bind(this));

        let url = appSettings.apihost;
        if (this.props.isedit) {
            url = `${url}/api/rest/posts/${this.state.postid}/update`;
        } else {
            url = `${url}/api/rest/posts`;
        }

        formPromise.then((formData:FormData) => {
            let params: RequestInit = {
                method: 'POST',
                body: formData,
            }
            return fetch(url, params);
        }).then((resp) => resp.json()).then(function(data) {
            formLogger("form submitted - resp=", url, data);
            if (data.hasOwnProperty('err')) {
                throw data.err;
            }
            this.blogFormSubmitted({ 
                showform: false,
                postid: data.postid || this.state.postid,
                refresh: this.props.isedit ? -1 : data.postid,
            });
        }.bind(this)).catch((err) => {
            formLogger("form submit errored: ", err);
            this.setState({'postError': JSON.stringify(err)});
            this.postErrorWrap.current!.style.display = "block";
        });
    }
    onImgDeleteClick(event:React.MouseEvent<HTMLSpanElement>) {
        this.cropContainer.current!.style.display = 'none';
        this.imgUploadInput.current!.value = "";
    }
    onImgInputChange(event:React.ChangeEvent<HTMLInputElement>) {
        if (event.target.files && event.target.files[0]) {
            var onload = function (img:HTMLCanvasElement) {
                var c;
                if ('croppie' in this.state) {
                    c = this.state['croppie'];
                } else {
                    c = new Croppie(this.cropContainer.current, {
                        viewport: { width: 250, height: 250 },
                        boundary: { width: 300, height: 300 },
                        showZoomer: true,
                        enableResize: false,
                        enableOrientation: true,
                        enforceBoundary: true,
                    });
                    this.state['croppie'] = c;
                    this.rotateLeft.current.addEventListener("click", function () {
                        c.rotate(90);
                    });
                    this.rotateRight.current.addEventListener("click", function () {
                        c.rotate(-90);
                    });
                }
                c.bind({
                    url: img.toDataURL(),
                });
                this.cropContainer.current.style.display = 'block';
                formLogger("done init croppie:");
            }.bind(this);
            loadImage(event.target.files[0], onload, {
                maxWidth: 1024,
                orientation: true,
                canvas: true,
            });
        }
    }
    componentDidMount() {
        this.cropContainer.current!.style.display = "None";
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.placename != this.props.placename &&
            this.props.placename != prevState.placename) {
            this.setState({ placename: this.props.placename });
        }
    }
    render() {
        const { editorState } = this.state;
        return (
            <div id="{this.props.id}" className="blog-form" ref={this.blogFormDiv} >
                <div className="post-error-wrap" ref={this.postErrorWrap}>
                    <div className="alert alert-danger">
                        {this.state.postError}
                    </div>
                </div>
                <form onSubmit={this.onPostFormSubmit} ref={this.postForm}>
                    {this.state.errormessage}
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input type="text" className="form-control" name="title" placeholder="Post title"
                            value={this.state.title} onChange={this.handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="date">Date:</label>
                        <input type="date" className="form-control" name="date" placeholder="yyyy-mm-dd"
                            value={this.state.date} onChange={this.handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="placename">Place Name:</label>
                        <input type="text" className="form-control" name="placename"
                            value={this.state.placename} onChange={this.handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="postTags">Tags:</label>
                        <TagsInput name="postTags" value={this.state.postTags}
                            onChange={this.handlePostTagsChange} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="imgUploadInput">Upload Photo:</label>
                        <input type="file" className="form-control-file"
                            name="imgUploadInput"
                            ref={this.imgUploadInput}
                            onChange={this.onImgInputChange}
                            accept="image/*"
                            required={!this.props.isedit} />
                        <small id="fileHelp" className="form-text text-muted">
                            Upload a photo for this place
                        </small>
                        <div className="cropContainer" ref={this.cropContainer}>
                            <span className="rotateLeft" ref={this.rotateLeft}>
                                <i className="fas fa-undo-alt"></i>
                            </span>
                            <span className="imgdelete"
                                onClick={this.onImgDeleteClick}
                                ref={this.imgdelete}>
                                <i className="far fa-times-circle"></i>
                            </span>
                            <span className="rotateRight" ref={this.rotateRight}>
                                <i className="fas fa-redo-alt"></i>
                            </span >
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Post content:</label>
                        <Editor
                            editorState={editorState}
                            toolbarClassName="post-editor-toolbar"
                            wrapperClassName="post-editor-wrapper"
                            editorClassName="post-editor-editor"
                            onEditorStateChange={this.onEditorStateChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="auth">Auth:</label>
                        <input type="password" className="form-control" name="auth" placeholder="Secret Auth"
                            value={this.state.auth} onChange={this.handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <button type="submit" className="btn btn-sm btn-outline-dark form-btn-submit">Submit</button>
                        <button onClick={this.onPostFormClear} className="btn btn-sm btn-outline-dark form-btn-clear">Clear</button>
                        <button onClick={this.onPostFormCancel} className="btn btn-sm btn-outline-dark form-btn-cancel">Cancel</button>
                        {this.props.isedit ? 
                            <button onClick={this.onPostFormDelete} className="btn btn-sm btn-outline-dark form-btn-delete">Delete</button>
                            : ""
                        }
                    </div>
                </form>
            </div>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form);
