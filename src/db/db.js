const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

/*const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port
});*/

const pool = new Pool({
    user: process.env.user,
    host: process.env.host,
    database: process.env.database,
    password: process.env.password,
    port: process.env.port,
    ssl: { 
        require: true,
        rejectUnauthorized: true,
        ca: fs.readFileSync('./pathto/us-east-2-bundle.pem').toString(), 
      } 
});


module.exports = pool;