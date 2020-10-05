var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var logger = require('debug')("app:reducer:home");
var home = function (state, action) {
    if (state === void 0) { state = []; }
    logger("on change action=%s", action.type);
    switch (action.type) {
        case 'MAP_MARKER_CLICKED':
            return __assign(__assign({}, state), { showform: action.data.showform, isedit: action.data.isedit });
        case 'MAP_THUMBNAIL_CLICKED':
            return __assign(__assign({}, state), { postid: action.data.postid });
        case 'BLOG_FORM_CANCELLED':
            return __assign(__assign({}, state), { showform: action.data.showform });
        case 'BLOG_FORM_SUBMITTED':
            return __assign(__assign({}, state), { showform: action.data.showform, postid: action.data.postid, refresh: action.data.refresh });
        case 'BLOG_POST_EDIT_CLICKED':
            return __assign(__assign({}, state), { showform: action.data.showform, isedit: action.data.isedit });
        case 'TAG_LINK_CLICKED':
            return __assign(__assign({}, state), { filteredPostids: action.data.postids, tagname: action.data.tagname });
        default:
            return state;
    }
};
export default home;
//# sourceMappingURL=home.js.map