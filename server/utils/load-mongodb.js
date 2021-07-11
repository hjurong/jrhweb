/*
    initialise mongodb
 */
"use strict";

const logging = require("./logging");
const logger = logging.getLogger("load-mongodb");
const appSettings = require("../config/app-settings");
const utils = require("./utils");

let db;
(function getDbConnection() {
    utils
        .getDatabase()
        .then((database) => {
            logger.info(`creating collection ${appSettings.mongocollection}`);
            db = database.collection(appSettings.mongocollection);
            logger.info("creating indexes");
            db.createIndex({
                tagnames: 1,
                location: "2dsphere",
            });
            logger.info("done; ^C to exit");
            // TO-DO: close db conn properly
        })
        .catch((err) => {
            logger.error("load mongodb failed with %O", err);
            throw err;
        });
})();
