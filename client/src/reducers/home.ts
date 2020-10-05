import * as ReduxTypes from "ReduxTypes";

type HomeReduerModel = {
	showform: boolean;
	isedit: boolean;
	postid: number;
	refresh: boolean;
	filteredPostids: number[];
	tagname: string;
};

const initState: HomeReduerModel = {
	showform: false,
	isedit: false,
	postid: -1,
	refresh: false,
	filteredPostids: [],
	tagname: ""
};

const logger = require("debug")("app:reducer:home");
const home = (state = initState, action: ReduxTypes.RootAction) => {
	logger("on change action=%s", action.type);
	switch (action.type) {
		case "MAP_MARKER_CLICKED":
			return {
				...state,
				showform: action.payload.showform,
				isedit: action.payload.isedit
			};
		case "MAP_THUMBNAIL_CLICKED":
			return {
				...state,
				postid: action.payload.postid
			};
		case "BLOG_FORM_CANCELLED":
			return {
				...state,
				showform: action.payload.showform
			};
		case "BLOG_FORM_SUBMITTED":
			return {
				...state,
				showform: action.payload.showform,
				postid: action.payload.postid,
				refresh: action.payload.refresh
			};
		case "BLOG_POST_EDIT_CLICKED":
			return {
				...state,
				showform: action.payload.showform,
				isedit: action.payload.isedit
			};
		case "TAG_LINK_CLICKED":
			return {
				...state,
				filteredPostids: action.payload.postids,
				tagname: action.payload.tagname
			};
		default:
			return state;
	}
};

export default home;
