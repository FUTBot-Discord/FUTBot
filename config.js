const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    "general": {
        "shards": 6,
        "token": process.env.TOKEN,
        "respawn": true
    },
    "rethinkdb": {
        "host": process.env.RDB_HOST,
        "port": process.env.RDB_PORT,
        "db": process.env.RDB_DB
    }
}