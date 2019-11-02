import React from 'react';

import { connect } from 'react-redux';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import TagsInput from 'react-tagsinput';
import { blogFormSubmitted, blogFormCancelled } from '../../../actions'

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import 'croppie/croppie.css';

const Croppie = require('croppie');
const loadImage = require('blueimp-load-image');
var formLogger = require('debug')("app:blog:form");

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            title: "",
            date: "",
            editorState: EditorState.createEmpty(),
            postId: -1,
            postTags: [],
            autoCompleteTags: [],
            placename: this.props.placename || "",
            center: this.props.center || [],
        };

        if (this.props.isedit) {
            const html = "<p>test</p>";
            if (contentBlock) {
                const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
                const editorState = EditorState.createWithContent(contentState);
                this.state['editorState'] = editorState;
            }
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.onEditorStateChange = this.onEditorStateChange.bind(this);
        this.onImgInputChange = this.onImgInputChange.bind(this);
        this.onImgDeleteClick = this.onImgDeleteClick.bind(this);
        this.handlePostTagsChange = this.handlePostTagsChange.bind(this);
        this.onPostFormClear = this.onPostFormClear.bind(this);
        this.onPostFormCancel = this.onPostFormCancel.bind(this);
        this.onPostFormSubmit = this.onPostFormSubmit.bind(this);
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
    handleInputChange(event) {
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
        this.setState({ [name]: value });
    }
    onPostFormCancel(event) {
        event.preventDefault();
        this.blogFormCancelled({ showform: false });
    }
    onPostFormClear(event) {
        this.setState({
            placename: "",
            title: "",
            date: "",
            postTags: [],
        });
        event.preventDefault();
    }
    onPostFormSubmit(event) {
        event.preventDefault(); //FIXME

        const formData = new FormData();
        formData.append(
            'content', 
            draftToHtml(convertToRaw(
                this.state.editorState.getCurrentContent()
            ))
        );
        formData.append('id', this.state.postId);
        formData.append('date', this.state.date);
        formData.append('tags', this.state.postTags);
        formData.append('title', this.state.title);
        formData.append('center', this.state.center);
        formData.append('placename', this.state.placename);
        if ('croppie' in this.state) {
            formData.append('postimg', this.state.croppie)
        }

        formLogger("form submitted");
        this.blogFormSubmitted({ showform: false });
    }
    onImgDeleteClick(event) {
        this.cropContainter.style.display = 'none';
        this.imgUploadInput.value = "";
    }
    onImgInputChange(event) {
        if (event.target.files && event.target.files[0]) {
            var onload = function (img) {
                var c;
                if ('croppie' in this.state) {
                    c = this.state['croppie'];
                } else {
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
    }
    componentDidMount() {
        this.cropContainter.style.display = "None";
        this.blogFormCancelled = this.props.blogFormCancelled;
        this.blogFormSubmitted = this.props.blogFormSubmitted;
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
            <div id={this.props.id} className="blog-form" ref={el => this.blogFormDiv = el} >
                <form onSubmit={this.onPostFormSubmit} ref={el => this.postForm = el}>
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
                            ref={el => this.imgUploadInput = el}
                            onChange={this.onImgInputChange}
                            accept="image/*"
                            required={this.props.isedit} />
                        <small id="fileHelp" className="form-text text-muted">
                            Upload a photo for this place
                    </small>
                        <div className="cropContainer" ref={el => this.cropContainter = el}>
                            <span className="rotateLeft" ref={el => this.rotateLeft = el}>
                                <i className="fas fa-undo-alt"></i>
                            </span>
                            <span className="imgdelete"
                                onClick={this.onImgDeleteClick}
                                ref={el => this.imgdelete = el}>
                                <i className="far fa-times-circle"></i>
                            </span>
                            <span className="rotateRight" ref={el => this.rotateRight = el}>
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
                        <button type="submit" className="btn btn-sm btn-outline-dark form-btn-submit">Submit</button>
                        <button onClick={this.onPostFormClear} className="btn btn-sm btn-outline-dark form-btn-clear">Clear</button>
                        <button onClick={this.onPostFormCancel} className="btn btn-sm btn-outline-dark form-btn-cancel">Cancel</button>
                    </div>
                </form>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    
});

const mapDispatchToProps = dispatch => ({
    blogFormSubmitted: data => dispatch(blogFormSubmitted(data)),
    blogFormCancelled: data => dispatch(blogFormCancelled(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Form);
