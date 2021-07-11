/**
 * mongo implementation of the DAO interface for post tags
 */
const logging = require("../utils/logging");
const logger = logging.getLogger("app::model::tags-dao-mongodb");
const dbutils = require("../utils/db");

function findMany(params) {
    let limit = params.limit || 100;
    let where = params.where || {};
    let scols = params.select || {};
    let pipeline = [
        {
            $match: where,
        },
        {
            $addFields: { postid: "$_id" },
        },
        {
            $unset: ["_id"],
        },
    ];
    if (scols.length) {
        pipeline.push({ $porject: scols });
    }
    logger.debug("findMany -> ", where, scols, limit);
    return dbutils
        .getDbConnection()
        .then((db) => {
            return db.aggregate(pipeline).limit(limit).toArray();
        })
        .then(function (res) {
            return {
                data: res,
                statusCode: 200,
            };
        })
        .catch(function (err) {
            return {
                data: {},
                statusCode: 404,
                err: err,
            };
        });
}

/**
 * Find the shopping list for the specified id
 */
function findOne(tag) {
    let params = {
        limit: 1,
        where: `where tag=${tag}`,
    };
    return findMany(params);
}

module.exports.findMany = findMany;
module.exports.findOne = findOne;
