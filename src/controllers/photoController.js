import Photo from '../models/Photo.js';
import fs from 'fs-extra';
import path from 'path';
import logger from '../config/logger.js'; // 로거를 import 합니다.

export const getPhotos = async (req, res) => {
  try {
    const photos = await Photo.getAll(req.query.status);
    res.json(photos);
  } catch (error) {
    // 에러 로깅 코드를 추가합니다.
    logger.error('사진 목록 조회 실패:', error);
    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};

export const uploadPhoto = async (req, res) => {
  try {
    const { comment } = req.body;
    const filename = req.file.filename;
    const newPhoto = await Photo.create(filename, comment);
    res.status(201).json(newPhoto);
  } catch (error) {
    // 에러 로깅 코드를 추가합니다.
    logger.error('사진 업로드 실패:', error);
    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};

export const deletePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await Photo.getById(id);
    if (photo) {
      await fs.remove(path.join(process.env.UPLOAD_PATH, photo.filename));
      await Photo.delete(id);
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Photo not found' });
    }
  } catch (error) {
    // 에러 로깅 코드를 추가합니다.
    logger.error(`사진(id: ${req.params.id}) 삭제 실패:`, error);
    res.status(500).json({ message: '서버 내부 오류가 발생했습니다.' });
  }
};