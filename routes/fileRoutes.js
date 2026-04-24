const express = require('express');
const router = express.Router();
const upload=require('../config/multer.js')
const {uploadFile}=require('../controllers/filecontroller.js')
const authMiddleware=require('../middleware/auth.js')
const { getUserFiles }=require('../controllers/filecontroller.js')
const { downloadFile } = require('../controllers/filecontroller.js');
const { renameFile } =require('../controllers/filecontroller.js')
// single file upload
router.post('/upload', upload.single('file'), uploadFile);
// / 🔐 protected route
router.get('/my-files', authMiddleware, getUserFiles);
router.get('/download/:id', authMiddleware, downloadFile);

router.patch('/rename/:id', authMiddleware, renameFile);
module.exports = router;