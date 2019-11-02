var logger = require('debug')("app:reducer:map");
const map = (state=[], action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'MAP_LOADED':
            return {
                ...state,
                places: action.data.places,
            };
        case 'MAP_CENTER_CHANGED':
            return {
                ...state,
                center: action.data.center,
            }
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