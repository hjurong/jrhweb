const express = require("express");

const router = express.Router();
const postsController = require("../../../controllers/posts-controller");
const upload = require("../../../middlewares/upload");
const validate = require("../../../middlewares/post-validators");

// REST service
router.get("/", validate.postQueryValidators, postsController.findMany);
router.get("/geo", postsController.findManyGeo);
router.get("/:postId(\\d+)", postsController.findOne);

router.post(
    "/",
    [upload.single("postimgs")].concat(validate.postCreateValidators),
    postsController.create
);
router.post(
    "/:postId(\\d+)/update",
    [upload.single("postimgs")].concat(validate.postUpdateValidators),
    postsController.update
);
router.patch(
    "/:postId(\\d+)/update",
    [upload.single("postimgs")].concat(validate.postUpdateValidators),
    postsController.update
);
router.post(
    "/:postId(\\d+)/remove",
    validate.postDeleteValidators,
    postsController.remove
);
router.delete(
    "/:postId(\\d+)",
    validate.postDeleteValidators,
    postsController.remove
);

module.exports = router;
