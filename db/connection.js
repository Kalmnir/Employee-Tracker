const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'rootr00t!',
    database: 'employee_db'
});

module.exports = connection;