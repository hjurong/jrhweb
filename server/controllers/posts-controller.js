/**
 * Controller for blog posts
 * REST interface.
 */

const fs = require("fs");
const url = require("url");
const path = require("path");
const sharp = require("sharp");
const uuidv1 = require("uuid/v1");
const { validationResult } = require("express-validator/check");

const appSettings = require("../config/app-settings");
const postsDao = require("../models/posts-dao");
const logging = require("../utils/logging");
const utils = require("../utils/utils");

const THUMBNAIL_SIZE = 64;
const logger = logging.getLogger("app::controller::rest::posts");

/**
 *
 * findMany using dao
 *
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function findMany(req, res, next) {
    logger.debug("findMany()");
    var err = validationResult(req);
    if (!err.isEmpty()) {
        logger.error(err.mapped());
        utils.writeServerJsonResponse(res, { err: err.mapped() }, 400);
        return;
    }
    postsDao
        .findMany(req.query)
        .then((result) => {
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            logger.error(err);
            next(err);
        });
}

function findManyGeo(req, res, next) {
    logger.info("findManyGeo", req.query, postsDao.findManyGeo);
    postsDao
        .findManyGeo(req.query)
        .then((result) => {
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            logger.error(err);
            next(err);
        });
}

function getPostImgSaveDir(postid) {
    postid = postid.toString();
    let imgsdir = path.join(appSettings.publicDir, "imgs/posts", postid);
    return imgsdir;
}

function saveImgs(postid, imgname, buf) {
    const imgsdir = getPostImgSaveDir(postid);
    if (!fs.existsSync(imgsdir)) {
        logger.info("creating new dir for post imgs: ", imgsdir);
        fs.mkdirSync(imgsdir, { recursive: true });
    }
    const tname = `${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}_${imgname}`;
    const tsavename = path.join(imgsdir, tname);
    let thbPromise = sharp(buf).png().resize(THUMBNAIL_SIZE).toFile(tsavename);

    const isavename = path.join(imgsdir, imgname);
    let imgPromise = sharp(buf).png().toFile(isavename);
    return [thbPromise, imgPromise];
}

/**
 * Creates a new post and redirects to the posts-all page
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function create(req, res, next) {
    logger.info("received req: ", req.body);
    if (!req.file) {
        utils.writeServerJsonResponse(res, { err: "missing file" }, 400);
        return;
    }
    var err = validationResult(req);
    if (!err.isEmpty() && false) {
        logger.error(err.mapped());
        utils.writeServerJsonResponse(res, { err: err.mapped() }, 400);
        return;
    }

    let imgname = `${uuidv1()}.png`;
    let params = Object.assign({}, req.body);
    params = Object.assign(params, {
        imgname: imgname,
    });
    params.tags = JSON.parse(params.tags);
    logger.debug("create()", params);

    let createPromise = postsDao.create(params);
    let saveImgsPromise = createPromise
        .then((result) => {
            logger.debug("create() -> promise ->", result);

            let promises = saveImgs(
                result.data.postid,
                imgname,
                req.file.buffer
            );
            promises.unshift({ imgSaved: true });
            return Promise.all(promises);
        })
        .catch((err) => {
            logger.error("failed to save full img: ", err);
            return [{ imgSaved: false, err: err }];
        });

    Promise.all([createPromise, saveImgsPromise])
        .then((results) => {
            let result = results[0];
            result.data["imgSaved"] = results[1][0].imgSaved;
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            next(err);
        });
}

/**
 * findManyes the specified post and all of its items
 * and returns it to the caller.
 *
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function findOne(req, res, next) {
    logger.debug("findOne()");
    let postId = req.params.postId;
    postsDao
        .findOne(postId)
        .then((result) => {
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            logger.error(err);
            next(err);
        });
}

/**
 *
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function update(req, res, next) {
    logger.debug("update()");
    var err = validationResult(req);
    if (!err.isEmpty()) {
        logger.error(err.mapped());
        utils.writeServerJsonResponse(res, { err: err.mapped() }, 400);
        return;
    }

    let postid = req.params.postId;
    let params = Object.assign({}, req.body);
    if (req.file) {
        let imgname = `${uuidv1()}.png`;
        params = Object.assign(params, {
            imgname: imgname,
        });
    }

    params.tags = JSON.parse(params.tags);
    logger.debug("update()", params);

    let updatePromise = postsDao.update(postid, params);
    let saveImgsPromise = updatePromise
        .then((result) => {
            logger.debug("update() -> promise ->", result);

            if (req.file) {
                let promises = saveImgs(
                    postid,
                    params.imgname,
                    req.file.buffer
                );
                promises.unshift({ imgSaved: true });
                return Promise.all(promises);
            } else {
                return [{ imgSaved: false }];
            }
        })
        .catch((err) => {
            logger.error("failed to save full img: ", err);
            return [{ imgSaved: false, err: err }];
        });

    Promise.all([updatePromise, saveImgsPromise])
        .then((results) => {
            let result = results[0];
            result.data["imgSaved"] = results[1][0].imgSaved;
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            next(err);
        });
}

/**
 *
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function remove(req, res, next) {
    let postId = req.params.postId;

    postsDao
        .remove(postId)
        .then((result) => {
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            next(err);
        });
}

module.exports.findMany = findMany;
module.exports.findManyGeo = findManyGeo;
module.exports.create = create;
module.exports.findOne = findOne;
module.exports.update = update;
module.exports.remove = remove;
