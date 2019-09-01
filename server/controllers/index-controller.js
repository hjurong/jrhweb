'use strict';

const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const async = require('async');
const url = require('url');

const dateformat = require('dateformat');

const request = require('../utils/utils').httpRequest;

const logger = require('../utils/logger');

/**
 * Fetches all shopping lists and redirects to the
 * lists-all page
 * 
 * @param {Request} req - the Request object
 * @param {Response} res - the Response object
 * @param {Object} next - the next middleware function in the req/res cycle
 */
function renderMainPage(req, res, next) {
    // TODO: Refactor into common method with callback
    request('GET', '/', null, (err, data) => {
        if (err) {
            next(err);
        } else {
            // Now render the page
            res.render('index', { title: 'Shopping Lists'});
        }
    });
}


// Pages
module.exports.main = renderMainPage;
