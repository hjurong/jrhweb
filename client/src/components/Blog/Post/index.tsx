import React from "react";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import * as ReduxTypes from "ReduxTypes";
import {
	blogPostEditClicked,
	blogPostLoaded,
	BlogPostEditClickedData,
	BlogPostLoadedData
} from "../../../actions";
import { defaultPost } from "../../../reducers/posts";
import * as BlogPostsTypes from "BlogPostsTypes";

const zlib = require("zlib");
const dateFormat = require("dateformat");
const appSettings = require("../../../lib/app-settings");
const postLogger = require("debug")("app:blog:post");

const mapStateToProps = (state: ReduxTypes.ReducerState) => ({
	postid: state.home.postid,
	postids: state.map.postids
});

const mapDispatchToProps = (dispatch: Dispatch<ReduxTypes.RootAction>) => ({
	blogPostEditClicked: (data: BlogPostEditClickedData) =>
		dispatch(blogPostEditClicked(data)),
	blogPostLoaded: (data: BlogPostLoadedData) => dispatch(blogPostLoaded(data))
});

type PostProps = ReturnType<typeof mapStateToProps> &
	ReturnType<typeof mapDispatchToProps>;

type PostState = {
	post: BlogPostsTypes.BlogPostsPostType;
	postid: number;
	postptr: number;
	content: string;
	title: string;
	date: string;
	fnames: string;
	placename: string;
	tagnames: string[];
};

class Post extends React.Component<PostProps, PostState> {
	blogPostEdit = React.createRef<HTMLDivElement>();
	postTagsWrap = React.createRef<HTMLDivElement>();
	postAlertWrap = React.createRef<HTMLDivElement>();
	postContentWrap = React.createRef<HTMLDivElement>();

	blogPostEditClicked = this.props.blogPostEditClicked;
	blogPostLoaded = this.props.blogPostLoaded;

	constructor(props: PostProps) {
		super(props);

		this.state = {
			post: defaultPost,
			postid: -1,
			postptr: 0,
			content: "",
			title: "",
			date: "",
			fnames: "",
			placename: "",
			tagnames: []
		};

		this.onBlogPostEditClicked = this.onBlogPostEditClicked.bind(this);
		this.onPrevBlogPostClicked = this.onPrevBlogPostClicked.bind(this);
		this.onNextBlogPostClicked = this.onNextBlogPostClicked.bind(this);
		this.handleStateChange = this.handleStateChange.bind(this);
		this.fetchPost = this.fetchPost.bind(this);
		this.renderPost = this.renderPost.bind(this);
		this.renderAlert = this.renderAlert.bind(this);
	}
	onBlogPostEditClicked(event: React.MouseEvent<HTMLButtonElement>) {
		this.blogPostEditClicked({
			showform: true,
			isedit: true,
			post: this.state.post
		});
	}
	renderAlert(type: string) {
		return `<div class="alert alert-warning alert-dismissible fade show" role="alert">
            Already at ${type} post
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>`;
	}
	onNextBlogPostClicked(event: React.MouseEvent<HTMLButtonElement>) {
		this.setState({
			postptr: this.props.postids.findIndex(e => e == this.state.postid)
		});
		if (this.state.postptr == 0) {
			this.postAlertWrap.current!.innerHTML = this.renderAlert("latest");
			return;
		}
		this.setState({ postptr: this.state.postptr - 1 });
		this.renderPost(this.props.postids[this.state.postptr]);
	}
	onPrevBlogPostClicked(event: React.MouseEvent<HTMLButtonElement>) {
		this.setState({
			postptr: this.props.postids.findIndex(e => e == this.state.postid)
		});
		if (this.state.postptr == this.props.postids.length - 1) {
			this.postAlertWrap.current!.innerHTML = this.renderAlert("last");
			return;
		}
		this.setState({ postptr: this.state.postptr + 1 });
		this.renderPost(this.props.postids[this.state.postptr]);
	}
	handleStateChange(name: keyof PostState, value: any) {
		switch (name) {
			case "content":
				const buf = Buffer.from(value, "base64");
				value = zlib.unzipSync(buf).toString();
				this.postContentWrap.current!.innerHTML = value;
				break;
			case "tagnames":
				value = value.split(",");
				break;
			case "date":
				value = dateFormat(value, "dddd, mmmm dS, yyyy");
			default:
				break;
		}
		this.setState(prevState => ({
			...prevState,
			[name]: value
		}));
	}
	getPostImgUrl() {
		return `${appSettings.publicDir}/imgs/posts/${this.state.postid}/${this.state.fnames}`;
	}
	fetchPost(postid?: number) {
		let params = { limit: 1 };
		let urlstr = `${appSettings.apihost}/api/rest/posts`;
		if (postid !== undefined && postid !== -1) {
			urlstr = `${urlstr}/${postid}`;
		}
		let url = new URL(urlstr);
		Object.keys(params).forEach(key =>
			url.searchParams.append(key, params[key])
		);
		return fetch(url.toString()).then(resp => resp.json());
	}
	renderPost(postid?: number) {
		postid = postid || this.props.postid;
		this.fetchPost(postid).then(
			function(data) {
				postLogger("fetchPost received: ", data);
				let post = data[0];
				Object.entries(post).forEach(
					function(pair) {
						this.handleStateChange(pair[0], pair[1]);
					}.bind(this)
				);

				post.htmlContent = this.state.content;
				this.state.post = post;
				this.blogPostLoaded({ post: post });
			}.bind(this)
		);
	}
	componentDidMount() {
		this.renderPost();
	}
	componentDidUpdate(prevProps: PostProps) {
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
						<span
							className="blog-post-edit"
							title="edit post"
							onClick={this.onBlogPostEditClicked}
							ref={this.blogPostEdit}
						>
							<i className="fas fa-edit"></i>
						</span>
					</p>
					<div className="post-img-wrap">
						<img
							className="post-img"
							src={this.getPostImgUrl()}
						></img>
					</div>
					<div
						className="post-content-wrap"
						ref={this.postContentWrap}
					></div>
					<div className="post-tags-wrap" ref={this.postTagsWrap}>
						{this.state.tagnames.map((tagname, i) => {
							return (
								<span
									className="badge badge-primary post-tag-span"
									key={i}
								>
									{tagname}
								</span>
							);
						})}
					</div>
				</div>
				<div className="blog-alert-wrap" ref={this.postAlertWrap}></div>
				<nav className="blog-pagination">
					<button
						className="btn btn-outline-primary post-btn-prev"
						onClick={this.onPrevBlogPostClicked}
					>
						Prev
					</button>
					<button
						className="btn btn-outline-secondary post-btn-next"
						onClick={this.onNextBlogPostClicked}
					>
						Next
					</button>
				</nav>
			</div>
		);
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Post);
