var logger = require('debug')("app:reducer:posts");
const posts = (state={articles: []}, action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'HOME_PAGE_LOADED':
            return {
                ...state,
                articles: action.data.articles,
            };
        default:
            return state;
    }
};

export default posts;