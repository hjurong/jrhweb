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
var logger = require('debug')("app:reducer:posts");
var posts = function (state, action) {
    if (state === void 0) { state = { articles: [] }; }
    logger("on change action=%s", action.type);
    switch (action.type) {
        case 'BLOG_POST_LOADED':
            return __assign(__assign({}, state), { post: action.data.post, center: {
                    lat: action.data.post.location.x,
                    lng: action.data.post.location.y
                } });
        case 'BLOG_POST_EDIT_CLICKED':
            return __assign(__assign({}, state), { post: action.data.post });
        default:
            return state;
    }
};
export default posts;
//# sourceMappingURL=posts.js.map