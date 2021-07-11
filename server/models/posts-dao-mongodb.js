/**
 * mongodb schema
 * {
 *     postid: int,
 *     tagnames: arr[string],
 *     content: string,
 *     fnames: arr[string],
 *     location: Point(lng, lat),
 *     placename: string,
 *     date: date,
 *     title: string,
 * }
 */

const GeoJSON = require("geojson");
const logging = require("../utils/logging");
const logger = logging.getLogger("app::model::posts-dao-mongodb");
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

function findManyGeo(params) {
    logger.info("findManyGeo %O", params);
    params.select = {
        fnames: 1,
        location: 1,
    };
    return findMany(params).then((res) => {
        if (res.statusCode == 200) {
            res.data = GeoJSON.parse(res.data, { GeoJSON: "location" });
        }
        return res;
    });
}

/**
 * create a new post and insert into mongo
 */
function create(params) {
    var latLngArr = params.location.split(",").map((n) => parseFloat(n));
    var doc = {
        title: params.title,
        date: params.date,
        location: {
            type: "Point",
            coordinates: [latLngArr[1], latLngArr[0]], // mongo geo point expects [Lng, Lat]
        },
        placename: params.placename,
        content: params.content,
        fnames: params.fnames,
        tagnames: params.tags,
    };
    return dbutils
        .getDbConnection()
        .then((db) => {
            return db.insertOne(doc);
        })
        .then((ret) => {
            logger.info(`created new postid=${ret.insertedId}`);
            return {
                data: { postid: ret.insertedId },
                statusCode: 201,
            };
        })
        .catch((err) => {
            logger.error("[create] %O", err);
            return {
                err: err,
                data: {},
                statusCode: 400,
            };
        });
}

/**
 * Find the document with matching id
 */
function findOne(postid) {
    let params = {
        limit: 1,
        where: { _id: postid },
    };
    return findMany(params);
}

function update(postid, params) {}

/**
 * Remove the specified document
 */
function remove(postid) {}

module.exports.findMany = findMany;
module.exports.findManyGeo = findManyGeo;
module.exports.findOne = findOne;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
