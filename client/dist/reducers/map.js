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
var logger = require('debug')("app:reducer:map");
var map = function (state, action) {
    if (state === void 0) { state = []; }
    logger("on change action=%s", action.type);
    switch (action.type) {
        case 'MAP_LOADED':
            return __assign(__assign({}, state), { postids: action.data.postids });
        case 'MAP_CENTER_CHANGED':
            return __assign(__assign({}, state), { center: action.data.center });
        case 'MAP_THUMBNAIL_CLICKED':
            return __assign(__assign({}, state), { postid: action.data.postid });
        case 'MAP_PLACENAME_CHANGED':
            return __assign(__assign({}, state), { placename: action.data.placename });
        default:
            return state;
    }
};
export default map;
//# sourceMappingURL=map.js.map