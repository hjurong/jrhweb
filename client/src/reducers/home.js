var logger = require('debug')("app:reducer:home");
const home = (state=[], action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'MAP_MARKER_CLICKED':
            return {
                ...state,
                showform: action.data.showform,
                isedit: action.data.isedit,
            };
        case 'BLOG_FORM_CANCELLED':
            return {
                ...state,
                showform: action.data.showform,
            };
        case 'BLOG_FORM_SUBMITTED':
            return {
                ...state,
                showform: action.data.showform,
            };
        case 'BLOG_POST_EDIT_CLICKED':
            return {
                ...state,
                showform: action.data.showform,
                isedit: action.data.isedit,
            };
        default:
            return state;
    }
};

export default home;