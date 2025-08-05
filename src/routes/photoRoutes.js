import { Router } from 'express';
import multer from 'multer';
import { getPhotos, uploadPhoto, deletePhoto } from '../controllers/photoController.js';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

router.get('/', getPhotos);
router.post('/upload', upload.single('photo'), uploadPhoto);
router.delete('/:id', deletePhoto);

export default router;
