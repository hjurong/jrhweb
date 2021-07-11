/**
 * Controller for blog tags
 * REST interface.
 */

const tagsDao = require("../models/tags-dao");
const logging = require("../utils/logging");
const utils = require("../utils/utils");

const logger = logging.getLogger("app::controller::rest::tags");

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
    tagsDao
        .findMany(req.query)
        .then((result) => {
            logger.debug("findMany()", result);
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            logger.error(err);
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
    let tag = req.params.tag;
    tagsDao
        .findOne(tag)
        .then((result) => {
            utils.writeServerJsonResponse(res, result.data, result.statusCode);
        })
        .catch((err) => {
            logger.error(err);
            next(err);
        });
}

module.exports.findMany = findMany;
module.exports.findOne = findOne;
