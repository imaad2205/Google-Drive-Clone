import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud,
  FolderPlus,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed, onToggle, currentPath, onNavigate }) => {
  const { user } = useAuth();

  // Format bytes to human readable
  const formatStorage = (bytes) => {
    if (!bytes || bytes === 0) return '0 GB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const MAX_STORAGE = 15 * 1024 * 1024 * 1024; // 15GB
  const used = user?.storageUsed || 0;
  const percentage = Math.min((used / MAX_STORAGE) * 100, 100);
  // Ensure a minimum visible width when storage is used
  const displayPercentage = used > 0 ? Math.max(percentage, 1.5) : 0;

  const menuItems = [
    {
      icon: HardDrive,
      label: 'My Drive',
      path: '/',
      active: true
    }
  ];

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 72 : 280,
      }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-white border-r border-slate-200/80 flex flex-col relative"
    >
      {/* Header with Logo */}
      <div className={cn(
        "flex items-center h-16 border-b border-slate-100",
        isCollapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <motion.div
          animate={{ opacity: isCollapsed ? 0 : 1 }}
          className={cn("flex items-center gap-3", isCollapsed && "hidden")}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl blur-md opacity-40" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="font-bold text-slate-900 text-lg">CloudVault</span>
        </motion.div>

        {/* Collapsed Logo */}
        {isCollapsed && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl blur-md opacity-40" />
            <div className="relative w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Cloud className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 rounded-lg hover:bg-slate-100 transition-colors",
            isCollapsed && "absolute -right-3 top-4 bg-white border border-slate-200 shadow-sm z-10"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          )}
        </Button>
      </div>

      {/* New Folder Button */}
      <div className={cn("p-3", isCollapsed && "px-2")}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={() => onNavigate('create-folder')}
            className={cn(
              "w-full gap-2 h-11 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500",
              "hover:from-brand-700 hover:to-brand-600 text-white font-medium",
              "shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30",
              "transition-all duration-200",
              isCollapsed && "w-11 p-0"
            )}
          >
            <FolderPlus className="w-4 h-4" />
            {!isCollapsed && <span>New Folder</span>}
          </Button>
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <motion.div
                key={item.path}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? "bg-brand-50 text-brand-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-brand-600" : "text-slate-400"
                  )} />
                  {!isCollapsed && (
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </nav>

      {/* Storage Section */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="p-4 border-t border-slate-100"
          >
            {/* Storage Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl p-4 border border-slate-200/60">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center">
                  <HardDrive className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-slate-900 text-sm">Storage</span>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      percentage > 90
                        ? "bg-gradient-to-r from-red-500 to-red-400"
                        : percentage > 70
                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                        : "bg-gradient-to-r from-brand-500 to-purple-500"
                    )}
                  />
                </div>
              </div>

              {/* Storage Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  {formatStorage(used)} used
                </span>
                <span className="font-medium text-slate-700">
                  15 GB
                </span>
              </div>

              {/* Upgrade Prompt (if storage > 50%) */}
              {percentage > 50 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-3 pt-3 border-t border-slate-200/60"
                >
                  <button className="w-full flex items-center justify-center gap-2 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                    <Sparkles className="w-3.5 h-3.5" />
                    Upgrade for more storage
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Storage Indicator */}
      {isCollapsed && (
        <div className="p-2 border-t border-slate-100">
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${displayPercentage}%` }}
              transition={{ duration: 1, delay: 0.3 }}
              className={cn(
                "h-full rounded-full",
                percentage > 90
                  ? "bg-red-500"
                  : percentage > 70
                  ? "bg-amber-500"
                  : "bg-brand-500"
              )}
            />
          </div>
        </div>
      )}
    </motion.aside>
  );
};

export default Sidebar;
