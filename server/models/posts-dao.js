"use strict";

const appSettings = require("../config/app-settings");

/**
 * This is the DAO interface for posts.
 */
const postsDaoImpl = require(`./posts-dao-${appSettings.backingdb}`);

function findMany(params) {
    return postsDaoImpl.findMany(params);
}

function findManyGeo(params) {
    return postsDaoImpl.findManyGeo(params);
}

function create(data) {
    return postsDaoImpl.create(data);
}

function findOne(id) {
    return postsDaoImpl.findOne(id);
}

function update(id, data) {
    return postsDaoImpl.update(id, data);
}

function remove(id) {
    return postsDaoImpl.remove(id);
}

module.exports.findMany = findMany;
module.exports.findManyGeo = findManyGeo;
module.exports.findOne = findOne;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
