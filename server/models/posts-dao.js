'use strict';

/**
 * This is the DAO interface for posts.
 * You will need to provide an implementation for each
 * function in the interface. The implementation has been
 * provided for you in the appropriately named *sqlite3.js
 */

const postsDaoImpl = require('./posts-dao-mysql');

function fetch(params) {
    return postsDaoImpl.fetch(params);
}

function fetchgeo(params) {
    return postsDaoImpl.fetchgeo(params);
}

function create(data) {
    return postsDaoImpl.create(data);
}

function read(id) {
    return postsDaoImpl.read(id);
}

function update(id, data) {
    return postsDaoImpl.update(id, data);
}

function remove(id) {
    return postsDaoImpl.remove(id);
}

module.exports.fetch = fetch;
module.exports.fetchgeo = fetchgeo;
module.exports.read = read;
module.exports.create = create;
module.exports.update = update;
module.exports.remove = remove;
