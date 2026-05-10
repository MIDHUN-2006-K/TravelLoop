import React from "react";

/* Shimmer-effect skeleton loaders */

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-12 w-full" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/60 p-6 space-y-4">
      <div className="skeleton h-5 w-2/3" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full" />
        <div className="skeleton h-3 w-5/6" />
      </div>
      <div className="flex gap-3 pt-2">
        <div className="skeleton h-8 w-20 rounded-lg" />
        <div className="skeleton h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function TripCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-200/60 overflow-hidden">
      <div className="skeleton h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-3 w-1/2" />
        <div className="flex gap-2 pt-1">
          <div className="skeleton h-6 w-16 rounded-full" />
          <div className="skeleton h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <TripCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero skeleton */}
      <div className="skeleton h-32 w-full rounded-2xl" />
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-surface-200/60 p-5 space-y-3">
            <div className="skeleton h-3 w-20" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="skeleton w-4 h-4 rounded-full flex-shrink-0 mt-1" />
          <div className="flex-1 space-y-3">
            <div className="skeleton h-20 w-full rounded-xl" />
            <div className="skeleton h-14 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="skeleton w-full h-[400px] rounded-2xl" />
  );
}
