import React from 'react';
import { FiFolder, FiFile, FiDownload, FiTrash2, FiFileText, FiImage, FiMusic, FiVideo, FiArchive } from 'react-icons/fi';

const FileList = ({ 
  files, 
  folders, 
  viewMode, 
  onFolderClick, 
  onFileDownload, 
  onDelete, 
  formatFileSize, 
  formatDate 
}) => {
  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <FiImage className="h-8 w-8 text-green-500" />;
    if (mimeType.startsWith('video/')) return <FiVideo className="h-8 w-8 text-purple-500" />;
    if (mimeType.startsWith('audio/')) return <FiMusic className="h-8 w-8 text-pink-500" />;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) 
      return <FiFileText className="h-8 w-8 text-blue-500" />;
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) 
      return <FiArchive className="h-8 w-8 text-yellow-500" />;
    return <FiFile className="h-8 w-8 text-gray-500" />;
  };

  const allItems = [...folders, ...files];

  if (allItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-24 w-24 text-gray-400">
          <FiFolder className="h-full w-full" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No files or folders</h3>
        <p className="mt-2 text-gray-500">Get started by uploading a file or creating a folder.</p>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {folders.map((folder) => (
            <li key={folder._id} className="hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <button
                    onClick={() => onFolderClick(folder)}
                    className="flex items-center space-x-3 flex-1 text-left"
                  >
                    <FiFolder className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{folder.name}</p>
                      <p className="text-sm text-gray-500">Folder • {formatDate(folder.createdAt)}</p>
                    </div>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onDelete(folder._id, 'folder')}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {files.map((file) => (
            <li key={file._id} className="hover:bg-gray-50">
              <div className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3 flex-1">
                    {getFileIcon(file.mimeType)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onFileDownload(file._id)}
                    className="p-2 text-gray-400 hover:text-primary-600"
                  >
                    <FiDownload className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(file._id, 'file')}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {folders.map((folder) => (
        <div key={folder._id} className="group relative">
          <button
            onClick={() => onFolderClick(folder)}
            className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
          >
            <div className="flex flex-col items-center">
              <FiFolder className="h-12 w-12 text-blue-500 mb-2" />
              <p className="text-sm font-medium text-gray-900 truncate w-full text-center">
                {folder.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">Folder</p>
            </div>
          </button>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onDelete(folder._id, 'folder')}
              className="p-1 bg-white rounded-full shadow hover:bg-red-50"
            >
              <FiTrash2 className="h-3 w-3 text-red-600" />
            </button>
          </div>
        </div>
      ))}
      
      {files.map((file) => (
        <div key={file._id} className="group relative">
          <div className="w-full p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center">
              {getFileIcon(file.mimeType)}
              <p className="text-sm font-medium text-gray-900 truncate w-full text-center mt-2">
                {file.name}
              </p>
              <p className="text-xs text-gray-500 mt-1">{formatFileSize(file.size)}</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
            <button
              onClick={() => onFileDownload(file._id)}
              className="p-1 bg-white rounded-full shadow hover:bg-primary-50"
            >
              <FiDownload className="h-3 w-3 text-primary-600" />
            </button>
            <button
              onClick={() => onDelete(file._id, 'file')}
              className="p-1 bg-white rounded-full shadow hover:bg-red-50"
            >
              <FiTrash2 className="h-3 w-3 text-red-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
