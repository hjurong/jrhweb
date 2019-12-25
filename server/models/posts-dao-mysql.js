/**
 * mysql implementation of the DAO interface for the
 * application. You should not need to make changes here.
 * If you find a bug, please open an issue.
 */

const appSettings = require('../config/app-settings');
const logging = require('../utils/logging');
const logger = logging.getLogger('app::model::posts-dao-mysql');
const utils = require('../utils/utils');
const db = utils.getDatabase();

function fetch(params) {
    let limit = params.limit || 100;
    let where = params.where || '';
    const sql = `
    select * from posts 
        left join ( 
            select postid, group_concat(fname) as fnames from imgs group by postid 
        ) imgs on posts.id = imgs.postid 
        left join contents on contents.postid = posts.id 
        left join ( 
            select postid, group_concat(tag) as tagnames from tags group by postid
        ) tags on tags.postid = posts.id 
        ${where}
    order by posts.id desc limit ?`;
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

function deletePosts(postid) {
    const sqlpost = 'DELETE FROM posts WHERE ID = ?';
    return utils.queryPromise(sqlpost, postid);
}

function insertPosts(params) {
    let post = {
        title: params.title,
        date: params.date,
        placename: params.placename,
    }
    let lnglat = params.location;
    const sqlpost = `INSERT INTO posts SET location=POINT(${lnglat}), ?`;
    return utils.queryPromise(sqlpost, post);
}

function updatePosts(postid, params) {
    let post = {
        title: params.title,
        date: params.date,
        placename: params.placename,
    }
    let lnglat = params.location;
    const sqlpost = `UPDATE posts SET location=POINT(${lnglat}), ? WHERE id=${postid}`;
    return utils.queryPromise(sqlpost, post);
}

function insertContents(postid, params) {
    const sqlcontents = 'INSERT INTO contents SET ?';
    let content = {
        postid: postid,
        content: params.content,
    };
    return utils.queryPromise(sqlcontents, content);
}

function updateContents(postid, params) {
    const sqlcontents = `UPDATE contents SET ? WHERE postid=${postid}`;
    let content = {
        content: params.content,
    };
    return utils.queryPromise(sqlcontents, content);
}

function deleteTags(postid, params) {
    var dels = [];
    for (var i=0; i<params.tags.del.length; i++) {
        dels.push([postid, params.tags.del[i].toLowerCase()]);
    }
    const sqltagsdel = 'DELETE FROM tags WHERE (`POSTID`, `TAG`) IN (?)';
    return utils.queryPromise(sqltagsdel, [dels]);
}

function clearTags(postid, params) {
    const sqltagsdel = 'DELETE FROM tags WHERE postid=?';
    return utils.queryPromise(sqltagsdel, [postid]);
}

function insertTags(postid, params) {
    var adds = [];
    for (var i=0; i<params.tags.add.length; i++) {
        adds.push([params.tags.add[i].toLowerCase(), postid]);
    }
    const sqltagsadd = 'INSERT INTO tags (`TAG`, `POSTID`) VALUES ?';
    return utils.queryPromise(sqltagsadd, [adds]);
}

function insertImgs(postid, params) {
    let img = {
        postid: postid,
        fname: params.imgname,
    };
    const sqlimgs = 'INSERT INTO imgs set ?';
    return utils.queryPromise(sqlimgs, img);
}

function updateImgs(postid, params) {
    let img = {
        fname: params.imgname,
    };
    const sqlimgs = `UPDATE imgs set ? WHERE postid=${postid}`;
    return utils.queryPromise(sqlimgs, img);
}

function deleteImgs(postid, params) {
    const sqlimgs = 'DELETE FROM imgs where postid=?';
    return utils.queryPromise(sqlimgs, [postid]);
}

/**
 * @params {
 *   title: string,
 *   date: date,
 *   location: string lng,lat,
 *   placename: string,
 *   imgname: string,
 *   tags: { add: list[string], del: list[stsring] },
 *   content: base64 string,
 * }
 */
function create(params) {
    let transaction = utils.queryPromise('START TRANSACTION');
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
    return Promise.all(promises).then((values) => {
        let commitPromise = utils.queryPromise('COMMIT');
        return Promise.all([values, commitPromise]);
    }).then((values) => {
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
    }).catch((err) => {
        db.rollback(function() {
            logger.error('rollback create');
        });
        return { 
            err: err,
            data: {},
            statusCode: 400
        };
    });
}

/**
 * Find the shopping list for the specified id
 */
function read(postid) {
    let params = {
        limit: 1,
        where: `where posts.id=${postid}`, 
    }
    return fetch(params);
}

function update(postid, params) {
    let transaction = utils.queryPromise('START TRANSACTION');
    let postPromise = transaction.then((res) => {
        return updatePosts(postid, params);
    });

    let contentPromise = transaction.then((res) => {
        return updateContents(postid, params);
    });

    let tagPromise = transaction.then((res) => {
        return clearTags(postid, params);
    }).then((res) => {
        return insertTags(postid, params);
    });

    let imgPromise;
    if (params.imgname) {
        imgPromise = transaction.then((res) => {
            return deleteImgs(postid, params);
        }).then((res) => {
            return insertImgs(postid, params);
        });
    } else {
        imgPromise = {affectedRows:0};
    }

    let promises = [postPromise, contentPromise, tagPromise, imgPromise];
    return Promise.all(promises).then((values) => {
        let commitPromise = utils.queryPromise('COMMIT');
        return Promise.all([values, commitPromise]);
    }).then((values) => {
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
    }).catch((err) => {
        db.rollback(function() {
            logger.error('rollback update');
        });
        return { 
            err: err,
            data: {},
            statusCode: 400
        };
    });
}

/**
 * Remove the specified item from the specified shopping
 * list
 */
function remove(postid) {
    const sql = 'DELETE FROM posts WHERE `id`=?';
    return utils.queryPromise(sql, postid).then(function(res) {
        return { data: {'affectedRows': res.affectedRows}, statusCode: 200 };
    }).catch(function(err) {
        return { data: {'err':'delete failed'}, statusCode: 404 };
    });
}

module.exports.fetch = fetch;
module.exports.read = read;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
