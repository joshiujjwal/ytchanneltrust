'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              YTChannel<span className="text-blue-600">Trust</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/ytct-score"
              className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
            >
              What's YTCT Score
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/ytct-score"
              onClick={toggleMenu}
              className="block px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-50 font-medium transition-colors"
            >
              What's YTCT Score
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
