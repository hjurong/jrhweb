import { combineReducers } from "redux";
import { posts } from "./posts";
import home from "./home";
import map from "./map";

export default combineReducers({
	posts,
	home,
	map
});
