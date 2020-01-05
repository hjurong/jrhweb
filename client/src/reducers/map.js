var logger = require('debug')("app:reducer:map");
const map = (state=[], action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'MAP_LOADED':
            return {
                ...state,
                postids: action.data.postids,
            };
        case 'MAP_CENTER_CHANGED':
            return {
                ...state,
                center: action.data.center,
            }
        case 'MAP_THUMBNAIL_CLICKED':
            return {
                ...state,
                postid: action.data.postid,
            };
        case 'MAP_PLACENAME_CHANGED':
            return {
                ...state,
                placename: action.data.placename,
            }
        default:
            return state;
    }
};

export default map;
