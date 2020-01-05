var logger = require('debug')("app:reducer:posts");
const posts = (state={articles: []}, action) => {
    logger("on change action=%s", action.type);
    switch(action.type) {
        case 'BLOG_POST_LOADED':
            return {
                ...state,
                post: action.data.post,
                center: {
                    lat: action.data.post.location.x, 
                    lng: action.data.post.location.y
                },
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
