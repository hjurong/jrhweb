const express = require('express');

const router = express.Router();
const postsController = require('../../../controllers/posts-controller');
const upload = require('../../../middlewares/upload');
const validate = require('../../../middlewares/post-validators');

// REST service
router.get('/', validate.postQueryValidators, postsController.fetch);
router.get('/geo', postsController.fetchgeo);
router.get('/:postId(\\d+)', postsController.read);

router.post('/', 
            [upload.single('postimgs')].concat(validate.postCreateValidators), 
            postsController.create);
router.post('/:postId(\\d+)/update', 
            [upload.single('postimgs')].concat(validate.postUpdateValidators), 
            postsController.update);
router.post('/:postId(\\d+)/remove', postsController.remove);

module.exports = router;
