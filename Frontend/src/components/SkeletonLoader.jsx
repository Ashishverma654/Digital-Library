import React from 'react';

export const BookCardSkeleton = () => {
  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col h-full animate-pulse border border-white/5 dark:border-white/5">
      <div className="h-64 w-full bg-black/5 dark:bg-white/5 relative overflow-hidden">
        {/* Shimmer effect */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="p-6 flex flex-col flex-grow gap-4 relative z-10 bg-white/10 dark:bg-black/10">
        <div className="flex-grow space-y-3">
          <div className="h-6 w-3/4 bg-black/10 dark:bg-white/10 rounded overflow-hidden relative">
             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
          <div className="h-4 w-1/2 bg-black/5 dark:bg-white/5 rounded overflow-hidden relative">
             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
          <div className="h-6 w-20 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
          <div className="h-10 w-20 bg-black/10 dark:bg-white/10 rounded-lg overflow-hidden relative">
             <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DashboardStatsSkeleton = () => {
  return (
    <div className="glass-panel p-6 rounded-xl animate-pulse border border-white/5 dark:border-white/5">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden relative">
           <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
        </div>
      </div>
      <div className="h-8 w-16 bg-black/10 dark:bg-white/10 rounded mb-2 overflow-hidden relative">
         <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="h-4 w-24 bg-black/5 dark:bg-white/5 rounded overflow-hidden relative">
         <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]"></div>
      </div>
    </div>
  );
};
