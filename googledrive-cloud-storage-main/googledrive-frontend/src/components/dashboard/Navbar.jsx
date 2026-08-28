import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Upload, 
  LogOut,
  X,
  Bell,
  Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

const Navbar = ({ 
  viewMode, 
  onViewModeChange, 
  onUpload, 
  onSearch,
  searchQuery,
  user 
}) => {
  const { logout } = useAuth();

  const handleSearch = (e) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40"
    >
      <div className="h-full flex items-center justify-between px-6 gap-4">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
            <Input
              type="text"
              placeholder="Search files and folders..."
              value={searchQuery}
              onChange={handleSearch}
              className={cn(
                "w-full pl-11 pr-10 h-11 rounded-xl",
                "bg-slate-50/80 border-slate-200/60",
                "focus:bg-white focus:border-brand-300 focus:ring-2 focus:ring-brand-500/20",
                "placeholder:text-slate-400 transition-all duration-200"
              )}
            />
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4 text-slate-400" />
              </motion.button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'grid'
                  ? "bg-white shadow-sm text-brand-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                viewMode === 'list'
                  ? "bg-white shadow-sm text-brand-600"
                  : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Button */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              onClick={onUpload}
              className={cn(
                "h-10 px-5 rounded-xl gap-2",
                "bg-gradient-to-r from-brand-600 to-brand-500",
                "hover:from-brand-700 hover:to-brand-600",
                "text-white font-medium",
                "shadow-lg shadow-brand-500/20 hover:shadow-xl hover:shadow-brand-500/30",
                "transition-all duration-200"
              )}
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </Button>
          </motion.div>

          {/* Divider */}
          <div className="w-px h-8 bg-slate-200" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-slate-50 transition-colors">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-semibold">
                      {getInitials()}
                    </span>
                  </div>
                  {/* Online indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                
                {/* User Info */}
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-900 leading-tight">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 leading-tight">
                    {user?.email}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              align="end" 
              className="w-64 p-2 rounded-xl border-slate-200/60 shadow-xl"
            >
              {/* User Header */}
              <div className="px-3 py-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {getInitials()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              <DropdownMenuSeparator className="bg-slate-100" />
              
              <DropdownMenuItem className="px-3 py-2.5 rounded-lg cursor-pointer focus:bg-slate-50">
                <Settings className="w-4 h-4 mr-3 text-slate-500" />
                <span className="text-slate-700">Settings</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-100" />
              
              <DropdownMenuItem 
                onClick={logout}
                className="px-3 py-2.5 rounded-lg cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-3" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
