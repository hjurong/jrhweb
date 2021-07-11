/*
 * app settings
 */
"use strict";
const path = require("path");
const dotenv = require("dotenv");
const result = dotenv.config({
    path: path.resolve(process.cwd(), "env/env.sh"),
});

/**
 * appSettings - all relative to the project root
 */
const appSettings = {
    logfile: process.env.SERVER_LOG_FILE,
    mysqlusr: process.env.MYSQL_USR,
    mysqlpwd: process.env.MYSQL_PWD,
    mysqldbname: process.env.MYSQL_DBNAME,
    mysqlhost: process.env.MYSQL_HOST,
    mongousr: process.env.MONGO_USR,
    mongopwd: process.env.MONGO_PWD,
    mongodbname: process.env.MONGO_DBNAME,
    mongocollection: process.env.MONGO_COLLECTION,
    mongohost: process.env.MONGO_HOST,
    backingdb: process.env.BACKING_DB,
    serverPort: process.env.SERVER_PORT,
    SSLCertificateFile: process.env.SSL_CERT_FILE,
    SSLCertificateKeyFile: process.env.SSL_KEY_FILE,
    publicDir: process.env.PUBLIC_DIR,
    secretAuth: process.env.SECRET_AUTH,
};

module.exports = appSettings;
