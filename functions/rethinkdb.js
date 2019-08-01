const r = require("rethinkdb");
const Pool = require("rethinkdb-pool");
const util = require("util");
const config = require("../config.json");

const pool = Pool(r, config.rethinkdb);

pool.run = util.promisify(pool.run);


module.exports = pool;
