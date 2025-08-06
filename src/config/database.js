import mysql from 'mysql2/promise';
import 'dotenv/config';

const pool = mysql.createPool({
  host: 'database-codedrop.czsktceizsjg.ap-northeast-2.rds.amazonaws.com',
  user: 'admin',
  password: '1q2w3e4r!!',
  database: 'instagram_auto_post',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;