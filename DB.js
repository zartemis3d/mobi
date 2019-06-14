const mysql = require('mysql');
const cfg = require('./config');

const pool = mysql.createPool({
    connectionLimit: 50,
    charset: 'utf8mb4',
    host: cfg.db_host,
    user: cfg.db_user,
    password: cfg.db_password,
    database: cfg.db_database
  })
  
module.exports = pool