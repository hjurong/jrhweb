const { check } = require('express-validator/check');

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(tomorrow.getDate() + 1)

let postIdValidator = check('postid').isInt().toInt();
let postLimitValidator = check('limit').optional().isInt().toInt();
let postTitleValidator = check('title').not().isEmpty().trim();
let postDateValidator = check('date').isISO8601();
let postLocationValidator = check('location').isLatLong();
let postPlacenameValidator = check('placename').not().isEmpty().trim();
let postTagsValidator = check('tags').isJSON();
let postTagsAddValidator = check('tags.add.*').isAlphanumeric().trim();
let postTagsDelValidator = check('tags.del.*').isAlphanumeric().trim();
let postContentValidator = check('content').isBase64();

let postCreateValidators = [
    postTitleValidator, postDateValidator, postLocationValidator, 
    postPlacenameValidator, postTagsValidator, postTagsAddValidator, 
    postContentValidator
];

let postUpdateValidators = [
    postTitleValidator, postDateValidator, postLocationValidator, 
    postPlacenameValidator, postTagsValidator, postTagsAddValidator, 
    postContentValidator
];

let postQueryValidators = [
    postLimitValidator,
];

module.exports.postCreateValidators = postCreateValidators;
module.exports.postUpdateValidators = postUpdateValidators;
module.exports.postQueryValidators = postQueryValidators;
