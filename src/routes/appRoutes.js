const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const appController = require('../controllers/appController.js');

// routes
router.post('/offer', appController.createOffer);
router.post('/leads/upload', upload.single('file'), appController.uploadleads);
router.post('/score', appController.runScores);
router.get('/results', appController.getResults);

module.exports = router;