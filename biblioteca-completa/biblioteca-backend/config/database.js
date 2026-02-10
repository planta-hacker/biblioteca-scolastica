// config/database.js - COMPATIBILE CON RAILWAY E LOCALE
const mysql = require('mysql2/promise');
require('dotenv').config();

// Railway usa MYSQL* mentre locale usa DB_*
// Questo file funziona in entrambi i casi
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'biblioteca_scolastica',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Opzioni per evitare timeout
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test connessione all'avvio
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connesso:', {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'biblioteca_scolastica',
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root'
    });
    connection.release();
  })
  .catch(err => {
    console.error('❌ ERRORE CONNESSIONE DATABASE:', err.message);
    console.error('Credenziali utilizzate:', {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'biblioteca_scolastica',
      password: process.env.MYSQLPASSWORD ? '***' : 'vuota'
    });
  });

module.exports = pool;
