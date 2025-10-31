import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host : 'localhost',
    user : 'root',
    password : '92067165C7@',
    database : 'consult7ERP',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

export default pool;