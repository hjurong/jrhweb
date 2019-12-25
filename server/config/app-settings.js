/*
 * app settings
 */
'use strict';
const path = require('path');
const dotenv = require('dotenv')
const result = dotenv.config({
    path: path.resolve(process.cwd(), 'env/env.sh')
});

/**
 * appSettings - all relative to the project root
 */
const appSettings = {
    logfile: process.env.SERVER_LOG_FILE,
    mysqlusr: process.env.MYSQL_USR,
    mysqlpwd: process.env.MYSQL_PWD,
    mysqldbname: process.env.MYSQL_DBNAME,
    serverPort: process.env.SERVER_PORT,
    SSLCertificateFile: process.env.SSL_CERT_FILE,
    SSLCertificateKeyFile: process.env.SSL_KEY_FILE,
    publicDir: process.env.PUBLIC_DIR,
};

module.exports = appSettings;
