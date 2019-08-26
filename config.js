require('dotenv').config();

const shardNumber = parseInt(process.env.D_SHARDS, 10);

module.exports = {
    "general": {
        "shards": shardNumber,
        "token": process.env.D_TOKEN,
        "respawn": true
    },
    "rethinkdb": {
        "host": process.env.RDB_HOST,
        "port": process.env.RDB_PORT,
        "db": process.env.RDB_DB
    },
    "redis": {
        "host": process.env.R_HOST,
        "retry_strategy": function (options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with
                // a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > 1000 * 60 * 60) {
                // End reconnecting after a specific timeout and flush all commands
                // with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > 10) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, 3000);
        }
    }
}
