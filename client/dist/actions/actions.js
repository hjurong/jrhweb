var nextPostId = 0;
export var addPost = function (text) { return ({
    type: 'ADD_POST',
    id: nextPostId++,
    text: text
}); };
export var setVisibilityFilter = function (filter) { return ({
    type: 'SET_VISIBILITY_FILTER',
    filter: filter
}); };
export var VisibilityFilters = {
    SHOW_ALL: 'SHOW_ALL',
    SHOW_ARCHIVED: 'SHOW_ARCHIVED',
    SHOW_LATEST: 'SHOW_LATEST'
};
export var mapLoaded = function (data) { return ({
    type: 'MAP_LOADED',
    data: data
}); };
export var mapPlacenameChanged = function (data) { return ({
    type: 'MAP_PLACENAME_CHANGED',
    data: data
}); };
export var mapCenterChanged = function (data) { return ({
    type: 'MAP_CENTER_CHANGED',
    data: data
}); };
export var mapMarkerClicked = function (data) { return ({
    type: 'MAP_MARKER_CLICKED',
    data: data
}); };
export var mapThumbnailClicked = function (data) { return ({
    type: 'MAP_THUMBNAIL_CLICKED',
    data: data
}); };
export var blogFormSubmitted = function (data) { return ({
    type: 'BLOG_FORM_SUBMITTED',
    data: data
}); };
export var blogFormCancelled = function (data) { return ({
    type: 'BLOG_FORM_CANCELLED',
    data: data
}); };
export var blogPostEditClicked = function (data) { return ({
    type: 'BLOG_POST_EDIT_CLICKED',
    data: data
}); };
export var blogPostLoaded = function (data) { return ({
    type: 'BLOG_POST_LOADED',
    data: data
}); };
export var tagLinkClicked = function (data) { return ({
    type: 'TAG_LINK_CLICKED',
    data: data
}); };
//# sourceMappingURL=actions.js.map