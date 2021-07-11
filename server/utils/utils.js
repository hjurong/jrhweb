/*
 */
"use strict";

const http = require("http");
const assert = require("assert");
const appSettings = require("../config/app-settings");
const logging = require("../utils/logging");
const logger = logging.getLogger("app::utils");

/**
 *
 * @param {IncomingMessage} response - the response object from the HTTP request callback
 * @param {ServerResponse} responseMessage - the message to write as a simple string
 * @param {number} statusCode - the HTTP status code for the response
 */
function writeServerResponse(response, responseMessage, statusCode) {
    logger.debug(responseMessage, `writeServerResponse(${statusCode})`);
    response.statusCode = statusCode;
    response.write(responseMessage);
    response.end();
}

/**
 * Write the response from the server.
 *
 * @param {IncomingMessage} response - the response object from the HTTP request callback
 * @param {ServerResponse} responseJson - the message to write as a simple string
 * @param {number} statusCode - the HTTP status code for the response
 */
function writeServerJsonResponse(response, responseJson, statusCode) {
    logger.debug(
        JSON.stringify(responseJson),
        `writeServerJsonResponse(${statusCode})`
    );
    response.setHeader("Content-Type", "application/json");
    response.status(statusCode).send(responseJson);
}

/**
 * Processes a chunk of data using the specified handler for
 * each row, which is specific to a particular table.
 *
 * @param {String} chunk - the chunk of data to be transformed
 *
 * @return {array} Array of field arrays. Each element in the returned
 * array is an array of fields that represent the data for a
 * single row to be written.
 */
function transformChunkIntoLines(chunk) {
    let ret = { fieldsArray: [], leftOvers: "" };
    // Split up the chunk into lines
    let lines = chunk.split(/\r?\n/);
    // Process all lines
    for (let aa = 0; aa < lines.length - 1; aa++) {
        // Split up the line based on delimiter (| symbol, which NEVER occurs in the input data, by design)
        let fields = lines[aa].split("|");
        ret.fieldsArray.push(fields);
    }
    ret.leftOvers = lines[lines.length - 1];
    // Return the array of field arrays
    return ret;
}

/**
 * A better assert.equal() - if the expected value does
 * not match the actual value, a meaningful message is
 * returned.
 *
 * @param {Object} actual - the actual value
 * @param {Object} expected - the expected value
 */
function assertEqual(actual, expected) {
    assert.strictEqual(
        actual,
        expected,
        `Assert failed: actual => ${actual}, expected => ${expected}`
    );
}

/**
 * Helper function:
 * Make a call to the specified requestPath, and when the
 * results are done, invoke the callback.
 *
 * @param {String} requestMethod - the HTTP method (GET, POST, etc)
 * @param {String} requestPath - the request path (e.g., /lists, /items, etc)
 * @param {String} postData - a JSON string (must be well-formed) containing any
 * data that is to be sent in the request body
 * @param {Function} resultsCallback - function to be invoked once the results
 * have been received from the remote server
 */
function httpRequest(requestMethod, requestPath, postData, resultsCallback) {
    let options = "";
    if (requestMethod == "GET") {
        options = `http://${appSettings.server_host}:${appSettings.server_listen_port}${requestPath}`;
        http.get(options, function requestCallback(response) {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                resultsCallback(null, data);
            });
            response.on("error", (err) => {
                resultsCallback(err, null);
            });
        });
    } else {
        // All others
        options = {
            hostname: appSettings.server_host,
            port: appSettings.server_listen_port,
            path: encodeURI(requestPath),
            method: requestMethod,
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
        };
        let req = http.request(options, function requestCallback(response) {
            let data = "";
            response.on("data", (chunk) => {
                data += chunk;
            });
            response.on("end", () => {
                resultsCallback(null, data);
            });
            response.on("error", (err) => {
                resultsCallback(err, null);
            });
        });
        req.write(postData);
        req.end();
    }
}

// What's exported
module.exports.writeServerResponse = writeServerResponse;
module.exports.writeServerJsonResponse = writeServerJsonResponse;
module.exports.transformChunkIntoLines = transformChunkIntoLines;
module.exports.assertEqual = assertEqual;
module.exports.httpRequest = httpRequest;
