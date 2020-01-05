import React from "react";

import { connect } from 'react-redux';
import { blogPostEditClicked, blogPostLoaded } from '../../../actions'

const zlib = require('zlib');
const dateFormat = require('dateformat');
const appSettings = require('../../../lib/app-settings');
const postLogger = require('debug')("app:blog:post");

class Post extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            postptr:0,
        };
        this.onBlogPostEditClicked = this.onBlogPostEditClicked.bind(this);
        this.onPrevBlogPostClicked = this.onPrevBlogPostClicked.bind(this);
        this.onNextBlogPostClicked = this.onNextBlogPostClicked.bind(this);
        this.handleStateChange = this.handleStateChange.bind(this);
        this.fetchPost = this.fetchPost.bind(this);
        this.renderPost = this.renderPost.bind(this);
        this.renderAlert = this.renderAlert.bind(this);
    }
    onBlogPostEditClicked(event) {
        this.blogPostEditClicked({
            showform: true,
            isedit: true,
            post: this.state.post,
        });
    }
    renderAlert(type) {
        return `<div class="alert alert-warning alert-dismissible fade show" role="alert">
            Already at ${type} post
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`
    } 
    onPrevBlogPostClicked(event) {
        if (this.state.postptr == 0) {
            this.postAlertWrap.innerHTML = this.renderAlert('oldest');
            return;
        }
        this.state.postptr--;
        this.renderPost(this.props.postids[this.state.postptr]);
    }
    onNextBlogPostClicked(event) {
        if (this.state.postptr == this.props.postids.length-1) {
            this.postAlertWrap.innerHTML = this.renderAlert('newest');
            return;
        }
        this.state.postptr++;
        this.renderPost(this.props.postids[this.state.postptr]);
    }
    handleStateChange(name, value) {
        switch (name) {
            case "content":
                const buf = Buffer.from(value, 'base64');
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
        this.setState({ [name]: value });
    }
    getPostImgUrl() {
        return `${appSettings.publicDir}/imgs/posts/${this.state.postid}/${this.state.fnames}`;
    }
    fetchPost(postid) {
        let params = {limit:1};
        let url = `${appSettings.apihost}/api/rest/posts`;
        if (postid !== undefined) {
            url = `${url}/${postid}`
        }
        url = new URL(url);
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
        return fetch(url).then(resp => resp.json());
    }
    renderPost(postid) {
        postid = postid || this.props.postid;
        this.fetchPost(postid).then(function(data) {
            postLogger("fetchPost received: ", data);
            let post = data[0];
            Object.entries(post).forEach(function(pair) {
                this.handleStateChange(pair[0], pair[1]);
            }.bind(this));

            post.htmlContent = this.state.content;
            this.state.post = post;
            this.blogPostLoaded({post: post});
        }.bind(this));
    }
    componentDidMount() {
        this.blogPostEditClicked = this.props.blogPostEditClicked;
        this.blogPostLoaded = this.props.blogPostLoaded;
        this.renderPost();
    }
    componentDidUpdate(prevProps) {
        if (prevProps.postid !== this.props.postid) {
            this.renderPost();
        }
    }
    render() {
        return (
        <div>
            <div className="blog-post">
                <h2 className="blog-post-title">{this.state.title}</h2>
                <p className="blog-post-meta">
                    {this.state.date} - {this.state.placename}
                    <span className="blog-post-edit" title="edit post" 
                        onClick={this.onBlogPostEditClicked}
                        ref={el => this.blogPostEdit = el}>
                        <i className="fas fa-edit"></i>
                    </span>
                </p>
                <div className="post-img-wrap">
                    <img className="post-img" src={this.getPostImgUrl()}></img>
                </div>
                <div className="post-content-wrap" 
                    ref={el => this.postContentWrap = el}>
                </div>
            </div>
            <div className="blog-alert-wrap"
                ref={el => this.postAlertWrap = el}>
            </div>
            <nav className="blog-pagination">
                <button className="btn btn-outline-primary post-btn-prev"
                    onClick={this.onPrevBlogPostClicked}>Prev</button>
                <button className="btn btn-outline-secondary post-btn-next"
                    onClick={this.onNextBlogPostClicked}>Next</button>
            </nav>
        </div>
        );
    }
}

const mapStateToProps = state => ({
    postid: state.home.postid,
    postids: state.map.postids,
});

const mapDispatchToProps = dispatch => ({
    blogPostEditClicked: data => dispatch(blogPostEditClicked(data)),
    blogPostLoaded: data => dispatch(blogPostLoaded(data)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Post);

