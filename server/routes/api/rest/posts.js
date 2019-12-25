const express = require('express');

const router = express.Router();
const postsController = require('../../../controllers/posts-controller');
const upload = require('../../../middlewares/upload');
const validate = require('../../../middlewares/post-validators');

// REST service
router.get('/', postsController.fetch);
router.get('/:postId', postsController.read);

router.post('/', 
            [upload.single('postimgs')].concat(validate.postCreateValidators), 
            postsController.create);
router.post('/:postId/update', 
            [upload.single('postimgs')].concat(validate.postUpdateValidators), 
            postsController.update);
router.post('/:postId/remove', postsController.remove);

module.exports = router;
