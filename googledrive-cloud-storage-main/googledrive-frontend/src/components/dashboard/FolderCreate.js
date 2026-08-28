import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';

const FolderCreate = ({ onClose, onCreate, parentFolder }) => {
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  
  const { api } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast.error('Please enter a folder name');
      return;
    }

    setCreating(true);

    try {
      const response = await api.post('/api/files/folder', {
        name: folderName.trim(),
        parentFolder
      });

      onCreate(response.data.folder);
      toast.success('Folder created successfully');
    } catch (error) {
      console.error('Create folder error:', error);
      toast.error(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Create New Folder
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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="folderName" className="text-sm font-medium text-gray-700">
                    Folder Name
                  </label>
                  <div className="relative">
                    <Folder className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="folderName"
                      type="text"
                      value={folderName}
                      onChange={(e) => setFolderName(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                      placeholder="Enter folder name"
                      autoFocus
                      disabled={creating}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={creating}
                    className="border-gray-300 hover:border-gray-400"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !folderName.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {creating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      'Create Folder'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FolderCreate;
