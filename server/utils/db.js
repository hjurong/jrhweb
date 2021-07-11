const mysql = require("mysql");
const MongoClient = require("mongodb").MongoClient;
const appSettings = require("../config/app-settings");
const logging = require("../utils/logging");
const logger = logging.getLogger("app::utils");

let _db;
let _conn;

function getDatabase() {
    // switch here if other db are supported
    if (appSettings.backingdb == "mysql") {
        return mysqldbConnect();
    } else if (appSettings.backingdb == "mongodb") {
        return mongodbConnect();
    } else {
        throw new Error(
            `[getDatabase] Unrecognised backing db ${appSettings.backingdb}`
        );
    }
}

function mysqldbConnect() {
    return new Promise((resolve, reject) => {
        if (_db) {
            logger.info("[mysqldbConnect] resolving existing connection");
            resolve(_db);
            return;
        }
        var connection = mysql.createConnection({
            host: appSettings.mysqlhost,
            user: appSettings.mysqlusr,
            password: appSettings.mysqlpwd,
            database: appSettings.mysqldbname,
        });

        connection.connect(function (err) {
            if (err) {
                logger.error("[mysqldbConnect] error connecting: " + err.stack);
                reject(err);
                return;
            }
            logger.info("[mysqldbConnect] connected to mysql server");
            process.on("exit", (code) => {
                logger.info(
                    `[mysqldbConnect] closing connection to mysql server, exit code ${code}`
                );
                connection.end();
            });
            _db = connection; // store a reference
            resolve(connection);
        });
    });
}

function mongodbConnect() {
    return new Promise((resolve, reject) => {
        if (_db) {
            logger.debug("[mongodbConnect] resolving existing client");
            resolve(_db);
            return;
        }
        var uri = `mongodb+srv://${appSettings.mongousr}:${appSettings.mongopwd}@${appSettings.mongohost}`;
        const client = new MongoClient(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        client.connect((err) => {
            if (err) {
                logger.error("[mongodbConnect] error connecting to mongodb");
                reject(err);
            }
            _db = client.db(appSettings.mongodbname);
            logger.info("[mongodbConnect] connected to mongo server");
            // Make sure connection closes when Node exits
            process.on("exit", (code) => {
                logger.debug(
                    `[mongodbConnect] Closing MongoDB connection (ext ${code})...`
                );
                client.close();
            });
            resolve(_db);
        });
    });
}

function getDbConnection() {
    return new Promise((resolve, reject) => {
        if (_conn) {
            logger.debug("[getDbConnection] resolving existing db connection");
            resolve(_conn);
        }
        getDatabase()
            .then((db) => {
                switch (appSettings.backingdb) {
                    case "mysql":
                        _conn = db;
                        break;
                    case "mongodb":
                        _conn = db.collection(appSettings.mongocollection);
                        break;
                    default:
                        // getDatabase throws on unregconised backing db
                        break;
                }
                resolve(_conn);
            })
            .catch((err) => {
                reject(err);
            });
    });
}

function mysqlQueryPromise(sql, values) {
    return getDatabase().then((db) => {
        db.query(sql, values, (error, results, _fields) => {
            if (error) {
                logger.error("[mysqlQueryPromise] %O", error);
                throw error;
            }
            return results;
        });
    });
}

module.exports.getDatabase = getDatabase;
module.exports.getDbConnection = getDbConnection;
module.exports.mysqlQueryPromise = mysqlQueryPromise;
