import { action } from "typesafe-actions";
import * as BlogMapTypes from "BlogMapTypes";
import * as BlogPostsTypes from "BlogPostsTypes";

export interface TagLinkClickedData {
	postids: number[];
	tagname: string;
}

export interface MapLoadedData {
	postids: number[];
}

export interface MapPlacenameChangedData {
	placename: string;
}

export interface MapCenterChangedData {
	center: BlogMapTypes.BlogMapCenterType;
}

export interface MapMarkerClickedData {
	showform: boolean;
	isedit: boolean;
}

export interface MapThumbnailClickedData {
	postid: number;
}

export interface BlogFormSubmittedData {
    showform: boolean;
    postid: number;
    refresh: number;
}

export interface BlogFormCancelledData {
	showform: boolean;
}

export interface BlogPostEditClickedData {
	showform: boolean;
	isedit: boolean;
	post: BlogPostsTypes.BlogPostsPostType;
}

export interface BlogPostLoadedData {
	post: BlogPostsTypes.BlogPostsPostType;
}

export const mapLoaded = (data: MapLoadedData) => action("MAP_LOADED", data);

export const mapPlacenameChanged = (data: MapPlacenameChangedData) =>
	action("MAP_PLACENAME_CHANGED", data);

export const mapCenterChanged = (data: MapCenterChangedData) =>
	action("MAP_CENTER_CHANGED", data);

export const mapMarkerClicked = (data: MapMarkerClickedData) =>
	action("MAP_MARKER_CLICKED", data);

export const mapThumbnailClicked = (data: MapThumbnailClickedData) =>
	action("MAP_THUMBNAIL_CLICKED", data);

export const blogFormSubmitted = (data: BlogFormSubmittedData) =>
	action("BLOG_FORM_SUBMITTED", data);

export const blogFormCancelled = (data: BlogFormCancelledData) =>
	action("BLOG_FORM_CANCELLED", data);

export const blogPostEditClicked = (data: BlogPostEditClickedData) =>
	action("BLOG_POST_EDIT_CLICKED", data);

export const blogPostLoaded = (data: BlogPostLoadedData) =>
	action("BLOG_POST_LOADED", data);

export const tagLinkClicked = (data: TagLinkClickedData) =>
	action("TAG_LINK_CLICKED", data);
