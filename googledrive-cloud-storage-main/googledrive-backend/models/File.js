const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'File name is required'],
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  },
  originalName: {
    type: String,
    required: function () {
      return this.type === 'file';
    },
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['file', 'folder']
  },
  mimeType: {
    type: String,
    required: function () {
      return this.type === 'file';
    }
  },
  size: {
    type: Number,
    default: 0,
    min: 0
  },
  path: {
    type: String,
    required: true,
    trim: true
  },
  s3Key: {
    type: String,
    required: false
  },
  parentFolder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient queries
fileSchema.index({ owner: 1, parentFolder: 1, isDeleted: 1 });
fileSchema.index({ owner: 1, path: 1, isDeleted: 1 });

// Virtual for full path
fileSchema.virtual('fullPath').get(function () {
  return this.path;
});

// Method to get folder structure
fileSchema.methods.getFolderStructure = async function () {
  if (this.type !== 'folder') return null;

  return await this.constructor.find({
    parentFolder: this._id,
    owner: this.owner,
    isDeleted: false
  }).populate('parentFolder', 'name');
};

module.exports = mongoose.model('File', fileSchema);
