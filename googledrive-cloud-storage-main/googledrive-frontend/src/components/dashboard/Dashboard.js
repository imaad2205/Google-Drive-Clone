import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import Skeleton from '../ui/skeleton';

// Import new premium components
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Breadcrumb from './Breadcrumb';
import FileGrid from './FileGrid';
import EmptyState from './EmptyState';

// Import existing components
import FileUpload from './FileUpload';
import FolderCreate from './FolderCreate';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [parentFolder, setParentFolder] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [allFiles, setAllFiles] = useState([]);
  const [allFolders, setAllFolders] = useState([]);
  const [folderHistory, setFolderHistory] = useState([]); // Track folder navigation history

  const { user, logout, fetchUser, api, updateStorageUsed } = useAuth();

  useEffect(() => {
    // Only fetch files if user is authenticated
    if (user) {
      fetchFiles();
    }
  }, [parentFolder, user]);

  useEffect(() => {
    // Filter files and folders based on search query
    if (searchQuery.trim()) {
      const filteredFiles = allFiles.filter(file =>
        file.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const filteredFolders = allFolders.filter(folder =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFiles(filteredFiles);
      setFolders(filteredFolders);
    } else {
      setFiles(allFiles);
      setFolders(allFolders);
    }
  }, [searchQuery, allFiles, allFolders]);

  const fetchFiles = async () => {
    // Don't fetch if no user
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await api.get('/api/files', {
        params: { parentFolder }
      });
      const fetchedFiles = response.data.files;
      const fetchedFolders = fetchedFiles.filter(file => file.type === 'folder');
      const fetchedFilesOnly = fetchedFiles.filter(file => file.type === 'file');

      setAllFolders(fetchedFolders);
      setAllFiles(fetchedFilesOnly);
      setFolders(fetchedFolders);
      setFiles(fetchedFilesOnly);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      // Only show session expired if it's actually a 401 and we have a user
      if (error.response?.status === 401) {
        // Don't spam with toasts, just logout
        logout();
      } else if (error.response) {
        toast.error('Failed to load files');
      }
      // Don't show error for network issues during initial load
    } finally {
      setLoading(false);
    }
  };

  const handleFolderClick = (folder) => {
    // Save current state to history before navigating
    setFolderHistory(prev => [...prev, { parentFolder, currentPath }]);
    setCurrentPath(folder.path);
    setParentFolder(folder._id);
  };

  const handleBackClick = () => {
    if (folderHistory.length > 0) {
      // Pop the last state from history
      const previousState = folderHistory[folderHistory.length - 1];
      setFolderHistory(prev => prev.slice(0, -1));
      setParentFolder(previousState.parentFolder);
      setCurrentPath(previousState.currentPath);
    } else {
      // Fallback to root
      setParentFolder(null);
      setCurrentPath('/');
    }
  };

  const handleNavigate = (path) => {
    if (path === 'back') {
      handleBackClick();
    } else if (path === 'create-folder') {
      setShowCreateFolder(true);
    } else if (path === '/') {
      setParentFolder(null);
      setCurrentPath('/');
      setFolderHistory([]); // Clear history when going to root
    } else {
      // Handle other navigation paths
      setCurrentPath(path);
    }
  };

  const handleFileUpload = (newFile, storageUsed) => {
    setAllFiles(prev => [...prev, newFile]);
    setFiles(prev => [...prev, newFile]);
    setShowUpload(false);
    // Update storage immediately if provided, otherwise fetch user
    if (storageUsed !== undefined) {
      updateStorageUsed(storageUsed);
    } else {
      fetchUser();
    }
    toast.success('File uploaded successfully!');
  };

  const handleFolderCreate = (newFolder) => {
    setAllFolders(prev => [...prev, newFolder]);
    setFolders(prev => [...prev, newFolder]);
    setShowCreateFolder(false);
    toast.success('Folder created successfully!');
  };

  const handleDelete = async (itemId, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      try {
        const response = await api.delete(`/api/files/${itemId}`);
        if (type === 'folder') {
          setAllFolders(prev => prev.filter(f => f._id !== itemId));
          setFolders(prev => prev.filter(f => f._id !== itemId));
        } else {
          setAllFiles(prev => prev.filter(f => f._id !== itemId));
          setFiles(prev => prev.filter(f => f._id !== itemId));
        }
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
        // Update storage immediately if provided
        if (response.data.storageUsed !== undefined) {
          updateStorageUsed(response.data.storageUsed);
        } else {
          fetchUser();
        }
      } catch (error) {
        console.error('Failed to delete:', error);
        if (error.response?.status === 401) {
          logout();
        } else {
          toast.error('Failed to delete item');
        }
      }
    }
  };

  const handleDownload = async (fileId) => {
    try {
      const response = await api.get(`/api/files/${fileId}/download`);
      const { downloadUrl, fileName } = response.data;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download:', error);
      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You can only download your own files.');
      } else {
        toast.error('Failed to download file');
      }
    }
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 p-4">
          <Skeleton className="w-16 h-16 rounded-lg mx-auto mb-3" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-3 w-3/4 mx-auto" />
        </div>
      ))}
    </div>
  );

  // Handle global drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setShowUpload(true);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
    >
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={currentPath}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <Navbar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onUpload={() => setShowUpload(true)}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          user={user}
        />

        {/* Breadcrumb */}
        <Breadcrumb
          currentPath={currentPath}
          onNavigate={handleNavigate}
          parentFolder={parentFolder}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {loading ? (
              <LoadingSkeleton />
            ) : files.length === 0 && folders.length === 0 ? (
              <EmptyState
                onUpload={() => setShowUpload(true)}
                onCreateFolder={() => setShowCreateFolder(true)}
                searchQuery={searchQuery}
              />
            ) : (
              <FileGrid
                files={files}
                folders={folders}
                viewMode={viewMode}
                onFolderClick={handleFolderClick}
                onFileDownload={handleDownload}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUpload && (
          <FileUpload
            onClose={() => setShowUpload(false)}
            onUpload={handleFileUpload}
            parentFolder={parentFolder}
          />
        )}

        {showCreateFolder && (
          <FolderCreate
            onClose={() => setShowCreateFolder(false)}
            onCreate={handleFolderCreate}
            parentFolder={parentFolder}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
