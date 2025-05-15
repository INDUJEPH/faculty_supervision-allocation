import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE || 'exam_management',
};

export const pool = mysql.createPool({
  ...DB_CONFIG,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}); 