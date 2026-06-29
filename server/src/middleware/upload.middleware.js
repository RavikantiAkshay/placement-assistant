import multer from 'multer';

const storage = multer.memoryStorage();

export const multerUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
}).single('resume');

export const validatePdfSignature = (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(new Error('No file uploaded'));
  }
  
  // Check PDF magic numbers: %PDF- (hex: 25 50 44 46 2D)
  const magicNumbers = req.file.buffer.toString('hex', 0, 5);
  if (magicNumbers !== '255044462d') {
    return res.status(400).json({ success: false, message: 'Invalid file format. Only true PDF files are allowed.' });
  }
  
  next();
};

export const uploadResume = [multerUpload, validatePdfSignature];
