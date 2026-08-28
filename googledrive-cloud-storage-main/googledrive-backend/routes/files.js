const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { uploadFileToS3, getSignedDownloadUrl, deleteFileFromS3 } = require('../config/aws');

const router = express.Router();

// Multer configuration for file uploads (Memory Storage for S3)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow all file types for now
    cb(null, true);
  },
});

// @route   GET /api/files
// @desc    Get all files and folders for authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const { parentFolder = null } = req.query;

    const files = await File.find({
      owner: req.user.id,
      parentFolder: parentFolder === 'null' ? null : parentFolder,
      isDeleted: false
    }).populate('parentFolder', 'name').sort({ type: -1, name: 1 });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching files'
    });
  }
});

// @route   POST /api/files/folder
// @desc    Create new folder
router.post('/folder', auth, [
  body('name').trim().notEmpty().withMessage('Folder name is required'),
  body('parentFolder').optional({ nullable: true }).custom((value) => {
    if (value === null || value === '' || value === 'null') return true;
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId.isValid(value);
  }).withMessage('Invalid parent folder ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let { name, parentFolder } = req.body;

    // Sanitize parentFolder
    if (parentFolder === 'null' || parentFolder === '') {
      parentFolder = null;
    }

    // Check if folder with same name already exists in the same location
    const existingFolder = await File.findOne({
      name,
      type: 'folder',
      parentFolder: parentFolder || null,
      owner: req.user.id,
      isDeleted: false
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'A folder with this name already exists in this location'
      });
    }

    // Build path
    let path = `/${name}`;
    if (parentFolder) {
      const parent = await File.findById(parentFolder);
      if (parent && parent.owner.toString() === req.user.id) {
        path = `${parent.path}/${name}`;
      }
    }

    const folder = new File({
      name,
      type: 'folder',
      path,
      parentFolder: parentFolder || null,
      owner: req.user.id
    });

    await folder.save();

    res.status(201).json({
      success: true,
      message: 'Folder created successfully',
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating folder'
    });
  }
});

// @route   GET /api/files/path/:path
// @desc    Get files by path
router.get('/path/*', auth, async (req, res) => {
  try {
    const path = '/' + req.params[0];

    const files = await File.find({
      owner: req.user.id,
      path: { $regex: `^${path}/` },
      isDeleted: false
    }).populate('parentFolder', 'name').sort({ type: -1, name: 1 });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Get files by path error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching files'
    });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file or folder (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File or folder not found'
      });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    file.isDeleted = true;
    file.deletedAt = new Date();
    await file.save();

    let updatedStorageUsed = 0;

    // Decrease storage usage for file
    if (file.type === 'file') {
      const user = await User.findById(req.user.id);
      user.storageUsed = Math.max(0, user.storageUsed - file.size);
      await user.save();
      updatedStorageUsed = user.storageUsed;
    }

    // Delete from S3 if it's a file
    if (file.type === 'file' && file.s3Key) {
      try {
        await deleteFileFromS3(file.s3Key);
      } catch (s3Error) {
        console.error('Failed to delete file from S3:', s3Error);
        // Continue with MongoDB deletion even if S3 deletion fails
      }
    }

    // If it's a folder, soft delete all contents and their S3 files
    if (file.type === 'folder') {
      const childFiles = await File.find({
        owner: req.user.id,
        path: { $regex: `^${file.path}/` },
        isDeleted: false
      });

      // Delete child files from S3
      for (const childFile of childFiles) {
        if (childFile.type === 'file' && childFile.s3Key) {
          try {
            await deleteFileFromS3(childFile.s3Key);
          } catch (s3Error) {
            console.error('Failed to delete child file from S3:', s3Error);
          }
        }
      }

      // Soft delete all contents in MongoDB
      await File.updateMany(
        {
          owner: req.user.id,
          path: { $regex: `^${file.path}/` },
          isDeleted: false
        },
        {
          isDeleted: true,
          deletedAt: new Date()
        }
      );

      // Calculate total size of deleted files to update user storage
      const totalSize = childFiles.reduce((acc, curr) => acc + (curr.size || 0), 0);
      const user = await User.findById(req.user.id);
      if (totalSize > 0) {
        user.storageUsed = Math.max(0, user.storageUsed - totalSize);
        await user.save();
      }
      updatedStorageUsed = user.storageUsed;
    }

    // Get final storage value if not already fetched
    if (updatedStorageUsed === 0 && file.type !== 'file') {
      const user = await User.findById(req.user.id);
      updatedStorageUsed = user.storageUsed;
    }

    res.json({
      success: true,
      message: 'File/folder deleted successfully',
      storageUsed: updatedStorageUsed
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting file'
    });
  }
});

// @route   POST /api/files/upload
// @desc    Upload file to local storage
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check storage limit (15GB)
    const user = await User.findById(req.user.id);
    const MAX_STORAGE = 15 * 1024 * 1024 * 1024; // 15GB in bytes
    const currentStorage = user.storageUsed || 0;

    if (user.storageUsed + req.file.size > MAX_STORAGE) {
      return res.status(400).json({
        success: false,
        message: 'Storage limit exceeded (15GB)'
      });
    }

    const { parentFolder = null, name } = req.body;
    const fileName = name || req.file.originalname;

    // Check if file with same name already exists in the same location
    const existingFile = await File.findOne({
      name: fileName,
      type: 'file',
      parentFolder: parentFolder || null,
      owner: req.user.id,
      isDeleted: false
    });

    if (existingFile) {
      return res.status(400).json({
        success: false,
        message: 'A file with this name already exists in this location'
      });
    }

    // Build path
    let filePath = `/${fileName}`;
    if (parentFolder) {
      const parent = await File.findById(parentFolder);
      if (parent && parent.owner.toString() === req.user.id) {
        filePath = `${parent.path}/${fileName}`;
      }
    }

    // Upload to S3
    const s3Key = await uploadFileToS3(req.file, req.user.id);

    // Save file metadata to MongoDB
    const file = new File({
      name: fileName,
      originalName: req.file.originalname,
      type: 'file',
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: filePath,
      s3Key, // Store the S3 key
      parentFolder: parentFolder || null,
      owner: req.user.id
    });

    await file.save();

    // Update user storage
    const oldStorage = user.storageUsed;
    const itemsSize = req.file.size;
    user.storageUsed = (user.storageUsed || 0) + itemsSize;
    await user.save();

    console.log(`[Storage Debug] User: ${user._id}`);
    console.log(`[Storage Debug] Old Storage: ${oldStorage}`);
    console.log(`[Storage Debug] File Size: ${itemsSize}`);
    console.log(`[Storage Debug] New Storage: ${user.storageUsed}`);

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      file,
      storageUsed: user.storageUsed // Return updated storage
    });
  } catch (error) {
    console.error('File upload error:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during file upload'
    });
  }
});

// @route   GET /api/files/:id/download
// @desc    Get file download URL for local storage
router.get('/:id/download', auth, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    if (file.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    if (file.type === 'folder') {
      return res.status(400).json({
        success: false,
        message: 'Cannot download folders'
      });
    }

    // Generate presigned URL for S3 download
    const downloadUrl = await getSignedDownloadUrl(file.s3Key);

    res.json({
      success: true,
      downloadUrl,
      fileName: file.originalName
    });
  } catch (error) {
    console.error('Download URL error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating download URL'
    });
  }
});

// @route   GET /api/files/search
// @desc    Search files and folders
router.get('/search', auth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const files = await File.find({
      owner: req.user.id,
      name: { $regex: q, $options: 'i' },
      isDeleted: false
    }).populate('parentFolder', 'name').sort({ type: -1, name: 1 });

    res.json({
      success: true,
      files
    });
  } catch (error) {
    console.error('Search files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching files'
    });
  }
});

module.exports = router;
