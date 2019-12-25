/**
 * mysql implementation of the DAO interface for the
 * application. You should not need to make changes here.
 * If you find a bug, please open an issue.
 */

const SqlString = require('sqlstring');
const logging = require('../utils/logging');
const logger = logging.getLogger('app::model::tags-dao-mysql');
const utils = require('../utils/utils');
const db = utils.getDatabase();

function fetch(params) {
    let limit = params.limit || 100;
    let where = params.where || '';
    const sql = `
    select group_concat(postid) as postids, tag, count(postid) as cnt
        from tags 
        ${where} group by tag
    order by cnt desc limit ?`;
    logger.debug('fetch() -> ', sql, limit);
    return utils.queryPromise(sql, limit).then(function(res) {
        return {
            data: res,
            statusCode: 200,
        };
    }).catch(function(err) {
        return {
            data: {},
            statusCode: 404,
            err: err,
        }
    });
}

/**
 * Find the shopping list for the specified id
 */
function read(tag) {
    tag = SqlString.escape(tag);
    let params = {
        limit: 1,
        where: `where tag=${tag}`, 
    }
    return fetch(params);
}

module.exports.fetch = fetch;
module.exports.read = read;
