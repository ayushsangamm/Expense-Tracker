// frontend/src/components/LoadingSkeleton.jsx
// Collection of modern glowing skeleton widgets representing various loading states.

import React from 'react';

/**
 * Metric Card Skeleton (Pulsing statistics)
 */
export const MetricSkeleton = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-3 relative overflow-hidden">
      {/* Pulse background overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]"></div>
      
      <div className="flex justify-between items-center">
        <div className="w-24 h-4 bg-zinc-800 rounded-full animate-pulse"></div>
        <div className="w-8 h-8 bg-zinc-800 rounded-xl animate-pulse"></div>
      </div>
      
      <div className="w-32 h-8 bg-zinc-800 rounded-lg animate-pulse mt-2"></div>
      
      <div className="w-40 h-3.5 bg-zinc-800/60 rounded-full animate-pulse mt-1"></div>
    </div>
  );
};

/**
 * List Item Skeleton (Pulsing transaction logs)
 */
export const ListItemSkeleton = () => {
  return (
    <div className="glass-card p-4 flex items-center justify-between border-b border-cardBorder">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-xl animate-pulse"></div>
        <div className="flex flex-col gap-2">
          <div className="w-32 h-4 bg-zinc-800 rounded-full animate-pulse"></div>
          <div className="w-20 h-3 bg-zinc-800/60 rounded-full animate-pulse"></div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="w-20 h-5 bg-zinc-800 rounded-full animate-pulse"></div>
        <div className="w-8 h-8 bg-zinc-800/60 rounded-lg animate-pulse"></div>
      </div>
    </div>
  );
};

/**
 * Graph Panel Skeleton (Pulsing analytics shapes)
 */
export const GraphSkeleton = () => {
  return (
    <div className="glass-card p-6 flex flex-col gap-4 min-h-[300px]">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1.5">
          <div className="w-36 h-4 bg-zinc-800 rounded-full animate-pulse"></div>
          <div className="w-24 h-3 bg-zinc-800/60 rounded-full animate-pulse"></div>
        </div>
        <div className="w-24 h-8 bg-zinc-800 rounded-xl animate-pulse"></div>
      </div>

      {/* Simulated bar/line outlines */}
      <div className="flex-1 flex items-end gap-3 h-48 pt-4">
        <div className="flex-1 bg-zinc-800/30 rounded-t-lg h-[40%] animate-pulse"></div>
        <div className="flex-1 bg-zinc-800/40 rounded-t-lg h-[75%] animate-pulse"></div>
        <div className="flex-1 bg-zinc-800/30 rounded-t-lg h-[50%] animate-pulse"></div>
        <div className="flex-1 bg-zinc-800/50 rounded-t-lg h-[90%] animate-pulse"></div>
        <div className="flex-1 bg-zinc-800/30 rounded-t-lg h-[60%] animate-pulse"></div>
        <div className="flex-1 bg-zinc-800/40 rounded-t-lg h-[30%] animate-pulse"></div>
      </div>
    </div>
  );
};

/**
 * Default wrapper combining skeletons for the central dashboard
 */
const LoadingSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Row of four metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main transaction listing */}
        <div className="lg:col-span-2 space-y-3">
          <div className="w-48 h-5 bg-zinc-800 rounded-full mb-3 animate-pulse"></div>
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
        
        {/* Sidebar Budgets */}
        <div className="space-y-3">
          <div className="w-36 h-5 bg-zinc-800 rounded-full mb-3 animate-pulse"></div>
          <div className="glass-card p-6 space-y-4">
            <div className="h-4 bg-zinc-800 rounded-full animate-pulse w-full"></div>
            <div className="h-2 bg-zinc-850 rounded-full animate-pulse w-full"></div>
            <div className="h-4 bg-zinc-800 rounded-full animate-pulse w-[80%]"></div>
            <div className="h-2 bg-zinc-850 rounded-full animate-pulse w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
