import * as ReduxTypes from "ReduxTypes";
import * as BlogPostsTypes from "BlogPostsTypes";
import { number } from "prop-types";

type PostsReduerModel = {
	post: BlogPostsTypes.BlogPostsPostType;
	center: { lat: number; lng: number };
};

const defaultPost = {
	id: -1,
	title: "",
	date: "",
	location: { x: 0, y: 0 },
	placename: "",
	postid: -1,
	fnames: "",
	content: "",
	tagnames: "",
	htmlContent: ""
};

const initState: PostsReduerModel = {
	post: defaultPost,
	center: { lat: 0, lng: 0 }
};

const logger = require("debug")("app:reducer:posts");
const posts = (state = initState, action: ReduxTypes.RootAction) => {
	logger("on change action=%s", action.type);
	switch (action.type) {
		case "BLOG_POST_LOADED":
			return {
				...state,
				post: action.payload.post,
				center: {
					lat: action.payload.post.location.x,
					lng: action.payload.post.location.y
				}
			};
		case "BLOG_POST_EDIT_CLICKED":
			return {
				...state,
				post: action.payload.post
			};
		default:
			return state;
	}
};

export { defaultPost, posts };
