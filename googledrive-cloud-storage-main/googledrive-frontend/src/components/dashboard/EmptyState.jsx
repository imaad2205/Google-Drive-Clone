import React from 'react';
import { motion } from 'framer-motion';
import { Cloud, Upload, FolderPlus, Search, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

const EmptyState = ({ onUpload, onCreateFolder, searchQuery }) => {
  const isSearchResult = searchQuery && searchQuery.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 px-6"
    >
      {/* Illustration */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        className="relative mb-8"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/20 to-purple-500/20 rounded-full blur-3xl scale-150" />
        
        {/* Main illustration container */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          {/* Animated circles */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-brand-400 rounded-full opacity-60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-400 rounded-full opacity-60" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4"
          >
            <div className="absolute top-0 right-0 w-2 h-2 bg-pink-400 rounded-full opacity-60" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-amber-400 rounded-full opacity-60" />
          </motion.div>

          {/* Center icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl border border-slate-200/60 shadow-soft-lg flex items-center justify-center">
              {isSearchResult ? (
                <Search className="w-12 h-12 text-slate-300" />
              ) : (
                <Cloud className="w-14 h-14 text-slate-300" />
              )}
            </div>
            
            {/* Floating elements */}
            {!isSearchResult && (
              <>
                <motion.div
                  animate={{ y: [0, -5, 0], x: [0, 3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl shadow-lg flex items-center justify-center"
                >
                  <FolderPlus className="w-5 h-5 text-white" />
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 5, 0], x: [0, -3, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                  className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 text-white" />
                </motion.div>
              </>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center max-w-md"
      >
        <h3 className="text-2xl font-bold text-slate-900 mb-3">
          {isSearchResult ? 'No results found' : 'Your drive is empty'}
        </h3>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          {isSearchResult 
            ? `We couldn't find any files or folders matching "${searchQuery}". Try a different search term.`
            : 'Start by uploading your first file or creating a folder to organize your content.'
          }
        </p>

        {/* Action Buttons */}
        {!isSearchResult && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={onUpload}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 text-white font-medium shadow-lg shadow-brand-500/25 hover:shadow-xl transition-all duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Files
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={onCreateFolder}
                className="h-12 px-6 rounded-xl border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Folder
              </Button>
            </motion.div>
          </div>
        )}
      </motion.div>

      {/* Tips Section */}
      {!isSearchResult && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 max-w-lg"
        >
          <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-6 border border-brand-100/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900">Quick tips</h4>
            </div>
            
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0" />
                <span>Drag and drop files anywhere on this page to upload</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0" />
                <span>Create folders to keep your files organized</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 flex-shrink-0" />
                <span>Use the search bar to quickly find any file</span>
              </li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;
