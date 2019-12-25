'use strict';

/**
 * This is the DAO interface for tags.
 * You will need to provide an implementation for each
 * function in the interface. The implementation can be switched
 * appropriately
 */

const tagsDaoImpl = require('./tags-dao-mysql');

function fetch(params) {
    return tagsDaoImpl.fetch(params);
}

function read(id) {
    return tagsDaoImpl.read(id);
}

module.exports.fetch = fetch;
module.exports.read = read;
