declare module "BlogPostsTypes" {
    export type BlogPostsPostType = {
        "id": number;
        "title": string;
        "date": string; 
        "location": {x: number; y: number};
        "placename": string; 
        "postid": number; 
        "fnames": string; 
        "content": string; 
        "tagnames": string; 
        "htmlContent": string; 
    }    
}
