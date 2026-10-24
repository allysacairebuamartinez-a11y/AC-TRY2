const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "caire_db"
});

module.exports = pool.promise();