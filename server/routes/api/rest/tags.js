const express = require("express");

const router = express.Router();
const tagsController = require("../../../controllers/tags-controller");

// REST service
router.get("/", tagsController.findMany);
router.get("/:tag", tagsController.findOne);

/* TODO: add this ?
const validate = require('../../../middlewares/tag-validators');
router.post('/', 
            validate.tagCreateValidators, 
            tagsController.create);
router.post('/:tagId/update',
            validate.tagUpdateValidators, 
            tagsController.update);
router.post('/:tagId/remove', tagsController.remove);
*/

module.exports = router;
