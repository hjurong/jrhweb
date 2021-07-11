"use strict";

const appSettings = require("../config/app-settings");

/**
 * This is the DAO interface for tags.
 * You will need to provide an implementation for each
 * function in the interface. The implementation can be switched
 * appropriately
 */
const tagsDaoImpl = require(`./tags-dao-${appSettings.backingdb}`);

function findMany(params) {
    return tagsDaoImpl.findMany(params);
}

function findOne(id) {
    return tagsDaoImpl.findOne(id);
}

module.exports.findMany = findMany;
module.exports.findOne = findOne;
