import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onPageChange, className = '' }: PaginationProps) {
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page
  }

  return (
    <div className={`flex items-center justify-center gap-2 mt-6 ${className}`}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!canGoPrevious}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      <span className="px-4 py-2 text-sm font-medium text-gray-700">
        Page <span className="font-bold">{page}</span> of <span className="font-bold">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!canGoNext}
        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white transition-colors"
        aria-label="Next page"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
