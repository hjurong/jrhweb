/**
 * mysql implementation of the DAO interface for the
 * application. You should not need to make changes here.
 * If you find a bug, please open an issue.
 */

const GeoJSON = require("geojson");
const logging = require("../utils/logging");
const logger = logging.getLogger("app::model::posts-dao-mysql");
const dbutils = require("../utils/db");

function findMany(params) {
    let limit = params.limit || 100;
    let where = params.where || "";
    let scols = params.select || "*";
    const sql = `
    select ${scols} from posts 
        left join ( 
            select postid, group_concat(fname) as fnames from imgs group by postid 
        ) imgs on posts.id = imgs.postid 
        left join contents on contents.postid = posts.id 
        left join ( 
            select postid, group_concat(tag) as tagnames from tags group by postid
        ) tags on tags.postid = posts.id 
        ${where}
    order by posts.id desc limit ?`;
    logger.debug("findMany() -> ", sql, limit);
    return dbutils
        .mysqlQueryPromise(sql, limit)
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
    logger.info("findManyGeo ", params);
    params.select =
        "posts.id as postid, fnames, ST_X(location) as lng, ST_Y(location) as lat";
    return findMany(params).then((res) => {
        if (res.statusCode == 200) {
            res.data = GeoJSON.parse(res.data, { Point: ["lng", "lat"] });
        }
        return res;
    });
}

function deletePosts(postid) {
    const sqlpost = "DELETE FROM posts WHERE ID = ?";
    return dbutils.mysqlQueryPromise(sqlpost, postid);
}

function insertPosts(params) {
    let post = {
        title: params.title,
        date: params.date,
        placename: params.placename,
    };
    let lnglat = params.location;
    const sqlpost = `INSERT INTO posts SET location=POINT(${lnglat}), ?`;
    return dbutils.mysqlQueryPromise(sqlpost, post);
}

function updatePosts(postid, params) {
    let post = {
        title: params.title,
        date: params.date,
        placename: params.placename,
    };
    let lnglat = params.location;
    const sqlpost = `UPDATE posts SET location=POINT(${lnglat}), ? WHERE id=${postid}`;
    return dbutils.mysqlQueryPromise(sqlpost, post);
}

function insertContents(postid, params) {
    const sqlcontents = "INSERT INTO contents SET ?";
    let content = {
        postid: postid,
        content: params.content,
    };
    return dbutils.mysqlQueryPromise(sqlcontents, content);
}

function updateContents(postid, params) {
    const sqlcontents = `UPDATE contents SET ? WHERE postid=${postid}`;
    let content = {
        content: params.content,
    };
    return dbutils.mysqlQueryPromise(sqlcontents, content);
}

function deleteTags(postid, params) {
    var dels = [];
    for (var i = 0; i < params.tags.del.length; i++) {
        dels.push([postid, params.tags.del[i].toLowerCase()]);
    }
    const sqltagsdel = "DELETE FROM tags WHERE (`POSTID`, `TAG`) IN (?)";
    return dbutils.mysqlQueryPromise(sqltagsdel, [dels]);
}

function clearTags(postid, params) {
    const sqltagsdel = "DELETE FROM tags WHERE postid=?";
    return dbutils.mysqlQueryPromise(sqltagsdel, [postid]);
}

function insertTags(postid, params) {
    var adds = [];
    for (var i = 0; i < params.tags.add.length; i++) {
        adds.push([params.tags.add[i].toLowerCase(), postid]);
    }
    const sqltagsadd = "INSERT INTO tags (`TAG`, `POSTID`) VALUES ?";
    return dbutils.mysqlQueryPromise(sqltagsadd, [adds]);
}

function insertImgs(postid, params) {
    let img = {
        postid: postid,
        fname: params.imgname,
    };
    const sqlimgs = "INSERT INTO imgs set ?";
    return dbutils.mysqlQueryPromise(sqlimgs, img);
}

function updateImgs(postid, params) {
    let img = {
        fname: params.imgname,
    };
    const sqlimgs = `UPDATE imgs set ? WHERE postid=${postid}`;
    return dbutils.mysqlQueryPromise(sqlimgs, img);
}

function deleteImgs(postid, params) {
    const sqlimgs = "DELETE FROM imgs where postid=?";
    return dbutils.mysqlQueryPromise(sqlimgs, [postid]);
}

/**
 * insert post into tables
 */
function create(params) {
    let transaction = dbutils.mysqlQueryPromise("START TRANSACTION");
    let postPromise = transaction.then((res) => {
        return insertPosts(params);
    });

    let contentPromise = postPromise.then((res) => {
        const postid = res.insertId;
        return insertContents(postid, params);
    });

    let tagPromise = postPromise.then((res) => {
        if (!params.tags.add.length) {
            return true;
        }
        const postid = res.insertId;
        return insertTags(postid, params);
    });

    let imgPromise = postPromise.then((res) => {
        const postid = res.insertId;
        return insertImgs(postid, params);
    });

    let promises = [postPromise, contentPromise, tagPromise, imgPromise];
    return Promise.all(promises)
        .then((values) => {
            let commitPromise = dbutils.mysqlQueryPromise("COMMIT");
            return Promise.all([values, commitPromise]);
        })
        .then((values) => {
            let results = values[0];
            logger.info(`created new postid=${results[0].insertId}`);
            let data = {
                postid: results[0].insertId,
                contentid: results[1].insertId,
                imgId: results[3].insertId,
            };
            return {
                data: data,
                statusCode: 201,
            };
        })
        .catch((err) => {
            dbutils.getDbConnection().then((db) => {
                db.rollback(function () {
                    logger.error("rollback create");
                });
                return {
                    err: err,
                    data: {},
                    statusCode: 400,
                };
            });
        });
}

/**
 * select one from table
 */
function findOne(postid) {
    let params = {
        limit: 1,
        where: `where posts.id=${postid}`,
    };
    return findMany(params);
}

function update(postid, params) {
    let transaction = dbutils.mysqlQueryPromise("START TRANSACTION");
    let postPromise = transaction.then((res) => {
        return updatePosts(postid, params);
    });

    let contentPromise = transaction.then((res) => {
        return updateContents(postid, params);
    });

    let tagPromise = transaction
        .then((res) => {
            return clearTags(postid, params);
        })
        .then((res) => {
            return insertTags(postid, params);
        });

    let imgPromise;
    if (params.imgname) {
        imgPromise = transaction
            .then((res) => {
                return deleteImgs(postid, params);
            })
            .then((res) => {
                return insertImgs(postid, params);
            });
    } else {
        imgPromise = { affectedRows: 0 };
    }

    let promises = [postPromise, contentPromise, tagPromise, imgPromise];
    return Promise.all(promises)
        .then((values) => {
            let commitPromise = dbutils.mysqlQueryPromise("COMMIT");
            return Promise.all([values, commitPromise]);
        })
        .then((values) => {
            let results = values[0];
            logger.info(`updated postid=${postid}`);
            let data = {
                postsAffectedRows: results[0].affectedRows,
                contentsAffectedRows: results[1].affectedRows,
                tagsAffectedRows: results[2].affectedRows,
                imgsAffectedRows: results[3].affectedRows,
            };
            return {
                data: data,
                statusCode: 200,
            };
        })
        .catch((err) => {
            dbutils.getDbConnection().then((db) => {
                db.rollback(function () {
                    logger.error("rollback update");
                });
                return {
                    err: err,
                    data: {},
                    statusCode: 400,
                };
            });
        });
}

/**
 * Remove the specified item table
 */
function remove(postid) {
    const sql = "DELETE FROM posts WHERE `id`=?";
    return utils
        .queryPromise(sql, postid)
        .then(function (res) {
            return {
                data: { affectedRows: res.affectedRows },
                statusCode: 200,
            };
        })
        .catch(function (err) {
            return { data: { err: "delete failed" }, statusCode: 404 };
        });
}

module.exports.findMany = findMany;
module.exports.findManyGeo = findManyGeo;
module.exports.findOne = findOne;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
