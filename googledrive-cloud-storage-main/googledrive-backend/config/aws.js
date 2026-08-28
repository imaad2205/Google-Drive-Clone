const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Generate unique file name
const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// Upload file to S3
const uploadFileToS3 = async (file, userId) => {
  const fileName = `${userId}/${generateFileName()}-${file.originalname}`;
  
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return fileName;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

// Generate signed URL for file download
const getSignedDownloadUrl = async (s3Key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw new Error('Failed to generate download URL');
  }
};

// Delete file from S3
const deleteFileFromS3 = async (s3Key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: s3Key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('S3 delete error:', error);
    throw new Error('Failed to delete file from S3');
  }
};

module.exports = {
  uploadFileToS3,
  getSignedDownloadUrl,
  deleteFileFromS3,
  generateFileName,
};
