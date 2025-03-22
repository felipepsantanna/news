import mysql from 'mysql2/promise';

let connection;

export const createConnection = async () => {
    if (!connection) {
        connection = await mysql.createPool({
            host: process.env.FLADB_HOST,
            user: process.env.FLADB_USER,
            password: process.env.FLADB_PASSWORD,
            database: process.env.FLADB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
            idleTimeout: 300000, // idle connections timeout, in milliseconds, the default value 60000
            queueLimit: 0,
            enableKeepAlive: true,
            keepAliveInitialDelay: 0,
        })
    }
    return connection
};
