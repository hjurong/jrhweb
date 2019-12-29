var logger = require('debug')("app:reducer:posts");
const posts = (state={articles: []}, action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'HOME_PAGE_LOADED':
            return {
                ...state,
                post: action.data.post,
            };
        case 'BLOG_POST_EDIT_CLICKED':
            return {
                ...state,
                post: action.data.post,
            };
        default:
            return state;
    }
};

export default posts;
