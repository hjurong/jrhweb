import * as ReduxTypes from "ReduxTypes";
import * as BlogMapTypes from "BlogMapTypes";

type MapReduerModel = {
	center: BlogMapTypes.BlogMapCenterType;
	postid: number;
	postids: number[];
	placename: string;
};

const initState: MapReduerModel = {
	center: { lng: 0, lat: 0 },
	postid: 0,
	postids: [],
	placename: ""
};

const logger = require("debug")("app:reducer:map");
const map = (state = initState, action: ReduxTypes.RootAction) => {
	logger("on change action=%s", action.type);
	switch (action.type) {
		case "MAP_LOADED":
			return {
				...state,
				postids: action.payload.postids
			};
		case "MAP_CENTER_CHANGED":
			return {
				...state,
				center: action.payload.center
			};
		case "MAP_THUMBNAIL_CLICKED":
			return {
				...state,
				postid: action.payload.postid
			};
		case "MAP_PLACENAME_CHANGED":
			return {
				...state,
				placename: action.payload.placename
			};
		default:
			return state;
	}
};

export default map;
