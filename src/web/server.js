import express from 'express';
import 'dotenv/config';
import photoRoutes from '../routes/photoRoutes.js';
import logger from '../config/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 프로젝트의 루트 디렉토리 경로를 계산합니다.
// 현재 파일 위치: /src/web/server.js -> 루트는 두 단계 위입니다.
const projectRoot = path.resolve(__dirname, '../../');

const app = express();
const port = process.env.WEB_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public 폴더는 기존처럼 설정합니다.
app.use(express.static(path.join(__dirname, 'public')));

// /uploads URL 경로를 프로젝트 루트의 uploads 폴더와 절대 경로로 연결합니다.
app.use('/uploads', express.static(path.join(projectRoot, 'uploads')));

app.use('/api/photos', photoRoutes);

app.listen(port, () => {
  logger.info(`🌐 웹 서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

export default app;
