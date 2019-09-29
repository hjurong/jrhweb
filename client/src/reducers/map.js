var logger = require('debug')("app:reducer:map");
const map = (state=[], action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'HOME_PAGE_LOADED':
            return {
                ...state,
                places: action.data.places,
            };
        case 'MARKER_SELECTED':
            return {
                ...state,
                current_location_id: action.data.current_location_id,
            }
        default:
            return state;
    }
};

export default map;