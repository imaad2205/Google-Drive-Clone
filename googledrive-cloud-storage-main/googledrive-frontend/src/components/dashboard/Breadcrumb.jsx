import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const Breadcrumb = ({ currentPath, onNavigate, parentFolder }) => {
  // Build breadcrumb items from current path
  const buildBreadcrumbItems = () => {
    const items = [
      { label: 'My Drive', path: '/', icon: Home }
    ];

    if (currentPath && currentPath !== '/') {
      const pathParts = currentPath.split('/').filter(part => part);
      let currentPathBuilder = '';
      
      pathParts.forEach((part, index) => {
        currentPathBuilder += `/${part}`;
        items.push({
          label: part,
          path: currentPathBuilder,
          isLast: index === pathParts.length - 1
        });
      });
    }

    return items;
  };

  const breadcrumbItems = buildBreadcrumbItems();

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-center justify-between px-6 py-3 bg-slate-50/50 border-b border-slate-200/60"
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0 mx-1" />
            )}
            
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {item.isLast ? (
                <span className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg font-medium text-slate-900 bg-white border border-slate-200/60 shadow-sm">
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onNavigate(item.path)}
                  className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all duration-200",
                    "text-slate-600 hover:text-slate-900 hover:bg-white hover:shadow-sm",
                    index === 0 && "font-medium"
                  )}
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  {item.label}
                </button>
              )}
            </motion.div>
          </React.Fragment>
        ))}
      </nav>
      
      {/* Back Button */}
      {parentFolder && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onNavigate('back')}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl ml-4",
            "text-sm font-medium text-brand-600",
            "bg-brand-50 hover:bg-brand-100 border border-brand-200/50",
            "transition-all duration-200"
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
      )}
    </motion.div>
  );
};

export default Breadcrumb;
