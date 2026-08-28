import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  File, 
  MoreVertical, 
  Download, 
  Trash2,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code,
  FileSpreadsheet,
  Presentation
} from 'lucide-react';
import { Button } from '../ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { formatFileSize, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const FileGrid = ({ 
  files, 
  folders, 
  viewMode, 
  onFolderClick, 
  onFileDownload, 
  onDelete
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());

  // Get file type icon and colors
  const getFileTypeConfig = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return { icon: Image, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    }
    if (mimeType?.startsWith('video/')) {
      return { icon: Film, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100' };
    }
    if (mimeType?.startsWith('audio/')) {
      return { icon: Music, color: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100' };
    }
    if (mimeType?.includes('pdf')) {
      return { icon: FileText, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' };
    }
    if (mimeType?.includes('spreadsheet') || mimeType?.includes('excel')) {
      return { icon: FileSpreadsheet, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' };
    }
    if (mimeType?.includes('presentation') || mimeType?.includes('powerpoint')) {
      return { icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' };
    }
    if (mimeType?.includes('zip') || mimeType?.includes('rar') || mimeType?.includes('tar')) {
      return { icon: Archive, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' };
    }
    if (mimeType?.includes('text') || mimeType?.includes('code') || mimeType?.includes('javascript') || mimeType?.includes('json')) {
      return { icon: Code, color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100' };
    }
    return { icon: File, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };
  };

  const handleSelect = (id, event) => {
    event.stopPropagation();
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  const allItems = [
    ...folders.map(folder => ({ ...folder, itemType: 'folder' })),
    ...files.map(file => ({ ...file, itemType: 'file' }))
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-soft overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-slate-50/80 border-b border-slate-200/60">
          <div className="col-span-6 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Modified</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</div>
          <div className="col-span-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</div>
        </div>
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-slate-100"
        >
          {allItems.map((item) => {
            const fileConfig = item.itemType === 'file' ? getFileTypeConfig(item.mimeType) : null;
            const FileIcon = fileConfig?.icon || File;
            
            return (
              <motion.div
                key={item._id}
                variants={itemVariants}
                className={cn(
                  "grid grid-cols-12 gap-4 px-6 py-4 cursor-pointer transition-all duration-200",
                  "hover:bg-slate-50/80",
                  selectedItems.has(item._id) && "bg-brand-50/50 border-l-2 border-l-brand-500"
                )}
                onClick={() => item.itemType === 'folder' ? onFolderClick(item) : onFileDownload(item._id)}
              >
                <div className="col-span-6 flex items-center gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.has(item._id)}
                    onChange={(e) => handleSelect(item._id, e)}
                    className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                    item.itemType === 'folder' 
                      ? "bg-brand-50 border border-brand-100" 
                      : `${fileConfig?.bg} border ${fileConfig?.border}`
                  )}>
                    {item.itemType === 'folder' ? (
                      <Folder className="w-5 h-5 text-brand-600" />
                    ) : (
                      <FileIcon className={cn("w-5 h-5", fileConfig?.color)} />
                    )}
                  </div>
                  
                  <span className="font-medium text-slate-900 truncate">
                    {item.name}
                  </span>
                </div>
                
                <div className="col-span-2 flex items-center text-sm text-slate-500">
                  {formatDate(item.updatedAt || item.createdAt)}
                </div>
                
                <div className="col-span-2 flex items-center text-sm text-slate-500">
                  {item.itemType === 'folder' ? '—' : formatFileSize(item.size)}
                </div>
                
                <div className="col-span-2 flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg hover:bg-slate-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    
                    <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5">
                      {item.itemType === 'file' && (
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onFileDownload(item._id); }}
                          className="rounded-lg px-3 py-2"
                        >
                          <Download className="w-4 h-4 mr-2 text-slate-500" />
                          Download
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuSeparator className="my-1" />
                      
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onDelete(item._id, item.itemType); }}
                        className="rounded-lg px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    );
  }

  // Grid View
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4"
    >
      {allItems.map((item) => {
        const fileConfig = item.itemType === 'file' ? getFileTypeConfig(item.mimeType) : null;
        const FileIcon = fileConfig?.icon || File;
        
        return (
          <motion.div
            key={item._id}
            variants={itemVariants}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative bg-white rounded-2xl border border-slate-200/60 p-4",
              "cursor-pointer transition-all duration-300",
              "hover:shadow-soft-lg hover:border-brand-200",
              selectedItems.has(item._id) && "ring-2 ring-brand-500 border-brand-500"
            )}
            onClick={() => item.itemType === 'folder' ? onFolderClick(item) : onFileDownload(item._id)}
          >
            {/* Checkbox */}
            <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <input
                type="checkbox"
                checked={selectedItems.has(item._id)}
                onChange={(e) => handleSelect(item._id, e)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Actions Menu */}
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-slate-100 shadow-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-44 rounded-xl p-1.5">
                  {item.itemType === 'file' && (
                    <DropdownMenuItem 
                      onClick={(e) => { e.stopPropagation(); onFileDownload(item._id); }}
                      className="rounded-lg px-3 py-2"
                    >
                      <Download className="w-4 h-4 mr-2 text-slate-500" />
                      Download
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator className="my-1" />
                  
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(item._id, item.itemType); }}
                    className="rounded-lg px-3 py-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Icon */}
            <div className="flex flex-col items-center pt-2">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="mb-4"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center",
                  item.itemType === 'folder' 
                    ? "bg-gradient-to-br from-brand-50 to-brand-100 border border-brand-200/50" 
                    : `${fileConfig?.bg} border ${fileConfig?.border}`
                )}>
                  {item.itemType === 'folder' ? (
                    <Folder className="w-8 h-8 text-brand-600" />
                  ) : (
                    <FileIcon className={cn("w-8 h-8", fileConfig?.color)} />
                  )}
                </div>
              </motion.div>

              {/* File Info */}
              <div className="w-full text-center space-y-1">
                <p className="text-sm font-medium text-slate-900 truncate px-1" title={item.name}>
                  {item.name}
                </p>
                <p className="text-xs text-slate-500">
                  {item.itemType === 'folder' ? 'Folder' : formatFileSize(item.size)}
                </p>
                <p className="text-xs text-slate-400">
                  {formatDate(item.updatedAt || item.createdAt)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default FileGrid;
