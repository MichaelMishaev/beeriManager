'use client'

import { motion } from 'framer-motion'

// Skeleton shimmer animation
const shimmer = {
  initial: { backgroundPosition: '-200% 0' },
  animate: {
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear' as const
    }
  }
}

function SkeletonPulse({ className = '' }: { className?: string }) {
  return (
    <motion.div
      variants={shimmer}
      initial="initial"
      animate="animate"
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_100%] rounded ${className}`}
    />
  )
}

export function GroceryListSkeleton() {
  return (
    <div className="relative flex h-auto w-full flex-col overflow-x-hidden max-w-[480px] mx-auto bg-white dark:bg-[#102219] font-[family-name:var(--font-jakarta)]">
      {/* Header Skeleton */}
      <div className="flex p-4 bg-[#f6f8f7] dark:bg-[#102219]">
        <div className="flex w-full flex-col gap-4 items-center">
          <div className="flex gap-6 flex-col items-center">
            {/* Event Image Skeleton */}
            <SkeletonPulse className="min-h-40 w-40 rounded-xl" />

            <div className="flex flex-col items-center justify-center gap-2 w-full">
              {/* Title Skeleton */}
              <SkeletonPulse className="h-7 w-48" />
              {/* Class Skeleton */}
              <SkeletonPulse className="h-5 w-32" />
              {/* Date Skeleton */}
              <SkeletonPulse className="h-5 w-40" />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Skeleton */}
      <div className="px-4 py-2">
        <div className="flex flex-col gap-3 p-4 bg-[#13ec80]/5 dark:bg-[#13ec80]/10 rounded-xl border border-[#13ec80]/10">
          <div className="flex justify-between items-center">
            <SkeletonPulse className="h-5 w-32" />
            <SkeletonPulse className="h-6 w-16 rounded-full" />
          </div>
          <SkeletonPulse className="h-3 w-full rounded-full" />
          <SkeletonPulse className="h-4 w-48" />
        </div>
      </div>

      {/* Section Header Skeleton */}
      <div className="px-4 pt-4 flex items-center justify-between">
        <SkeletonPulse className="h-6 w-32" />
        <SkeletonPulse className="h-4 w-20" />
      </div>

      {/* Filter Pills Skeleton */}
      <div className="flex gap-3 p-4">
        <SkeletonPulse className="h-10 w-28 rounded-full" />
        <SkeletonPulse className="h-10 w-24 rounded-full" />
        <SkeletonPulse className="h-10 w-24 rounded-full" />
      </div>

      {/* List Items Skeleton */}
      <div className="flex flex-col px-2 pb-24">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-3 min-h-[80px] py-3 border-b border-gray-100 dark:border-white/5"
          >
            {/* Icon Skeleton */}
            <SkeletonPulse className="size-11 rounded-full flex-shrink-0" />

            {/* Content Skeleton */}
            <div className="flex flex-col gap-2 flex-1">
              <SkeletonPulse className="h-5 w-3/4" />
              <SkeletonPulse className="h-4 w-1/2" />
            </div>

            {/* Button Skeleton */}
            <SkeletonPulse className="h-10 w-20 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Form skeleton for the create page
export function GroceryFormSkeleton() {
  return (
    <div className="font-[family-name:var(--font-jakarta)]">
      {/* Progress bar skeleton */}
      <div className="px-4 pt-4">
        <SkeletonPulse className="h-1 w-full rounded-full" />
      </div>

      {/* Section header skeleton */}
      <div className="px-4 pt-6">
        <SkeletonPulse className="h-8 w-40 mb-2" />
        <SkeletonPulse className="h-4 w-64" />
      </div>

      {/* Form fields skeleton */}
      <div className="mt-4 space-y-4 px-4">
        {/* Event Name */}
        <div className="py-3">
          <SkeletonPulse className="h-4 w-24 mb-2" />
          <SkeletonPulse className="h-14 w-full rounded-xl" />
        </div>

        {/* Class Name */}
        <div className="py-3">
          <SkeletonPulse className="h-4 w-20 mb-2" />
          <SkeletonPulse className="h-14 w-full rounded-xl" />
        </div>

        {/* Date and Time section */}
        <div className="pt-4">
          <SkeletonPulse className="h-6 w-28 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <SkeletonPulse className="h-4 w-16 mb-2" />
              <SkeletonPulse className="h-14 w-full rounded-xl" />
            </div>
            <div>
              <SkeletonPulse className="h-4 w-12 mb-2" />
              <SkeletonPulse className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="py-3">
          <SkeletonPulse className="h-4 w-16 mb-2" />
          <SkeletonPulse className="h-14 w-full rounded-xl" />
        </div>

        {/* Creator Name */}
        <div className="py-3">
          <SkeletonPulse className="h-4 w-32 mb-2" />
          <SkeletonPulse className="h-14 w-full rounded-xl" />
        </div>

        {/* Info box */}
        <SkeletonPulse className="h-20 w-full rounded-xl mt-8" />
      </div>

      {/* Spacer */}
      <div className="h-28" />

      {/* Footer button skeleton */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-[#f6f8f7]/95 dark:bg-[#102219]/95">
        <SkeletonPulse className="h-14 w-full rounded-xl" />
      </div>
    </div>
  )
}
