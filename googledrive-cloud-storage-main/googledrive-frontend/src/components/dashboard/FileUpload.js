import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, File, CheckCircle, AlertCircle, Image, Film, Music, FileText, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { formatFileSize, getFileIcon, getFileColor } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const FileUpload = ({ onClose, onUpload, parentFolder }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  
  const { api } = useAuth();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parentFolder', parentFolder || '');

    setUploading(true);
    setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

    try {
      const response = await api.post('/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
        },
      });

      onUpload(response.data.file, response.data.storageUsed);
      toast.success(`${file.name} uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      let errorMessage = `Failed to upload ${file.name}`;
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      }
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.name];
        return newProgress;
      });
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Upload Files
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Drag & Drop Area */}
              <motion.div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive
                    ? 'border-blue-500 bg-blue-50/50 scale-[1.02]'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
                  } ${uploading ? 'pointer-events-none opacity-60' : 'cursor-pointer'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={openFileDialog}
                whileHover={!uploading ? { scale: 1.01 } : {}}
                whileTap={!uploading ? { scale: 0.99 } : {}}
              >
                <motion.div
                  animate={{
                    scale: dragActive ? 1.1 : 1,
                    rotate: dragActive ? 5 : 0
                  }}
                  transition={{ type: "spring" }}
                  className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6"
                >
                  <UploadCloud className="w-10 h-10 text-blue-600" />
                </motion.div>

                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {dragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>

                <p className="text-gray-600 mb-6">
                  or click to browse from your computer
                </p>

                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={uploading}
                >
                  {uploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </div>
                  ) : (
                    'Select Files'
                  )}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleChange}
                  className="hidden"
                  multiple
                />
              </motion.div>

              {/* Upload Progress */}
              {Object.keys(uploadProgress).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-4"
                >
                  <h4 className="font-medium text-gray-900">Upload Progress</h4>

                  <div className="space-y-3">
                    {Object.entries(uploadProgress).map(([fileName, progress]) => (
                      <motion.div
                        key={fileName}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <File className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {progress === 100 ? 'Completed' : `${progress}%`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {progress === 100 ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </div>
                        </div>

                        <Progress
                          value={progress}
                          className="h-2 bg-gray-200"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* File Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Upload Guidelines</p>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Maximum file size: 100MB</li>
                      <li>• Supported formats: All file types</li>
                      <li>• Multiple files can be uploaded simultaneously</li>
                      <li>• Files will be uploaded to: {parentFolder ? 'Current folder' : 'Root directory'}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FileUpload;
