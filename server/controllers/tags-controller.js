/**
 * Controller for blog tags
 * REST interface.
 */

const tagsDao = require('../models/tags-dao');
const logging = require('../utils/logging');
const utils = require('../utils/utils');

const logger = logging.getLogger('app::controller::rest::tags');

/**
 * 
 * Fetches all shopping tags and redirects to the
 * tags-all page
 * 
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function fetch(req, res, next) {
    logger.debug('fetch()');
    tagsDao.fetch(req.query).then((result) => {
        logger.debug('fetch()', result);
        utils.writeServerJsonResponse(res, result.data, result.statusCode);
    }).catch((err) => {
        logger.error(err);
        next(err);
    });
}

/**
 * Fetches the specified post and all of its items
 * and returns it to the caller.
 * 
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function read(req, res, next) {
    logger.debug('read()');
    let tag = req.params.tag;
    tagsDao.read(tag).then((result) => {
        utils.writeServerJsonResponse(res, result.data, result.statusCode);
    }).catch((err) => {
        logger.error(err);
        next(err);
    });
}

module.exports.fetch = fetch;
module.exports.read = read;
